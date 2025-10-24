"""Tests for User API endpoints."""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User
from apps.users.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


class TestUserViewSet:
    """Test suite for UserViewSet API endpoints."""

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Create an API client for testing."""
        return APIClient()

    @pytest.fixture
    def authenticated_user(self) -> User:
        """Create and return an authenticated user."""
        return UserFactory()

    def test_list_users_requires_authentication(self, api_client: APIClient) -> None:
        """Test that listing users requires authentication."""
        url = reverse("api:user-list")
        response = api_client.get(url)

        # DRF returns 403 with IsAuthenticated permission class
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_users_returns_only_current_user(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test authenticated user can only see themselves in list."""
        # Create other users
        UserFactory.create_batch(3)

        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["email"] == authenticated_user.email

    def test_retrieve_user_requires_authentication(self, api_client: APIClient) -> None:
        """Test that retrieving a user requires authentication."""
        user = UserFactory()
        url = reverse("api:user-detail", kwargs={"pk": user.pk})
        response = api_client.get(url)

        # DRF returns 403 with IsAuthenticated permission class
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_retrieve_own_user_successful(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test authenticated user can retrieve their own details."""
        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-detail", kwargs={"pk": authenticated_user.pk})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == authenticated_user.email
        assert response.data["first_name"] == authenticated_user.first_name
        assert response.data["last_name"] == authenticated_user.last_name

    def test_retrieve_other_user_forbidden(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test authenticated user cannot retrieve other users."""
        other_user = UserFactory()

        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-detail", kwargs={"pk": other_user.pk})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_own_user_successful(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test authenticated user can update their own details."""
        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-detail", kwargs={"pk": authenticated_user.pk})

        update_data = {
            "first_name": "UpdatedFirst",
            "last_name": "UpdatedLast",
            "email": authenticated_user.email,
        }

        response = api_client.put(url, update_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == "UpdatedFirst"
        assert response.data["last_name"] == "UpdatedLast"

        # Verify database was updated
        authenticated_user.refresh_from_db()
        assert authenticated_user.first_name == "UpdatedFirst"
        assert authenticated_user.last_name == "UpdatedLast"

    def test_partial_update_own_user_successful(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test authenticated user can partially update their own details."""
        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-detail", kwargs={"pk": authenticated_user.pk})

        original_last_name = authenticated_user.last_name
        update_data = {"first_name": "PatchedFirst"}

        response = api_client.patch(url, update_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == "PatchedFirst"
        assert response.data["last_name"] == original_last_name

        # Verify database was updated
        authenticated_user.refresh_from_db()
        assert authenticated_user.first_name == "PatchedFirst"
        assert authenticated_user.last_name == original_last_name

    def test_update_other_user_forbidden(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test authenticated user cannot update other users."""
        other_user = UserFactory()

        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-detail", kwargs={"pk": other_user.pk})

        update_data = {
            "first_name": "Hacked",
            "last_name": "User",
            "email": other_user.email,
        }

        response = api_client.put(url, update_data, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Verify other user was not updated
        other_user.refresh_from_db()
        assert other_user.first_name != "Hacked"

    def test_me_endpoint_returns_current_user(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test /me endpoint returns current authenticated user."""
        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-me")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == authenticated_user.email
        assert response.data["first_name"] == authenticated_user.first_name
        assert response.data["last_name"] == authenticated_user.last_name

    def test_me_endpoint_requires_authentication(self, api_client: APIClient) -> None:
        """Test /me endpoint requires authentication."""
        url = reverse("api:user-me")
        response = api_client.get(url)

        # DRF returns 403 with IsAuthenticated permission class
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_user_not_allowed(self, api_client: APIClient) -> None:
        """Test creating users via API is not allowed."""
        url = reverse("api:user-list")
        new_user_data = {
            "email": "newuser@example.com",
            "first_name": "New",
            "last_name": "User",
        }

        response = api_client.post(url, new_user_data, format="json")

        # Should be 403 (forbidden) or 405 (method not allowed)
        assert response.status_code in [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        ]

    def test_delete_user_not_allowed(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test deleting users via API is not allowed."""
        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-detail", kwargs={"pk": authenticated_user.pk})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        # Verify user still exists
        assert User.objects.filter(pk=authenticated_user.pk).exists()

    def test_queryset_filters_by_current_user(
        self,
        api_client: APIClient,
        authenticated_user: User,
    ) -> None:
        """Test that queryset is properly filtered to current user."""
        # Create multiple users
        other_users = UserFactory.create_batch(5)

        api_client.force_authenticate(user=authenticated_user)
        url = reverse("api:user-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

        # Ensure it's the authenticated user
        returned_emails = [user["email"] for user in response.data]
        assert authenticated_user.email in returned_emails

        # Ensure other users are not in response
        for other_user in other_users:
            assert other_user.email not in returned_emails
