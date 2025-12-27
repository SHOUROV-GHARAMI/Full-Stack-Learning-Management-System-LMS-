from django.conf import settings
from django.db import models

from apps.courses.models import Course


class Enrollment(models.Model):
	STATUS_ACTIVE = "active"
	STATUS_CANCELLED = "cancelled"

	STATUS_CHOICES = (
		(STATUS_ACTIVE, "Active"),
		(STATUS_CANCELLED, "Cancelled"),
	)

	student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
	course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name="enrollments")
	enrolled_at = models.DateTimeField(auto_now_add=True)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

	class Meta:
		unique_together = ("student", "course")
		ordering = ("-enrolled_at",)

	def __str__(self):
		return f"{self.student.email} -> {self.course.title}"


class EnrollmentRequest(models.Model):
	STATUS_PENDING = "pending"
	STATUS_APPROVED = "approved"
	STATUS_REJECTED = "rejected"

	STATUS_CHOICES = (
		(STATUS_PENDING, "Pending"),
		(STATUS_APPROVED, "Approved"),
		(STATUS_REJECTED, "Rejected"),
	)

	student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollment_requests")
	course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollment_requests")
	instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_enrollment_requests")
	message = models.TextField(blank=True)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		unique_together = ("student", "course")
		ordering = ("-created_at",)

	def __str__(self):
		return f"{self.student.email} -> {self.course.title} ({self.status})"
