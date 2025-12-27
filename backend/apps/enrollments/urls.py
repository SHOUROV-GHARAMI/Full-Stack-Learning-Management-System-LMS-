from django.urls import path

from .views import (
    EnrollView, 
    InstructorEnrollView, 
    MyCoursesView,
    EnrollmentRequestCreateView,
    EnrollmentRequestListView,
    EnrollmentRequestActionView,
    UnenrollStudentView
)

urlpatterns = [
	path("enroll/<int:course_id>/", EnrollView.as_view(), name="enroll-course"),
	path("instructor-enroll/<int:course_id>/", InstructorEnrollView.as_view(), name="instructor-enroll"),
	path("my-courses/", MyCoursesView.as_view(), name="my-courses"),
	path("enrollment-requests/", EnrollmentRequestCreateView.as_view(), name="enrollment-request-create"),
	path("enrollment-requests/list/", EnrollmentRequestListView.as_view(), name="enrollment-request-list"),
	path("enrollment-requests/<int:request_id>/action/", EnrollmentRequestActionView.as_view(), name="enrollment-request-action"),
	path("unenroll/<int:enrollment_id>/", UnenrollStudentView.as_view(), name="unenroll-student"),
]
