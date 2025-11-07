from django.db import transaction
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import ListModelMixin
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.mixins import UpdateModelMixin
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.models import User

from .serializers import EmailTokenObtainPairSerializer
from .serializers import OTPVerificationSerializer
from .serializers import ResendOTPSerializer
from .serializers import UserRegistrationSerializer
from .serializers import UserSerializer


class UserViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = "pk"

    def get_queryset(self, *args, **kwargs):
        # Filter to only show the current user
        if self.request.user.is_authenticated:
            return self.queryset.filter(id=self.request.user.pk)
        return self.queryset.none()

    @action(detail=False)
    def me(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)


class UserRegistrationView(CreateAPIView):
    """API endpoint for user registration with OTP email verification."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Create a new user and send OTP for email verification."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Return user data without password
        response_serializer = UserSerializer(user, context={"request": request})
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class OTPVerificationView(GenericAPIView):
    """API endpoint for verifying OTP and activating email."""

    serializer_class = OTPVerificationSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """Verify OTP code and mark user email as verified."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get user and OTP from validated data
        user = serializer.validated_data["user"]
        otp = serializer.validated_data["otp"]

        # Mark user as email verified
        user.is_email_verified = True
        user.save(update_fields=["is_email_verified", "modified"])

        # Mark OTP as used
        otp.mark_as_used()

        return Response(
            {"message": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )


@extend_schema(
    responses={200: TokenObtainPairSerializer},
    description=(
        "Obtain JWT access and refresh tokens using email and password. "
        "Email must be verified."
    ),
)
class EmailTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token obtain view that uses email and checks email verification."""

    serializer_class = EmailTokenObtainPairSerializer

    @method_decorator(transaction.non_atomic_requests)
    def dispatch(self, *args, **kwargs):
        """Disable automatic transaction wrapping to handle OTP creation manually."""
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        """Override to handle OTP creation outside transaction when email unverified."""
        from rest_framework.exceptions import ValidationError as DRFValidationError
        from apps.users.models import EmailVerificationOTP, User

        # Wrap the parent call in a transaction so successful logins are atomic
        try:
            with transaction.atomic():
                return super().post(request, *args, **kwargs)
        except DRFValidationError as e:
            # Transaction rolled back, now we can create OTP outside it
            # Check if this is an email verification required error
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                if 'email_verification_required' in e.detail:
                    # Get user email from request
                    email = request.data.get('email', '').lower()

                    # Create OTP in a separate transaction (now outside the rolled-back one)
                    try:
                        user = User.objects.get(email=email)

                        with transaction.atomic():
                            otp = EmailVerificationOTP.create_for_user(user)

                            # Send email
                            from apps.users.tasks import send_otp_email
                            send_otp_email.delay(user.id, otp.code)

                    except User.DoesNotExist:
                        pass

            # Re-raise the validation error to return proper 400 response
            raise


class EmailTokenRefreshView(TokenRefreshView):
    """JWT token refresh view (uses default SimpleJWT behavior)."""


class ResendOTPView(GenericAPIView):
    """API endpoint for resending OTP verification email."""

    serializer_class = ResendOTPSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """Resend OTP code to user's email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Verification code sent to your email."},
            status=status.HTTP_200_OK,
        )
