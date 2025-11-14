# apps/projects/tests/test_views.py
from typing import Any

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.projects.models import Project
from apps.projects.tests.factories import ProjectFactory
from apps.users.models import User
from apps.users.tests.factories import UserFactory


@pytest.fixture
def api_client() -> APIClient:
    """Fixture for API client"""
    return APIClient()


@pytest.fixture
def authenticated_client(user: User) -> APIClient:
    """Fixture for authenticated API client"""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
class TestProjectViewSetAuthentication:
    """Test authentication requirements for ProjectViewSet"""

    def test_list_requires_authentication(self, api_client: APIClient) -> None:
        """Test that listing projects requires authentication"""
        url = reverse("projects:project-list")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_requires_authentication(self, api_client: APIClient) -> None:
        """Test that retrieving a project requires authentication"""
        project = ProjectFactory()
        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_requires_authentication(self, api_client: APIClient) -> None:
        """Test that creating a project requires authentication"""
        url = reverse("projects:project-list")
        data = {"name": "Test Project"}
        response = api_client.post(url, data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_requires_authentication(self, api_client: APIClient) -> None:
        """Test that updating a project requires authentication"""
        project = ProjectFactory()
        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        data = {"name": "Updated"}
        response = api_client.patch(url, data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_requires_authentication(self, api_client: APIClient) -> None:
        """Test that deleting a project requires authentication"""
        project = ProjectFactory()
        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProjectViewSetList:
    """Test listing projects"""

    def test_list_returns_only_user_projects(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test that users only see their own projects"""
        # Create projects for the authenticated user
        my_projects = ProjectFactory.create_batch(3, owner=user)

        # Create projects for other users
        other_user = UserFactory()
        ProjectFactory.create_batch(2, owner=other_user)

        url = reverse("projects:project-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 3

        # Verify all returned projects belong to the user
        returned_uuids = {p["uuid"] for p in response.data["results"]}
        expected_uuids = {str(p.uuid) for p in my_projects}
        assert returned_uuids == expected_uuids

    def test_list_empty_when_no_projects(
        self,
        authenticated_client: APIClient,
    ) -> None:
        """Test that list returns empty when user has no projects"""
        url = reverse("projects:project-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_list_includes_required_fields(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test that list response includes all required fields"""
        ProjectFactory(owner=user)

        url = reverse("projects:project-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        project_data = response.data["results"][0]

        required_fields = [
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

        for field in required_fields:
            assert field in project_data

    def test_list_default_ordering(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test that list is ordered by -created_at by default"""
        # Create projects with different created_at times
        old = ProjectFactory(owner=user)
        new = ProjectFactory(owner=user)

        url = reverse("projects:project-list")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]

        # Newest should be first
        assert results[0]["uuid"] == str(new.uuid)
        assert results[1]["uuid"] == str(old.uuid)


@pytest.mark.django_db
class TestProjectViewSetFiltering:
    """Test filtering projects"""

    def test_filter_by_status(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test filtering projects by status"""
        active = ProjectFactory(owner=user, status=Project.Status.ACTIVE)
        ProjectFactory(owner=user, status=Project.Status.DRAFT)
        ProjectFactory(owner=user, status=Project.Status.COMPLETED)

        url = reverse("projects:project-list")
        response = authenticated_client.get(url, {"status": Project.Status.ACTIVE})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["uuid"] == str(active.uuid)

    def test_filter_by_priority(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test filtering projects by priority"""
        high = ProjectFactory(owner=user, priority=Project.Priority.HIGH)
        ProjectFactory(owner=user, priority=Project.Priority.LOW)
        ProjectFactory(owner=user, priority=Project.Priority.MEDIUM)

        url = reverse("projects:project-list")
        response = authenticated_client.get(url, {"priority": Project.Priority.HIGH})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["uuid"] == str(high.uuid)

    def test_filter_by_multiple_criteria(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test filtering by multiple criteria"""
        target = ProjectFactory(
            owner=user,
            status=Project.Status.ACTIVE,
            priority=Project.Priority.HIGH,
        )
        ProjectFactory(
            owner=user,
            status=Project.Status.ACTIVE,
            priority=Project.Priority.LOW,
        )
        ProjectFactory(
            owner=user,
            status=Project.Status.DRAFT,
            priority=Project.Priority.HIGH,
        )

        url = reverse("projects:project-list")
        response = authenticated_client.get(
            url,
            {
                "status": Project.Status.ACTIVE,
                "priority": Project.Priority.HIGH,
            },
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["uuid"] == str(target.uuid)


@pytest.mark.django_db
class TestProjectViewSetSearch:
    """Test searching projects"""

    def test_search_by_name(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test searching projects by name"""
        matching = ProjectFactory(owner=user, name="Django Project")
        ProjectFactory(owner=user, name="React Project")

        url = reverse("projects:project-list")
        response = authenticated_client.get(url, {"search": "Django"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["uuid"] == str(matching.uuid)

    def test_search_by_description(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test searching projects by description"""
        matching = ProjectFactory(owner=user, description="Backend API development")
        ProjectFactory(owner=user, description="Frontend UI design")

        url = reverse("projects:project-list")
        response = authenticated_client.get(url, {"search": "Backend"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["uuid"] == str(matching.uuid)

    def test_search_case_insensitive(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test search is case-insensitive"""
        project = ProjectFactory(owner=user, name="Django Project")

        url = reverse("projects:project-list")

        # Test lowercase
        response = authenticated_client.get(url, {"search": "django"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

        # Test uppercase
        response = authenticated_client.get(url, {"search": "DJANGO"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1


@pytest.mark.django_db
class TestProjectViewSetOrdering:
    """Test ordering projects"""

    def test_order_by_created_at_ascending(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test ordering by created_at ascending"""
        old = ProjectFactory(owner=user)
        new = ProjectFactory(owner=user)

        url = reverse("projects:project-list")
        response = authenticated_client.get(url, {"ordering": "created_at"})

        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]

        # Oldest should be first
        assert results[0]["uuid"] == str(old.uuid)
        assert results[1]["uuid"] == str(new.uuid)

    def test_order_by_created_at_descending(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test ordering by created_at descending"""
        old = ProjectFactory(owner=user)
        new = ProjectFactory(owner=user)

        url = reverse("projects:project-list")
        response = authenticated_client.get(url, {"ordering": "-created_at"})

        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]

        # Newest should be first
        assert results[0]["uuid"] == str(new.uuid)
        assert results[1]["uuid"] == str(old.uuid)

    def test_order_by_priority(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test ordering by priority"""
        low = ProjectFactory(owner=user, priority=Project.Priority.LOW)
        high = ProjectFactory(owner=user, priority=Project.Priority.HIGH)
        medium = ProjectFactory(owner=user, priority=Project.Priority.MEDIUM)

        url = reverse("projects:project-list")
        response = authenticated_client.get(url, {"ordering": "priority"})

        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]

        # Should be ordered: LOW (1), MEDIUM (2), HIGH (3)
        assert results[0]["uuid"] == str(low.uuid)
        assert results[1]["uuid"] == str(medium.uuid)
        assert results[2]["uuid"] == str(high.uuid)


@pytest.mark.django_db
class TestProjectViewSetRetrieve:
    """Test retrieving individual projects"""

    def test_retrieve_own_project(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test retrieving a project owned by the user"""
        project = ProjectFactory(owner=user)

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["uuid"] == str(project.uuid)
        assert response.data["name"] == project.name

    def test_cannot_retrieve_other_user_project(
        self,
        authenticated_client: APIClient,
    ) -> None:
        """Test that users cannot retrieve projects they don't own"""
        other_user = UserFactory()
        project = ProjectFactory(owner=other_user)

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_nonexistent_project(
        self,
        authenticated_client: APIClient,
    ) -> None:
        """Test retrieving a project that doesn't exist"""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        url = reverse("projects:project-detail", kwargs={"uuid": fake_uuid})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestProjectViewSetCreate:
    """Test creating projects"""

    def test_create_project(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test creating a new project"""
        url = reverse("projects:project-list")
        data = {
            "name": "New Project",
            "description": "Test Description",
            "status": Project.Status.DRAFT,
            "priority": Project.Priority.HIGH,
        }

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "New Project"
        assert response.data["description"] == "Test Description"
        assert response.data["status"] == Project.Status.DRAFT
        assert response.data["priority"] == Project.Priority.HIGH

        # Verify owner is set to authenticated user
        assert response.data["owner"] == user.id

        # Verify project was created in database
        project = Project.objects.get(uuid=response.data["uuid"])
        assert project.owner == user

    def test_create_project_minimal_data(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test creating project with only required fields"""
        url = reverse("projects:project-list")
        data = {"name": "Minimal Project"}

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Minimal Project"
        assert response.data["owner"] == user.id

        # Verify defaults are set
        assert response.data["status"] == Project.Status.DRAFT
        assert response.data["priority"] == Project.Priority.MEDIUM

    def test_create_project_missing_name(
        self,
        authenticated_client: APIClient,
    ) -> None:
        """Test that creating project without name fails"""
        url = reverse("projects:project-list")
        data = {"description": "Missing name"}

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "name" in response.data

    def test_create_project_owner_auto_assigned(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test that owner is automatically assigned and cannot be overridden"""
        other_user = UserFactory()

        url = reverse("projects:project-list")
        data = {
            "name": "Test",
            "owner": other_user.id,  # Try to set different owner
        }

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        # Owner should be the authenticated user, not the one in data
        assert response.data["owner"] == user.id

    def test_create_uses_project_create_serializer(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test that create action uses ProjectCreateSerializer"""
        url = reverse("projects:project-list")
        data = {"name": "Test"}

        response = authenticated_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        # Verify owner was auto-assigned (ProjectCreateSerializer behavior)
        assert response.data["owner"] == user.id


@pytest.mark.django_db
class TestProjectViewSetUpdate:
    """Test updating projects"""

    def test_update_own_project(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test updating a project owned by the user"""
        project = ProjectFactory(owner=user, name="Original Name")

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        data = {"name": "Updated Name"}

        response = authenticated_client.patch(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Updated Name"

        # Verify database was updated
        project.refresh_from_db()
        assert project.name == "Updated Name"

    def test_cannot_update_other_user_project(
        self,
        authenticated_client: APIClient,
    ) -> None:
        """Test that users cannot update projects they don't own"""
        other_user = UserFactory()
        project = ProjectFactory(owner=other_user)

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        data = {"name": "Hacked Name"}

        response = authenticated_client.patch(url, data)

        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Verify project was not updated
        project.refresh_from_db()
        assert project.name != "Hacked Name"

    def test_update_status(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test updating project status"""
        project = ProjectFactory(owner=user, status=Project.Status.DRAFT)

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        data = {"status": Project.Status.ACTIVE}

        response = authenticated_client.patch(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == Project.Status.ACTIVE

    def test_update_priority(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test updating project priority"""
        project = ProjectFactory(owner=user, priority=Project.Priority.MEDIUM)

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        data = {"priority": Project.Priority.CRITICAL}

        response = authenticated_client.patch(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["priority"] == Project.Priority.CRITICAL

    def test_cannot_change_owner(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test that owner cannot be changed via update"""
        project = ProjectFactory(owner=user)
        other_user = UserFactory()

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        data = {"owner": other_user.id}

        response = authenticated_client.patch(url, data)

        assert response.status_code == status.HTTP_200_OK

        # Owner should remain unchanged
        project.refresh_from_db()
        assert project.owner == user

    def test_full_update(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test full update (PUT) of a project"""
        project = ProjectFactory(owner=user)

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        data = {
            "name": "Completely New Name",
            "description": "Completely New Description",
            "status": Project.Status.COMPLETED,
            "priority": Project.Priority.HIGH,
        }

        response = authenticated_client.put(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Completely New Name"
        assert response.data["description"] == "Completely New Description"


@pytest.mark.django_db
class TestProjectViewSetDelete:
    """Test deleting projects"""

    def test_delete_own_project(
        self,
        authenticated_client: APIClient,
        user: User,
    ) -> None:
        """Test deleting a project owned by the user"""
        project = ProjectFactory(owner=user)
        project_uuid = project.uuid

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify project was deleted
        assert not Project.objects.filter(uuid=project_uuid).exists()

    def test_cannot_delete_other_user_project(
        self,
        authenticated_client: APIClient,
    ) -> None:
        """Test that users cannot delete projects they don't own"""
        other_user = UserFactory()
        project = ProjectFactory(owner=other_user)
        project_uuid = project.uuid

        url = reverse("projects:project-detail", kwargs={"uuid": project.uuid})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Verify project still exists
        assert Project.objects.filter(uuid=project_uuid).exists()

    def test_delete_nonexistent_project(
        self,
        authenticated_client: APIClient,
    ) -> None:
        """Test deleting a project that doesn't exist"""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        url = reverse("projects:project-detail", kwargs={"uuid": fake_uuid})
        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
