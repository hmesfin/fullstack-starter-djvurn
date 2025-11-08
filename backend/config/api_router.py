from django.conf import settings
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from apps.users.api.views import EmailTokenObtainPairView
from apps.users.api.views import EmailTokenRefreshView
from apps.users.api.views import OTPVerificationView
from apps.users.api.views import PasswordResetConfirmView
from apps.users.api.views import PasswordResetRequestView
from apps.users.api.views import ResendOTPView
from apps.users.api.views import UserRegistrationView
from apps.users.api.views import UserViewSet

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)


app_name = "api"
urlpatterns = [
    *router.urls,
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
    path("auth/token/", EmailTokenObtainPairView.as_view(), name="auth-token"),
    path(
        "auth/token/refresh/",
        EmailTokenRefreshView.as_view(),
        name="auth-token-refresh",
    ),
]
