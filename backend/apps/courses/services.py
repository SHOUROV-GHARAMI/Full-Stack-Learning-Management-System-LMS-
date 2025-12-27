from typing import Dict, Any, Optional
from django.db.models import QuerySet, Count, Q
from .models import Course, CourseCategory
from .validators import CourseValidator
from .exceptions import CourseNotFoundError, CategoryNotFoundError


class CourseManagementService:
    
    @staticmethod
    def create_course(user, course_data: Dict[str, Any]) -> Course:
        CourseValidator.validate_create_permissions(user)
        CourseValidator.validate_course_data(course_data)
        
        if user.role == 'instructor' and 'instructor' not in course_data:
            course_data['instructor'] = user
        
        return Course.objects.create(**course_data)
    
    @staticmethod
    def update_course(user, course_id: int, updates: Dict[str, Any]) -> Course:
        course = CourseManagementService.get_course_by_id(course_id)
        CourseValidator.validate_update_permissions(user, course)
        
        for field, value in updates.items():
            if hasattr(course, field):
                setattr(course, field, value)
        
        course.save()
        return course
    
    @staticmethod
    def delete_course(user, course_id: int) -> None:
        course = CourseManagementService.get_course_by_id(course_id)
        CourseValidator.validate_delete_permissions(user, course)
        course.delete()
    
    @staticmethod
    def get_course_by_id(course_id: int) -> Course:
        try:
            return Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise CourseNotFoundError(f"Course with id {course_id} not found")


class CourseQueryService:
    
    @staticmethod
    def get_published_courses(filters: Optional[Dict[str, Any]] = None) -> QuerySet:
        qs = Course.objects.filter(status='published').select_related(
            'category', 'instructor'
        ).order_by('-created_at')
        
        if not filters:
            return qs
        
        if filters.get('category'):
            qs = qs.filter(category_id=filters['category'])
        
        if filters.get('instructor'):
            qs = qs.filter(instructor_id=filters['instructor'])
        
        if filters.get('search'):
            search_term = filters['search']
            qs = qs.filter(
                Q(title__icontains=search_term) |
                Q(description__icontains=search_term)
            )
        
        return qs
    
    @staticmethod
    def get_courses_for_instructor(instructor) -> QuerySet:
        return Course.objects.filter(
            instructor=instructor
        ).select_related('category').order_by('-created_at')
    
    @staticmethod
    def get_course_statistics() -> Dict[str, Any]:
        from django.db.models import Count
        
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(status='published').count()
        draft_courses = Course.objects.filter(status='draft').count()
        
        courses_by_category = Course.objects.values(
            'category__name'
        ).annotate(count=Count('id')).order_by('-count')
        
        return {
            'total': total_courses,
            'published': published_courses,
            'draft': draft_courses,
            'by_category': list(courses_by_category)
        }


class CategoryService:
    
    @staticmethod
    def get_all_categories() -> QuerySet:
        return CourseCategory.objects.annotate(
            course_count=Count('courses')
        ).order_by('name')
    
    @staticmethod
    def get_category_by_id(category_id: int) -> CourseCategory:
        try:
            return CourseCategory.objects.get(id=category_id)
        except CourseCategory.DoesNotExist:
            raise CategoryNotFoundError(f"Category with id {category_id} not found")
