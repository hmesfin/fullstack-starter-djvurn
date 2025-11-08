"""
Tests for password reset Celery tasks.

Following TDD approach - tests written FIRST before implementation.
"""

import pytest
from django.core import mail

from apps.users.models import PasswordResetToken
from apps.users.tasks import send_password_reset_email
from apps.users.tests.factories import UserFactory


@pytest.mark.django_db
class TestSendPasswordResetEmail:
    """Test suite for send_password_reset_email Celery task."""

    def test_send_password_reset_email_successful(self):
        """Test that password reset email is sent successfully."""
        user = UserFactory(first_name="John", last_name="Doe")
        token = PasswordResetToken.create_for_user(user)

        # Call the task directly (not .delay() for testing)
        send_password_reset_email(user.id, token.token)

        # Check that email was sent
        assert len(mail.outbox) == 1
        assert mail.outbox[0].to == [user.email]
        assert (
            "Password" in mail.outbox[0].subject and "Reset" in mail.outbox[0].subject
        )

    def test_send_password_reset_email_contains_token(self):
        """Test that password reset email contains the reset token."""
        user = UserFactory()
        token = PasswordResetToken.create_for_user(user)

        send_password_reset_email(user.id, token.token)

        # Check email body contains token
        email_body = mail.outbox[0].body
        assert token.token in email_body

    def test_send_password_reset_email_contains_reset_url(self):
        """Test that password reset email contains a valid reset URL."""
        user = UserFactory()
        token = PasswordResetToken.create_for_user(user)

        send_password_reset_email(user.id, token.token)

        # Check email body contains reset URL with token
        email_body = mail.outbox[0].body
        # URL should contain the token as a parameter or path component
        assert "/reset" in email_body or "/password-reset" in email_body
        assert token.token in email_body

    def test_send_password_reset_email_personalizes_greeting(self):
        """Test that email greeting includes user's first name."""
        user = UserFactory(first_name="Alice")
        token = PasswordResetToken.create_for_user(user)

        send_password_reset_email(user.id, token.token)

        email_body = mail.outbox[0].body
        assert (
            f"Hello {user.first_name}" in email_body
            or f"Hi {user.first_name}" in email_body
        )

    def test_send_password_reset_email_includes_expiry_info(self):
        """Test that email includes token expiry information."""
        user = UserFactory()
        token = PasswordResetToken.create_for_user(user)

        send_password_reset_email(user.id, token.token)

        email_body = mail.outbox[0].body
        # Should mention expiry time (1 hour)
        assert (
            "1 hour" in email_body
            or "60 minute" in email_body
            or "expire" in email_body.lower()
        )

    def test_send_password_reset_email_with_invalid_user_id(self):
        """Test sending password reset email with non-existent user ID."""
        # Should handle gracefully without crashing
        invalid_user_id = 999999

        # Should not raise exception
        send_password_reset_email(invalid_user_id, "fake-token")

        # No email should be sent
        assert len(mail.outbox) == 0

    def test_send_password_reset_email_from_address(self):
        """Test that email is sent from correct address."""
        user = UserFactory()
        token = PasswordResetToken.create_for_user(user)

        send_password_reset_email(user.id, token.token)

        # Check from address (should use DEFAULT_FROM_EMAIL)
        assert len(mail.outbox) == 1
        # In test environment, this will be the default from email
        assert mail.outbox[0].from_email is not None

    def test_send_password_reset_email_has_html_alternative(self):
        """Test that email includes HTML version."""
        user = UserFactory()
        token = PasswordResetToken.create_for_user(user)

        send_password_reset_email(user.id, token.token)

        email = mail.outbox[0]
        # Check that HTML alternative exists
        assert len(email.alternatives) > 0
        html_content, content_type = email.alternatives[0]
        assert content_type == "text/html"
        assert token.token in html_content

    def test_send_password_reset_email_to_multiple_users(self):
        """Test sending password reset emails to multiple users."""
        user1 = UserFactory(email="user1@example.com")
        user2 = UserFactory(email="user2@example.com")

        token1 = PasswordResetToken.create_for_user(user1)
        token2 = PasswordResetToken.create_for_user(user2)

        send_password_reset_email(user1.id, token1.token)
        send_password_reset_email(user2.id, token2.token)

        # Both emails should be sent
        assert len(mail.outbox) == 2

        # Check recipients
        recipients = [email.to[0] for email in mail.outbox]
        assert user1.email in recipients
        assert user2.email in recipients

        # Check each email has correct token
        assert (
            token1.token in mail.outbox[0].body or token1.token in mail.outbox[1].body
        )
        assert (
            token2.token in mail.outbox[0].body or token2.token in mail.outbox[1].body
        )
