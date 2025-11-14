import secrets
from datetime import timedelta
from typing import ClassVar

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import BooleanField
from django.db.models import CharField
from django.db.models import DateTimeField
from django.db.models import EmailField
from django.db.models import ForeignKey
from django.db.models import ImageField
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.shared.models import BaseModel

from .managers import UserManager


def validate_image_size(image: models.fields.files.FieldFile) -> None:
    """Validate uploaded image file size (max 5MB)."""
    max_size_mb = 5
    max_size_bytes = max_size_mb * 1024 * 1024
    if image.size > max_size_bytes:
        msg = f"Image file size cannot exceed {max_size_mb}MB"
        raise ValidationError(msg)


class User(AbstractUser, BaseModel):
    """
    Default custom user model for Project Slug.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    first_name = CharField(_("first name"), max_length=150)
    last_name = CharField(_("last name"), max_length=150)
    email = EmailField(_("email address"), unique=True)
    username = None  # type: ignore[assignment]
    is_email_verified = BooleanField(_("email verified"), default=False)
    avatar = ImageField(
        _("avatar"),
        upload_to="avatars/",
        blank=True,
        null=True,
        validators=[validate_image_size],
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects: ClassVar[UserManager] = UserManager()

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("api:user-detail", kwargs={"pk": self.id})


class EmailVerificationOTP(BaseModel):
    """Model to store OTP codes for email verification."""

    user = ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="email_otps",
        verbose_name=_("user"),
    )
    code = CharField(_("OTP code"), max_length=6)
    expires_at = DateTimeField(_("expires at"))
    is_used = BooleanField(_("is used"), default=False)

    class Meta:
        verbose_name = _("Email Verification OTP")
        verbose_name_plural = _("Email Verification OTPs")
        ordering = ["-created"]
        indexes = [
            models.Index(fields=["user", "-created"]),
            models.Index(fields=["code", "is_used"]),
        ]

    def __str__(self) -> str:
        return f"OTP for {self.user.email} - {self.code}"

    @classmethod
    def generate_code(cls) -> str:
        """Generate a 6-digit OTP code."""
        return str(secrets.randbelow(1000000)).zfill(6)

    @classmethod
    def create_for_user(cls, user: "User") -> "EmailVerificationOTP":
        """Create a new OTP for the given user."""
        code = cls.generate_code()
        expires_at = timezone.now() + timedelta(minutes=15)
        return cls.objects.create(user=user, code=code, expires_at=expires_at)

    def is_valid(self) -> bool:
        """Check if the OTP is still valid."""
        return not self.is_used and self.expires_at > timezone.now()

    def mark_as_used(self) -> None:
        """Mark the OTP as used."""
        self.is_used = True
        self.save(update_fields=["is_used", "modified"])


class PasswordResetOTP(BaseModel):
    """Model to store OTP codes for password reset."""

    user = ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="password_reset_otps",
        verbose_name=_("user"),
    )
    code = CharField(_("OTP code"), max_length=6)
    expires_at = DateTimeField(_("expires at"))
    is_used = BooleanField(_("is used"), default=False)

    class Meta:
        verbose_name = _("Password Reset OTP")
        verbose_name_plural = _("Password Reset OTPs")
        ordering = ["-created"]
        indexes = [
            models.Index(fields=["user", "-created"]),
            models.Index(fields=["code", "is_used"]),
        ]

    def __str__(self) -> str:
        return f"Password Reset OTP for {self.user.email} - {self.code}"

    @classmethod
    def generate_code(cls) -> str:
        """Generate a 6-digit OTP code."""
        return str(secrets.randbelow(1000000)).zfill(6)

    @classmethod
    def create_for_user(cls, user: "User") -> "PasswordResetOTP":
        """Create a new OTP for the given user and invalidate old ones."""
        # Mark all existing unused OTPs for this user as used
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        # Create new OTP
        code = cls.generate_code()
        expires_at = timezone.now() + timedelta(minutes=15)
        return cls.objects.create(user=user, code=code, expires_at=expires_at)

    def is_valid(self) -> bool:
        """Check if the OTP is still valid."""
        return not self.is_used and self.expires_at > timezone.now()

    def mark_as_used(self) -> None:
        """Mark the OTP as used."""
        self.is_used = True
        self.save(update_fields=["is_used", "modified"])


class PasswordResetToken(BaseModel):
    """Model to store password reset tokens."""

    user = ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
        verbose_name=_("user"),
    )
    token = CharField(_("reset token"), max_length=64, unique=True)
    expires_at = DateTimeField(_("expires at"))
    is_used = BooleanField(_("is used"), default=False)

    class Meta:
        verbose_name = _("Password Reset Token")
        verbose_name_plural = _("Password Reset Tokens")
        ordering = ["-created"]
        indexes = [
            models.Index(fields=["user", "-created"]),
            models.Index(fields=["token", "is_used"]),
        ]

    def __str__(self) -> str:
        return f"Password reset for {self.user.email}"

    @classmethod
    def generate_token(cls) -> str:
        """Generate a secure random token."""
        return secrets.token_urlsafe(32)

    @classmethod
    def create_for_user(cls, user: "User") -> "PasswordResetToken":
        """Create a new password reset token for the given user."""
        token = cls.generate_token()
        expires_at = timezone.now() + timedelta(hours=1)
        return cls.objects.create(user=user, token=token, expires_at=expires_at)

    def is_valid(self) -> bool:
        """Check if the token is still valid."""
        return not self.is_used and self.expires_at > timezone.now()

    def mark_as_used(self) -> None:
        """Mark the token as used."""
        self.is_used = True
        self.save(update_fields=["is_used", "modified"])
