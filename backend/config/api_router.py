from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from apps.users.api.views import EmailTokenObtainPairView
from apps.users.api.views import EmailTokenRefreshView
from apps.users.api.views import OTPVerificationView
from apps.users.api.views import PasswordChangeView
from apps.users.api.views import PasswordResetConfirmView
from apps.users.api.views import PasswordResetOTPConfirmView
from apps.users.api.views import PasswordResetOTPRequestView
from apps.users.api.views import PasswordResetRequestView
from apps.users.api.views import ResendOTPView
from apps.users.api.views import UserRegistrationView
from apps.users.api.views import UserViewSet

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)


app_name = "api"
urlpatterns = [
    # User-specific endpoints (must come before router.urls to avoid conflicts)
    path(
        "users/change-password/",
        PasswordChangeView.as_view(),
        name="user-change-password",
    ),
    # Router URLs (includes UserViewSet)
    *router.urls,
    # Auth endpoints
    path("auth/register/", UserRegistrationView.as_view(), name="auth-register"),
    path("auth/verify-otp/", OTPVerificationView.as_view(), name="auth-verify-otp"),
    path("auth/resend-otp/", ResendOTPView.as_view(), name="auth-resend-otp"),
    path(
        "auth/password-reset/request/",
        PasswordResetRequestView.as_view(),
        name="auth-password-reset-request",
    ),
    path(
        "auth/password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
    path(
        "auth/password-reset-otp/request/",
        PasswordResetOTPRequestView.as_view(),
        name="auth-password-reset-otp-request",
    ),
    path(
        "auth/password-reset-otp/confirm/",
        PasswordResetOTPConfirmView.as_view(),
        name="auth-password-reset-otp-confirm",
    ),
    path("auth/token/", EmailTokenObtainPairView.as_view(), name="auth-token"),
    path(
        "auth/token/refresh/",
        EmailTokenRefreshView.as_view(),
        name="auth-token-refresh",
    ),
]
