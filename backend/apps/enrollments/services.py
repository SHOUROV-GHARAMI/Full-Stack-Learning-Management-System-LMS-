from typing import Dict, Any, Optional
from django.db.models import QuerySet, Q, Count
from django.contrib.auth import get_user_model
from .models import Enrollment, EnrollmentRequest
from .validators import EnrollmentValidator, EnrollmentRequestValidator
from .exceptions import EnrollmentNotFoundError, EnrollmentRequestNotFoundError

User = get_user_model()


class EnrollmentManagementService:
    
    @staticmethod
    def create_enrollment(student, course, status: str = 'pending') -> Enrollment:
        existing = Enrollment.objects.filter(
            student=student, course=course
        ).first()
        
        EnrollmentValidator.validate_new_enrollment(student, course, existing)
        
        if existing and existing.status in ['cancelled', 'completed']:
            existing.delete()
        
        return Enrollment.objects.create(
            student=student,
            course=course,
            status=status
        )
    
    @staticmethod
    def enroll_student_by_email(instructor, course, student_email: str) -> Enrollment:
        student = User.objects.get(email=student_email, role='student')
        
        if course.instructor != instructor and instructor.role != 'admin':
            from .exceptions import EnrollmentPermissionError
            raise EnrollmentPermissionError(
                "You can only enroll students in your own courses"
            )
        
        return EnrollmentManagementService.create_enrollment(
            student=student,
            course=course,
            status='active'
        )
    
    @staticmethod
    def update_enrollment_status(user, enrollment_id: int, new_status: str) -> Enrollment:
        enrollment = EnrollmentManagementService.get_enrollment_by_id(enrollment_id)
        
        EnrollmentValidator.validate_enrollment_update_permissions(user, enrollment)
        EnrollmentValidator.validate_status_transition(enrollment.status, new_status)
        
        enrollment.status = new_status
        enrollment.save()
        
        return enrollment
    
    @staticmethod
    def get_enrollment_by_id(enrollment_id: int) -> Enrollment:
        try:
            return Enrollment.objects.select_related(
                'student', 'course', 'course__instructor'
            ).get(id=enrollment_id)
        except Enrollment.DoesNotExist:
            raise EnrollmentNotFoundError(f"Enrollment with id {enrollment_id} not found")


class EnrollmentQueryService:
    
    @staticmethod
    def get_student_enrollments(student, status: Optional[str] = None) -> QuerySet:
        qs = Enrollment.objects.filter(
            student=student
        ).select_related('course', 'course__category').order_by('-enrolled_at')
        
        if status:
            qs = qs.filter(status=status)
        
        return qs
    
    @staticmethod
    def get_course_enrollments(course, status: Optional[str] = None) -> QuerySet:
        qs = Enrollment.objects.filter(
            course=course
        ).select_related('student').order_by('-enrolled_at')
        
        if status:
            qs = qs.filter(status=status)
        
        return qs
    
    @staticmethod
    def get_enrollment_statistics() -> Dict[str, Any]:
        total_enrollments = Enrollment.objects.count()
        active_enrollments = Enrollment.objects.filter(status='active').count()
        completed_enrollments = Enrollment.objects.filter(status='completed').count()
        
        enrollments_by_status = Enrollment.objects.values('status').annotate(
            count=Count('id')
        )
        
        return {
            'total': total_enrollments,
            'active': active_enrollments,
            'completed': completed_enrollments,
            'by_status': list(enrollments_by_status)
        }


class EnrollmentRequestService:
    
    @staticmethod
    def create_enrollment_request(student, instructor, course, message: str = "") -> EnrollmentRequest:
        EnrollmentRequestValidator.validate_enrollment_request(student, instructor, course)
        
        return EnrollmentRequest.objects.create(
            student=student,
            instructor=instructor,
            course=course,
            message=message
        )
    
    @staticmethod
    def approve_enrollment_request(instructor, request_id: int) -> Enrollment:
        request = EnrollmentRequestService.get_request_by_id(request_id)
        
        if request.instructor != instructor and instructor.role != 'admin':
            from .exceptions import EnrollmentPermissionError
            raise EnrollmentPermissionError("You can only approve your own requests")
        
        enrollment = EnrollmentManagementService.create_enrollment(
            student=request.student,
            course=request.course,
            status='active'
        )
        
        request.status = 'approved'
        request.save()
        
        return enrollment
    
    @staticmethod
    def reject_enrollment_request(instructor, request_id: int) -> EnrollmentRequest:
        request = EnrollmentRequestService.get_request_by_id(request_id)
        
        if request.instructor != instructor and instructor.role != 'admin':
            from .exceptions import EnrollmentPermissionError
            raise EnrollmentPermissionError("You can only reject your own requests")
        
        request.status = 'rejected'
        request.save()
        
        return request
    
    @staticmethod
    def get_request_by_id(request_id: int) -> EnrollmentRequest:
        try:
            return EnrollmentRequest.objects.select_related(
                'student', 'instructor', 'course'
            ).get(id=request_id)
        except EnrollmentRequest.DoesNotExist:
            raise EnrollmentRequestNotFoundError(f"Request with id {request_id} not found")
    
    @staticmethod
    def get_instructor_requests(instructor, status: Optional[str] = None) -> QuerySet:
        qs = EnrollmentRequest.objects.filter(
            instructor=instructor
        ).select_related('student', 'course').order_by('-created_at')
        
        if status:
            qs = qs.filter(status=status)
        
        return qs
