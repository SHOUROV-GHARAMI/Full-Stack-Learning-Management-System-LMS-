from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import uuid


def generate_registration_number():
	return f"REG{uuid.uuid4().hex[:10].upper()}"


class UserManager(BaseUserManager):
	def create_user(self, email, password=None, role="student", **extra_fields):
		if not email:
			raise ValueError("Users must have an email address")
		email = self.normalize_email(email)
		user = self.model(email=email, role=role, **extra_fields)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, email, password=None, **extra_fields):
		extra_fields.setdefault("is_staff", True)
		extra_fields.setdefault("is_superuser", True)
		extra_fields.setdefault("is_active", True)
		return self.create_user(email, password, role="admin", **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
	ROLE_ADMIN = "admin"
	ROLE_INSTRUCTOR = "instructor"
	ROLE_STUDENT = "student"

	ROLE_CHOICES = (
		(ROLE_ADMIN, "Admin"),
		(ROLE_INSTRUCTOR, "Instructor"),
		(ROLE_STUDENT, "Student"),
	)

	email = models.EmailField(unique=True)
	registration_number = models.CharField(max_length=20, unique=True, default=generate_registration_number, editable=False, blank=True, null=True)
	role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)
	is_active = models.BooleanField(default=True)
	is_staff = models.BooleanField(default=False)
	date_joined = models.DateTimeField(default=timezone.now)

	objects = UserManager()

	USERNAME_FIELD = "email"
	REQUIRED_FIELDS = []

	class Meta:
		verbose_name = "user"
		verbose_name_plural = "users"
		ordering = ("-date_joined",)

	def __str__(self):
		return self.email


class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
	name = models.CharField(max_length=255, blank=True)
	phone = models.CharField(max_length=20, blank=True)
	bio = models.TextField(blank=True)
	profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Profile for {self.user.email}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
	if created:
		Profile.objects.create(user=instance)
