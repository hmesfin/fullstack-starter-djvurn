# Fullstack Reference Project - Implementation Plan

## Project Overview

Building a production-ready, fully-typed fullstack application with Django REST Framework backend and Vue.js/React Native frontends, featuring automated API client generation and end-to-end type safety.

## Current Status ✅ Completed

### 1. Backend Setup (Django + DRF)

- ✅ Initialized project using Cookiecutter-Django
- ✅ Created `projects` app with proper model structure (UUID for public URLs, auto-increment PK)
- ✅ Implemented Django models with Status and Priority enums
- ✅ Created DRF serializers with ViewSets
- ✅ Configured drf-spectacular for OpenAPI schema generation
- ✅ Docker setup with PostgreSQL and Redis

### 2. API Client Generation Pipeline

- ✅ Installed @hey-api/openapi-ts for TypeScript client generation
- ✅ Successfully generated fully-typed SDK with:
  - Individual functions for each endpoint
  - Complete request/response types
  - Proper enum types matching Django choices
  - Path and query parameter types

### 3. Frontend Foundation (Vue.js)

- ✅ Created Vue 3 + TypeScript project with Vite
- ✅ Configured strict TypeScript settings
- ✅ Generated API types location: `frontend/src/api/`
  - `sdk.gen.ts` - Individual endpoint functions
  - `types.gen.ts` - All TypeScript interfaces
  - `client.gen.ts` - Base client configuration

## Next Steps 🚀 To Implement

### Phase 1: Complete Vue.js Integration

1. **Configure API Client with Authentication**
   - [ ] Set up axios interceptors for JWT tokens
   - [ ] Implement token refresh logic
   - [ ] Create `frontend/src/lib/api-client.ts`

2. **Install Required Dependencies**

```bash
   cd frontend
   npm install @tanstack/vue-query zod vee-validate @vee-validate/zod
   npm install pinia  # for state management
```

3. **Create Core Composables**
   - [ ] `useProjects.ts` - CRUD operations for projects
   - [ ] `useAuth.ts` - Authentication flow
   - [ ] `useUser.ts` - User profile management

4. **Build Components**
   - [ ] ProjectList.vue - Display projects with filtering
   - [ ] ProjectForm.vue - Create/Edit with Zod validation
   - [ ] LoginForm.vue - JWT authentication

### Phase 2: Django JWT Authentication

1. **Configure Django Simple JWT**

```python
   # requirements/base.txt
   djangorestframework-simplejwt==5.3.1
```

2. **Add JWT Views**
   - [ ] Token obtain pair endpoint
   - [ ] Token refresh endpoint
   - [ ] Token verify endpoint

3. **Update CORS Settings**
   - [ ] Configure django-cors-headers for frontend URL

### Phase 3: Testing Infrastructure

1. **Backend Testing**
   - [ ] Add factories using factory_boy
   - [ ] Create pytest fixtures in conftest.py
   - [ ] Write API tests with JWT authentication

2. **Frontend Testing**
   - [ ] Configure Vitest for unit tests
   - [ ] Set up @testing-library/vue
   - [ ] Add MSW for API mocking
   - [ ] Create Playwright tests for E2E

### Phase 4: Pre-commit Hooks & CI/CD

1. **Pre-commit Configuration**

```yaml
   # .pre-commit-config.yaml in project root
   - Python: ruff, mypy
   - TypeScript: eslint, prettier
   - Tests: pytest, vitest
```

2. **GitHub Actions Workflow**
   - [ ] Run tests on PR
   - [ ] Type checking
   - [ ] Build verification

### Phase 5: React Native Setup

1. **Initialize React Native Project**
   - [ ] Create `mobile/` directory
   - [ ] Configure TypeScript strictly
   - [ ] Set up React Navigation v6

2. **Share Types with Mobile**
   - [ ] Create shared types package
   - [ ] Configure module resolution

3. **Mobile-Specific Libraries**
   - [ ] Zustand for state management
   - [ ] React Hook Form + Zod
   - [ ] TanStack Query for data fetching

### Phase 6: Microservices Preparation

1. **Create Reusable Django Package**
   - [ ] Extract common authentication logic
   - [ ] Create base models and mixins
   - [ ] Package notification system

2. **Structure Apps as Proto-Services**
   - [ ] Each app with own API layer
   - [ ] Separate service layer
   - [ ] Independent test suites

## File Structure

```
fullstack-reference/
├── apps/           # Django backend
│   ├── config/
│   ├── projects/          # Main app
│   │   ├── models.py
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   ├── requirements/
│   └── docker-compose.local.yml
├── frontend/              # Vue.js app
│   ├── src/
│   │   ├── api/          # Generated types
│   │   ├── composables/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
└── mobile/               # React Native (future)
```

## Development Workflow

1. **Backend Changes**
   - Modify Django models/serializers
   - Run migrations
   - Schema automatically updates

2. **Regenerate Types**

```bash
   cd frontend
   npm run generate:api
```

3. **Frontend Updates**
   - TypeScript shows breaking changes
   - Update affected components
   - Tests verify functionality

## Key Decisions Made

- **Monorepo structure** for convenience during development
- **UUID for public URLs**, auto-increment for primary keys
- **SDK pattern** for API client (not services pattern)
- **Strict TypeScript** configuration throughout
- **Cookiecutter-Django** as foundation
- **@hey-api/openapi-ts** for code generation

## Success Metrics

- [ ] Zero runtime type errors
- [ ] API changes caught at compile time
- [ ] 80%+ test coverage
- [ ] Sub-3 second build times
- [ ] Consistent code style enforced
