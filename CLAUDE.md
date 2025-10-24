# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Django + Vue.js starter template with:

- **Backend**: Django 5.2, Django REST Framework (API-only), PostgreSQL, Redis, Celery (async tasks)
- **Frontend**: Vue 3 (Composition API), TypeScript, Vite, TanStack Query (vue-query)
- **Infrastructure**: Docker-based development with docker-compose (all services containerized)
- **API Contract**: OpenAPI schema with automatic TypeScript client generation via `@hey-api/openapi-ts`
- **Package Management**: `uv` for Python (replaces pip/poetry), `npm` for JavaScript
- **Type Safety**: Strict TypeScript config with `noUncheckedIndexedAccess` enabled
- **Authentication**: Token-based API authentication (no Django templates/forms frontend)

## Core Principles (Non-Negotiable)

These principles are **equally important** and must be followed at all times:

### 1. Test-Driven Development (TDD)
- **RED-GREEN-REFACTOR** cycle is mandatory
- Write tests FIRST, implementation SECOND
- No code exists until there's a failing test that needs it
- Minimum 85% code coverage (90% for data, 95% for security)

### 2. Fully-Typed Code (Type Safety First)
- **NO `any` types** - ever. Use `unknown` if type is truly unknown
- **Explicit return types** on all functions (TypeScript & Python)
- **mypy strict mode** for Python - all code must pass with no errors
- **TypeScript strict mode** - `noUncheckedIndexedAccess` enabled
- **Runtime validation** with Zod schemas (mirrors TypeScript types)
- Type checking runs BEFORE tests in CI/CD

### 3. Code Quality & Organization
- **Max 500 lines per file** - split when approaching limit
- **Domain-driven organization** - group by feature, not by type
- **Descriptive naming** - `getUserByEmail()` not `getUser()`
- **No magic numbers** - use named constants
- **Modular architecture** - each module is self-contained

## User Preferences

- **Django Patterns**: Auto-increment PK (default) + UUID for public API exposure
- **Development**: Docker-first workflow for consistency across environments
- **Frontend**: Vue.js handles ALL user-facing UI (no Django templates except for emails)
- **Validation**: Zod schemas for ALL API requests/responses

## Development Workflow

### Starting the Stack

**All services run in Docker** via `docker-compose` (including frontend Vite dev server):

```bash
# Start all services (Django, Frontend, Postgres, Redis, Celery, Mailpit)
docker compose up

# View logs
docker compose logs -f django
docker compose logs -f frontend
docker compose logs -f celeryworker

# Rebuild after dependency changes
docker compose build

# Rebuild specific service
docker compose build django
docker compose build frontend
```

Services run on:

- Django API: <http://localhost:8000>
- Django Admin: <http://localhost:8000/admin>
- **Frontend (Vite dev server)**: <http://localhost:5173> (runs in Docker)
- Mailpit (email testing): <http://localhost:8025>
- Flower (Celery monitor): <http://localhost:5555>

### Django Commands

**IMPORTANT**: All Django commands that interact with the database MUST run inside the Docker container:

```bash
# Database migrations
docker compose run --rm django python manage.py makemigrations
docker compose run --rm django python manage.py migrate

# Create superuser
docker compose run --rm django python manage.py createsuperuser

# Django shell
docker compose run --rm django python manage.py shell

# Run tests
docker compose run --rm django pytest
docker compose run --rm django pytest apps/projects/tests.py  # single test file

# Type checking
docker compose run --rm django mypy apps

# Test coverage
docker compose run --rm django coverage run -m pytest
docker compose run --rm django coverage html
```

**Exception**: Only `python manage.py startapp <name>` runs locally (to avoid root file ownership issues).

### Frontend Commands

Frontend commands can run in two ways:

**1. Via Docker (recommended for consistency):**

```bash
# Type checking
docker compose run --rm frontend npm run type-check

# Build for production
docker compose run --rm frontend npm run build

# Generate TypeScript API client from Django OpenAPI schema
docker compose run --rm frontend npm run generate:api  # requires Django running

# Install new dependencies (then rebuild)
docker compose run --rm frontend npm install <package>
docker compose build frontend
```

**2. On the host (faster for type-checking during development):**

```bash
cd frontend

# Install dependencies
npm install

# Type checking (fast, no Docker overhead)
npm run type-check  # or: vue-tsc --noEmit

# Build for production
npm run build

# Generate TypeScript API client
npm run generate:api  # requires Django running on :8000
```

**Note**: The dev server (`npm run dev`) runs automatically in Docker via `docker compose up`. You don't need to run it manually.

### Frontend Testing

**Test Framework**: Vitest (configured in `vite.config.ts`)

**1. Via Docker (recommended for consistency):**

```bash
# Run tests once
docker compose run --rm frontend npm run test:run

# Run tests in watch mode
docker compose run --rm frontend npm test

# Run tests with UI
docker compose run --rm frontend npm run test:ui
```

**2. On the host (faster for iteration):**

```bash
cd frontend

# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui
```

**Zod Schema Validation Pattern:**

All API request/response data MUST have corresponding Zod schemas for runtime validation:

```typescript
// frontend/src/schemas/auth.schema.ts
import { z } from 'zod'

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
}).strict()

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
```

**Usage in components:**

```typescript
import { userRegistrationSchema } from '@/schemas'
import { apiAuthRegisterCreate } from '@/api/sdk.gen'
import { apiClient } from '@/lib/api-client'

const result = userRegistrationSchema.safeParse(formData)
if (result.success) {
  // Data is validated at runtime
  await apiAuthRegisterCreate({ client: apiClient, body: result.data })
} else {
  // Handle validation errors
  console.error(result.error.issues)
}
```

**TDD for Schemas:**

1. Write schema validation tests FIRST (`__tests__/schema.test.ts`)
2. Run tests to verify they fail (RED phase)
3. Implement schema to make tests pass (GREEN phase)
4. Schemas are stored in `frontend/src/schemas/` grouped by domain

## Architecture

### Backend Structure

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

**Key Patterns**:

- All backend code in `backend/` directory for clear separation
- Apps in `backend/apps/` directory
- Custom User model: `apps.users.User` (email-based, no username)
- API endpoints: `/api/v1/` namespace
- DRF ViewSets registered in `backend/config/api_router.py`
- OpenAPI schema available at `/api/schema/`
- Authentication: DRF Token Authentication (via `/api/auth-token/`)
- **No Django template views**: All user-facing UI handled by Vue.js frontend
- Templates only used for Django Admin and email templates (`backend/apps/templates/email/`)

### Frontend Structure

```tree
frontend/src/
├── api/              # Auto-generated from OpenAPI schema (DO NOT EDIT)
│   ├── sdk.gen.ts    # Generated API functions
│   └── types.gen.ts  # Generated TypeScript types
├── composables/      # Vue composables (useProjects, etc)
├── components/       # Reusable Vue components
├── lib/
│   └── api-client.ts # Configured axios client with auth interceptors
├── schemas/          # Zod validation schemas (mirror backend models)
├── types/            # Manual TypeScript types
├── App.vue
└── main.ts
```

**Key Patterns**:

- Composition API with `<script setup lang="ts">`
- TanStack Query (vue-query) for data fetching/caching
- Auto-generated API client from Django OpenAPI schema
- API calls use typed functions from `@/api/sdk.gen.ts` (not service classes)
- Composables pattern: `useProjects()` wraps API + query logic
- Never manually edit files in `src/api/` (regenerate with `npm run generate:api`)
- **API Client Usage**: Always pass `apiClient` to generated SDK functions:
  ```typescript
  import { projectsList } from '@/api/sdk.gen';
  import { apiClient } from '@/lib/api-client';

  const response = await projectsList({
    client: apiClient,
    query: { status: 'active' }
  });
  ```

### API Client Generation

The frontend TypeScript client is auto-generated from Django's OpenAPI schema:

1. Django generates OpenAPI schema via `drf-spectacular`
2. `@hey-api/openapi-ts` generates TypeScript client
3. Generated files in `frontend/src/api/` (committed to Git)

**Workflow**:

```bash
# After changing Django models/serializers/views:

# Option 1: Via Docker (recommended)
docker compose run --rm frontend npm run generate:api

# Option 2: On host (faster, requires Django running)
cd frontend
npm run generate:api  # fetches http://localhost:8000/api/schema/
```

**When to regenerate**:

- After adding/modifying Django models
- After changing DRF serializers or views
- After adding new API endpoints
- After changing field types or validation

**Generated Type Patterns**:
- Request types: `ProjectCreateRequest`, `PatchedProjectRequest`
- Response types in `.data` property: `response.data`
- Enums: `StatusEnum`, `PriorityEnum` (mapped in `SPECTACULAR_SETTINGS`)

### Testing

**Backend (pytest)**:

```bash
docker compose run --rm django pytest                    # all tests
docker compose run --rm django pytest apps/projects/     # specific app
docker compose run --rm django pytest -v                 # verbose
docker compose run --rm django pytest --lf               # last failed
docker compose run --rm django pytest -k "test_create"   # match pattern
```

Test configuration in `pyproject.toml`:

- `pytest.ini_options`: Django settings module, database reuse
- `coverage.run`: Coverage includes `apps/**`, omits migrations/tests

**Frontend (Vitest)**:

```bash
# Via Docker (recommended)
docker compose run --rm frontend npm run test:run    # run once
docker compose run --rm frontend npm test            # watch mode
docker compose run --rm frontend npm run test:ui     # with UI

# On host (faster)
cd frontend
npm run test:run    # run once
npm test            # watch mode
npm run test:ui     # with UI
```

Test configuration in `vite.config.ts`:

- `test.globals`: true - enables describe, it, expect globally
- `test.environment`: jsdom - for DOM testing
- Schemas tests in `src/schemas/__tests__/` validate Zod schemas

## Code Quality Tools

### Python (Backend)

**Linting & Formatting**:

- **Ruff**: All-in-one linter + formatter (configured in `pyproject.toml`)
- **mypy**: Type checking with Django stubs
- **djLint**: Django template linting

```bash
# Run via pre-commit hooks
pre-commit run --all-files

# Or manually via Docker:
docker compose run --rm django ruff check apps/
docker compose run --rm django ruff format apps/
docker compose run --rm django mypy apps/
```

**Pre-commit hooks** (`.pre-commit-config.yaml`):

- Ruff (lint + format)
- djLint (template formatting)
- django-upgrade (auto-upgrade to Django 5.2 syntax)
- Standard checks (trailing whitespace, YAML/JSON/TOML validation, etc.)

### TypeScript (Frontend)

```bash
cd frontend
npm run type-check   # vue-tsc --noEmit
npm run build        # includes type checking
```

## Environment Configuration

Environment files in `.envs/.local/`:

- `.django` - Django settings (SECRET_KEY, DEBUG, REDIS_URL, etc.)
- `.postgres` - Database credentials

**Do not commit** actual secrets. Template files should use placeholders.

## Database

- PostgreSQL (via Docker)
- ORM: Django ORM
- Migrations: Django migrations (run via `docker compose run --rm django`)
- Connection: Managed by Django via `DATABASE_URL` env var

## Celery (Async Tasks)

- **Broker & Backend**: Redis
- **Worker**: `celeryworker` service in docker-compose
- **Beat Scheduler**: `celerybeat` service (for periodic tasks)
- **Monitoring**: Flower UI at <http://localhost:5555>

**Define tasks** in `apps/<app>/tasks.py`:

```python
from config.celery_app import app

@app.task()
def my_task():
    # task code
```

**Run task**:

```python
from apps.myapp.tasks import my_task
my_task.delay()  # async
```

## Deployment Considerations

- Production settings in `config/settings/production.py`
- Static files: Collected via `collectstatic`, served via CDN/S3 (django-storages)
- ASGI server: Uvicorn (configured in docker-compose)
- Environment: Set `DJANGO_SETTINGS_MODULE=config.settings.production`

## Important Notes

1. **Monorepo Structure**: Backend and frontend separated at root level
   - `backend/` - All Django/Python code (apps, config, manage.py, dependencies)
   - `frontend/` - All Vue.js/TypeScript code
   - Root - Infrastructure files (docker-compose, .envs, docs)

2. **API-Only Backend**: Django serves only API endpoints and admin interface
   - No django-crispy-forms, no django-allauth, no template-based views
   - Templates directory (`backend/apps/templates/`) used ONLY for email templates
   - All user-facing UI handled by Vue.js frontend at `http://localhost:5173`

3. **Python Package Management**: This project uses `uv` (not pip/poetry)
   - Dependencies in `backend/pyproject.toml` under `[project.dependencies]` or `[dependency-groups.dev]`
   - Lock file: `backend/uv.lock`
   - Sync: `docker compose build` after modifying `pyproject.toml`

4. **Custom User Model**: Authentication uses `apps.users.User` (email-based, no username field)
   - API-only authentication with DRF Token Authentication
   - No django-allauth or template-based auth flows
   - Authentication handled entirely through API endpoints

5. **Email Templates**: Django templates in `backend/apps/templates/email/`
   - Used for transactional emails (password reset, notifications, etc.)
   - Sent via django-anymail (SendGrid configured)
   - NOT for user-facing web pages

6. **API Versioning**: Endpoints prefixed with `/api/v1/` (configured in `SPECTACULAR_SETTINGS`)

7. **UUID Primary Keys**: Example `Project` model uses UUIDs for primary keys (better for APIs)

8. **DRF Spectacular**: Auto-generates OpenAPI schema with proper enum handling
   - Enum mappings in `SPECTACULAR_SETTINGS['ENUM_NAME_OVERRIDES']`
   - Schema endpoint: `/api/schema/`

9. **CORS**: Configured for `/api/.*` endpoints via `django-cors-headers`

10. **Authentication**: API-only authentication
   - Backend: DRF TokenAuthentication (obtain token via `/api/auth-token/`)
   - No session-based auth, no django-allauth, no template-based login
   - Frontend handles all auth UI (login, signup, password reset)
   - Consider implementing JWT for token refresh (djangorestframework-simplejwt)

## Useful Commands Quick Reference

```bash
# Start everything (includes frontend Vite dev server)
docker compose up

# View logs
docker compose logs -f django
docker compose logs -f frontend

# Django commands (run from backend/ directory in container)
docker compose run --rm django python manage.py makemigrations
docker compose run --rm django python manage.py migrate
docker compose run --rm django python manage.py createsuperuser
docker compose run --rm django python manage.py shell
docker compose run --rm django pytest

# Frontend commands (via Docker - recommended)
docker compose run --rm frontend npm run type-check
docker compose run --rm frontend npm run build
docker compose run --rm frontend npm run generate:api  # Regenerate TS client
docker compose run --rm frontend npm install <package>

# Frontend commands (on host - faster for iteration)
cd frontend
npm run type-check    # Fast TypeScript checking
npm run generate:api  # Requires Django running on :8000

# Code quality
pre-commit run --all-files
docker compose run --rm django ruff check apps/
docker compose run --rm django mypy apps/

# Rebuild after dependency changes
docker compose build django    # After updating pyproject.toml
docker compose build frontend  # After updating package.json
```

## Common Workflows

### Adding a New Django Model

1. Define model in `backend/apps/<app>/models.py`
2. Create serializer in `backend/apps/<app>/api/serializers.py`
3. Create ViewSet in `backend/apps/<app>/api/views.py`
4. Register ViewSet in `backend/config/api_router.py`
5. Create and run migrations:
   ```bash
   docker compose run --rm django python manage.py makemigrations
   docker compose run --rm django python manage.py migrate
   ```
6. Regenerate frontend types:
   ```bash
   docker compose run --rm frontend npm run generate:api
   ```
7. Create composable in `frontend/src/composables/use<Model>.ts`

### Adding Frontend Dependencies

```bash
# Install package
docker compose run --rm frontend npm install <package>

# Rebuild container to persist
docker compose build frontend

# Restart service
docker compose restart frontend
```
