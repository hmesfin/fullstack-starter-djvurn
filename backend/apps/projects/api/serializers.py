# apps/projects/api/serializers.py
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from apps.projects.models import Project

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "uuid",
            "name",
            "description",
            "owner",
            "owner_email",
            "status",
            "priority",
            "start_date",
            "due_date",
            "is_overdue",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["uuid", "created_at", "updated_at", "owner"]

    def get_is_overdue(self, obj: Project) -> bool:
        if obj.due_date and obj.status != Project.Status.COMPLETED:
            return obj.due_date < timezone.now().date()
        return False


class ProjectCreateSerializer(ProjectSerializer):
    """Separate serializer for creation to handle owner assignment"""

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields
        read_only_fields = ["uuid", "created_at", "updated_at", "owner"]

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)
