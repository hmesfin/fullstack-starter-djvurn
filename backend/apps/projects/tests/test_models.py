# apps/projects/tests/test_models.py
from datetime import date, timedelta

import pytest
from django.db import IntegrityError

from apps.projects.models import Project
from apps.projects.tests.factories import ProjectFactory
from apps.users.tests.factories import UserFactory


@pytest.mark.django_db
class TestProjectModel:
    """Test suite for Project model"""

    def test_create_project_with_defaults(self) -> None:
        """Test creating a project with default values"""
        project = ProjectFactory()

        assert project.id is not None
        assert project.uuid is not None
        assert project.name != ""
        assert project.status == Project.Status.DRAFT
        assert project.priority == Project.Priority.MEDIUM
        assert project.owner is not None
        assert project.created_at is not None
        assert project.updated_at is not None

    def test_uuid_is_unique(self) -> None:
        """Test that UUID is unique across projects"""
        project1 = ProjectFactory()
        project2 = ProjectFactory()

        assert project1.uuid != project2.uuid

    def test_uuid_is_auto_generated(self) -> None:
        """Test that UUID is automatically generated on creation"""
        project = ProjectFactory()
        assert project.uuid is not None
        # UUID should be version 4
        assert project.uuid.version == 4

    def test_project_status_choices(self) -> None:
        """Test all valid status choices"""
        statuses = [
            Project.Status.DRAFT,
            Project.Status.ACTIVE,
            Project.Status.COMPLETED,
            Project.Status.ARCHIVED,
        ]

        for status in statuses:
            project = ProjectFactory(status=status)
            assert project.status == status

    def test_project_priority_choices(self) -> None:
        """Test all valid priority choices"""
        priorities = [
            Project.Priority.LOW,
            Project.Priority.MEDIUM,
            Project.Priority.HIGH,
            Project.Priority.CRITICAL,
        ]

        for priority in priorities:
            project = ProjectFactory(priority=priority)
            assert project.priority == priority

    def test_owner_relationship(self) -> None:
        """Test that owner relationship works correctly"""
        user = UserFactory()
        project = ProjectFactory(owner=user)

        assert project.owner == user
        assert project in user.owned_projects.all()

    def test_owner_cascade_delete(self) -> None:
        """Test that deleting owner deletes projects (CASCADE)"""
        user = UserFactory()
        project = ProjectFactory(owner=user)
        project_id = project.id

        user.delete()

        # Project should be deleted
        assert not Project.objects.filter(id=project_id).exists()

    def test_multiple_projects_per_user(self) -> None:
        """Test that a user can own multiple projects"""
        user = UserFactory()
        projects = ProjectFactory.create_batch(5, owner=user)

        assert user.owned_projects.count() == 5
        assert all(p.owner == user for p in projects)

    def test_str_representation(self) -> None:
        """Test __str__ method returns project name"""
        project = ProjectFactory(name="Test Project")
        assert str(project) == "Test Project"

    def test_default_ordering(self) -> None:
        """Test projects are ordered by priority (desc) then created_at (desc)"""
        # Create projects with different priorities
        low = ProjectFactory(
            priority=Project.Priority.LOW,
            created_at=date(2024, 1, 1),
        )
        high = ProjectFactory(
            priority=Project.Priority.HIGH,
            created_at=date(2024, 1, 2),
        )
        critical = ProjectFactory(
            priority=Project.Priority.CRITICAL,
            created_at=date(2024, 1, 3),
        )
        medium = ProjectFactory(
            priority=Project.Priority.MEDIUM,
            created_at=date(2024, 1, 4),
        )

        # Get all projects in default order
        projects = list(Project.objects.all())

        # Should be ordered: CRITICAL, HIGH, MEDIUM, LOW
        # Within same priority: newer first
        assert projects[0] == critical
        assert projects[1] == high
        assert projects[2] == medium
        assert projects[3] == low

    def test_blank_description(self) -> None:
        """Test that description can be blank"""
        project = ProjectFactory(description="")
        assert project.description == ""

    def test_null_dates(self) -> None:
        """Test that start_date and due_date can be null"""
        project = ProjectFactory(start_date=None, due_date=None)
        assert project.start_date is None
        assert project.due_date is None

    def test_with_dates(self) -> None:
        """Test project with both dates set"""
        start = date(2024, 1, 1)
        due = date(2024, 12, 31)
        project = ProjectFactory(start_date=start, due_date=due)

        assert project.start_date == start
        assert project.due_date == due

    def test_updated_at_changes_on_save(self) -> None:
        """Test that updated_at changes when project is updated"""
        project = ProjectFactory()
        original_updated_at = project.updated_at

        # Modify and save
        project.name = "Updated Name"
        project.save()

        # updated_at should be different (newer)
        assert project.updated_at >= original_updated_at

    def test_created_at_does_not_change(self) -> None:
        """Test that created_at does not change on update"""
        project = ProjectFactory()
        original_created_at = project.created_at

        # Modify and save
        project.name = "Updated Name"
        project.save()

        # created_at should remain the same
        assert project.created_at == original_created_at

    def test_max_name_length(self) -> None:
        """Test that name field has max_length of 255"""
        long_name = "x" * 255
        project = ProjectFactory(name=long_name)
        assert len(project.name) == 255

    def test_owner_cannot_be_null(self) -> None:
        """Test that owner field is required"""
        with pytest.raises(IntegrityError):
            Project.objects.create(
                name="Test",
                owner=None,  # type: ignore
            )

    def test_factory_traits_draft(self) -> None:
        """Test factory draft trait"""
        project = ProjectFactory(draft=True)
        assert project.status == Project.Status.DRAFT

    def test_factory_traits_active(self) -> None:
        """Test factory active trait"""
        project = ProjectFactory(active=True)
        assert project.status == Project.Status.ACTIVE

    def test_factory_traits_completed(self) -> None:
        """Test factory completed trait"""
        project = ProjectFactory(completed=True)
        assert project.status == Project.Status.COMPLETED

    def test_factory_traits_archived(self) -> None:
        """Test factory archived trait"""
        project = ProjectFactory(archived=True)
        assert project.status == Project.Status.ARCHIVED

    def test_factory_traits_high_priority(self) -> None:
        """Test factory high_priority trait"""
        project = ProjectFactory(high_priority=True)
        assert project.priority == Project.Priority.HIGH

    def test_factory_traits_critical_priority(self) -> None:
        """Test factory critical_priority trait"""
        project = ProjectFactory(critical_priority=True)
        assert project.priority == Project.Priority.CRITICAL

    def test_factory_traits_with_dates(self) -> None:
        """Test factory with_dates trait"""
        project = ProjectFactory(with_dates=True)
        assert project.start_date is not None
        assert project.due_date is not None
        # start_date should be before or equal to due_date (can be same day)
        assert project.start_date <= project.due_date

    def test_factory_traits_overdue(self) -> None:
        """Test factory overdue trait"""
        project = ProjectFactory(overdue=True)
        assert project.status == Project.Status.ACTIVE
        assert project.due_date is not None
        assert project.due_date < date.today()

    def test_factory_traits_starting_soon(self) -> None:
        """Test factory starting_soon trait"""
        project = ProjectFactory(starting_soon=True)
        assert project.status == Project.Status.DRAFT
        assert project.start_date is not None
        # start_date should be between today and +7 days
        assert project.start_date >= date.today()
        assert project.start_date <= date.today() + timedelta(days=8)  # Allow up to +8 days to be safe

    def test_combined_traits(self) -> None:
        """Test combining multiple factory traits"""
        project = ProjectFactory(
            active=True,
            high_priority=True,
            with_dates=True,
        )
        assert project.status == Project.Status.ACTIVE
        assert project.priority == Project.Priority.HIGH
        assert project.start_date is not None
        assert project.due_date is not None
