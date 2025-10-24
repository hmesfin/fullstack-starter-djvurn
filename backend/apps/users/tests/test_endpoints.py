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
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

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
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

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
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_user_not_allowed(self, api_client: APIClient) -> None:
        """Test creating users via API is not allowed."""
        url = reverse("api:user-list")
        new_user_data = {
            "email": "newuser@example.com",
            "first_name": "New",
            "last_name": "User",
        }

        response = api_client.post(url, new_user_data, format="json")

        # Should be 401 (unauthorized) or 405 (method not allowed)
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
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


class TestUserRegistration:
    """Test suite for user registration with OTP email verification."""

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Create an API client for testing."""
        return APIClient()

    def test_register_user_successful(self, api_client: APIClient) -> None:
        """Test successful user registration creates user and OTP."""
        from apps.users.models import EmailVerificationOTP

        url = reverse("api:auth-register")
        registration_data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = api_client.post(url, registration_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert "email" in response.data
        assert response.data["email"] == "newuser@example.com"
        assert "password" not in response.data  # Password should not be in response

        # Verify user was created
        user = User.objects.get(email="newuser@example.com")
        assert user.first_name == "John"
        assert user.last_name == "Doe"
        assert user.is_email_verified is False  # Should not be verified yet
        assert user.is_active is True  # Should be active
        assert user.check_password("SecurePass123!")  # Password should be hashed

        # Verify OTP was created
        otp = EmailVerificationOTP.objects.filter(user=user, is_used=False).first()
        assert otp is not None
        assert len(otp.code) == 6
        assert otp.is_valid() is True

    def test_register_user_with_duplicate_email_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test registration with duplicate email returns 400."""
        existing_user = UserFactory(email="existing@example.com")

        url = reverse("api:auth-register")
        registration_data = {
            "email": "existing@example.com",
            "password": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = api_client.post(url, registration_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_register_user_with_invalid_email_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test registration with invalid email returns 400."""
        url = reverse("api:auth-register")
        registration_data = {
            "email": "not-an-email",
            "password": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = api_client.post(url, registration_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_register_user_without_required_fields_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test registration without required fields returns 400."""
        url = reverse("api:auth-register")

        # Missing first_name
        response = api_client.post(
            url,
            {
                "email": "test@example.com",
                "password": "SecurePass123!",
                "last_name": "Doe",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "first_name" in response.data

        # Missing last_name
        response = api_client.post(
            url,
            {
                "email": "test@example.com",
                "password": "SecurePass123!",
                "first_name": "John",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "last_name" in response.data

        # Missing password
        response = api_client.post(
            url,
            {
                "email": "test@example.com",
                "first_name": "John",
                "last_name": "Doe",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data

    def test_register_user_with_weak_password_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test registration with weak password returns 400."""
        url = reverse("api:auth-register")
        registration_data = {
            "email": "test@example.com",
            "password": "123",  # Too short
            "first_name": "John",
            "last_name": "Doe",
        }

        response = api_client.post(url, registration_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data

    def test_registration_normalizes_email(self, api_client: APIClient) -> None:
        """Test registration normalizes email to lowercase."""
        url = reverse("api:auth-register")
        registration_data = {
            "email": "NewUser@EXAMPLE.COM",
            "password": "SecurePass123!",
            "first_name": "John",
            "last_name": "Doe",
        }

        response = api_client.post(url, registration_data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        user = User.objects.get(email="newuser@example.com")
        assert user.email == "newuser@example.com"


class TestOTPVerification:
    """Test suite for OTP email verification."""

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Create an API client for testing."""
        return APIClient()

    def test_verify_otp_successful(self, api_client: APIClient) -> None:
        """Test successful OTP verification marks user as verified."""
        from apps.users.models import EmailVerificationOTP

        # Create user with OTP
        user = UserFactory(is_email_verified=False)
        otp = EmailVerificationOTP.create_for_user(user)

        url = reverse("api:auth-verify-otp")
        verification_data = {
            "email": user.email,
            "code": otp.code,
        }

        response = api_client.post(url, verification_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data

        # Verify user is now email verified
        user.refresh_from_db()
        assert user.is_email_verified is True

        # Verify OTP is marked as used
        otp.refresh_from_db()
        assert otp.is_used is True

    def test_verify_otp_with_invalid_code_fails(self, api_client: APIClient) -> None:
        """Test OTP verification with invalid code returns 400."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory(is_email_verified=False)
        otp = EmailVerificationOTP.create_for_user(user)

        url = reverse("api:auth-verify-otp")
        verification_data = {
            "email": user.email,
            "code": "999999",  # Wrong code
        }

        response = api_client.post(url, verification_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # User should still not be verified
        user.refresh_from_db()
        assert user.is_email_verified is False

    def test_verify_otp_with_expired_code_fails(self, api_client: APIClient) -> None:
        """Test OTP verification with expired code returns 400."""
        from datetime import timedelta

        from django.utils import timezone

        from apps.users.models import EmailVerificationOTP

        user = UserFactory(is_email_verified=False)
        otp = EmailVerificationOTP.create_for_user(user)

        # Manually expire the OTP
        otp.expires_at = timezone.now() - timedelta(minutes=1)
        otp.save()

        url = reverse("api:auth-verify-otp")
        verification_data = {
            "email": user.email,
            "code": otp.code,
        }

        response = api_client.post(url, verification_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # User should still not be verified
        user.refresh_from_db()
        assert user.is_email_verified is False

    def test_verify_otp_with_used_code_fails(self, api_client: APIClient) -> None:
        """Test OTP verification with already used code returns 400."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory(is_email_verified=False)
        otp = EmailVerificationOTP.create_for_user(user)
        otp.mark_as_used()

        url = reverse("api:auth-verify-otp")
        verification_data = {
            "email": user.email,
            "code": otp.code,
        }

        response = api_client.post(url, verification_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_with_nonexistent_email_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test OTP verification with non-existent email returns 400."""
        url = reverse("api:auth-verify-otp")
        verification_data = {
            "email": "nonexistent@example.com",
            "code": "123456",
        }

        response = api_client.post(url, verification_data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_without_required_fields_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test OTP verification without required fields returns 400."""
        url = reverse("api:auth-verify-otp")

        # Missing code
        response = api_client.post(
            url,
            {"email": "test@example.com"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Missing email
        response = api_client.post(
            url,
            {"code": "123456"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_otp_uses_most_recent_valid_code(
        self,
        api_client: APIClient,
    ) -> None:
        """Test OTP verification uses the most recent valid code."""
        from apps.users.models import EmailVerificationOTP

        user = UserFactory(is_email_verified=False)

        # Create two OTPs
        old_otp = EmailVerificationOTP.create_for_user(user)
        new_otp = EmailVerificationOTP.create_for_user(user)

        url = reverse("api:auth-verify-otp")

        # Verify with new code should work
        verification_data = {
            "email": user.email,
            "code": new_otp.code,
        }

        response = api_client.post(url, verification_data, format="json")

        assert response.status_code == status.HTTP_200_OK

        # User should be verified
        user.refresh_from_db()
        assert user.is_email_verified is True


class TestJWTAuthentication:
    """Test suite for JWT token authentication with email verification."""

    @pytest.fixture
    def api_client(self) -> APIClient:
        """Create an API client for testing."""
        return APIClient()

    def test_obtain_token_with_verified_email_successful(
        self,
        api_client: APIClient,
    ) -> None:
        """Test obtaining JWT tokens with verified email is successful."""
        # Create user with verified email
        user = UserFactory(is_email_verified=True)
        password = "SecurePass123!"
        user.set_password(password)
        user.save()

        url = reverse("api:auth-token")
        credentials = {
            "email": user.email,
            "password": password,
        }

        response = api_client.post(url, credentials, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["access"] is not None
        assert response.data["refresh"] is not None

    def test_obtain_token_with_unverified_email_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test obtaining JWT tokens with unverified email fails."""
        # Create user with unverified email
        user = UserFactory(is_email_verified=False)
        password = "SecurePass123!"
        user.set_password(password)
        user.save()

        url = reverse("api:auth-token")
        credentials = {
            "email": user.email,
            "password": password,
        }

        response = api_client.post(url, credentials, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data or "detail" in response.data

    def test_obtain_token_with_invalid_credentials_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test obtaining JWT tokens with invalid credentials fails."""
        user = UserFactory(is_email_verified=True)

        url = reverse("api:auth-token")
        credentials = {
            "email": user.email,
            "password": "WrongPassword123!",
        }

        response = api_client.post(url, credentials, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_token_successful(self, api_client: APIClient) -> None:
        """Test refreshing JWT tokens is successful."""
        # Create user and obtain tokens first
        user = UserFactory(is_email_verified=True)
        password = "SecurePass123!"
        user.set_password(password)
        user.save()

        # Obtain initial tokens
        token_url = reverse("api:auth-token")
        credentials = {
            "email": user.email,
            "password": password,
        }
        token_response = api_client.post(token_url, credentials, format="json")
        refresh_token = token_response.data["refresh"]

        # Refresh the token
        refresh_url = reverse("api:auth-token-refresh")
        refresh_data = {"refresh": refresh_token}

        response = api_client.post(refresh_url, refresh_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert response.data["access"] is not None

    def test_access_protected_endpoint_with_valid_token(
        self,
        api_client: APIClient,
    ) -> None:
        """Test accessing protected endpoint with valid JWT token."""
        # Create user and obtain token
        user = UserFactory(is_email_verified=True)
        password = "SecurePass123!"
        user.set_password(password)
        user.save()

        # Obtain token
        token_url = reverse("api:auth-token")
        credentials = {
            "email": user.email,
            "password": password,
        }
        token_response = api_client.post(token_url, credentials, format="json")
        access_token = token_response.data["access"]

        # Access protected endpoint
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        url = reverse("api:user-me")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == user.email

    def test_access_protected_endpoint_without_token_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test accessing protected endpoint without token fails."""
        url = reverse("api:user-me")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_access_protected_endpoint_with_invalid_token_fails(
        self,
        api_client: APIClient,
    ) -> None:
        """Test accessing protected endpoint with invalid token fails."""
        # Use invalid token
        api_client.credentials(HTTP_AUTHORIZATION="Bearer invalid_token_here")
        url = reverse("api:user-me")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
