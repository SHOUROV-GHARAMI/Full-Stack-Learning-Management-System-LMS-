from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    registration_number = serializers.CharField(source='user.registration_number', read_only=True)
    
    class Meta:
        model = Profile
        fields = ["name", "phone", "bio", "profile_image", "registration_number"]

    def validate(self, attrs):
        user = self.context["request"].user
        bio = attrs.get("bio", "")
        
        if bio and user.role != User.ROLE_INSTRUCTOR:
            raise serializers.ValidationError({"bio": "Bio field is only available for instructors."})
        
        return attrs


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ["id", "email", "registration_number", "role", "is_active", "date_joined", "profile"]
        read_only_fields = ["id", "registration_number", "role", "is_active", "date_joined"]


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["role", "is_active"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "role"]

    def validate_role(self, value):
        if value == User.ROLE_ADMIN:
            raise serializers.ValidationError("Admin accounts must be created by an admin.")
        return value

    def create(self, validated_data):
        role = validated_data.get("role", User.ROLE_STUDENT)
        password = validated_data.pop("password")
        user = User.objects.create_user(email=validated_data["email"], password=password, role=role)
        return user


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active:
            raise serializers.ValidationError("Inactive user.")
        data["user"] = UserSerializer(self.user).data
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.instance = User.objects.get(email=value)
        except User.DoesNotExist:
            self.instance = None
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except Exception:
            raise serializers.ValidationError("Invalid reset token.")

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError("Invalid or expired reset token.")

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return user


def build_password_reset_payload(user):
    token_generator = PasswordResetTokenGenerator()
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = token_generator.make_token(user)
    return {"uid": uid, "token": token}
