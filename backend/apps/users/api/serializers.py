from typing import Any

from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.users.models import EmailVerificationOTP
from apps.users.models import PasswordResetOTP
from apps.users.models import PasswordResetToken
from apps.users.models import User
from apps.users.tasks import send_otp_email
from apps.users.tasks import send_password_reset_email
from apps.users.tasks import send_password_reset_otp_email


class UserSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "url", "avatar"]

        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "pk"},
            "avatar": {"required": False, "allow_null": True},
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
        otp = EmailVerificationOTP.create_for_user(user)

        # Send OTP email via Celery task (async)
        send_otp_email.delay(user.id, otp.code)

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


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP to unverified email."""

    email = serializers.EmailField(required=True)

    def validate_email(self, value: str) -> str:
        """Validate and normalize email."""
        return value.lower()

    def save(self) -> None:
        """Create new OTP and send email."""
        email = self.validated_data["email"]

        # Try to get user (security: don't leak user existence)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security, return success even if user doesn't exist
            # This prevents email enumeration attacks
            return

        # Check if email is already verified
        if user.is_email_verified:
            msg = _("Email address is already verified.")
            raise serializers.ValidationError(msg)

        # Create new OTP
        otp = EmailVerificationOTP.create_for_user(user)

        # Send OTP email via Celery task
        send_otp_email.delay(user.id, otp.code)


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
            # OTP creation is handled in the view to avoid transaction rollback issues
            raise serializers.ValidationError(
                {
                    "email": _(
                        "Email address is not verified. "
                        "We've sent a verification code to your email. "
                        "Please verify your email before logging in.",
                    ),
                    "email_verification_required": True,
                },
            )

        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""

    email = serializers.EmailField(required=True)

    def validate_email(self, value: str) -> str:
        """Validate and normalize email."""
        return value.lower()

    def save(self) -> None:
        """Create password reset token and send email."""
        email = self.validated_data["email"]

        # Try to get user (security: don't leak user existence)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security, return success even if user doesn't exist
            # This prevents email enumeration attacks
            return

        # Create new password reset token
        token = PasswordResetToken.create_for_user(user)

        # Send password reset email via Celery task
        send_password_reset_email.delay(user.id, token.token)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""

    token = serializers.CharField(required=True, max_length=64)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    def validate_password(self, value: str) -> str:
        """Validate password using Django's password validators."""
        validate_password(value)
        return value

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Validate token and prepare for password reset."""
        token_str = attrs.get("token", "")

        # Find valid token
        try:
            token = PasswordResetToken.objects.get(
                token=token_str,
                is_used=False,
            )
        except PasswordResetToken.DoesNotExist:
            msg = _("Invalid or expired password reset token.")
            raise serializers.ValidationError(
                msg,
            ) from None

        # Check if token is still valid (not expired)
        if not token.is_valid():
            msg = _("Invalid or expired password reset token.")
            raise serializers.ValidationError(
                msg,
            )

        # Store token and user for use in save()
        attrs["reset_token"] = token
        attrs["user"] = token.user

        return attrs

    def save(self) -> User:
        """Reset user password and mark token as used."""
        user = self.validated_data["user"]
        reset_token = self.validated_data["reset_token"]
        new_password = self.validated_data["password"]

        # Set new password
        user.set_password(new_password)
        user.save(update_fields=["password", "modified"])

        # Mark token as used
        reset_token.mark_as_used()

        return user


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password (authenticated users)."""

    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
    )

    def validate_new_password(self, value: str) -> str:
        """Validate new password using Django's password validators."""
        validate_password(value)
        return value

    def validate_old_password(self, value: str) -> str:
        """Validate that old password is correct."""
        user = self.context["request"].user
        if not user.check_password(value):
            msg = _("Incorrect password.")
            raise serializers.ValidationError(msg)
        return value

    def save(self, **kwargs: Any) -> User:
        """Change user password."""
        user = self.context["request"].user
        new_password = self.validated_data["new_password"]

        user.set_password(new_password)
        user.save(update_fields=["password", "modified"])

        return user

class PasswordResetOTPRequestSerializer(serializers.Serializer):
    """Serializer for OTP-based password reset request."""

    email = serializers.EmailField(required=True)

    def validate_email(self, value: str) -> str:
        """Validate and normalize email."""
        return value.lower()

    def save(self) -> None:
        """Create password reset OTP and send email."""
        email = self.validated_data["email"]

        # Try to get user (security: don't leak user existence)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security, return success even if user doesn't exist
            # This prevents email enumeration attacks
            return

        # Create new password reset OTP (invalidates old ones)
        otp = PasswordResetOTP.create_for_user(user)

        # Send password reset OTP email via Celery task
        send_password_reset_otp_email.delay(user.id, otp.code)


class PasswordResetOTPConfirmSerializer(serializers.Serializer):
    """Serializer for OTP-based password reset confirmation."""

    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True, max_length=6, min_length=6)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    def validate_email(self, value: str) -> str:
        """Validate and normalize email."""
        return value.lower()

    def validate_password(self, value: str) -> str:
        """Validate password using Django's password validators."""
        validate_password(value)
        return value

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Validate OTP code and prepare for password reset."""
        email = attrs.get("email", "")
        code = attrs.get("code", "")

        # Get user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            msg = _("Invalid email or code.")
            raise serializers.ValidationError(msg) from None

        # Find valid OTP for this user
        try:
            otp = PasswordResetOTP.objects.get(
                user=user,
                code=code,
                is_used=False,
            )
        except PasswordResetOTP.DoesNotExist:
            msg = _("Invalid or expired OTP code.")
            raise serializers.ValidationError(msg) from None

        # Check if OTP is still valid (not expired)
        if not otp.is_valid():
            msg = _("OTP code has expired. Please request a new one.")
            raise serializers.ValidationError(msg)

        # Store OTP and user in validated_data for save method
        attrs["_otp"] = otp
        attrs["_user"] = user

        return attrs

    def save(self, **kwargs: Any) -> User:
        """Reset user password and mark OTP as used."""
        user = self.validated_data["_user"]
        otp = self.validated_data["_otp"]
        new_password = self.validated_data["password"]

        # Update password
        user.set_password(new_password)
        user.save(update_fields=["password", "modified"])

        # Mark OTP as used
        otp.mark_as_used()

        return user
