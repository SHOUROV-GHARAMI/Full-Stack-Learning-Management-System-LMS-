from django.urls import path

from .views import (
	LoginView,
	LogoutView,
    AdminUserListView,
    AdminUserUpdateView,
	PasswordResetConfirmView,
	PasswordResetRequestView,
	RefreshView,
	RegisterAPIView,
)

urlpatterns = [
	path("register/", RegisterAPIView.as_view(), name="register"),
	path("login/", LoginView.as_view(), name="login"),
	path("logout/", LogoutView.as_view(), name="logout"),
	path("refresh/", RefreshView.as_view(), name="token_refresh"),
	path("forgot-password/", PasswordResetRequestView.as_view(), name="forgot_password"),
	path("reset-password/", PasswordResetConfirmView.as_view(), name="reset_password"),
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserUpdateView.as_view(), name="admin-user-update"),
]
