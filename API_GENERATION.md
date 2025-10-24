# API Type Generation Guide

## Quick Reference

### Generate TypeScript Types from Django OpenAPI Schema

**Step 1: Generate OpenAPI Schema**
```bash
# Using Django's spectacular command (recommended)
docker compose run --rm django python manage.py spectacular --color --file /app/frontend/openapi-schema.json
```

**Step 2: Generate TypeScript Types**
```bash
# Generate TypeScript SDK and types
docker compose run --rm frontend npm run generate:types
```

**One-Step Process (when curl is available)**
```bash
# This won't work in the current setup (no curl in containers)
# docker compose run --rm frontend npm run generate:api
```

## Generated Files

After generation, you'll find these files in `frontend/src/api/`:

- `types.gen.ts` - TypeScript interfaces for all request/response types
- `sdk.gen.ts` - Fully-typed API functions (one per endpoint)
- `client.gen.ts` - Base HTTP client configuration
- `index.ts` - Public exports

## Available Authentication Functions

```typescript
import {
  apiAuthRegisterCreate,      // POST /api/auth/register/
  apiAuthVerifyOtpCreate,      // POST /api/auth/verify-otp/
  apiAuthTokenCreate2,         // POST /api/auth/token/
  apiAuthTokenRefreshCreate,   // POST /api/auth/token/refresh/
} from '@/api/sdk.gen';

import type {
  UserRegistration,
  OTPVerification,
  EmailTokenObtainPair,
  TokenRefresh,
} from '@/api/types.gen';
```

## Usage Example

```typescript
import { apiAuthRegisterCreate } from '@/api/sdk.gen';
import { client } from '@/api/client.gen';

// Register a new user
const response = await apiAuthRegisterCreate({
  client,
  body: {
    email: 'user@example.com',
    password: 'SecurePass123!',
    first_name: 'John',
    last_name: 'Doe',
  },
});

// Response is fully typed!
console.log(response.data?.email);
```

## When to Regenerate

Regenerate TypeScript types whenever you:
- ✅ Add/modify Django models
- ✅ Add/modify DRF serializers
- ✅ Add/modify API endpoints
- ✅ Change field types or validation rules

## Troubleshooting

### Issue: "curl: not found"
**Solution:** Use Django's spectacular command instead (see Step 1 above)

### Issue: "unknown plugin dependency 'axios'"
**Solution:** Already fixed - we use `@hey-api/client-axios` in package.json

### Issue: Operation ID collisions
**Solution:** Remove duplicate endpoint definitions in urls.py (e.g., old `/api/auth-token/`)

## Clean Up Old Endpoint

The old `/api/auth-token/` endpoint should be removed from `backend/config/urls.py`:

```python
# REMOVE this line:
path("api/auth-token/", obtain_auth_token, name="obtain_auth_token"),
```

We now use `/api/auth/token/` with email verification check instead.
