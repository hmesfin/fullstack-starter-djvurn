from datetime import datetime

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from .models import User


@shared_task()
def get_users_count():
    """A pointless Celery task to demonstrate usage."""
    return User.objects.count()


@shared_task()
def send_otp_email(user_id: int, otp_code: str) -> None:
    """
    Send OTP verification email to user.

    Args:
        user_id: ID of the user to send email to
        otp_code: 6-digit OTP code to include in email

    Raises:
        User.DoesNotExist: If user with given ID doesn't exist
    """
    # Get user (will raise User.DoesNotExist if not found)
    user = User.objects.get(id=user_id)

    # Prepare email context
    context = {
        "user": user,
        "otp_code": otp_code,
        "year": datetime.now().year,
    }

    # Render email templates
    text_content = render_to_string("email/otp_verification.txt", context)
    html_content = render_to_string("email/otp_verification.html", context)

    # Create email
    subject = "Verify Your Email - OTP Code"
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = user.email

    # Create email with both plain text and HTML versions
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=from_email,
        to=[to_email],
    )
    email.attach_alternative(html_content, "text/html")

    # Send email
    email.send()
