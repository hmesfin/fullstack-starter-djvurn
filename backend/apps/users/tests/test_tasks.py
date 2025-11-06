"""
Tests for Celery tasks in the users app.

Following TDD approach - tests written FIRST before implementation.
"""

import pytest
from django.core import mail
from django.utils import timezone

from apps.users.models import EmailVerificationOTP
from apps.users.models import User
from apps.users.tasks import send_otp_email


@pytest.mark.django_db
class TestSendOTPEmail:
    """Test suite for send_otp_email Celery task."""

    def test_send_otp_email_success(self):
        """Test that OTP email is sent successfully."""
        # Create a user and OTP
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )
        otp = EmailVerificationOTP.create_for_user(user)

        # Call the task
        send_otp_email(user.id, otp.code)

        # Assert email was sent
        assert len(mail.outbox) == 1
        email = mail.outbox[0]
        assert email.to == [user.email]
        assert otp.code in email.body  # OTP code should be in email body
        assert "verify" in email.subject.lower() or "otp" in email.subject.lower()

    def test_send_otp_email_contains_code(self):
        """Test that email contains the OTP code."""
        user = User.objects.create_user(
            email="user@test.com",
            password="testpass123",
            first_name="Jane",
            last_name="Doe",
        )
        otp = EmailVerificationOTP.create_for_user(user)

        send_otp_email(user.id, otp.code)

        email = mail.outbox[0]
        # Check both plain text and HTML versions
        assert otp.code in email.body
        if email.alternatives:
            html_body = email.alternatives[0][0]
            assert otp.code in html_body

    def test_send_otp_email_personalizes_message(self):
        """Test that email is personalized with user's name."""
        user = User.objects.create_user(
            email="john@example.com",
            password="testpass123",
            first_name="John",
            last_name="Smith",
        )
        otp = EmailVerificationOTP.create_for_user(user)

        send_otp_email(user.id, otp.code)

        email = mail.outbox[0]
        # Check that user's first name appears in the email
        assert user.first_name in email.body or "John" in email.body

    def test_send_otp_email_includes_expiry_info(self):
        """Test that email mentions OTP expiry time (15 minutes)."""
        user = User.objects.create_user(
            email="expire@example.com",
            password="testpass123",
            first_name="Expiry",
            last_name="Test",
        )
        otp = EmailVerificationOTP.create_for_user(user)

        send_otp_email(user.id, otp.code)

        email = mail.outbox[0]
        # Check for expiry information
        assert "15" in email.body or "fifteen" in email.body.lower()
        assert "minute" in email.body.lower()

    def test_send_otp_email_with_invalid_user_id(self):
        """Test that task handles invalid user ID gracefully."""
        # Call with non-existent user ID
        with pytest.raises(User.DoesNotExist):
            send_otp_email(99999, "123456")

    def test_send_otp_email_from_address(self):
        """Test that email is sent from the correct address."""
        user = User.objects.create_user(
            email="from@example.com",
            password="testpass123",
            first_name="From",
            last_name="Test",
        )
        otp = EmailVerificationOTP.create_for_user(user)

        send_otp_email(user.id, otp.code)

        email = mail.outbox[0]
        # Default Django EMAIL_FROM should be set
        assert email.from_email is not None
        assert "@" in email.from_email

    def test_send_otp_email_html_alternative(self):
        """Test that email includes HTML alternative for better formatting."""
        user = User.objects.create_user(
            email="html@example.com",
            password="testpass123",
            first_name="HTML",
            last_name="Test",
        )
        otp = EmailVerificationOTP.create_for_user(user)

        send_otp_email(user.id, otp.code)

        email = mail.outbox[0]
        # Check that HTML alternative is provided
        assert len(email.alternatives) > 0
        html_content = email.alternatives[0][0]
        assert "<html" in html_content.lower() or "<!doctype" in html_content.lower()
        assert otp.code in html_content

    def test_send_otp_email_multiple_users(self):
        """Test sending OTP emails to multiple users."""
        users_data = [
            ("user1@example.com", "User", "One"),
            ("user2@example.com", "User", "Two"),
            ("user3@example.com", "User", "Three"),
        ]

        for email, first_name, last_name in users_data:
            user = User.objects.create_user(
                email=email,
                password="testpass123",
                first_name=first_name,
                last_name=last_name,
            )
            otp = EmailVerificationOTP.create_for_user(user)
            send_otp_email(user.id, otp.code)

        # Check all emails were sent
        assert len(mail.outbox) == 3
        sent_to = {email.to[0] for email in mail.outbox}
        assert sent_to == {email for email, _, _ in users_data}
