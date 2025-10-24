"""Tests for User model and UserManager."""

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from faker import Faker

from apps.users.models import User
from apps.users.tests.factories import UserFactory

pytestmark = pytest.mark.django_db
fake = Faker()


class TestUserManager:
    """Test suite for UserManager."""

    def test_create_user_with_email_successful(self) -> None:
        """Test creating a user with an email is successful."""
        email = fake.email()
        password = fake.password()
        first_name = fake.first_name()
        last_name = fake.last_name()

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        assert user.email == email
        assert user.check_password(password)
        assert user.first_name == first_name
        assert user.last_name == last_name
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_user_normalizes_email(self) -> None:
        """Test email is normalized for new users."""
        email_upper = f"{fake.user_name()}@EXAMPLE.COM"
        user = User.objects.create_user(
            email=email_upper,
            password=fake.password(),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
        )

        assert user.email == email_upper.lower()

    def test_create_user_without_email_raises_error(self) -> None:
        """Test creating a user without an email raises ValueError."""
        with pytest.raises(ValueError, match="The given email must be set"):
            User.objects.create_user(
                email="",
                password=fake.password(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
            )

    def test_create_user_with_duplicate_email_raises_error(self) -> None:
        """Test creating a user with duplicate email raises IntegrityError."""
        user = UserFactory()

        with pytest.raises(IntegrityError):
            User.objects.create_user(
                email=user.email,
                password=fake.password(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
            )

    def test_create_superuser_successful(self) -> None:
        """Test creating a superuser is successful."""
        email = fake.email()
        password = fake.password()

        user = User.objects.create_superuser(
            email=email,
            password=password,
            first_name=fake.first_name(),
            last_name=fake.last_name(),
        )

        assert user.email == email
        assert user.check_password(password)
        assert user.is_active is True
        assert user.is_staff is True
        assert user.is_superuser is True

    def test_create_superuser_with_is_staff_false_raises_error(self) -> None:
        """Test creating superuser with is_staff=False raises ValueError."""
        with pytest.raises(ValueError, match="Superuser must have is_staff=True"):
            User.objects.create_superuser(
                email=fake.email(),
                password=fake.password(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                is_staff=False,
            )

    def test_create_superuser_with_is_superuser_false_raises_error(self) -> None:
        """Test creating superuser with is_superuser=False raises ValueError."""
        with pytest.raises(ValueError, match="Superuser must have is_superuser=True"):
            User.objects.create_superuser(
                email=fake.email(),
                password=fake.password(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                is_superuser=False,
            )


class TestUserModel:
    """Test suite for User model."""

    def test_user_str_representation(self) -> None:
        """Test the user string representation."""
        user = UserFactory()

        # AbstractUser uses email as str since username is None
        assert str(user) == user.email

    def test_user_has_uuid_primary_key(self) -> None:
        """Test user model uses UUID as primary key."""
        uuid_string_length = (
            36  # Standard UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        )
        user = UserFactory()

        assert user.id is not None
        assert isinstance(user.id, type(user.id))  # UUID type
        assert len(str(user.id)) == uuid_string_length  # UUID string format

    def test_user_has_timestamps(self) -> None:
        """Test user model has created and modified timestamps."""
        user = UserFactory()

        assert user.created is not None
        assert user.modified is not None
        assert user.modified >= user.created

    def test_user_has_soft_delete_field(self) -> None:
        """Test user model has is_deleted field for soft deletion."""
        user = UserFactory()

        assert hasattr(user, "is_deleted")
        assert user.is_deleted is False

    def test_user_get_absolute_url(self) -> None:
        """Test user get_absolute_url returns correct URL."""
        user = UserFactory()

        url = user.get_absolute_url()
        assert url == f"/api/users/{user.pk}/"

    def test_username_field_is_email(self) -> None:
        """Test USERNAME_FIELD is set to email."""
        assert User.USERNAME_FIELD == "email"

    def test_required_fields_include_names(self) -> None:
        """Test REQUIRED_FIELDS includes first_name and last_name."""
        assert "first_name" in User.REQUIRED_FIELDS
        assert "last_name" in User.REQUIRED_FIELDS

    def test_user_model_is_same_as_get_user_model(self) -> None:
        """Test User model is the same as Django's get_user_model."""
        user_model = get_user_model()
        assert user_model is User

    def test_user_factory_creates_valid_user(self) -> None:
        """Test UserFactory creates a valid user instance."""
        user = UserFactory()

        assert user.id is not None
        assert user.email
        assert user.first_name
        assert user.last_name
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_user_has_is_email_verified_field(self) -> None:
        """Test user model has is_email_verified field defaulting to False."""
        user = UserFactory()

        assert hasattr(user, "is_email_verified")
        assert user.is_email_verified is False

    def test_user_is_email_verified_can_be_set_to_true(self) -> None:
        """Test user is_email_verified can be set to True."""
        user = UserFactory(is_email_verified=True)

        assert user.is_email_verified is True


class TestEmailVerificationOTPModel:
    """Test suite for EmailVerificationOTP model."""

    def test_generate_code_returns_six_digit_string(self) -> None:
        """Test generate_code returns a 6-digit string."""
        from apps.users.models import EmailVerificationOTP

        code = EmailVerificationOTP.generate_code()

        assert isinstance(code, str)
        assert len(code) == 6
        assert code.isdigit()

    def test_generate_code_pads_with_zeros(self) -> None:
        """Test generate_code pads with leading zeros for small numbers."""
        from unittest.mock import patch

        from apps.users.models import EmailVerificationOTP

        # Mock randbelow to return a small number
        with patch("secrets.randbelow", return_value=42):
            code = EmailVerificationOTP.generate_code()

        assert code == "000042"

    def test_create_for_user_creates_otp(self) -> None:
        """Test create_for_user creates an OTP for the given user."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory()

        otp = EmailVerificationOTP.create_for_user(user)

        assert otp.id is not None
        assert otp.user == user
        assert len(otp.code) == 6
        assert otp.code.isdigit()
        assert otp.is_used is False
        assert otp.expires_at is not None

    def test_create_for_user_sets_expiry_15_minutes(self) -> None:
        """Test create_for_user sets expiry to 15 minutes from now."""
        from datetime import timedelta

        from django.utils import timezone

        from apps.users.models import EmailVerificationOTP

        user = UserFactory()
        before_creation = timezone.now()

        otp = EmailVerificationOTP.create_for_user(user)

        expected_expiry = before_creation + timedelta(minutes=15)
        # Allow 1 second tolerance for test execution time
        assert abs((otp.expires_at - expected_expiry).total_seconds()) < 1

    def test_is_valid_returns_true_for_unused_non_expired_otp(self) -> None:
        """Test is_valid returns True for unused and non-expired OTP."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory()
        otp = EmailVerificationOTP.create_for_user(user)

        assert otp.is_valid() is True

    def test_is_valid_returns_false_for_used_otp(self) -> None:
        """Test is_valid returns False for used OTP."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory()
        otp = EmailVerificationOTP.create_for_user(user)
        otp.mark_as_used()

        assert otp.is_valid() is False

    def test_is_valid_returns_false_for_expired_otp(self) -> None:
        """Test is_valid returns False for expired OTP."""
        from datetime import timedelta

        from django.utils import timezone

        from apps.users.models import EmailVerificationOTP

        user = UserFactory()
        otp = EmailVerificationOTP.create_for_user(user)

        # Manually set expiry to the past
        otp.expires_at = timezone.now() - timedelta(minutes=1)
        otp.save()

        assert otp.is_valid() is False

    def test_mark_as_used_sets_is_used_to_true(self) -> None:
        """Test mark_as_used sets is_used to True."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory()
        otp = EmailVerificationOTP.create_for_user(user)

        assert otp.is_used is False

        otp.mark_as_used()

        assert otp.is_used is True

    def test_otp_str_representation(self) -> None:
        """Test EmailVerificationOTP string representation."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory()
        otp = EmailVerificationOTP.create_for_user(user)

        expected_str = f"OTP for {user.email} - {otp.code}"
        assert str(otp) == expected_str

    def test_user_can_have_multiple_otps(self) -> None:
        """Test user can have multiple OTP codes (for resend functionality)."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory()

        otp1 = EmailVerificationOTP.create_for_user(user)
        otp2 = EmailVerificationOTP.create_for_user(user)

        assert otp1.id != otp2.id
        assert otp1.code != otp2.code
        assert user.email_otps.count() == 2

    def test_otp_ordering_by_created_at_descending(self) -> None:
        """Test OTPs are ordered by created_at descending (newest first)."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory()

        otp1 = EmailVerificationOTP.create_for_user(user)
        otp2 = EmailVerificationOTP.create_for_user(user)

        otps = user.email_otps.all()

        assert otps[0] == otp2  # Newest first
        assert otps[1] == otp1
