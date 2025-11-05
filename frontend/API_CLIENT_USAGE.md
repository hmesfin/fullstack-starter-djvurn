# API Client Usage Guide

## Overview

The API client is fully configured with:
- ✅ JWT authentication with automatic token injection
- ✅ Automatic token refresh on 401 errors
- ✅ Request queuing during token refresh
- ✅ Type-safe API calls with auto-generated TypeScript types
- ✅ Token storage utilities

## Basic Usage

### Import the API Client

```typescript
import { apiClient } from '@/lib/api-client'
import {
  apiAuthTokenCreate,
  apiUsersMeRetrieve,
  projectsList,
  projectsCreate,
} from '@/api/sdk.gen'
```

### Authentication Flow

#### 1. User Registration

```typescript
import { apiAuthRegisterCreate } from '@/api/sdk.gen'
import { apiClient } from '@/lib/api-client'

// Register a new user
const { data } = await apiAuthRegisterCreate({
  client: apiClient,
  body: {
    email: 'user@example.com',
    password: 'SecurePassword123!',
    first_name: 'John',
    last_name: 'Doe',
  },
})

// Response: { email: 'user@example.com', first_name: 'John', last_name: 'Doe' }
// User receives OTP email at this point
```

#### 2. Verify OTP

```typescript
import { apiAuthVerifyOtpCreate } from '@/api/sdk.gen'

// Verify email with OTP code
const { data } = await apiAuthVerifyOtpCreate({
  client: apiClient,
  body: {
    email: 'user@example.com',
    code: '123456',
  },
})

// Response: { email: 'user@example.com', code: '123456' }
// Email is now verified
```

#### 3. Login (Obtain JWT Tokens)

```typescript
import { apiAuthTokenCreate } from '@/api/sdk.gen'
import { setTokens } from '@/lib/token-storage'

// Login to get JWT tokens
const { data } = await apiAuthTokenCreate({
  client: apiClient,
  body: {
    email: 'user@example.com',
    password: 'SecurePassword123!',
  },
})

// Store tokens in localStorage
if (data) {
  setTokens({
    access: data.access,
    refresh: data.refresh,
  })
}

// All subsequent API calls will automatically include the JWT token
```

#### 4. Get Current User

```typescript
import { apiUsersMeRetrieve } from '@/api/sdk.gen'

// Get current authenticated user (requires JWT token)
const { data } = await apiUsersMeRetrieve({
  client: apiClient,
})

// Response: { first_name: 'John', last_name: 'Doe', email: 'user@example.com', url: '...' }
```

#### 5. Logout

```typescript
import { clearTokens } from '@/lib/token-storage'

// Clear tokens from storage
clearTokens()

// Redirect to login page
window.location.href = '/login'
```

### Working with Projects

#### List Projects

```typescript
import { projectsList } from '@/api/sdk.gen'

// Get all projects
const { data } = await projectsList({
  client: apiClient,
})

// With filters
const { data } = await projectsList({
  client: apiClient,
  query: {
    status: 'active',
    search: 'important',
    ordering: '-created_at',
  },
})
```

#### Create Project

```typescript
import { projectsCreate } from '@/api/sdk.gen'

const { data } = await projectsCreate({
  client: apiClient,
  body: {
    name: 'My New Project',
    description: 'Project description',
    status: 'active',
    priority: 3, // High priority
    start_date: '2025-01-01',
    due_date: '2025-12-31',
  },
})
```

#### Update Project

```typescript
import { projectsPartialUpdate } from '@/api/sdk.gen'

const { data } = await projectsPartialUpdate({
  client: apiClient,
  path: {
    uuid: 'project-uuid-here',
  },
  body: {
    status: 'completed',
  },
})
```

#### Delete Project

```typescript
import { projectsDestroy } from '@/api/sdk.gen'

await projectsDestroy({
  client: apiClient,
  path: {
    uuid: 'project-uuid-here',
  },
})
```

## Token Storage Utilities

### Available Functions

```typescript
import {
  setTokens,
  getTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
  hasTokens,
} from '@/lib/token-storage'

// Store token pair
setTokens({ access: '...', refresh: '...' })

// Get token pair
const tokens = getTokens() // { access: string, refresh: string } | null

// Get individual tokens
const accessToken = getAccessToken() // string | null
const refreshToken = getRefreshToken() // string | null

// Update only access token (after refresh)
setAccessToken('new-access-token')

// Clear all tokens (logout)
clearTokens()

// Check if tokens exist
const isAuthenticated = hasTokens() // boolean
```

## Automatic Token Refresh

The API client **automatically handles token refresh**:

1. When a request receives a 401 Unauthorized response
2. The client automatically calls `/api/auth/token/refresh/` with the refresh token
3. Updates the access token in localStorage
4. Retries the original failed request with the new token
5. All other pending requests are queued and processed after refresh

**You don't need to manually handle token refresh!**

```typescript
// This will automatically refresh the token if needed
const { data } = await apiUsersMeRetrieve({
  client: apiClient,
})
```

### Multiple Concurrent Requests

If multiple requests fail with 401 at the same time:
- Only ONE token refresh request is made
- Other requests are queued
- All queued requests are retried with the new token

This prevents the "token refresh race condition" problem.

## Error Handling

### Handle API Errors

```typescript
import { apiAuthTokenCreate } from '@/api/sdk.gen'
import type { AxiosError } from 'axios'

try {
  const { data } = await apiAuthTokenCreate({
    client: apiClient,
    body: {
      email: 'user@example.com',
      password: 'wrong-password',
    },
  })
} catch (error) {
  const axiosError = error as AxiosError<{ detail?: string }>

  if (axiosError.response?.status === 401) {
    console.error('Invalid credentials:', axiosError.response.data.detail)
  } else {
    console.error('Login failed:', axiosError.message)
  }
}
```

### Token Refresh Failure

When token refresh fails:
1. All tokens are cleared from localStorage
2. User is redirected to `/login`
3. All pending requests are rejected

## Environment Variables

Create a `.env` file in the frontend directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000
```

For production:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Type Safety

All API calls are fully typed:

```typescript
import { projectsCreate } from '@/api/sdk.gen'
import type { ProjectCreateRequest, Project } from '@/api/types.gen'

// Request body is type-checked
const request: ProjectCreateRequest = {
  name: 'Project Name',
  description: 'Description',
  status: 'active', // ✅ Type-checked enum
  priority: 3, // ✅ Type-checked: 1 | 2 | 3 | 4
}

const { data } = await projectsCreate({
  client: apiClient,
  body: request,
})

// Response is fully typed
if (data) {
  const project: Project = data
  console.log(project.uuid) // ✅ TypeScript knows all properties
  console.log(project.is_overdue) // ✅ Computed field from backend
}
```

## Testing

The token storage utilities are fully tested (16 tests):

```bash
# Run tests via Docker
docker compose run --rm frontend npm run test:run

# Run tests in watch mode
docker compose run --rm frontend npm test
```

## Regenerating API Types

After changing Django models/serializers/endpoints:

```bash
# Step 1: Generate OpenAPI schema
docker compose run --rm django python manage.py spectacular --color --file /app/frontend/openapi-schema.json

# Step 2: Generate TypeScript types
docker compose run --rm frontend npm run generate:types
```

## Security Notes

- Tokens are stored in `localStorage` (consider `sessionStorage` for more security)
- Access tokens are sent via `Authorization: Bearer <token>` header
- Refresh tokens are only sent to `/api/auth/token/refresh/` endpoint
- HTTPS should be used in production to prevent token interception
- Consider implementing token rotation for additional security
