from typing import Dict, Any
from django.db.models import Count, Q
from django.contrib.auth import get_user_model

from apps.courses.models import Course
from apps.enrollments.models import Enrollment

User = get_user_model()


class DashboardStatsService:
    
    @staticmethod
    def get_admin_dashboard() -> Dict[str, Any]:
        total_active_users = User.objects.filter(is_active=True).count()
        role_counts = User.objects.values("role").annotate(count=Count("id"))
        
        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(status=Course.STATUS_PUBLISHED).count()
        draft_courses = Course.objects.filter(status=Course.STATUS_DRAFT).count()
        
        total_enrollments = Enrollment.objects.count()
        active_enrollments = Enrollment.objects.filter(status='active').count()
        pending_enrollments = Enrollment.objects.filter(status='pending').count()
        
        top_courses = Course.objects.annotate(
            enrollment_count=Count('enrollments')
        ).order_by('-enrollment_count')[:5].values(
            'id', 'title', 'enrollment_count'
        )
        
        return {
            "total_active_users": total_active_users,
            "total_courses": total_courses,
            "published_courses": published_courses,
            "draft_courses": draft_courses,
            "total_enrollments": total_enrollments,
            "active_enrollments": active_enrollments,
            "pending_enrollments": pending_enrollments,
            "role_counts": list(role_counts),
            "top_courses": list(top_courses),
        }
    
    @staticmethod
    def get_instructor_dashboard(instructor) -> Dict[str, Any]:
        courses = Course.objects.filter(instructor=instructor)
        course_count = courses.count()
        published_count = courses.filter(status=Course.STATUS_PUBLISHED).count()
        draft_count = courses.filter(status=Course.STATUS_DRAFT).count()
        
        enrollments = Enrollment.objects.filter(course__in=courses)
        total_students = enrollments.values('student').distinct().count()
        active_enrollments = enrollments.filter(status='active').count()
        pending_enrollments = enrollments.filter(status='pending').count()
        
        course_stats = courses.annotate(
            enrollment_count=Count('enrollments'),
            active_enrollment_count=Count(
                'enrollments',
                filter=Q(enrollments__status='active')
            )
        ).values('id', 'title', 'enrollment_count', 'active_enrollment_count')
        
        return {
            "course_count": course_count,
            "published_courses": published_count,
            "draft_courses": draft_count,
            "total_students": total_students,
            "active_enrollments": active_enrollments,
            "pending_enrollments": pending_enrollments,
            "course_stats": list(course_stats),
        }
    
    @staticmethod
    def get_student_dashboard(student) -> Dict[str, Any]:
        enrollments = Enrollment.objects.filter(student=student)
        
        total_enrolled = enrollments.count()
        active_courses = enrollments.filter(status='active').count()
        completed_courses = enrollments.filter(status='completed').count()
        pending_courses = enrollments.filter(status='pending').count()
        
        recent_enrollments = enrollments.select_related(
            'course', 'course__instructor', 'course__instructor__profile'
        ).order_by('-enrolled_at')[:5].values(
            'id', 'course__id', 'course__title', 
            'course__instructor__email', 'course__instructor__profile__name',
            'status', 'enrolled_at'
        )
        
        return {
            "total_enrolled": total_enrolled,
            "active_courses": active_courses,
            "completed_courses": completed_courses,
            "pending_courses": pending_courses,
            "recent_enrollments": list(recent_enrollments),
        }
    
    @staticmethod
    def get_dashboard_for_user(user) -> Dict[str, Any]:
        if user.role == User.ROLE_ADMIN or user.is_staff:
            return DashboardStatsService.get_admin_dashboard()
        elif user.role == User.ROLE_INSTRUCTOR:
            return DashboardStatsService.get_instructor_dashboard(user)
        elif user.role == User.ROLE_STUDENT:
            return DashboardStatsService.get_student_dashboard(user)
        else:
            return {"detail": "No dashboard available for this role."}
