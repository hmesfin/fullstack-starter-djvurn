# apps/projects/tests/test_serializers.py
from datetime import date
from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from apps.projects.api.serializers import ProjectCreateSerializer
from apps.projects.api.serializers import ProjectSerializer
from apps.projects.models import Project
from apps.projects.tests.factories import ProjectFactory
from apps.users.tests.factories import UserFactory


@pytest.mark.django_db
class TestProjectSerializer:
    """Test suite for ProjectSerializer"""

    def test_serialize_project(self) -> None:
        """Test serializing a project to JSON"""
        project = ProjectFactory(
            name="Test Project",
            description="Test Description",
            status=Project.Status.ACTIVE,
            priority=Project.Priority.HIGH,
        )

        serializer = ProjectSerializer(project)
        data = serializer.data

        assert data["uuid"] == str(project.uuid)
        assert data["name"] == "Test Project"
        assert data["description"] == "Test Description"
        assert data["status"] == Project.Status.ACTIVE
        assert data["priority"] == Project.Priority.HIGH
        assert data["owner"] == project.owner.id
        assert data["owner_email"] == project.owner.email

    def test_owner_email_is_read_only(self) -> None:
        """Test that owner_email cannot be set during deserialization"""
        data = {
            "name": "Test",
            "owner_email": "different@example.com",
        }

        serializer = ProjectSerializer(data=data)
        # owner_email should be ignored (read-only)
        assert serializer.is_valid(raise_exception=False)

    def test_uuid_is_read_only(self) -> None:
        """Test that UUID cannot be set during creation"""
        user = UserFactory()
        data = {
            "name": "Test",
            "owner": user.id,
            "uuid": "00000000-0000-0000-0000-000000000000",
        }

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()
        # Manually set owner since it's read-only in serializer
        project = serializer.save(owner=user)

        # UUID should be auto-generated, not the provided value
        assert str(project.uuid) != "00000000-0000-0000-0000-000000000000"

    def test_created_at_is_read_only(self) -> None:
        """Test that created_at cannot be set during creation"""
        user = UserFactory()
        past_date = timezone.now() - timedelta(days=100)
        data = {
            "name": "Test",
            "owner": user.id,
            "created_at": past_date.isoformat(),
        }

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()
        # Manually set owner since it's read-only in serializer
        project = serializer.save(owner=user)

        # created_at should be auto-generated, not the provided value
        assert project.created_at > past_date

    def test_updated_at_is_read_only(self) -> None:
        """Test that updated_at cannot be set during creation"""
        user = UserFactory()
        past_date = timezone.now() - timedelta(days=100)
        data = {
            "name": "Test",
            "owner": user.id,
            "updated_at": past_date.isoformat(),
        }

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()
        # Manually set owner since it's read-only in serializer
        project = serializer.save(owner=user)

        # updated_at should be auto-generated, not the provided value
        assert project.updated_at > past_date

    def test_owner_is_read_only(self) -> None:
        """Test that owner cannot be changed during update"""
        project = ProjectFactory()
        original_owner = project.owner
        new_user = UserFactory()

        data = {
            "name": "Updated Name",
            "owner": new_user.id,
        }

        serializer = ProjectSerializer(project, data=data, partial=True)
        assert serializer.is_valid()
        updated_project = serializer.save()

        # Owner should not change
        assert updated_project.owner == original_owner
        assert updated_project.owner != new_user

    def test_is_overdue_true_when_past_due_and_not_completed(self) -> None:
        """Test is_overdue is True when due_date is past and status is not COMPLETED"""
        project = ProjectFactory(
            status=Project.Status.ACTIVE,
            due_date=date.today() - timedelta(days=1),  # noqa: DTZ011
        )

        serializer = ProjectSerializer(project)
        assert serializer.data["is_overdue"] is True

    def test_is_overdue_false_when_completed(self) -> None:
        """Test is_overdue is False when status is COMPLETED even if past due"""
        project = ProjectFactory(
            status=Project.Status.COMPLETED,
            due_date=date.today() - timedelta(days=1),  # noqa: DTZ011
        )

        serializer = ProjectSerializer(project)
        assert serializer.data["is_overdue"] is False

    def test_is_overdue_false_when_no_due_date(self) -> None:
        """Test is_overdue is False when due_date is None"""
        project = ProjectFactory(
            status=Project.Status.ACTIVE,
            due_date=None,
        )

        serializer = ProjectSerializer(project)
        assert serializer.data["is_overdue"] is False

    def test_is_overdue_false_when_future_due_date(self) -> None:
        """Test is_overdue is False when due_date is in the future"""
        project = ProjectFactory(
            status=Project.Status.ACTIVE,
            due_date=date.today() + timedelta(days=1),  # noqa: DTZ011
        )

        serializer = ProjectSerializer(project)
        assert serializer.data["is_overdue"] is False

    def test_is_overdue_false_when_due_today(self) -> None:
        """Test is_overdue is False when due_date is today (not yet overdue)"""
        project = ProjectFactory(
            status=Project.Status.ACTIVE,
            due_date=timezone.now().date(),  # Use timezone-aware date
        )

        serializer = ProjectSerializer(project)
        # Due today is NOT overdue (still has time to complete today)
        assert serializer.data["is_overdue"] is False

    def test_is_overdue_for_different_statuses(self) -> None:
        """Test is_overdue behavior for all statuses with past due_date"""
        past_date = date.today() - timedelta(days=1)  # noqa: DTZ011

        # ACTIVE - should be overdue
        active = ProjectFactory(status=Project.Status.ACTIVE, due_date=past_date)
        assert ProjectSerializer(active).data["is_overdue"] is True

        # DRAFT - should be overdue
        draft = ProjectFactory(status=Project.Status.DRAFT, due_date=past_date)
        assert ProjectSerializer(draft).data["is_overdue"] is True

        # COMPLETED - should NOT be overdue
        completed = ProjectFactory(status=Project.Status.COMPLETED, due_date=past_date)
        assert ProjectSerializer(completed).data["is_overdue"] is False

        # ARCHIVED - should be overdue
        archived = ProjectFactory(status=Project.Status.ARCHIVED, due_date=past_date)
        assert ProjectSerializer(archived).data["is_overdue"] is True

    def test_deserialize_valid_data(self) -> None:
        """Test deserializing valid data"""
        user = UserFactory()
        data = {
            "name": "New Project",
            "description": "Description",
            "owner": user.id,
            "status": Project.Status.DRAFT,
            "priority": Project.Priority.HIGH,
            "start_date": "2024-01-01",
            "due_date": "2024-12-31",
        }

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()

        # Manually set owner since it's read-only in serializer
        project = serializer.save(owner=user)
        assert project.name == "New Project"
        assert project.description == "Description"
        assert project.status == Project.Status.DRAFT
        assert project.priority == Project.Priority.HIGH
        assert project.start_date == date(2024, 1, 1)
        assert project.due_date == date(2024, 12, 31)

    def test_deserialize_minimal_data(self) -> None:
        """Test deserializing with only required fields"""
        user = UserFactory()
        data = {
            "name": "Minimal Project",
            "owner": user.id,
        }

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()

        # Manually set owner since it's read-only in serializer
        project = serializer.save(owner=user)
        assert project.name == "Minimal Project"
        assert project.description == ""
        assert project.status == Project.Status.DRAFT
        assert project.priority == Project.Priority.MEDIUM

    def test_deserialize_missing_name(self) -> None:
        """Test validation fails when name is missing"""
        user = UserFactory()
        data = {
            "owner": user.id,
        }

        serializer = ProjectSerializer(data=data)
        assert not serializer.is_valid()
        assert "name" in serializer.errors

    def test_deserialize_invalid_status(self) -> None:
        """Test validation fails for invalid status"""
        user = UserFactory()
        data = {
            "name": "Test",
            "owner": user.id,
            "status": "invalid_status",
        }

        serializer = ProjectSerializer(data=data)
        assert not serializer.is_valid()
        assert "status" in serializer.errors

    def test_deserialize_invalid_priority(self) -> None:
        """Test validation fails for invalid priority"""
        user = UserFactory()
        data = {
            "name": "Test",
            "owner": user.id,
            "priority": 999,
        }

        serializer = ProjectSerializer(data=data)
        assert not serializer.is_valid()
        assert "priority" in serializer.errors

    def test_partial_update(self) -> None:
        """Test partial update (PATCH)"""
        project = ProjectFactory(name="Original Name")

        data = {"name": "Updated Name"}
        serializer = ProjectSerializer(project, data=data, partial=True)
        assert serializer.is_valid()

        updated = serializer.save()
        assert updated.name == "Updated Name"
        # Other fields should remain unchanged
        assert updated.description == project.description


@pytest.mark.django_db
class TestProjectCreateSerializer:
    """Test suite for ProjectCreateSerializer"""

    def setup_method(self) -> None:
        """Set up test fixtures"""
        self.factory = APIRequestFactory()

    def test_create_assigns_owner_from_request_user(self) -> None:
        """Test that create() automatically assigns owner from request.user"""
        user = UserFactory()

        # Create a mock request with authenticated user
        request = self.factory.post("/")
        request.user = user

        data = {
            "name": "Test Project",
            "description": "Test Description",
        }

        serializer = ProjectCreateSerializer(
            data=data,
            context={"request": request},
        )
        assert serializer.is_valid()

        project = serializer.save()
        assert project.owner == user

    def test_create_ignores_owner_in_data(self) -> None:
        """Test that owner in data is ignored and request.user is used"""
        actual_user = UserFactory()
        different_user = UserFactory()

        request = self.factory.post("/")
        request.user = actual_user

        data = {
            "name": "Test Project",
            "owner": different_user.id,  # This should be ignored
        }

        serializer = ProjectCreateSerializer(
            data=data,
            context={"request": request},
        )
        assert serializer.is_valid()

        project = serializer.save()
        # Owner should be request.user, not the one in data
        assert project.owner == actual_user
        assert project.owner != different_user

    def test_owner_is_read_only(self) -> None:
        """Test that owner field is read-only in Meta"""
        assert "owner" in ProjectCreateSerializer.Meta.read_only_fields

    def test_inherits_from_project_serializer(self) -> None:
        """Test that ProjectCreateSerializer inherits from ProjectSerializer"""
        assert issubclass(ProjectCreateSerializer, ProjectSerializer)

    def test_has_same_fields_as_project_serializer(self) -> None:
        """Test that fields match ProjectSerializer"""
        assert ProjectCreateSerializer.Meta.fields == ProjectSerializer.Meta.fields

    def test_create_with_all_fields(self) -> None:
        """Test creating project with all optional fields"""
        user = UserFactory()
        request = self.factory.post("/")
        request.user = user

        data = {
            "name": "Full Project",
            "description": "Full Description",
            "status": Project.Status.ACTIVE,
            "priority": Project.Priority.HIGH,
            "start_date": "2024-01-01",
            "due_date": "2024-12-31",
        }

        serializer = ProjectCreateSerializer(
            data=data,
            context={"request": request},
        )
        assert serializer.is_valid()

        project = serializer.save()
        assert project.owner == user
        assert project.name == "Full Project"
        assert project.status == Project.Status.ACTIVE
        assert project.priority == Project.Priority.HIGH

    def test_validation_errors_preserved(self) -> None:
        """Test that validation errors still work correctly"""
        user = UserFactory()
        request = self.factory.post("/")
        request.user = user

        data = {
            # Missing required 'name' field
            "description": "Test",
        }

        serializer = ProjectCreateSerializer(
            data=data,
            context={"request": request},
        )
        assert not serializer.is_valid()
        assert "name" in serializer.errors
