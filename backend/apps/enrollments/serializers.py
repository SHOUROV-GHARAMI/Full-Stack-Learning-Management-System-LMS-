from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.courses.models import Course
from .models import Enrollment, EnrollmentRequest

User = get_user_model()


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")
    course_status = serializers.ReadOnlyField(source="course.status")

    class Meta:
        model = Enrollment
        fields = ["id", "course", "course_title", "course_status", "enrolled_at", "status"]
        read_only_fields = ["id", "course_title", "course_status", "enrolled_at", "status"]


class EnrollmentCreateSerializer(serializers.Serializer):
    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        course_id = self.context.get("course_id")
        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"course_id": "Course not found."})

        if user.enrollments.filter(course=course).exists():
            raise serializers.ValidationError({"course_id": "Already enrolled."})
        if course.status != Course.STATUS_PUBLISHED:
            raise serializers.ValidationError({"course_id": "Course is not open for enrollment."})
        attrs["course"] = course
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        course = self.validated_data["course"]
        enrollment = Enrollment.objects.create(student=user, course=course)
        return enrollment


class InstructorEnrollSerializer(serializers.Serializer):
    student_email = serializers.EmailField()

    def validate(self, attrs):
        request = self.context["request"]
        instructor = request.user
        course_id = self.context.get("course_id")
        student_email = attrs["student_email"]

        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"course_id": "Course not found."})

        if course.instructor != instructor and instructor.role != User.ROLE_ADMIN and not instructor.is_staff:
            raise serializers.ValidationError({"course_id": "You can only enroll students in your own courses."})

        try:
            student = User.objects.get(email=student_email, role=User.ROLE_STUDENT)
        except User.DoesNotExist:
            raise serializers.ValidationError({"student_email": "Student with this email not found."})

        if student.enrollments.filter(course=course).exists():
            raise serializers.ValidationError({"student_email": "Student is already enrolled."})

        attrs["course"] = course
        attrs["student"] = student
        return attrs

    def save(self, **kwargs):
        course = self.validated_data["course"]
        student = self.validated_data["student"]
        enrollment = Enrollment.objects.create(student=student, course=course)
        return enrollment


class EnrollmentRequestSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")
    student_email = serializers.ReadOnlyField(source="student.email")
    instructor_email = serializers.ReadOnlyField(source="instructor.email")

    class Meta:
        model = EnrollmentRequest
        fields = ["id", "course", "course_title", "student_email", "instructor_email", "message", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "course_title", "student_email", "instructor_email", "status", "created_at", "updated_at"]


class EnrollmentRequestCreateSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    message = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate(self, attrs):
        request = self.context["request"]
        student = request.user
        course_id = attrs["course_id"]

        try:
            course = Course.objects.get(pk=course_id, status=Course.STATUS_PUBLISHED)
        except Course.DoesNotExist:
            raise serializers.ValidationError({"course_id": "Course not found or not available."})

        if student.enrollments.filter(course=course).exists():
            raise serializers.ValidationError({"course_id": "You are already enrolled in this course."})

        if student.enrollment_requests.filter(course=course, status=EnrollmentRequest.STATUS_PENDING).exists():
            raise serializers.ValidationError({"course_id": "You already have a pending request for this course."})

        attrs["course"] = course
        attrs["instructor"] = course.instructor
        return attrs

    def save(self, **kwargs):
        student = self.context["request"].user
        course = self.validated_data["course"]
        instructor = self.validated_data["instructor"]
        message = self.validated_data.get("message", "")
        
        enrollment_request = EnrollmentRequest.objects.create(
            student=student,
            course=course,
            instructor=instructor,
            message=message
        )
        return enrollment_request
