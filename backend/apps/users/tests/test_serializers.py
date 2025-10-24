"""Tests for User serializers."""

import pytest
from django.test import RequestFactory

from apps.users.api.serializers import UserSerializer
from apps.users.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


class TestUserSerializer:
    """Test suite for UserSerializer."""

    def test_serialize_user(self) -> None:
        """Test serializing a user instance."""
        user = UserFactory()
        factory = RequestFactory()
        request = factory.get("/")

        serializer = UserSerializer(user, context={"request": request})
        data = serializer.data

        assert data["email"] == user.email
        assert data["first_name"] == user.first_name
        assert data["last_name"] == user.last_name
        assert "url" in data

    def test_serializer_contains_expected_fields(self) -> None:
        """Test serializer contains only expected fields."""
        user = UserFactory()
        factory = RequestFactory()
        request = factory.get("/")

        serializer = UserSerializer(user, context={"request": request})
        data = serializer.data

        expected_fields = {"email", "first_name", "last_name", "url"}
        assert set(data.keys()) == expected_fields

    def test_serializer_does_not_expose_sensitive_fields(self) -> None:
        """Test serializer does not expose sensitive fields."""
        user = UserFactory()
        factory = RequestFactory()
        request = factory.get("/")

        serializer = UserSerializer(user, context={"request": request})
        data = serializer.data

        # Sensitive fields should not be in serialized data
        assert "password" not in data
        assert "is_staff" not in data
        assert "is_superuser" not in data
        assert "is_active" not in data
        assert "id" not in data

    def test_deserialize_user_data(self) -> None:
        """Test deserializing user data for updates."""
        user = UserFactory()
        factory = RequestFactory()
        request = factory.get("/")

        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "email": user.email,  # Email must be included
        }

        serializer = UserSerializer(
            user,
            data=update_data,
            context={"request": request},
            partial=False,
        )

        assert serializer.is_valid()
        updated_user = serializer.save()

        assert updated_user.first_name == "Updated"
        assert updated_user.last_name == "Name"
        assert updated_user.email == user.email

    def test_partial_update_user(self) -> None:
        """Test partial update of user data."""
        user = UserFactory()
        factory = RequestFactory()
        request = factory.get("/")

        update_data = {"first_name": "PartialUpdate"}

        serializer = UserSerializer(
            user,
            data=update_data,
            context={"request": request},
            partial=True,
        )

        assert serializer.is_valid()
        updated_user = serializer.save()

        assert updated_user.first_name == "PartialUpdate"
        assert updated_user.last_name == user.last_name  # Unchanged
        assert updated_user.email == user.email  # Unchanged

    def test_serializer_validates_email_uniqueness(self) -> None:
        """Test serializer validates email uniqueness on create."""
        existing_user = UserFactory()
        factory = RequestFactory()
        request = factory.get("/")

        # Try to create a new user with existing email
        data = {
            "email": existing_user.email,
            "first_name": "New",
            "last_name": "User",
        }

        serializer = UserSerializer(data=data, context={"request": request})

        assert not serializer.is_valid()
        assert "email" in serializer.errors

    def test_serializer_url_field_format(self) -> None:
        """Test the url field is properly formatted."""
        user = UserFactory()
        factory = RequestFactory()
        request = factory.get("/")

        serializer = UserSerializer(user, context={"request": request})
        data = serializer.data

        # URL should contain the user's pk
        assert str(user.pk) in data["url"]
        assert data["url"].endswith(f"/users/{user.pk}/")
