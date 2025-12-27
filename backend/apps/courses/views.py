from django.contrib.auth import get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound

from .models import Course, CourseCategory
from .serializers import CourseCategorySerializer, CourseSerializer
from .services import CourseManagementService, CourseQueryService, CategoryService
from .exceptions import (
    CourseValidationError,
    CoursePermissionError,
    CourseNotFoundError,
    CategoryNotFoundError,
    InstructorRequiredError
)

User = get_user_model()


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        categories = CategoryService.get_all_categories()
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        self._require_admin()
        serializer.save()

    def perform_update(self, serializer):
        self._require_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self._require_admin()
        if instance.courses.exists():
            raise ValidationError("Cannot delete category while courses exist.")
        instance.delete()

    def _require_admin(self):
        user = self.request.user
        if not (user.role == User.ROLE_ADMIN or user.is_staff):
            raise PermissionDenied("Only admins can manage categories.")


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == User.ROLE_ADMIN or user.is_staff:
            return Course.objects.select_related('category', 'instructor').order_by('-created_at')
        
        if user.role == User.ROLE_INSTRUCTOR:
            return CourseQueryService.get_courses_for_instructor(user)
        
        return CourseQueryService.get_published_courses()

    def perform_create(self, serializer):
        user = self.request.user
        
        try:
            course_data = serializer.validated_data
            course_data['instructor'] = user
            course = CourseManagementService.create_course(
                user=user,
                course_data=course_data
            )
            serializer.instance = course
        except (CoursePermissionError, InstructorRequiredError) as e:
            raise PermissionDenied(str(e))
        except CourseValidationError as e:
            raise ValidationError(str(e))

    def perform_update(self, serializer):
        user = self.request.user
        course = self.get_object()
        
        try:
            updated_course = CourseManagementService.update_course(
                user=user,
                course_id=course.id,
                course_data=serializer.validated_data
            )
            serializer.instance = updated_course
        except CoursePermissionError as e:
            raise PermissionDenied(str(e))
        except CourseValidationError as e:
            raise ValidationError(str(e))
        except CourseNotFoundError as e:
            raise NotFound(str(e))

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user
        
        try:
            CourseManagementService.delete_course(user, course.id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CoursePermissionError as e:
            raise PermissionDenied(str(e))
        except CourseValidationError as e:
            raise ValidationError(str(e))
        except CourseNotFoundError as e:
            raise NotFound(str(e))

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
