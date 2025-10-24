# Context for Claude Code - Fullstack Reference Project

## Quick Start

You're continuing development on a fullstack Django + Vue.js project with automated TypeScript client generation from OpenAPI schemas. The foundation is built; now we need to complete the integration and add testing/tooling.

## Current Working Directory

```bash
cd ~/fullstack-starter
```

## What's Already Built

1. **Django Backend**: Cookiecutter-Django project with `projects` app, DRF views, and OpenAPI schema generation via drf-spectacular
2. **Frontend Setup**: Vue 3 + TypeScript with strict config
3. **API Generation**: Working pipeline that generates TypeScript SDK from Django OpenAPI schema

## Generated API Structure

The frontend has auto-generated types in `frontend/src/api/`:

- `sdk.gen.ts` - Contains functions like `projectsList()`, `projectsCreate()`, etc.
- `types.gen.ts` - All TypeScript interfaces (Project, ProjectCreateRequest, etc.)
- `client.gen.ts` - Base client for configuration

## Key Code Patterns to Follow

### API Client Usage Pattern

```typescript
import { projectsList } from '@/api/sdk.gen';
import { apiClient } from '@/lib/api-client';

// Always pass the configured client
const response = await projectsList({
  client: apiClient,
  query: { status: 'active' }
});
```

### Django Model Pattern (User Preference)

```python
class MyModel(models.Model):
    # Auto-increment PK (default), UUID for public exposure
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    # ... other fields
```

### TypeScript Strict Config

The user wants VERY strict TypeScript. The tsconfig.json has all strict flags enabled including `noUncheckedIndexedAccess`.

## User Preferences

1. **Testing**: TDD approach with pytest (Django) and Vitest (Vue)
2. **Type Safety**: Full typing, no `any` types allowed
3. **Django Stack**: DRF, Celery, Redis, PostgreSQL, SendGrid via Anymail
4. **Deployment**: Hetzner (PaaS)
5. **Development**: Docker-based with docker-compose.local.yml

## Immediate Tasks

### Task 1: Complete API Client Setup

Create `frontend/src/lib/api-client.ts` with:

- JWT token management
- Interceptors for auth headers
- Token refresh logic
- Proper typing from generated types

### Task 2: Install Frontend Dependencies

```bash
cd frontend
npm install @tanstack/vue-query zod vee-validate @vee-validate/zod pinia
```

### Task 3: Create useProjects Composable

Implement `frontend/src/composables/useProjects.ts` following the patterns shown in the conversation. Note that the SDK uses individual function exports, not a service class.

### Task 4: Set Up Django JWT

1. Add djangorestframework-simplejwt to requirements/base.txt
2. Configure JWT endpoints in urls.py
3. Update settings for JWT authentication

### Task 5: Create First Vue Component

Build `ProjectList.vue` with:

- Full TypeScript typing
- Using the useProjects composable
- Zod validation for forms
- Proper error handling

## Testing Commands

```bash
# Backend tests
docker-compose -f docker-compose.local.yml run --rm django pytest

# Frontend dev
cd frontend && npm run dev

# Generate API types (after backend changes)
cd frontend && npm run generate:api

# Type checking
cd frontend && npm run type-check
```

## API Generation Workflow

1. Make Django model/serializer changes
2. Restart Django to update schema
3. Run: `cd frontend && npm run generate:api`
4. Fix TypeScript errors that appear
5. Components now have updated types

## Common Issues & Solutions

### Issue: API generation fails

- Ensure Django is running: `docker-compose -f docker-compose.local.yml up`
- Check schema endpoint: `curl http://localhost:8000/api/schema/`

### Issue: TypeScript errors with generated types

- The generated types use specific patterns:
  - Request types: `ProjectCreateRequest`, `PatchedProjectRequest`
  - Response types are in the `.data` property of responses
  - Enums: `StatusEnum`, `PriorityEnum`

### Issue: CORS errors

- Need to configure django-cors-headers
- Add frontend URL to CORS_ALLOWED_ORIGINS

## Next Major Milestone

Get a fully working CRUD flow for Projects with:

1. ✅ Type-safe API calls
2. ✅ JWT authentication
3. ✅ Form validation with Zod
4. ✅ Optimistic updates via TanStack Query
5. ✅ Proper error handling

## Code Style Rules

- NO console.log in production code
- All functions must have explicit return types
- Use computed() for derived state in Vue
- Follow Vue 3 Composition API patterns
- Use factory functions for tests
- Docstrings for all Django viewsets/serializers

## Questions Resolved

- Using SDK pattern (not services) for generated code ✅
- Using individual function exports from sdk.gen.ts ✅
- Projects app (not tasks) to avoid Celery naming conflict ✅
- Monorepo structure for now, may split later ✅

## Contact with User

The user (Hamel) is looking for:

1. Sustainable, maintainable, scalable setup
2. Battle-tested methods for faster shipping
3. Growing towards fullstack without overwhelm
4. Eventually wants microservices for common capabilities

Remember: The user has Django expertise but is newer to Vue.js and React Native. Provide clear explanations for frontend patterns while being more concise with Django concepts they already know.
