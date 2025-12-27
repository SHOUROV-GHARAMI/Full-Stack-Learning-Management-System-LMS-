from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError, NotFound
from django.contrib.auth import get_user_model

from apps.courses.models import Course
from .models import Enrollment, EnrollmentRequest
from .serializers import (
    EnrollmentCreateSerializer, 
    EnrollmentSerializer, 
    InstructorEnrollSerializer,
    EnrollmentRequestSerializer,
    EnrollmentRequestCreateSerializer
)
from .services import (
    EnrollmentManagementService,
    EnrollmentQueryService,
    EnrollmentRequestService
)
from .exceptions import (
    EnrollmentValidationError,
    EnrollmentPermissionError,
    EnrollmentNotFoundError,
    AlreadyEnrolledError,
    EnrollmentRequestNotFoundError
)

User = get_user_model()


class EnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id):
        if request.user.role != User.ROLE_STUDENT:
            raise PermissionDenied("Only students can enroll.")
        
        try:
            course = Course.objects.get(pk=course_id)
            enrollment = EnrollmentManagementService.create_enrollment(
                student=request.user,
                course=course,
                status='pending'
            )
            return Response(
                EnrollmentSerializer(enrollment).data,
                status=status.HTTP_201_CREATED
            )
        except Course.DoesNotExist:
            raise NotFound("Course not found.")
        except AlreadyEnrolledError as e:
            raise ValidationError(str(e))
        except EnrollmentValidationError as e:
            raise ValidationError(str(e))


class MyCoursesView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == User.ROLE_ADMIN:
            return Enrollment.objects.none()
        
        if user.role == User.ROLE_STUDENT:
            return EnrollmentQueryService.get_student_enrollments(user)
        
        if user.role == User.ROLE_INSTRUCTOR:
            return Enrollment.objects.filter(
                course__instructor=user
            ).select_related("course", "student")
        
        return Enrollment.objects.none()


class InstructorEnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id):
        user = request.user
        
        if user.role not in [User.ROLE_INSTRUCTOR, User.ROLE_ADMIN] and not user.is_staff:
            raise PermissionDenied("Only instructors can enroll students.")
        
        student_email = request.data.get('student_email')
        if not student_email:
            raise ValidationError("student_email is required")
        
        try:
            course = Course.objects.get(pk=course_id)
            enrollment = EnrollmentManagementService.enroll_student_by_email(
                instructor=user,
                course=course,
                student_email=student_email
            )
            return Response(
                EnrollmentSerializer(enrollment).data,
                status=status.HTTP_201_CREATED
            )
        except Course.DoesNotExist:
            raise NotFound("Course not found.")
        except User.DoesNotExist:
            raise NotFound(f"Student with email '{student_email}' not found. Make sure they are registered as a student.")
        except EnrollmentPermissionError as e:
            raise PermissionDenied(str(e))
        except AlreadyEnrolledError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"Enrollment error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


class EnrollmentRequestCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != User.ROLE_STUDENT:
            raise PermissionDenied("Only students can request enrollment.")
        
        course_id = request.data.get('course_id')
        instructor_id = request.data.get('instructor_id')
        message = request.data.get('message', '')
        
        if not course_id or not instructor_id:
            raise ValidationError("course_id and instructor_id are required")
        
        try:
            course = Course.objects.get(pk=course_id)
            instructor = User.objects.get(pk=instructor_id)
            
            enrollment_request = EnrollmentRequestService.create_enrollment_request(
                student=request.user,
                instructor=instructor,
                course=course,
                message=message
            )
            return Response(
                EnrollmentRequestSerializer(enrollment_request).data,
                status=status.HTTP_201_CREATED
            )
        except Course.DoesNotExist:
            raise NotFound("Course not found.")
        except User.DoesNotExist:
            raise NotFound("Instructor not found.")
        except EnrollmentValidationError as e:
            raise ValidationError(str(e))


class EnrollmentRequestListView(generics.ListAPIView):
    serializer_class = EnrollmentRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == User.ROLE_INSTRUCTOR:
            return EnrollmentRequestService.get_instructor_requests(user)
        elif user.role == User.ROLE_STUDENT:
            return EnrollmentRequest.objects.filter(
                student=user
            ).select_related("course", "instructor")
        
        return EnrollmentRequest.objects.none()


class EnrollmentRequestActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, request_id):
        user = request.user
        
        if user.role != User.ROLE_INSTRUCTOR:
            raise PermissionDenied("Only instructors can approve/reject requests.")
        
        action = request.data.get("action")
        if action not in ["approve", "reject"]:
            raise ValidationError("Invalid action. Use 'approve' or 'reject'.")
        
        try:
            if action == "approve":
                enrollment = EnrollmentRequestService.approve_enrollment_request(
                    instructor=user,
                    request_id=request_id
                )
                return Response(
                    {"detail": "Request approved and student enrolled."},
                    status=status.HTTP_200_OK
                )
            else:
                EnrollmentRequestService.reject_enrollment_request(
                    instructor=user,
                    request_id=request_id
                )
                return Response(
                    {"detail": "Request rejected."},
                    status=status.HTTP_200_OK
                )
        except EnrollmentRequestNotFoundError:
            raise NotFound("Request not found.")
        except EnrollmentPermissionError as e:
            raise PermissionDenied(str(e))
        except EnrollmentValidationError as e:
            raise ValidationError(str(e))


class UnenrollStudentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, enrollment_id):
        user = request.user
        
        if user.role not in [User.ROLE_INSTRUCTOR, User.ROLE_ADMIN]:
            raise PermissionDenied("Only instructors can unenroll students.")
        
        try:
            enrollment = Enrollment.objects.select_related('course', 'student').get(pk=enrollment_id)
            
            if enrollment.course.instructor != user and user.role != User.ROLE_ADMIN:
                raise PermissionDenied("You can only unenroll students from your own courses.")
            
            student_email = enrollment.student.email
            course_title = enrollment.course.title
            
            enrollment.status = Enrollment.STATUS_CANCELLED
            enrollment.save()
            
            return Response(
                {"detail": f"Student {student_email} unenrolled from {course_title}."},
                status=status.HTTP_200_OK
            )
        except Enrollment.DoesNotExist:
            raise NotFound("Enrollment not found.")
