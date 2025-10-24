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
        user = UserFactory()

        assert user.id is not None
        assert isinstance(user.id, type(user.id))  # UUID type
        assert len(str(user.id)) == 36  # UUID string format

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
