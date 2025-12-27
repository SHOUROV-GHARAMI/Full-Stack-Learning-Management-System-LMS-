from django.conf import settings
from django.db import models


class CourseCategory(models.Model):
	name = models.CharField(max_length=255, unique=True)
	description = models.TextField(blank=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "course category"
		verbose_name_plural = "course categories"
		ordering = ("name",)

	def __str__(self):
		return self.name


class Course(models.Model):
	STATUS_DRAFT = "draft"
	STATUS_PUBLISHED = "published"
	STATUS_ARCHIVED = "archived"

	STATUS_CHOICES = (
		(STATUS_DRAFT, "Draft"),
		(STATUS_PUBLISHED, "Published"),
		(STATUS_ARCHIVED, "Archived"),
	)

	title = models.CharField(max_length=255)
	description = models.TextField()
	category = models.ForeignKey(CourseCategory, on_delete=models.PROTECT, related_name="courses")
	instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="courses")
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ("-created_at",)

	def __str__(self):
		return self.title
