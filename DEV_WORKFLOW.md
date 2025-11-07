# Development Workflow

This document contains all commands, workflows, and procedures for developing with this Django + Vue.js full-stack starter template.

## Starting the Stack

**All services run in Docker** via `docker-compose` (including frontend Vite dev server):

```bash
# Start all services (Django, Frontend, Postgres, Redis, Celery, Mailpit)
docker compose up

# Start in detached mode (background)
docker compose up -d

# View logs
docker compose logs -f django
docker compose logs -f frontend
docker compose logs -f celeryworker

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v

# Rebuild after dependency changes
docker compose build

# Rebuild specific service
docker compose build django
docker compose build frontend
```

**Services and ports**:
- Django API: http://localhost:8000
- Django Admin: http://localhost:8000/admin
- Frontend (Vite dev server): http://localhost:5173 (runs in Docker)
- Mailpit (email testing): http://localhost:8025
- Flower (Celery monitor): http://localhost:5555
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Django Commands

**IMPORTANT**: All Django commands that interact with the database MUST run inside the Docker container.

### Database Migrations

```bash
# Create migrations after model changes
docker compose run --rm django python manage.py makemigrations

# Apply migrations
docker compose run --rm django python manage.py migrate

# Show migration status
docker compose run --rm django python manage.py showmigrations

# Show SQL for a migration (don't apply)
docker compose run --rm django python manage.py sqlmigrate <app_name> <migration_number>

# Revert to a specific migration
docker compose run --rm django python manage.py migrate <app_name> <migration_name>
```

### User Management

```bash
# Create superuser (interactive)
docker compose run --rm django python manage.py createsuperuser

# Create superuser (non-interactive)
docker compose run --rm django python manage.py createsuperuser \
  --noinput \
  --email admin@example.com
```

### Django Shell

```bash
# Python shell with Django environment
docker compose run --rm django python manage.py shell

# Enhanced shell (if django-extensions installed)
docker compose run --rm django python manage.py shell_plus

# Database shell (PostgreSQL psql)
docker compose run --rm django python manage.py dbshell
```

### Testing

```bash
# Run all tests
docker compose run --rm django pytest

# Run specific app tests
docker compose run --rm django pytest apps/projects/

# Run specific test file
docker compose run --rm django pytest apps/projects/tests.py

# Run specific test class
docker compose run --rm django pytest apps/projects/tests.py::TestProjectModel

# Run specific test function
docker compose run --rm django pytest apps/projects/tests.py::TestProjectModel::test_create

# Verbose output
docker compose run --rm django pytest -v

# Show print statements
docker compose run --rm django pytest -s

# Run last failed tests only
docker compose run --rm django pytest --lf

# Match pattern
docker compose run --rm django pytest -k "test_create"

# Stop on first failure
docker compose run --rm django pytest -x

# Parallel execution (if pytest-xdist installed)
docker compose run --rm django pytest -n auto
```

### Test Coverage

```bash
# Run tests with coverage
docker compose run --rm django coverage run -m pytest

# Show coverage report in terminal
docker compose run --rm django coverage report

# Generate HTML coverage report
docker compose run --rm django coverage html
# Open htmlcov/index.html in browser

# Show missing lines
docker compose run --rm django coverage report --show-missing

# Coverage for specific package
docker compose run --rm django coverage run -m pytest apps/projects/
docker compose run --rm django coverage report --include="apps/projects/*"
```

### Type Checking

```bash
# Type check all apps
docker compose run --rm django mypy apps

# Type check specific app
docker compose run --rm django mypy apps/projects

# Verbose output
docker compose run --rm django mypy apps -v
```

### Creating New Apps

```bash
# ONLY command that runs locally (to avoid root file ownership issues)
python manage.py startapp <app_name>

# Then move to apps/ directory
mv <app_name> backend/apps/

# Update INSTALLED_APPS in config/settings/base.py
# Add "apps.<app_name>",
```

### Data Management

```bash
# Load fixtures
docker compose run --rm django python manage.py loaddata <fixture_file>

# Dump data
docker compose run --rm django python manage.py dumpdata <app_name> > fixture.json

# Flush database (delete all data)
docker compose run --rm django python manage.py flush

# Reset database (drop and recreate)
docker compose down -v
docker compose up -d postgres
docker compose run --rm django python manage.py migrate
```

### Static Files

```bash
# Collect static files (production)
docker compose run --rm django python manage.py collectstatic --noinput

# Find static files
docker compose run --rm django python manage.py findstatic <file_path>
```

### Custom Management Commands

```bash
# Run custom management command
docker compose run --rm django python manage.py <command_name>
```

## Frontend Commands

Frontend commands can run in two ways: **via Docker (recommended)** or **on host (faster for iteration)**.

### Via Docker (Recommended)

```bash
# Type checking
docker compose run --rm frontend npm run type-check

# Build for production
docker compose run --rm frontend npm run build

# Preview production build
docker compose run --rm frontend npm run preview

# Generate TypeScript API client from Django OpenAPI schema
docker compose run --rm frontend npm run generate:api  # requires Django running

# Lint
docker compose run --rm frontend npm run lint

# Format
docker compose run --rm frontend npm run format

# Install new dependencies
docker compose run --rm frontend npm install <package>

# After installing, rebuild container
docker compose build frontend

# Restart service
docker compose restart frontend
```

### On Host (Faster for Iteration)

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Type checking (fast, no Docker overhead)
npm run type-check

# Build for production
npm run build

# Generate TypeScript API client (requires Django running on :8000)
npm run generate:api

# Lint
npm run lint

# Format
npm run format
```

**Note**: The dev server (`npm run dev`) runs automatically in Docker via `docker compose up`. You don't need to run it manually.

### Frontend Testing

#### Via Docker (Recommended)

```bash
# Run tests once
docker compose run --rm frontend npm run test:run

# Run tests in watch mode
docker compose run --rm frontend npm test

# Run tests with UI
docker compose run --rm frontend npm run test:ui

# Run tests with coverage
docker compose run --rm frontend npm run test:coverage

# Run specific test file
docker compose run --rm frontend npm run test:run -- ProjectCard.test.ts
```

#### On Host (Faster)

```bash
cd frontend

# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test:run -- ProjectCard.test.ts
```

### Adding Shadcn-vue Components

```bash
# Browse available components at https://www.shadcn-vue.com/docs/components

# Add a component (copies files to src/components/ui/)
docker compose run --rm frontend npx shadcn-vue@latest add <component-name>

# Examples
docker compose run --rm frontend npx shadcn-vue@latest add dialog
docker compose run --rm frontend npx shadcn-vue@latest add dropdown-menu
docker compose run --rm frontend npx shadcn-vue@latest add table
```

## API Client Generation

After changing Django models, serializers, or views, regenerate the TypeScript client:

```bash
# Ensure Django is running
docker compose up -d django

# Generate TypeScript client
docker compose run --rm frontend npm run generate:api
```

**When to regenerate**:
- After adding/modifying Django models
- After changing DRF serializers or views
- After adding new API endpoints
- After changing field types or validation

**What gets generated**:
- `frontend/src/api/sdk.gen.ts` - API functions
- `frontend/src/api/types.gen.ts` - TypeScript types

**Never manually edit** generated files in `frontend/src/api/`!

## Code Quality Tools

### Python (Backend)

#### Linting & Formatting

```bash
# Run all pre-commit hooks
pre-commit run --all-files

# Ruff (lint + format)
docker compose run --rm django ruff check apps/
docker compose run --rm django ruff check apps/ --fix
docker compose run --rm django ruff format apps/

# mypy (type checking)
docker compose run --rm django mypy apps/

# djLint (Django template linting)
docker compose run --rm django djlint backend/apps/templates/ --reformat
docker compose run --rm django djlint backend/apps/templates/ --check
```

#### Pre-commit Hooks

Installed via `.pre-commit-config.yaml`:
- Ruff (lint + format)
- djLint (template formatting)
- django-upgrade (auto-upgrade to Django 5.2 syntax)
- Standard checks (trailing whitespace, YAML/JSON/TOML validation, etc.)

```bash
# Install pre-commit hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files

# Run on staged files only
pre-commit run

# Update hook versions
pre-commit autoupdate
```

### TypeScript (Frontend)

```bash
# Type checking
cd frontend
npm run type-check   # vue-tsc --noEmit

# Build (includes type checking)
npm run build

# Lint
npm run lint

# Format
npm run format
```

## Environment Configuration

Environment files in `.envs/.local/`:
- `.django` - Django settings (SECRET_KEY, DEBUG, REDIS_URL, etc.)
- `.postgres` - Database credentials

**To modify environment variables**:
1. Edit files in `.envs/.local/`
2. Restart services: `docker compose restart`
3. Or rebuild if adding new dependencies: `docker compose up --build`

**Example `.django` settings**:
```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.local
DATABASE_URL=postgres://postgres:postgres@postgres:5432/postgres
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
EMAIL_HOST=mailpit
EMAIL_PORT=1025
```

## Common Workflows

### Adding a New Django Model

1. **Define model** in `backend/apps/<app>/models.py`:
   ```python
   from django.db import models
   import uuid

   class Project(models.Model):
       id = models.UUIDField(primary_key=True, default=uuid.uuid4)
       name = models.CharField(max_length=255)
       status = models.CharField(max_length=20)
   ```

2. **Create and run migrations**:
   ```bash
   docker compose run --rm django python manage.py makemigrations
   docker compose run --rm django python manage.py migrate
   ```

3. **Create serializer** in `backend/apps/<app>/api/serializers.py`:
   ```python
   from rest_framework import serializers
   from apps.projects.models import Project

   class ProjectSerializer(serializers.ModelSerializer):
       class Meta:
           model = Project
           fields = ['id', 'name', 'status']
   ```

4. **Create ViewSet** in `backend/apps/<app>/api/views.py`:
   ```python
   from rest_framework import viewsets
   from apps.projects.models import Project
   from .serializers import ProjectSerializer

   class ProjectViewSet(viewsets.ModelViewSet):
       queryset = Project.objects.all()
       serializer_class = ProjectSerializer
   ```

5. **Register ViewSet** in `backend/config/api_router.py`:
   ```python
   from apps.projects.api.views import ProjectViewSet

   router.register("projects", ProjectViewSet)
   ```

6. **Regenerate frontend types**:
   ```bash
   docker compose run --rm frontend npm run generate:api
   ```

7. **Create composable** in `frontend/src/composables/useProjects.ts`:
   ```typescript
   import { useQuery } from '@tanstack/vue-query'
   import { projectsList } from '@/api/sdk.gen'
   import { apiClient } from '@/lib/api-client'

   export function useProjects() {
     const { data: projects, isLoading } = useQuery({
       queryKey: ['projects'],
       queryFn: () => projectsList({ client: apiClient })
     })

     return { projects, isLoading }
   }
   ```

### Adding Frontend Dependencies

```bash
# Install package
docker compose run --rm frontend npm install <package>

# Example: Install a new library
docker compose run --rm frontend npm install date-fns

# Rebuild container to persist
docker compose build frontend

# Restart service
docker compose restart frontend
```

### Adding Backend Dependencies

```bash
# Add to pyproject.toml manually under [project.dependencies]
# Example:
# dependencies = [
#   "django-debug-toolbar==4.2.0",
# ]

# Or add to dev dependencies in [dependency-groups.dev]

# Rebuild container
docker compose build django

# Restart service
docker compose restart django
```

### Database Reset (Clean Slate)

```bash
# Stop services and remove volumes
docker compose down -v

# Start PostgreSQL
docker compose up -d postgres

# Run migrations
docker compose run --rm django python manage.py migrate

# Create superuser
docker compose run --rm django python manage.py createsuperuser

# Start all services
docker compose up
```

### Debugging Backend Issues

```bash
# Get recent logs
docker compose logs django --tail 100

# Filter for specific patterns
docker compose logs django --tail 200 | grep -E "(ERROR|WARNING)"

# Get logs from last 5 minutes
docker compose logs django --since 5m

# Follow logs in real-time
docker compose logs -f django

# Combine filters for debugging specific issues
docker compose logs django --tail 100 | grep -B 5 -A 5 "ValidationError"

# Search for specific user/email
docker compose logs django --tail 200 | grep "user@example.com"
```

### Debugging Frontend Issues

```bash
# View frontend logs
docker compose logs -f frontend

# Check for build errors
docker compose run --rm frontend npm run build

# Type check for errors
docker compose run --rm frontend npm run type-check
```

### Testing Backend APIs Independently

#### Using curl

```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","first_name":"Test","last_name":"User"}'

# Test login
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Test authenticated endpoint
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer <access_token>"
```

#### Using Django Shell

```bash
docker compose run --rm django python manage.py shell
```

```python
from apps.users.models import User

# Check user exists
user = User.objects.get(email="test@example.com")
print(f"User verified: {user.is_email_verified}")

# Create test data
project = Project.objects.create(
    name="Test Project",
    owner=user,
    status="active"
)
```

## Troubleshooting

### Docker Issues

**Container won't start**:
```bash
# Check logs
docker compose logs <service_name>

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

**Port already in use**:
```bash
# Find process using port
lsof -i :8000   # or :5173, :5432, etc.

# Kill process
kill -9 <PID>

# Or use different port in docker-compose.yml
```

**Permission issues**:
```bash
# Fix file ownership (Linux/WSL)
sudo chown -R $USER:$USER .

# Rebuild containers
docker compose build
```

### Django Issues

**Migrations out of sync**:
```bash
# Show migration status
docker compose run --rm django python manage.py showmigrations

# Fake apply migration (if already applied in DB)
docker compose run --rm django python manage.py migrate --fake <app_name> <migration_name>

# Reset migrations (nuclear option)
docker compose down -v
docker compose up -d postgres
docker compose run --rm django python manage.py migrate
```

**Static files not loading**:
```bash
# In development, Django serves static files automatically
# Ensure DEBUG=True in .envs/.local/.django

# In production, collect static files
docker compose run --rm django python manage.py collectstatic --noinput
```

### Frontend Issues

**Module not found**:
```bash
# Reinstall dependencies
docker compose run --rm frontend npm install

# Rebuild container
docker compose build frontend
```

**Type errors**:
```bash
# Regenerate types from backend
docker compose run --rm frontend npm run generate:api

# Type check
docker compose run --rm frontend npm run type-check
```

**Vite not reloading**:
```bash
# Restart frontend service
docker compose restart frontend

# Check frontend logs
docker compose logs -f frontend
```

## Quick Reference

```bash
# Start everything
docker compose up

# Stop everything
docker compose down

# View Django logs
docker compose logs -f django

# Run Django migrations
docker compose run --rm django python manage.py migrate

# Run Django tests
docker compose run --rm django pytest

# Type check frontend
docker compose run --rm frontend npm run type-check

# Regenerate API client
docker compose run --rm frontend npm run generate:api

# Django shell
docker compose run --rm django python manage.py shell

# Database reset
docker compose down -v && docker compose up -d postgres && docker compose run --rm django python manage.py migrate
```
