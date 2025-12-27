from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/profile/", include("apps.accounts.profile_urls")),
    path("api/courses/", include("apps.courses.urls")),
    path("api/", include("apps.enrollments.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
]
