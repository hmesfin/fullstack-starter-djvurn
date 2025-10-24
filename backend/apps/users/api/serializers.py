from typing import Any

from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.users.models import EmailVerificationOTP
from apps.users.models import User


class UserSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "url"]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "pk"},
        }


class UserRegistrationSerializer(serializers.ModelSerializer[User]):
    """Serializer for user registration with password validation."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name"]
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate_password(self, value: str) -> str:
        """Validate password using Django's password validators."""
        validate_password(value)
        return value

    def validate_email(self, value: str) -> str:
        """Validate email is unique and normalize it."""
        # Normalize email to lowercase
        value = value.lower()

        # Check if email already exists
        if User.objects.filter(email=value).exists():
            msg = "A user with this email address already exists."
            raise serializers.ValidationError(
                msg,
            )

        return value

    def create(self, validated_data: dict[str, Any]) -> User:
        """Create user with hashed password and generate OTP."""
        # Extract password from validated data
        password = validated_data.pop("password")

        # Create user with is_email_verified=False
        user = User.objects.create_user(
            password=password,
            is_email_verified=False,
            **validated_data,
        )

        # Generate OTP for email verification
        EmailVerificationOTP.create_for_user(user)

        # TODO: Send OTP email via Celery task

        return user


class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP email verification."""

    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True, max_length=6, min_length=6)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Validate OTP code for the given email."""
        email = attrs.get("email", "").lower()
        code = attrs.get("code", "")

        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            msg = _("Invalid email or verification code.")
            raise serializers.ValidationError(
                msg,
            ) from None

        # Find the most recent valid OTP for this user
        otp = (
            EmailVerificationOTP.objects.filter(
                user=user,
                code=code,
                is_used=False,
            )
            .order_by("-created")
            .first()
        )

        if not otp:
            msg = _("Invalid email or verification code.")
            raise serializers.ValidationError(
                msg,
            )

        if not otp.is_valid():
            msg = _("Verification code has expired or is invalid.")
            raise serializers.ValidationError(
                msg,
            )

        # Store user and OTP for use in the view
        attrs["user"] = user
        attrs["otp"] = otp

        return attrs


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that uses email and checks email verification."""

    username_field = "email"

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Validate credentials and check email verification."""
        # Call parent validation (checks credentials and sets self.user)
        data = super().validate(attrs)

        # Type guard: parent validation guarantees user is set
        if self.user is None:
            raise serializers.ValidationError(
                _("Authentication failed."),
            )

        # Check if email is verified
        if not self.user.is_email_verified:
            raise serializers.ValidationError(
                {
                    "email": _(
                        "Email address is not verified. Please verify your email before logging in.",
                    ),
                },
            )

        return data
