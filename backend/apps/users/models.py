import secrets
from datetime import timedelta
from typing import ClassVar

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import BooleanField
from django.db.models import CharField
from django.db.models import DateTimeField
from django.db.models import EmailField
from django.db.models import ForeignKey
from django.urls import reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.shared.models import BaseModel

from .managers import UserManager


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
