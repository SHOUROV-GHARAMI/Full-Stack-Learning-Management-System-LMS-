from typing import Dict, Any, List, Optional
from django.contrib.auth import get_user_model
from django.db.models import QuerySet
from .validators import UserValidator
from .exceptions import UserNotFoundError

User = get_user_model()


class UserManagementService:
    
    @staticmethod
    def get_user_by_id(user_id: int):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise UserNotFoundError(f"User with id {user_id} not found")
    
    @staticmethod
    def get_users_for_role(current_user, filters: Optional[Dict[str, Any]] = None) -> QuerySet:
        qs = User.objects.all().order_by("-date_joined")
        
        if current_user.role == 'instructor':
            qs = qs.filter(role='student')
        
        if not filters:
            return qs
        
        if filters.get('role'):
            qs = qs.filter(role=filters['role'])
        
        if filters.get('active') in {'true', 'false'}:
            qs = qs.filter(is_active=filters['active'] == 'true')
        
        if filters.get('q'):
            qs = qs.filter(email__icontains=filters['q'])
        
        return qs
    
    @staticmethod
    def update_user(current_user, target_user_id: int, changes: Dict[str, Any]):
        target_user = UserManagementService.get_user_by_id(target_user_id)
        
        UserValidator.validate_update_permissions(current_user, target_user, changes)
        
        for field, value in changes.items():
            if hasattr(target_user, field):
                setattr(target_user, field, value)
        
        target_user.save()
        return target_user
    
    @staticmethod
    def can_access_user_management(user) -> bool:
        return user.role in ['admin', 'instructor']


class UserQueryService:
    
    @staticmethod
    def search_users(query: str, limit: int = 10) -> QuerySet:
        return User.objects.filter(
            email__icontains=query
        ).order_by('email')[:limit]
    
    @staticmethod
    def get_users_by_role(role: str) -> QuerySet:
        return User.objects.filter(role=role).order_by('-date_joined')
    
    @staticmethod
    def get_active_users_count() -> int:
        return User.objects.filter(is_active=True).count()
    
    @staticmethod
    def get_users_by_role_counts() -> Dict[str, int]:
        from django.db.models import Count
        
        role_counts = User.objects.values('role').annotate(count=Count('id'))
        return {item['role']: item['count'] for item in role_counts}
