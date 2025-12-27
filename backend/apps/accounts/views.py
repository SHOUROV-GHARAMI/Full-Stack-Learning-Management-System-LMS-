from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    AdminUserUpdateSerializer,
    LoginSerializer,
    LogoutSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
    build_password_reset_payload,
)
from .services import UserManagementService, UserQueryService
from .exceptions import (
    UserValidationError,
    PermissionDeniedError,
    AdminProtectionError,
    RoleChangeError,
)

User = get_user_model()


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer


class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data["refresh"]
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.instance
        if user and user.is_active:
            payload = build_password_reset_payload(user)
            context = {"uid": payload["uid"], "token": payload["token"], "email": user.email}
            subject = "Password reset request"
            body = render_to_string("emails/password_reset.txt", context=context)
            email = EmailMultiAlternatives(subject, body, to=[user.email])
            email.send()
        return Response({"detail": "If the email exists, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password has been reset."})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = self.request.user.profile.__class__.objects.get_or_create(user=self.request.user)
        return profile


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.role == User.ROLE_ADMIN or user.is_staff))


class IsAdminOrInstructorRole(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and 
            (user.role in [User.ROLE_ADMIN, User.ROLE_INSTRUCTOR] or user.is_staff)
        )


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrInstructorRole]

    def get_queryset(self):
        filters = {
            'role': self.request.query_params.get('role'),
            'active': self.request.query_params.get('active'),
            'q': self.request.query_params.get('q'),
        }
        return UserManagementService.get_users_for_role(self.request.user, filters)


class AdminUserUpdateView(generics.UpdateAPIView):
    serializer_class = AdminUserUpdateSerializer
    permission_classes = [IsAdminOrInstructorRole]
    queryset = User.objects.all()
    http_method_names = ["patch"]

    def update(self, request, *args, **kwargs):
        try:
            updated_user = UserManagementService.update_user(
                current_user=request.user,
                target_user_id=self.get_object().id,
                changes=request.data
            )
            
            serializer = self.get_serializer(updated_user)
            return Response(serializer.data)
            
        except AdminProtectionError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except (PermissionDeniedError, RoleChangeError) as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        except UserValidationError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
