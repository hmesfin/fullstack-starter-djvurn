# CLAUDE.md

**2-Minute Project Briefing** - Read this first, consult detailed docs as needed.

## What Is This?

Full-stack Django + Vue.js starter template with production-ready patterns:

- **Backend**: Django 5.2, DRF (API-only), PostgreSQL, Redis, Celery
- **Frontend**: Vue 3 (Composition API), TypeScript, Vite, Shadcn-vue, Tailwind CSS v4
- **Auth**: Email-based with OTP verification (no Django templates)
- **Infrastructure**: Docker-first (all services containerized, including Vite dev server)
- **Type Safety**: Auto-generated TypeScript client from Django OpenAPI schema
- **Package Management**: `uv` (Python), `npm` (JavaScript)

## Non-Negotiable Rules

### 1. Test-Driven Development (TDD)

- **RED-GREEN-REFACTOR** cycle is mandatory
- Write tests FIRST, implementation SECOND
- No code exists until there's a failing test that needs it
- Minimum 85% code coverage (90% for data, 95% for security)

### 2. Fully-Typed Code

- **NO `any` types** - ever. Use `unknown` if type is truly unknown
- **Explicit return types** on all functions (TypeScript & Python)
- **mypy strict mode** (Python), **TypeScript strict mode** with `noUncheckedIndexedAccess`
- **Runtime validation** with Zod schemas (mirrors TypeScript types)

### 3. Code Organization

- **Max 500 lines per file** - split when approaching limit
- **Domain-driven organization** - group by feature, not by type
- **Descriptive naming** - `getUserByEmail()` not `getUser()`

## User Preferences

- **Django patterns**: Auto-increment PK (default) + UUID for public API exposure
- **Development**: Docker-first workflow - consistency over speed
- **Frontend**: Vue.js handles ALL user-facing UI (no Django templates except emails)
- **Validation**: Zod schemas for ALL API requests/responses

## App Planning System

**NEW**: This starter includes an AI-driven planning system that transforms your app idea into a comprehensive, TDD-driven, session-based implementation plan.

**Philosophy**: Planning is the bottleneck, not coding. Poor planning leads to project failure. Good plans enable successful agent execution.

### Quick Plan

```bash
/plan-app
```

**What you get**:

1. Interactive discovery (Claude asks smart questions about your app)
2. Technical requirements document (models, endpoints, components, validation)
3. High-level project plan (phases, timelines, success criteria)
4. Detailed session-by-session tasks (TDD workflows, files to create, exit criteria)

**Learn more**: See `.claude/PLANNING_GUIDE.md`

## Quick Start

### Start Everything

```bash
docker compose up
```

**Services**:

- Django API: <http://localhost:8000> (includes admin)
- Frontend: <http://localhost:5173> (Vite dev server in Docker)
- Mailpit: <http://localhost:8025> (email testing)
- Flower: <http://localhost:5555> (Celery monitor)

### Critical Commands

```bash
# Django (ALWAYS via Docker, NEVER locally except startapp)
docker compose run --rm django python manage.py migrate
docker compose run --rm django pytest

# Frontend (Docker or host - your choice)
docker compose run --rm frontend npm run type-check
docker compose run --rm frontend npm run generate:api  # After backend changes

# Logs
docker compose logs -f django
docker compose logs -f frontend
```

**Exception**: Only `python manage.py startapp <name>` runs locally (avoids root file ownership).

## Critical Gotchas

### Django ATOMIC_REQUESTS Transaction Rollback

**Symptom**: Data appears created in logs, then vanishes (e.g., "created: 1" → "count: 0")

**Cause**: `DATABASES["default"]["ATOMIC_REQUESTS"] = True` wraps every request in transaction. When `ValidationError` is raised, the **entire transaction rolls back**, including model creation.

**Fix**: Use `@transaction.non_atomic_requests` decorator. See DEBUG_DOGMA.md for detailed patterns.

### Generated SDK Error Handling

The `@hey-api/openapi-ts` generated SDK may **return errors instead of throwing them**.

**Pattern to use**:

```typescript
const response = await apiAuthTokenCreate({ client: apiClient, body: data })

// ALWAYS check for error property
if (response && 'error' in response && response.error) {
  throw response  // Throw it to be caught properly
}
```

### Axios Configuration

Ensure axios throws on 4xx/5xx errors:

```typescript
// frontend/src/lib/api-client.ts
validateStatus: (status) => status >= 200 && status < 300
```

## Where to Find More

- **ARCHITECTURE.md** - Detailed structure, patterns, component library, validation
- **DEV_WORKFLOW.md** - All commands, workflows, troubleshooting (database, testing, code quality)
- **EMAIL_SETUP.md** - Email configuration (Mailpit, SendGrid, templates, Celery tasks)
- **DEBUG_DOGMA.md** - Hard-won debugging lessons (when "chasing your tails")
- **GREEN_CICD.md** - Keeping CI/CD green: testing workflows, failure patterns, best practices

## Key Architecture Decisions

1. **Monorepo**: `backend/` (Django/Python), `frontend/` (Vue/TypeScript), root (infrastructure)
2. **API-Only Backend**: Django serves API + admin only. No template-based views. All user-facing UI in Vue.js.
3. **Custom User Model**: `apps.users.User` (email-based, no username)
4. **Auto-Generated API Client**: Frontend types generated from Django OpenAPI schema (never edit `frontend/src/api/` manually)
5. **Shadcn-vue**: Copy-paste components (not npm package) - full ownership, customize as needed

## Common Workflows (Quick Reference)

### Add Django Model

1. Define model in `backend/apps/<app>/models.py`
2. Create migrations: `docker compose run --rm django python manage.py makemigrations`
3. Apply migrations: `docker compose run --rm django python manage.py migrate`
4. Create serializer + ViewSet, register in `api_router.py`
5. **Regenerate frontend types**: `docker compose run --rm frontend npm run generate:api`
6. Create composable in `frontend/src/composables/use<Model>.ts`

See DEV_WORKFLOW.md for complete step-by-step workflows.

### Add Frontend Dependency

```bash
docker compose run --rm frontend npm install <package>
docker compose build frontend
docker compose restart frontend
```

### Add Backend Dependency

Edit `backend/pyproject.toml` → Add to `[project.dependencies]` or `[dependency-groups.dev]`

```bash
docker compose build django
docker compose restart django
```

### Database Reset (Clean Slate)

```bash
docker compose down -v
docker compose up -d postgres
docker compose run --rm django python manage.py migrate
docker compose run --rm django python manage.py createsuperuser
docker compose up
```

## Testing

> **IMPORTANT**: Run tests locally BEFORE pushing. CI is your safety net, not your test runner.

```bash
# Backend
docker compose run --rm django pytest                  # all tests
docker compose run --rm django pytest apps/projects/   # specific app
docker compose run --rm django pytest -v               # verbose
docker compose run --rm django coverage run -m pytest  # with coverage

# Frontend
docker compose run --rm frontend npm run test:run      # all tests
docker compose run --rm frontend npm test              # watch mode

# Mobile
cd mobile && npm run test:run                          # all tests
cd mobile && npm test                                  # watch mode

# Type checking
docker compose run --rm django mypy apps
docker compose run --rm frontend npm run type-check
cd mobile && npm run type-check
```

**See GREEN_CICD.md for complete testing workflows, failure patterns, and best practices.**

## Debugging

> **When debugging feels unproductive or you're "chasing your tails"**, refer to DEBUG_DOGMA.md.

**Quick checks**:

1. Check `ATOMIC_REQUESTS` FIRST when data appears then disappears
2. Fetch Django logs proactively: `docker compose logs django --tail 100`
3. Test backend APIs independently with `curl` or Django shell
4. Check SDK error handling: `if (response && 'error' in response && response.error)`
5. Verify axios `validateStatus` is throwing on 4xx errors

**Efficient log commands**:

```bash
docker compose logs django --tail 100
docker compose logs django --tail 200 | grep -E "(ERROR|WARNING)"
docker compose logs django --since 5m
docker compose logs -f django  # follow in real-time
```

## Important Notes

1. **Python Package Management**: This project uses `uv` (not pip/poetry)
   - Dependencies in `backend/pyproject.toml` under `[project.dependencies]`
   - Lock file: `backend/uv.lock`

2. **Email Templates**: Django templates in `backend/apps/templates/email/`
   - Used for transactional emails (password reset, OTP verification, etc.)
   - Sent via django-anymail (SendGrid) or Mailpit (local)
   - See EMAIL_SETUP.md for complete configuration

3. **Authentication**: API-only (no session-based auth, no django-allauth)
   - Backend: DRF TokenAuthentication + JWT
   - Frontend handles all auth UI (login, signup, OTP verification)

4. **Generated API Client**: Never manually edit `frontend/src/api/`
   - Regenerate after backend changes: `npm run generate:api`

5. **Shadcn-vue Components**: Copy-paste, not npm package
   - Add new: `docker compose run --rm frontend npx shadcn-vue@latest add <component>`
   - Components in `frontend/src/components/ui/` - customize freely

6. **Dark Mode**: VueUse `useDark()` composable with localStorage persistence

7. **Centralized Constants**: `frontend/src/constants/projects.ts`
   - Maps Django enums (StatusEnum, PriorityEnum) to UI
   - Single source of truth for status/priority labels and badge variants

## File Organization Triggers (MANDATORY)

- File approaching 500 lines → Split immediately
- Component has >3 responsibilities → Extract sub-components
- Module has 3+ related views → Create feature module
- Logic used by 3+ modules → Move to `shared/`

## That's It

You now know:

- ✅ What this project is
- ✅ Non-negotiable rules (TDD, types, organization)
- ✅ How to start the stack
- ✅ Critical gotchas (ATOMIC_REQUESTS, SDK errors)
- ✅ Where to find detailed docs

**Detailed docs**:

- **ARCHITECTURE.md** - Structure, patterns, components
- **DEV_WORKFLOW.md** - Commands, workflows, troubleshooting
- **EMAIL_SETUP.md** - Email configuration (Mailpit, SendGrid)
- **DEBUG_DOGMA.md** - Debugging patterns and lessons
- **GREEN_CICD.md** - Keeping CI/CD green: testing workflows, pre-push checklists, failure patterns

Now go build something! 🚀
