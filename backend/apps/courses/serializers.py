from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Course, CourseCategory

User = get_user_model()


class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ["id", "name", "description"]


class CourseSerializer(serializers.ModelSerializer):
    instructor_email = serializers.ReadOnlyField(source="instructor.email")
    instructor_registration_number = serializers.ReadOnlyField(source="instructor.registration_number")
    category = CourseCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=CourseCategory.objects.all(), source="category", write_only=True
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_id",
            "instructor",
            "instructor_email",
            "instructor_registration_number",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "instructor", "instructor_email", "instructor_registration_number", "created_at", "updated_at"]

    def validate_status(self, value):
        user = self.context["request"].user
        if user.role == User.ROLE_INSTRUCTOR and value == Course.STATUS_ARCHIVED:
            return value
        return value
