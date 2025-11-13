"""
Tests for OTP resend functionality.

Following TDD approach - tests written FIRST before implementation.
"""

import pytest
from django.core import mail
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import EmailVerificationOTP
from apps.users.models import User


@pytest.mark.django_db
class TestResendOTP:
    """Test suite for resend OTP endpoint."""

    def setup_method(self):
        """Set up test client and create test user."""
        # Clear cache to reset throttle counters between tests
        cache.clear()

        self.client = APIClient()
        self.url = reverse("api:auth-resend-otp")

        # Create a user with unverified email
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            is_email_verified=False,
        )

    def test_resend_otp_endpoint_exists(self):
        """Test that resend OTP endpoint is accessible."""
        response = self.client.post(self.url, {})
        # Should not be 404
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_resend_otp_successful(self):
        """Test resending OTP to existing user with unverified email."""
        response = self.client.post(
            self.url,
            {"email": self.user.email},
        )

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data
        assert "sent" in response.data["message"].lower()

    def test_resend_otp_sends_email(self):
        """Test that resending OTP actually sends an email."""
        self.client.post(
            self.url,
            {"email": self.user.email},
        )

        # Check that email was sent
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == [self.user.email]

    def test_resend_otp_creates_new_otp(self):
        """Test that resending OTP creates a new OTP code."""
        # Create initial OTP
        old_otp = EmailVerificationOTP.create_for_user(self.user)
        old_code = old_otp.code

        # Resend OTP
        self.client.post(
            self.url,
            {"email": self.user.email},
        )

        # Check that a new OTP was created
        new_otp = (
            EmailVerificationOTP.objects.filter(
                user=self.user,
            )
            .order_by("-created")
            .first()
        )

        assert new_otp is not None
        assert new_otp.code != old_code

    def test_resend_otp_with_nonexistent_email_returns_success(self):
        """Test that resending OTP to non-existent email returns success (security)."""
        response = self.client.post(
            self.url,
            {"email": "nonexistent@example.com"},
        )

        # Should return success to prevent email enumeration
        assert response.status_code == status.HTTP_200_OK
        # But no email should actually be sent
        assert len(mail.outbox) == 0

    def test_resend_otp_with_already_verified_email_fails(self):
        """Test that resending OTP to already verified email fails."""
        # Mark user as verified
        self.user.is_email_verified = True
        self.user.save()

        response = self.client.post(
            self.url,
            {"email": self.user.email},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "verified" in str(response.data).lower()

    def test_resend_otp_without_email_fails(self):
        """Test that resending OTP without email parameter fails."""
        response = self.client.post(self.url, {})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_resend_otp_with_invalid_email_format_fails(self):
        """Test that resending OTP with invalid email format fails."""
        response = self.client.post(
            self.url,
            {"email": "not-an-email"},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_resend_otp_normalizes_email(self):
        """Test that email is normalized (lowercased) before lookup."""
        response = self.client.post(
            self.url,
            {"email": "TeSt@ExAmPlE.cOm"},  # Mixed case
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == [self.user.email]

    def test_resend_otp_rate_limiting(self):
        """Test that resending OTP is rate limited to 3 requests per hour per email."""
        # First 3 requests should succeed (within rate limit)
        for i in range(3):
            response = self.client.post(
                self.url,
                {"email": self.user.email},
            )
            assert response.status_code == status.HTTP_200_OK, (
                f"Request {i + 1} should succeed"
            )

        # 4th request should be throttled (429 Too Many Requests)
        response = self.client.post(
            self.url,
            {"email": self.user.email},
        )
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert (
            "throttled" in str(response.data).lower()
            or "rate limit" in str(response.data).lower()
        )

        # Only 3 emails should be sent (4th request was blocked)
        assert len(mail.outbox) == 3

    def test_resend_otp_rate_limiting_is_per_email(self):
        """Test that rate limiting is per email address (not global)."""
        # Create second user
        user2 = User.objects.create_user(
            email="test2@example.com",
            password="testpass123",
            first_name="Test2",
            last_name="User2",
            is_email_verified=False,
        )

        # Exhaust rate limit for first user (3 requests)
        for _ in range(3):
            response = self.client.post(
                self.url,
                {"email": self.user.email},
            )
            assert response.status_code == status.HTTP_200_OK

        # 4th request for first user should be throttled
        response = self.client.post(
            self.url,
            {"email": self.user.email},
        )
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

        # But requests for second user should still work (separate rate limit)
        response = self.client.post(
            self.url,
            {"email": user2.email},
        )
        assert response.status_code == status.HTTP_200_OK

        # Total: 3 emails for user1 + 1 email for user2 = 4 emails
        assert len(mail.outbox) == 4

    def test_resend_otp_does_not_expose_user_existence(self):
        """Test response is same for existing and non-existing emails."""
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

        # Both should return same response structure (don't leak user existence)
        # This is a security best practice
        assert response1.status_code == response2.status_code
