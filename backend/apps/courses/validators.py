from typing import Dict, Any
from .exceptions import CourseValidationError, InstructorRequiredError


class CourseValidator:
    
    @staticmethod
    def validate_create_permissions(user) -> None:
        if user.role not in ['admin', 'instructor']:
            raise InstructorRequiredError(
                "Only admins and instructors can create courses"
            )
    
    @staticmethod
    def validate_update_permissions(user, course) -> None:
        if user.role == 'admin':
            return
        
        if user.role == 'instructor' and course.instructor == user:
            return
        
        raise InstructorRequiredError(
            "Only course instructor or admin can update this course"
        )
    
    @staticmethod
    def validate_delete_permissions(user, course) -> None:
        CourseValidator.validate_update_permissions(user, course)
    
    @staticmethod
    def validate_course_data(data: Dict[str, Any]) -> None:
        required_fields = ['title', 'description']
        
        for field in required_fields:
            if field not in data or not data[field]:
                raise CourseValidationError(f"{field} is required")
        
        valid_statuses = ['draft', 'published', 'archived']
        if 'status' in data and data['status'] not in valid_statuses:
            raise CourseValidationError(
                f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
