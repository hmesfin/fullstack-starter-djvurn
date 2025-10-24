# apps/projects/api/views.py
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter
from drf_spectacular.utils import extend_schema
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.projects.models import Project

from .serializers import ProjectCreateSerializer
from .serializers import ProjectSerializer


@extend_schema(tags=["projects"])
class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing projects.

    All endpoints require authentication.
    Projects are filtered to show only those owned by the current user.
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    filterset_fields = ["status", "priority"]
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "due_date", "priority"]
    ordering = ["-created_at"]
    lookup_field = "uuid"

    def get_queryset(self):
        user = self.request.user
        assert isinstance(user, User)  # Safe due to IsAuthenticated permission
        return Project.objects.filter(owner=user).select_related("owner")

    def get_serializer_class(self):
        if self.action == "create":
            return ProjectCreateSerializer
        return ProjectSerializer

    @extend_schema(
        summary="List all projects for the authenticated user",
        description="Returns a paginated list of projects owned by the current user",
        parameters=[
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                enum=[choice[0] for choice in Project.Status.choices],
                description="Filter by project status",
            ),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
