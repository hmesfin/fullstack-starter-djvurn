"""
Tests for OTP-based Password Reset API Endpoints

TDD Implementation - RED Phase
Tests written FIRST before implementation
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User


@pytest.mark.django_db
class TestPasswordResetOTPRequestEndpoint:
    """Tests for POST /api/auth/password-reset-otp/request/"""

    def setup_method(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.url = reverse("api:auth-password-reset-otp-request")
        self.user = User.objects.create_user(
            email="test@example.com",
            password="OldPassword123!",
            first_name="Test",
            last_name="User",
            is_email_verified=True,
        )

    def test_request_password_reset_otp_success(self):
        """Test successful password reset OTP request."""
        data = {"email": "test@example.com"}

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data
        # Security: Don't leak user existence
        assert "otp" in response.data["message"].lower() or "code" in response.data["message"].lower()

    def test_request_password_reset_otp_creates_otp_record(self):
        """Test that OTP record is created in database."""
        from apps.users.models import PasswordResetOTP

        data = {"email": "test@example.com"}

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        # Check OTP was created
        otp = PasswordResetOTP.objects.filter(user=self.user).first()
        assert otp is not None
        assert otp.code.isdigit()
        assert len(otp.code) == 6
        assert otp.is_used is False

    def test_request_password_reset_otp_invalidates_old_codes(self):
        """Test that requesting new OTP invalidates previous unused codes."""
        from apps.users.models import PasswordResetOTP

        # Create first OTP
        self.client.post(self.url, {"email": "test@example.com"}, format="json")
        first_otp = PasswordResetOTP.objects.filter(user=self.user).first()
        first_code = first_otp.code

        # Create second OTP
        self.client.post(self.url, {"email": "test@example.com"}, format="json")

        # First OTP should be invalidated
        first_otp.refresh_from_db()
        assert first_otp.is_used is True

        # New OTP should exist and be different
        new_otp = PasswordResetOTP.objects.filter(user=self.user, is_used=False).first()
        assert new_otp is not None
        assert new_otp.code != first_code

    def test_request_password_reset_otp_nonexistent_email(self):
        """Test password reset request with non-existent email (security: don't leak info)."""
        data = {"email": "nonexistent@example.com"}

        response = self.client.post(self.url, data, format="json")

        # Should return success to prevent email enumeration
        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data

    def test_request_password_reset_otp_invalid_email_format(self):
        """Test password reset request with invalid email format."""
        data = {"email": "not-an-email"}

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_request_password_reset_otp_missing_email(self):
        """Test password reset request without email."""
        data = {}

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data


@pytest.mark.django_db
class TestPasswordResetOTPConfirmEndpoint:
    """Tests for POST /api/auth/password-reset-otp/confirm/"""

    def setup_method(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.url = reverse("api:auth-password-reset-otp-confirm")
        self.user = User.objects.create_user(
            email="test@example.com",
            password="OldPassword123!",
            first_name="Test",
            last_name="User",
            is_email_verified=True,
        )

    def _create_valid_otp(self):
        """Helper to create a valid OTP code."""
        from apps.users.models import PasswordResetOTP

        otp = PasswordResetOTP.create_for_user(self.user)
        return otp.code

    def test_confirm_password_reset_otp_success(self):
        """Test successful password reset with valid OTP."""
        code = self._create_valid_otp()
        data = {
            "email": "test@example.com",
            "code": code,
            "password": "NewPassword456!",
        }

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.data

        # Verify password was changed
        self.user.refresh_from_db()
        assert self.user.check_password("NewPassword456!")

    def test_confirm_password_reset_otp_marks_code_as_used(self):
        """Test that OTP code is marked as used after successful reset."""
        from apps.users.models import PasswordResetOTP

        code = self._create_valid_otp()
        data = {
            "email": "test@example.com",
            "code": code,
            "password": "NewPassword456!",
        }

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_200_OK

        # Check OTP is marked as used
        otp = PasswordResetOTP.objects.get(code=code)
        assert otp.is_used is True

    def test_confirm_password_reset_otp_invalid_code(self):
        """Test password reset with invalid OTP code."""
        data = {
            "email": "test@example.com",
            "code": "999999",
            "password": "NewPassword456!",
        }

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "code" in str(response.data).lower() or "otp" in str(response.data).lower()

    def test_confirm_password_reset_otp_already_used(self):
        """Test password reset with already used OTP code."""
        from apps.users.models import PasswordResetOTP

        code = self._create_valid_otp()

        # Use the code once
        data = {
            "email": "test@example.com",
            "code": code,
            "password": "NewPassword456!",
        }
        self.client.post(self.url, data, format="json")

        # Try to use it again
        data["password"] = "AnotherPassword789!"
        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_confirm_password_reset_otp_expired_code(self):
        """Test password reset with expired OTP code."""
        from datetime import timedelta

        from django.utils import timezone

        from apps.users.models import PasswordResetOTP

        # Create OTP and manually expire it
        otp = PasswordResetOTP.create_for_user(self.user)
        otp.expires_at = timezone.now() - timedelta(minutes=1)
        otp.save()

        data = {
            "email": "test@example.com",
            "code": otp.code,
            "password": "NewPassword456!",
        }

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_confirm_password_reset_otp_weak_password(self):
        """Test password reset with weak password (should be rejected by validators)."""
        code = self._create_valid_otp()
        data = {
            "email": "test@example.com",
            "code": code,
            "password": "weak",
        }

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.data

    def test_confirm_password_reset_otp_missing_fields(self):
        """Test password reset with missing required fields."""
        # Missing code
        response = self.client.post(
            self.url,
            {"email": "test@example.com", "password": "NewPassword456!"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Missing email
        response = self.client.post(
            self.url,
            {"code": "123456", "password": "NewPassword456!"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Missing password
        response = self.client.post(
            self.url,
            {"email": "test@example.com", "code": "123456"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_confirm_password_reset_otp_wrong_user_email(self):
        """Test password reset with OTP code for different user."""
        # Create OTP for original user
        code = self._create_valid_otp()

        # Create another user
        User.objects.create_user(
            email="other@example.com",
            password="Password123!",
            first_name="Other",
            last_name="User",
        )

        # Try to use first user's code with second user's email
        data = {
            "email": "other@example.com",
            "code": code,
            "password": "NewPassword456!",
        }

        response = self.client.post(self.url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
