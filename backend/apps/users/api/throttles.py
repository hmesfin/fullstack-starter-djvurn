"""Custom throttle classes for user API endpoints."""

from rest_framework.throttling import SimpleRateThrottle
from typing import Optional


class ResendOTPThrottle(SimpleRateThrottle):
    """
    Throttle for OTP resend endpoint.

    Rate limits based on email address (not IP) to prevent abuse.
    Default: 3 requests per hour per email address.
    """

    scope = "resend_otp"
    rate = "3/hour"

    def get_cache_key(self, request, view) -> Optional[str]:
        """
        Generate cache key based on email from request data.

        If email is not provided, fall back to IP-based throttling.
        """
        email = request.data.get("email")

        if not email:
            # If no email provided, use IP-based throttling
            return self.get_ident(request)

        # Normalize email to lowercase
        email = email.lower()

        # Create cache key: throttle_scope + email
        return self.cache_format % {
            "scope": self.scope,
            "ident": email,
        }
