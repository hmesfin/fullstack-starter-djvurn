# Architecture Documentation

This document provides detailed information about the project structure, patterns, and architectural decisions for the Django + Vue.js full-stack starter template.

## Backend Structure

```tree
backend/
├── apps/
│   ├── contrib/         # Cookiecutter-django utilities
│   ├── projects/        # Example app: Project model
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   └── views.py     # DRF ViewSets
│   │   ├── migrations/
│   │   ├── models.py
│   │   └── tests.py
│   └── users/           # Custom user model (email-based auth)
├── config/
│   ├── settings/
│   │   ├── base.py        # Shared settings
│   │   ├── local.py       # Development settings
│   │   ├── production.py
│   │   └── test.py        # Test configuration
│   ├── api_router.py    # DRF router (registers ViewSets)
│   ├── urls.py          # Root URL configuration
│   ├── asgi.py          # ASGI entry point (uvicorn)
│   └── celery_app.py    # Celery configuration
├── locale/          # Translation files
├── manage.py        # Django CLI
├── pyproject.toml   # Python dependencies
└── uv.lock          # Dependency lock file
```

### Backend Patterns

- All backend code in `backend/` directory for clear separation
- Apps in `backend/apps/` directory
- Custom User model: `apps.users.User` (email-based, no username)
- API endpoints: `/api/` namespace
- DRF ViewSets registered in `backend/config/api_router.py`
- OpenAPI schema available at `/api/schema/`
- Authentication: DRF Token Authentication (via `/api/auth-token/`)
- **No Django template views**: All user-facing UI handled by Vue.js frontend
- Templates only used for Django Admin and email templates (`backend/apps/templates/email/`)

### Django Settings Configuration

**Settings hierarchy**:
- `base.py`: Shared settings for all environments
- `local.py`: Development settings (DEBUG=True, Mailpit, etc.)
- `test.py`: Test settings (in-memory caches, eager Celery, etc.)
- `production.py`: Production settings (S3, SendGrid, etc.)

**Key settings to know**:
- `DATABASES["default"]["ATOMIC_REQUESTS"] = True`: Every request wrapped in transaction (see DEBUG_DOGMA.md for rollback patterns)
- `CELERY_TASK_ALWAYS_EAGER = True` (test.py): Celery tasks run synchronously in tests
- DRF settings in `REST_FRAMEWORK`: Token auth, pagination, permissions
- `SPECTACULAR_SETTINGS`: OpenAPI schema generation config with enum mappings

## Frontend Structure

```tree
frontend/src/
├── api/              # Auto-generated from OpenAPI schema (DO NOT EDIT)
│   ├── sdk.gen.ts    # Generated API functions
│   └── types.gen.ts  # Generated TypeScript types
├── components/       # Domain components
│   ├── auth/         # LoginForm, RegisterForm, OTPVerificationForm
│   ├── projects/     # ProjectCard, ProjectForm, ProjectFilters, ProjectList
│   ├── ui/           # Shadcn-vue components (Button, Input, Card, etc.)
│   └── ThemeToggle.vue  # Dark mode toggle
├── composables/      # Vue composables (useProjects, useTheme, etc)
├── constants/        # Centralized constants (PROJECT_STATUSES, etc)
├── lib/
│   ├── api-client.ts # Configured axios client with auth interceptors
│   └── utils.ts      # cn() utility for class merging
├── schemas/          # Zod validation schemas (mirror backend models)
├── stores/           # Pinia stores
├── types/            # Manual TypeScript types
├── views/            # Route views (LoginView, DashboardView, etc)
├── App.vue
└── main.ts
```

### Frontend Patterns

**Component Library**: Shadcn-vue (copy-paste components, no dependency hell)
- Built on Radix Vue primitives (accessibility-first)
- Styled with Tailwind CSS utility classes
- Components in `src/components/ui/` - full ownership, customize as needed
- Add new components: `docker compose run --rm frontend npx shadcn-vue@latest add <component-name>`

**Dark Mode**: VueUse `useDark()` composable
- System preference detection with manual override
- Persisted in localStorage
- Class-based (`dark` class on `<html>`)

**Styling**: Tailwind CSS v4
- Zero custom CSS - all utility classes
- Design tokens via CSS variables for light/dark themes

**Centralized Constants**: `src/constants/projects.ts`
- STATUS_CONFIG, PRIORITY_CONFIG with badge variants
- Maps backend Django enums (StatusEnum, PriorityEnum) to UI
- Single source of truth for status/priority labels and colors

**State Management**:
- Pinia stores for global state
- TanStack Query (vue-query) for server state/caching
- Composables wrap API + query logic (e.g., `useProjects()`)

**Type Safety**:
- Composition API with `<script setup lang="ts">`
- Auto-generated API client from Django OpenAPI schema
- API calls use typed functions from `@/api/sdk.gen.ts` (not service classes)
- Never manually edit files in `src/api/` (regenerate with `npm run generate:api`)

**API Client Usage Pattern**:
```typescript
import { projectsList } from '@/api/sdk.gen';
import { apiClient } from '@/lib/api-client';

const response = await projectsList({
  client: apiClient,
  query: { status: 'active' }
});
```

**Error Handling Pattern** (critical for generated SDK):
```typescript
const response = await apiAuthTokenCreate({ client: apiClient, body: data })

// Check if the SDK returned an error object instead of throwing it
if (response && 'error' in response && response.error) {
  throw response  // Throw it to be caught properly
}
```

## API Client Generation

The frontend TypeScript client is auto-generated from Django's OpenAPI schema:

1. Django generates OpenAPI schema via `drf-spectacular`
2. `@hey-api/openapi-ts` generates TypeScript client
3. Generated files in `frontend/src/api/` (committed to Git)

**Regeneration workflow**:
```bash
# After changing Django models/serializers/views:
docker compose run --rm frontend npm run generate:api
```

**When to regenerate**:
- After adding/modifying Django models
- After changing DRF serializers or views
- After adding new API endpoints
- After changing field types or validation

**Generated type patterns**:
- Request types: `ProjectCreateRequest`, `PatchedProjectRequest`
- Response types in `.data` property: `response.data`
- Enums: `StatusEnum`, `PriorityEnum` (mapped in `SPECTACULAR_SETTINGS`)

## Validation Patterns

### Backend (Django)

**DRF Serializers**:
```python
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'status', 'priority']

    def validate_status(self, value):
        # Field-level validation
        if value not in ['active', 'archived']:
            raise serializers.ValidationError("Invalid status")
        return value

    def validate(self, attrs):
        # Object-level validation
        if attrs['priority'] == 'high' and attrs['status'] == 'archived':
            raise serializers.ValidationError("High priority projects cannot be archived")
        return attrs
```

### Frontend (Zod)

**Zod Schemas** (mirror backend validation):
```typescript
// frontend/src/schemas/projects.schema.ts
import { z } from 'zod'

export const projectCreateSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  status: z.enum(['active', 'archived']),
  priority: z.enum(['low', 'medium', 'high']),
}).strict()

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
```

**Usage in components**:
```typescript
const result = projectCreateSchema.safeParse(formData)
if (result.success) {
  // Data validated at runtime
  await projectsCreate({ client: apiClient, body: result.data })
} else {
  // Handle validation errors
  result.error.issues.forEach(issue => {
    fieldErrors[issue.path[0]] = issue.message
  })
}
```

**TDD for schemas**:
1. Write schema validation tests FIRST (`__tests__/schema.test.ts`)
2. Run tests to verify they fail (RED phase)
3. Implement schema to make tests pass (GREEN phase)
4. Schemas stored in `frontend/src/schemas/` grouped by domain

## Component Patterns

### Using Shadcn-vue Components

**Common components**:
- **Button**: `variant` (default, destructive, outline, secondary, ghost, link), `size` (default, sm, lg, icon)
- **Input**: Text, email, password, number inputs with proper styling
- **Select**: Dropdown with search/filtering support (uses Radix Vue primitives)
- **Card**: Container with Header, Title, Description, Content, Footer
- **Badge**: Small labels with variants (default, secondary, destructive, outline)
- **Alert**: Info/warning/error messages with AlertTitle and AlertDescription

**Usage example**:
```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Always include type="button" to prevent accidental form submission
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Login</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input id="email" type="email" v-model="email" />
        </div>
        <Button type="submit" class="w-full">Sign In</Button>
      </div>
    </CardContent>
  </Card>
</template>
```

**Important patterns**:
1. **Always use `type="button"` on non-submit buttons** to prevent accidental form submission
2. **Use Tailwind utility classes** for spacing, sizing, colors - no custom CSS
3. **Use centralized constants** from `src/constants/` for badge variants, status colors
4. **Dark mode support** - All Shadcn components work with `dark` class automatically

### Domain Component Organization

**Example: Projects Feature**

```tree
frontend/src/components/projects/
├── ProjectCard.vue         # Display single project
├── ProjectForm.vue         # Create/edit project form
├── ProjectFilters.vue      # Filter controls
└── ProjectList.vue         # List of projects with filters
```

**Composable pattern**:
```typescript
// frontend/src/composables/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiClient } from '@/lib/api-client'
import { projectsList, projectsCreate, projectsUpdate } from '@/api/sdk.gen'

export function useProjects() {
  const queryClient = useQueryClient()

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsList({ client: apiClient })
  })

  // Create project
  const createProject = useMutation({
    mutationFn: (data) => projectsCreate({ client: apiClient, body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  return { projects, isLoading, createProject }
}
```

## Testing Patterns

### Backend (pytest)

**Test structure**:
```python
# backend/apps/projects/tests.py
import pytest
from django.contrib.auth import get_user_model
from apps.projects.models import Project

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123'
    )

@pytest.mark.django_db
class TestProjectModel:
    def test_create_project(self, user):
        project = Project.objects.create(
            name='Test Project',
            owner=user,
            status='active'
        )
        assert project.name == 'Test Project'
        assert project.status == 'active'
```

**Test configuration** (`pyproject.toml`):
- `pytest.ini_options`: Django settings module, database reuse
- `coverage.run`: Coverage includes `apps/**`, omits migrations/tests

### Frontend (Vitest)

**Test structure**:
```typescript
// frontend/src/components/__tests__/ProjectCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCard from '../ProjectCard.vue'

describe('ProjectCard', () => {
  it('renders project name', () => {
    const wrapper = mount(ProjectCard, {
      props: {
        project: {
          id: '1',
          name: 'Test Project',
          status: 'active'
        }
      }
    })

    expect(wrapper.text()).toContain('Test Project')
  })
})
```

**Test configuration** (`vite.config.ts`):
- `test.globals`: true - enables describe, it, expect globally
- `test.environment`: jsdom - for DOM testing
- Schemas tests in `src/schemas/__tests__/` validate Zod schemas

## Database Patterns

### Models

**UUID Primary Keys** (recommended for APIs):
```python
import uuid
from django.db import models

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
```

**Auto-increment Primary Keys** (default):
```python
class Tag(models.Model):
    # id = models.AutoField(primary_key=True)  # implicit
    name = models.CharField(max_length=50)
```

### Migrations

**Creating migrations**:
```bash
# After changing models
docker compose run --rm django python manage.py makemigrations

# Apply migrations
docker compose run --rm django python manage.py migrate

# Check migration status
docker compose run --rm django python manage.py showmigrations
```

**Migration best practices**:
- One schema change per migration (easier rollback)
- Use `RunPython` for data migrations
- Test migrations on staging before production
- Never edit applied migrations

## Celery Task Patterns

### Defining Tasks

```python
# backend/apps/users/tasks.py
from config.celery_app import app
from django.core.mail import send_mail

@app.task()
def send_welcome_email(user_id):
    from apps.users.models import User
    user = User.objects.get(id=user_id)

    send_mail(
        'Welcome!',
        'Thanks for signing up.',
        'noreply@example.com',
        [user.email],
    )
```

### Running Tasks

```python
# Async (recommended)
from apps.users.tasks import send_welcome_email
send_welcome_email.delay(user.id)

# Sync (testing only)
send_welcome_email(user.id)
```

### Monitoring

- **Flower UI**: http://localhost:5555 (Celery task monitor)
- **View logs**: `docker compose logs -f celeryworker`

## Important Architectural Decisions

1. **Monorepo Structure**: Backend and frontend separated at root level
   - `backend/` - All Django/Python code
   - `frontend/` - All Vue.js/TypeScript code
   - Root - Infrastructure files (docker-compose, .envs, docs)

2. **API-Only Backend**: Django serves only API endpoints and admin interface
   - No django-crispy-forms, no django-allauth, no template-based views
   - All user-facing UI handled by Vue.js frontend

3. **Python Package Management**: Uses `uv` (not pip/poetry)
   - Dependencies in `backend/pyproject.toml`
   - Lock file: `backend/uv.lock`

4. **Custom User Model**: Email-based authentication
   - `apps.users.User` (no username field)
   - API-only authentication with DRF Token Authentication

5. **Email Templates**: Django templates in `backend/apps/templates/email/`
   - Used for transactional emails (password reset, notifications, etc.)
   - NOT for user-facing web pages

6. **UUID Primary Keys**: Example `Project` model uses UUIDs (better for APIs)

7. **DRF Spectacular**: Auto-generates OpenAPI schema with proper enum handling
   - Enum mappings in `SPECTACULAR_SETTINGS['ENUM_NAME_OVERRIDES']`

8. **CORS**: Configured for `/api/.*` endpoints via `django-cors-headers`
