# Phase 9: Microservices Preparation - Implementation Plan

**Objective**: Transform the Django monolith into a well-structured, microservices-ready architecture using proto-service patterns, reusable packages, and clear service boundaries.

**Philosophy**: Build a monolith that's ready to become microservices. Design for modularity, isolation, and reusability from day one.

## Overview

This phase prepares the codebase for future microservices migration by:

1. **Extracting common functionality into reusable Django packages** (shared libraries)
2. **Restructuring Django apps as "proto-services"** (self-contained, independently testable)
3. **Establishing clear service boundaries** (API contracts, data isolation)
4. **Implementing service-layer patterns** (business logic separated from views)

**NOT** building actual microservices yet - just organizing the monolith to make future extraction trivial.

## Prerequisites

- ✅ Django project with multiple apps (users, projects)
- ✅ DRF API layer with ViewSets
- ✅ JWT authentication working
- ✅ Comprehensive test coverage (Phase 3)

## Success Criteria

By the end of this phase:

- [ ] Reusable Django package `apps/core/` with shared authentication, models, and utilities
- [ ] Each app structured as a proto-service with clear API boundaries
- [ ] Service layer classes separate business logic from views
- [ ] Apps can run their tests independently
- [ ] Zero cross-app model imports (only through API contracts)
- [ ] Documentation for extracting apps into microservices

## Architecture Decisions

### Proto-Service Structure

Each Django app becomes a proto-service with:

```
apps/projects/
├── __init__.py
├── apps.py
├── models/               # Data layer (domain models)
│   ├── __init__.py
│   └── project.py
├── services/             # Business logic layer (NEW)
│   ├── __init__.py
│   └── project_service.py
├── api/                  # API layer (DRF)
│   ├── __init__.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── contracts/            # API contracts (NEW)
│   ├── __init__.py
│   └── schemas.py
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_services.py
│   └── test_api.py
└── README.md             # Service documentation
```

### Shared Core Package

```
apps/core/
├── __init__.py
├── apps.py
├── authentication/       # Reusable auth logic
│   ├── __init__.py
│   ├── backends.py
│   ├── permissions.py
│   └── mixins.py
├── models/              # Base models and mixins
│   ├── __init__.py
│   ├── base.py          # UUIDModel, TimestampedModel
│   └── mixins.py
├── services/            # Base service classes
│   ├── __init__.py
│   └── base.py
├── exceptions/          # Custom exceptions
│   ├── __init__.py
│   └── api.py
├── utils/               # Shared utilities
│   ├── __init__.py
│   └── validators.py
└── tests/
```

### Service Layer Pattern

Business logic moves from ViewSets to Service classes:

**Before (Fat ViewSet)**:
```python
class ProjectViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        # Business logic mixed with view logic
        project = serializer.save(owner=self.request.user)
        send_notification(project.owner, "Project created")
        log_activity(self.request.user, "created project")
```

**After (Thin ViewSet + Service)**:
```python
class ProjectViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        # View only handles HTTP concerns
        data = serializer.validated_data
        project = self.project_service.create_project(
            owner=self.request.user,
            **data
        )
        serializer.instance = project

class ProjectService:
    """Business logic for project management."""

    def create_project(self, owner: User, **data) -> Project:
        """Create a project with notifications and logging."""
        project = Project.objects.create(owner=owner, **data)
        self._send_creation_notification(project)
        self._log_activity(owner, "created project", project)
        return project
```

## Session Breakdown

### Session 1: Core Package Foundation (2-3 hours)

**Goal**: Create reusable `core` package with shared models, mixins, and authentication logic.

#### TDD Workflow

1. **Test First**: Write tests for base models and mixins
   - Test `UUIDModel` generates UUIDs
   - Test `TimestampedModel` auto-sets created_at/updated_at
   - Test `SoftDeleteMixin` filters deleted records

2. **Implement**: Create core package structure
   - Extract common model patterns from projects/users
   - Move UUID and timestamp logic to mixins

3. **Refactor**: Update existing apps to use core
   - Update `Project` model to inherit from core mixins
   - Update `User` model if needed
   - Run all existing tests (should still pass)

#### Files to Create

```
apps/core/
├── __init__.py
├── apps.py
├── models/
│   ├── __init__.py
│   ├── base.py              # UUIDModel, TimestampedModel
│   └── mixins.py            # SoftDeleteMixin, OwnedByUserMixin
├── authentication/
│   ├── __init__.py
│   └── permissions.py       # IsOwnerOrReadOnly, IsOwner
├── exceptions/
│   ├── __init__.py
│   └── api.py              # APIException subclasses
└── tests/
    ├── __init__.py
    ├── test_models.py
    └── test_permissions.py
```

#### Tests to Write

**`apps/core/tests/test_models.py`**:
```python
def test_uuid_model_generates_uuid():
    """UUIDModel automatically generates UUID on creation."""

def test_timestamped_model_sets_created_at():
    """TimestampedModel sets created_at on creation."""

def test_timestamped_model_updates_updated_at():
    """TimestampedModel updates updated_at on save."""

def test_soft_delete_mixin_marks_as_deleted():
    """SoftDeleteMixin marks records as deleted instead of removing."""

def test_soft_delete_mixin_filters_deleted():
    """SoftDeleteMixin excludes deleted records from default queryset."""
```

**`apps/core/tests/test_permissions.py`**:
```python
def test_is_owner_permission_allows_owner():
    """IsOwner permission allows object owner."""

def test_is_owner_permission_denies_non_owner():
    """IsOwner permission denies non-owners."""
```

#### Implementation Files

**`apps/core/models/base.py`**:
```python
import uuid
from django.db import models

class UUIDModel(models.Model):
    """Base model with UUID primary key and public UUID field."""

    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True,
    )

    class Meta:
        abstract = True

class TimestampedModel(models.Model):
    """Base model with created_at and updated_at timestamps."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]
```

**`apps/core/models/mixins.py`**:
```python
from django.db import models
from django.utils import timezone

class SoftDeleteMixin(models.Model):
    """Mixin for soft-delete functionality."""

    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        """Soft delete by setting deleted_at."""
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self):
        """Permanently delete the record."""
        super().delete()

class OwnedByUserMixin(models.Model):
    """Mixin for models owned by a user."""

    owner = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="%(class)s_set",
    )

    class Meta:
        abstract = True
```

#### Exit Criteria

- [ ] `apps/core/` package created and registered in INSTALLED_APPS
- [ ] Base models (UUIDModel, TimestampedModel) implemented and tested
- [ ] Mixins (SoftDeleteMixin, OwnedByUserMixin) implemented and tested
- [ ] Existing apps (projects, users) refactored to use core mixins
- [ ] All existing tests still pass
- [ ] Migrations created and applied

---

### Session 2: Service Layer Pattern (3-4 hours)

**Goal**: Extract business logic from ViewSets into dedicated Service classes for the `projects` app.

#### TDD Workflow

1. **Test First**: Write service layer tests
   - Test `ProjectService.create_project()` creates project with owner
   - Test `ProjectService.update_project()` validates ownership
   - Test `ProjectService.delete_project()` handles permissions
   - Test service methods raise appropriate exceptions

2. **Implement**: Create service classes
   - Extract logic from `ProjectViewSet.perform_create()`
   - Extract logic from `ProjectViewSet.perform_update()`
   - Move validation and business rules to service

3. **Refactor**: Update ViewSets to use services
   - Inject service into ViewSet
   - ViewSet only handles HTTP concerns (request/response)
   - Service handles business logic

#### Files to Create

```
apps/core/services/
├── __init__.py
└── base.py                  # BaseService class

apps/projects/services/
├── __init__.py
└── project_service.py       # ProjectService
```

#### Tests to Write

**`apps/projects/tests/test_services.py`**:
```python
def test_create_project_assigns_owner():
    """ProjectService.create_project() assigns owner."""

def test_create_project_validates_dates():
    """ProjectService.create_project() validates start_date < due_date."""

def test_update_project_requires_ownership():
    """ProjectService.update_project() validates user is owner."""

def test_delete_project_requires_ownership():
    """ProjectService.delete_project() validates user is owner."""

def test_service_raises_permission_denied():
    """Service methods raise PermissionDenied for non-owners."""
```

#### Implementation Files

**`apps/core/services/base.py`**:
```python
from typing import TypeVar, Generic
from django.db import models

T = TypeVar("T", bound=models.Model)

class BaseService(Generic[T]):
    """Base service class with common CRUD operations."""

    model: type[T]

    def __init__(self, user=None):
        self.user = user

    def get_queryset(self) -> models.QuerySet[T]:
        """Get base queryset for this service."""
        return self.model.objects.all()

    def get_by_uuid(self, uuid: str) -> T:
        """Retrieve object by UUID."""
        return self.get_queryset().get(uuid=uuid)
```

**`apps/projects/services/project_service.py`**:
```python
from apps.core.services.base import BaseService
from apps.core.exceptions.api import PermissionDeniedError
from apps.projects.models import Project
from apps.users.models import User

class ProjectService(BaseService[Project]):
    """Business logic for project management."""

    model = Project

    def create_project(
        self,
        owner: User,
        name: str,
        **data
    ) -> Project:
        """Create a new project."""
        if data.get("start_date") and data.get("due_date"):
            if data["start_date"] > data["due_date"]:
                raise ValueError("Start date must be before due date")

        project = Project.objects.create(
            owner=owner,
            name=name,
            **data
        )
        return project

    def update_project(
        self,
        uuid: str,
        user: User,
        **data
    ) -> Project:
        """Update existing project."""
        project = self.get_by_uuid(uuid)

        if project.owner != user:
            raise PermissionDeniedError("You don't own this project")

        for key, value in data.items():
            setattr(project, key, value)

        project.save()
        return project
```

#### Refactor ViewSets

**`apps/projects/api/views.py`**:
```python
from apps.projects.services.project_service import ProjectService

class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for project CRUD (now thin, delegates to service)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.project_service = ProjectService()

    def perform_create(self, serializer):
        """Create project via service layer."""
        project = self.project_service.create_project(
            owner=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = project

    def perform_update(self, serializer):
        """Update project via service layer."""
        project = self.project_service.update_project(
            uuid=serializer.instance.uuid,
            user=self.request.user,
            **serializer.validated_data
        )
        serializer.instance = project
```

#### Exit Criteria

- [ ] `BaseService` class created in `apps/core/services/base.py`
- [ ] `ProjectService` created with CRUD business logic
- [ ] Service layer tests written and passing (12+ tests)
- [ ] `ProjectViewSet` refactored to use service layer
- [ ] All existing API tests still pass
- [ ] ViewSets are thin (no business logic)

---

### Session 3: API Contracts and Proto-Service Documentation (2 hours)

**Goal**: Define explicit API contracts between apps and document each app as a proto-service.

#### TDD Workflow

1. **Test First**: Write contract validation tests
   - Test schema definitions match actual API responses
   - Test contract versioning works
   - Test breaking changes are detected

2. **Implement**: Create API contract schemas
   - Define Pydantic schemas for project API
   - Version contracts (v1)
   - Document service boundaries

3. **Document**: Write proto-service README for each app
   - Service purpose and responsibilities
   - API contracts (inputs/outputs)
   - Dependencies and integrations
   - How to extract into microservice

#### Files to Create

```
apps/projects/
├── contracts/
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── schemas.py       # Pydantic schemas for API contracts
│   │   └── events.py        # Event schemas (for future event-driven)
│   └── README.md            # Contract documentation
└── README.md                # Proto-service documentation

apps/users/
├── contracts/
│   └── v1/
│       └── schemas.py
└── README.md
```

#### Documentation Templates

**`apps/projects/README.md`** (Proto-Service Documentation):
```markdown
# Projects Service

## Purpose
Manage project lifecycle (CRUD operations, status tracking, ownership).

## Service Boundaries

### Owns
- Project data (name, description, status, dates)
- Project-user relationships (ownership)

### Does NOT Own
- User authentication (delegates to `users` service)
- Notifications (future: delegates to `notifications` service)

## API Contracts

See `contracts/v1/schemas.py` for request/response schemas.

### Endpoints
- `GET /api/projects/` - List projects (paginated)
- `POST /api/projects/` - Create project
- `GET /api/projects/{uuid}/` - Retrieve project
- `PATCH /api/projects/{uuid}/` - Update project
- `DELETE /api/projects/{uuid}/` - Delete project

### Authentication
Requires JWT token from `users` service.

## Dependencies

### Internal Services
- `users.User` model (ownership relation)

### External Services
- None (future: notifications service)

## Data Isolation

- Projects table is fully owned by this service
- No direct database access from other services
- Communication only through API contracts

## Microservice Extraction Guide

To extract this app into a standalone microservice:

1. **Database**: Separate `projects` table into its own database
2. **Authentication**: Replace direct User FK with user_uuid (string)
3. **API**: Keep existing DRF endpoints
4. **Service Communication**: Replace ORM joins with API calls to user service
5. **Events**: Publish events for created/updated/deleted projects

## Testing

Run service tests independently:
```bash
pytest apps/projects/tests/
```

## Service Layer

Business logic: `services/project_service.py`
API layer: `api/views.py`
```

**`apps/projects/contracts/v1/schemas.py`**:
```python
"""
API Contract Schemas for Projects Service v1

These schemas define the contract between this service and its consumers.
Breaking changes require a new version (v2).
"""

from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, Field, UUID4

class ProjectCreateRequest(BaseModel):
    """Contract for creating a project."""

    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    status: Literal["draft", "active", "completed", "archived"] = "draft"
    priority: Literal[1, 2, 3, 4] = 2
    start_date: date | None = None
    due_date: date | None = None

class ProjectResponse(BaseModel):
    """Contract for project response."""

    uuid: UUID4
    name: str
    description: str | None
    status: str
    priority: int
    start_date: date | None
    due_date: date | None
    is_overdue: bool
    owner_uuid: UUID4
    created_at: datetime
    updated_at: datetime
```

#### Tests to Write

**`apps/projects/contracts/tests/test_schemas.py`**:
```python
def test_project_create_request_validates():
    """ProjectCreateRequest accepts valid data."""

def test_project_create_request_rejects_invalid():
    """ProjectCreateRequest rejects invalid status."""

def test_project_response_matches_serializer():
    """ProjectResponse schema matches DRF serializer output."""
```

#### Exit Criteria

- [ ] API contract schemas created for projects service
- [ ] Proto-service README.md documents service boundaries
- [ ] Contract tests written and passing
- [ ] Microservice extraction guide documented
- [ ] Users service also documented (similar structure)

---

### Session 4: Independent Testing and Data Isolation (2 hours)

**Goal**: Ensure each app can run tests independently without dependencies on other apps.

#### TDD Workflow

1. **Test First**: Run each app's tests in isolation
   ```bash
   pytest apps/projects/tests/  # Should pass
   pytest apps/users/tests/     # Should pass
   ```

2. **Fix Dependencies**: Remove cross-app imports in tests
   - Use fixtures instead of importing models from other apps
   - Mock external service calls
   - Use API contracts for data structures

3. **Verify**: Run full test suite
   - All tests pass
   - No cross-app model imports in test files

#### Tests to Fix/Write

**Pattern to Avoid**:
```python
# ❌ BAD: Direct import from other app
from apps.users.models import User

def test_project_creation():
    user = User.objects.create(email="test@example.com")
```

**Pattern to Use**:
```python
# ✅ GOOD: Use factory or fixture
@pytest.fixture
def user(db):
    """Create test user (owned by this service for testing)."""
    from apps.users.models import User
    return User.objects.create(email="test@example.com")

def test_project_creation(user):
    project = Project.objects.create(owner=user, name="Test")
```

#### Files to Update

Update all test files to use fixtures instead of direct imports:
- `apps/projects/tests/conftest.py` - Add fixtures
- `apps/projects/tests/test_services.py` - Use fixtures
- `apps/projects/tests/test_api.py` - Use fixtures

#### Exit Criteria

- [ ] Each app has `conftest.py` with reusable fixtures
- [ ] Tests use fixtures instead of importing other apps' models
- [ ] Each app's tests can run independently
- [ ] Full test suite still passes
- [ ] Test coverage remains ≥85%

---

### Session 5: Shared Core Utilities and Final Refactoring (1-2 hours)

**Goal**: Complete the core package with shared utilities and finalize proto-service structure.

#### Files to Create

```
apps/core/utils/
├── __init__.py
├── validators.py     # Common validators (email, UUID)
├── decorators.py     # Service decorators (@transactional, @cached)
└── pagination.py     # Custom pagination classes

apps/core/tests/
└── test_utils.py
```

#### Implementation Examples

**`apps/core/utils/decorators.py`**:
```python
from functools import wraps
from django.db import transaction

def transactional(func):
    """Decorator to wrap service methods in database transaction."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        with transaction.atomic():
            return func(*args, **kwargs)
    return wrapper
```

**`apps/core/utils/validators.py`**:
```python
import re
from django.core.exceptions import ValidationError

def validate_no_special_chars(value: str) -> None:
    """Validate that string contains no special characters."""
    if not re.match(r'^[a-zA-Z0-9\s-]+$', value):
        raise ValidationError("String contains invalid characters")
```

#### Exit Criteria

- [ ] Core utilities implemented and tested
- [ ] Service decorators (transactional, cached) working
- [ ] All apps use core utilities instead of duplicating code
- [ ] Final test coverage report shows ≥85%
- [ ] Documentation updated with core package usage

---

## Final Deliverables

By the end of Phase 9, the project will have:

### Code Structure
- [x] `apps/core/` - Reusable package with shared logic
- [x] Each app structured as proto-service with:
  - `models/` - Data layer
  - `services/` - Business logic layer
  - `api/` - API layer (DRF)
  - `contracts/` - API contracts (Pydantic schemas)
  - `tests/` - Independent test suite
  - `README.md` - Service documentation

### Documentation
- [x] `apps/core/README.md` - Core package usage guide
- [x] `apps/projects/README.md` - Projects service documentation
- [x] `apps/users/README.md` - Users service documentation
- [x] `docs/MICROSERVICES_EXTRACTION.md` - Guide for extracting services

### Testing
- [x] Independent test suites for each app
- [x] Service layer tests (business logic)
- [x] API contract tests
- [x] Core package tests
- [x] ≥85% test coverage maintained

### Architecture Improvements
- [x] Clear service boundaries
- [x] Business logic separated from views (service layer)
- [x] Shared code extracted to reusable package
- [x] API contracts defined and versioned
- [x] Zero cross-app model imports

## Next Steps After Phase 9

With this foundation, the project is ready for:

1. **Event-Driven Architecture** - Add event publishing/subscribing between services
2. **API Gateway** - Centralize routing and authentication
3. **Service Extraction** - Move apps to separate repositories/containers
4. **Distributed Tracing** - Add OpenTelemetry for service observability
5. **Message Queues** - Replace direct API calls with async messaging (RabbitMQ/Kafka)

## Resources

- [Martin Fowler - Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)
- [Sam Newman - Monolith to Microservices](https://samnewman.io/books/monolith-to-microservices/)
- [Django Service Objects](https://github.com/mixxorz/django-service-objects)
- [Django API Domains](https://phalt.github.io/django-api-domains/)
