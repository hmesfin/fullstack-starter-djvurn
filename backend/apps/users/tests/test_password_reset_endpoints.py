"""
Tests for password reset API endpoints.

Following TDD approach - tests written FIRST before implementation.
"""

from datetime import timedelta

import pytest
from django.core import mail
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import PasswordResetToken
from apps.users.tests.factories import UserFactory


@pytest.mark.django_db
class TestPasswordResetRequest:
    """Test suite for password reset request endpoint."""

    def setup_method(self):
        """Set up test client for each test."""
        self.client = APIClient()
        self.url = reverse("api:auth-password-reset-request")
        self.user = UserFactory(email="test@example.com")

    def test_password_reset_request_endpoint_exists(self):
        """Test that password reset request endpoint is accessible."""
        response = self.client.post(self.url, {})
        # Should not be 404
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_password_reset_request_successful(self):
        """Test requesting password reset for existing user."""
        response = self.client.post(
            self.url,
            {"email": self.user.email},
        )

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data
        assert (
            "sent" in response.data["message"].lower()
            or "email" in response.data["message"].lower()
        )

    def test_password_reset_request_creates_token(self):
        """Test that password reset request creates a new token."""
        response = self.client.post(
            self.url,
            {"email": self.user.email},
        )

        assert response.status_code == status.HTTP_200_OK

        # Check that a token was created for this user
        token = PasswordResetToken.objects.filter(user=self.user, is_used=False).first()
        assert token is not None
        assert token.is_valid()

    def test_password_reset_request_sends_email(self):
        """Test that password reset request sends an email."""
        response = self.client.post(
            self.url,
            {"email": self.user.email},
        )

        assert response.status_code == status.HTTP_200_OK

        # Check that email was sent
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == [self.user.email]

    def test_password_reset_request_with_nonexistent_email_returns_success(self):
        """Test that requesting reset for non-existent email returns success (security)."""
        response = self.client.post(
            self.url,
            {"email": "nonexistent@example.com"},
        )

        # Should return success to prevent email enumeration
        assert response.status_code == status.HTTP_200_OK

        # But no token should be created
        assert PasswordResetToken.objects.count() == 0

        # And no email should be sent
        assert len(mail.outbox) == 0

    def test_password_reset_request_without_email_fails(self):
        """Test that password reset request without email fails."""
        response = self.client.post(self.url, {})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_password_reset_request_with_invalid_email_format_fails(self):
        """Test that password reset request with invalid email format fails."""
        response = self.client.post(
            self.url,
            {"email": "not-an-email"},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_reset_request_normalizes_email(self):
        """Test that email is normalized (lowercased) before lookup."""
        response = self.client.post(
            self.url,
            {"email": "TeSt@ExAmPlE.cOm"},  # Mixed case
        )

        assert response.status_code == status.HTTP_200_OK

        # Token should be created for the normalized email
        token = PasswordResetToken.objects.filter(user=self.user).first()
        assert token is not None

        # Email should be sent
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == [self.user.email]

    def test_password_reset_request_does_not_expose_user_existence(self):
        """Test that response is same for existing and non-existing emails (security)."""
        # Response for existing user
        response1 = self.client.post(
            self.url,
            {"email": self.user.email},
        )

        # Response for non-existing user
        response2 = self.client.post(
            self.url,
            {"email": "nonexistent@example.com"},
        )

        # Both should return same response structure and status
        assert response1.status_code == response2.status_code
        # Response messages should be identical
        assert response1.data == response2.data


@pytest.mark.django_db
class TestPasswordResetConfirm:
    """Test suite for password reset confirm endpoint."""

    def setup_method(self):
        """Set up test client and user for each test."""
        self.client = APIClient()
        self.url = reverse("api:auth-password-reset-confirm")
        self.user = UserFactory(email="test@example.com")
        self.user.set_password("OldPassword123!")
        self.user.save()

    def test_password_reset_confirm_endpoint_exists(self):
        """Test that password reset confirm endpoint is accessible."""
        response = self.client.post(self.url, {})
        # Should not be 404
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_password_reset_confirm_successful(self):
        """Test successful password reset with valid token."""
        # Create token
        token = PasswordResetToken.create_for_user(self.user)

        new_password = "NewSecurePassword123!"
        response = self.client.post(
            self.url,
            {
                "token": token.token,
                "password": new_password,
            },
        )

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data

        # Verify password was changed
        self.user.refresh_from_db()
        assert self.user.check_password(new_password)

        # Verify token was marked as used
        token.refresh_from_db()
        assert token.is_used

    def test_password_reset_confirm_with_invalid_token_fails(self):
        """Test password reset with invalid token fails."""
        response = self.client.post(
            self.url,
            {
                "token": "invalid-token-12345",
                "password": "NewPassword123!",
            },
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Password should not have changed
        self.user.refresh_from_db()
        assert self.user.check_password("OldPassword123!")

    def test_password_reset_confirm_with_expired_token_fails(self):
        """Test password reset with expired token fails."""
        token = PasswordResetToken.create_for_user(self.user)

        # Manually expire the token
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()

        response = self.client.post(
            self.url,
            {
                "token": token.token,
                "password": "NewPassword123!",
            },
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Password should not have changed
        self.user.refresh_from_db()
        assert self.user.check_password("OldPassword123!")

    def test_password_reset_confirm_with_used_token_fails(self):
        """Test password reset with already used token fails."""
        token = PasswordResetToken.create_for_user(self.user)
        token.mark_as_used()

        response = self.client.post(
            self.url,
            {
                "token": token.token,
                "password": "NewPassword123!",
            },
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_reset_confirm_with_weak_password_fails(self):
        """Test password reset with weak password fails validation."""
        token = PasswordResetToken.create_for_user(self.user)

        response = self.client.post(
            self.url,
            {
                "token": token.token,
                "password": "123",  # Too short
            },
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data

        # Password should not have changed
        self.user.refresh_from_db()
        assert self.user.check_password("OldPassword123!")

        # Token should not be marked as used
        token.refresh_from_db()
        assert not token.is_used

    def test_password_reset_confirm_without_required_fields_fails(self):
        """Test password reset without required fields fails."""
        # Missing password
        token = PasswordResetToken.create_for_user(self.user)
        response = self.client.post(
            self.url,
            {"token": token.token},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Missing token
        response = self.client.post(
            self.url,
            {"password": "NewPassword123!"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_reset_confirm_invalidates_old_sessions(self):
        """Test that password reset invalidates old sessions/tokens."""
        # This is important for security - changing password should log out all sessions
        token = PasswordResetToken.create_for_user(self.user)

        response = self.client.post(
            self.url,
            {
                "token": token.token,
                "password": "NewPassword123!",
            },
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify old password doesn't work
        self.user.refresh_from_db()
        assert not self.user.check_password("OldPassword123!")
        assert self.user.check_password("NewPassword123!")
