from typing import Dict, Any
from .exceptions import (
    EnrollmentValidationError,
    AlreadyEnrolledError,
    InvalidEnrollmentStatusError,
    EnrollmentPermissionError
)


class EnrollmentValidator:
    
    @staticmethod
    def validate_new_enrollment(user, course, existing_enrollment=None) -> None:
        if existing_enrollment:
            if existing_enrollment.status in ['pending', 'active']:
                raise AlreadyEnrolledError(
                    f"Student is already enrolled in this course with status '{existing_enrollment.status}'. "
                    f"Please unenroll them first if you want to re-enroll."
                )
        
        pass
    
    @staticmethod
    def validate_status_transition(current_status: str, new_status: str) -> None:
        valid_transitions = {
            'pending': ['active', 'cancelled'],
            'active': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': ['pending', 'active']
        }
        
        if new_status not in valid_transitions.get(current_status, []):
            raise InvalidEnrollmentStatusError(
                f"Cannot transition from {current_status} to {new_status}"
            )
    
    @staticmethod
    def validate_enrollment_update_permissions(user, enrollment) -> None:
        if user.role == 'admin':
            return
        
        if user.role == 'instructor' and enrollment.course.instructor == user:
            return
        
        if user.role == 'student' and enrollment.student == user:
            return
        
        raise EnrollmentPermissionError(
            "You don't have permission to update this enrollment"
        )


class EnrollmentRequestValidator:
    
    @staticmethod
    def validate_enrollment_request(student, instructor, course) -> None:
        if instructor.role != 'instructor':
            raise EnrollmentValidationError("Target user must be an instructor")
        
        if course.instructor != instructor:
            raise EnrollmentValidationError(
                "Instructor must be the course instructor"
            )
