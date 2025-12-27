from typing import Dict, Any
from .exceptions import AdminProtectionError, RoleChangeError, PermissionDeniedError


class UserValidator:
    
    @staticmethod
    def validate_admin_protection(user, changes: Dict[str, Any]) -> None:
        if user.role != 'admin':
            return
            
        if 'is_active' in changes and not changes['is_active']:
            raise AdminProtectionError("Admin users cannot be deactivated")
        
        if 'role' in changes and changes['role'] != 'admin':
            raise AdminProtectionError("Admin role cannot be changed")
    
    @staticmethod
    def validate_role_change(changes: Dict[str, Any]) -> None:
        if 'role' in changes and changes['role'] == 'admin':
            raise RoleChangeError("Cannot promote users to admin role")
    
    @staticmethod
    def validate_instructor_permissions(current_user, target_user, changes: Dict[str, Any]) -> None:
        if current_user.role != 'instructor':
            return
        
        if target_user.role != 'student':
            raise PermissionDeniedError("Instructors can only manage students")
        
        if 'role' in changes:
            raise PermissionDeniedError("Instructors cannot change user roles")
    
    @staticmethod
    def validate_update_permissions(current_user, target_user, changes: Dict[str, Any]) -> None:
        UserValidator.validate_admin_protection(target_user, changes)
        
        UserValidator.validate_role_change(changes)
        
        UserValidator.validate_instructor_permissions(current_user, target_user, changes)
