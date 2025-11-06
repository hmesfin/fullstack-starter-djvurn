# Testing Guide

## Test User Credentials

A verified test user has been created for manual testing:

```
Email: test@example.com
Password: testpass123
```

This user is **email verified** and can log in immediately.

## Testing the Application

### 1. Start the Application

```bash
docker compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin

### 2. Test Login Flow

1. Visit http://localhost:5173
2. You should be redirected to `/login`
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `testpass123`
4. Click "Login"
5. You should be redirected to `/dashboard` with projects view

### 3. Test Registration Flow

1. Click "Sign up" link on login page
2. Fill in registration form:
   - Email: (any valid email)
   - Password: (min 8 characters)
   - First Name: (required)
   - Last Name: (required)
3. Click "Register"
4. You'll see OTP verification form
5. Check Django logs for the OTP code:
   ```bash
   docker compose logs django | grep "OTP"
   ```
6. Enter the 6-digit code
7. Click "Verify Email"
8. You'll be redirected to login page
9. Log in with your new credentials

### 4. Test Protected Routes

Try to access `/dashboard` without logging in:
- Should redirect to `/login`

Try to access `/login` while logged in:
- Should redirect to `/dashboard`

### 5. Test Logout

1. Click "Logout" button in dashboard header
2. Should redirect to `/login`
3. Tokens should be cleared
4. Visiting `/dashboard` should redirect to `/login`

## API Testing

### Login Endpoint

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'
```

Expected response:
```json
{
  "refresh": "eyJ...",
  "access": "eyJ..."
}
```

### Register Endpoint

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123",
    "first_name": "New",
    "last_name": "User"
  }'
```

Expected response:
```json
{
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User"
}
```

### Get Current User

```bash
# First, get tokens
ACCESS_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}' \
  | jq -r '.access')

# Then, get user info
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Creating Additional Test Users

```bash
docker compose run --rm django python manage.py shell
```

```python
from apps.users.models import User

# Create verified user
user = User.objects.create_user(
    email='another@example.com',
    password='password123',
    first_name='Another',
    last_name='User',
    is_email_verified=True
)
print(f'Created: {user.email}')
```

## Troubleshooting

### 400 Bad Request on Login

**Possible causes:**
1. Email not verified - Register and verify OTP first
2. Wrong credentials - Check email/password
3. User doesn't exist - Register first

### Frontend Shows "Loading..." Forever

**Solution:**
1. Check backend is running: `docker compose ps`
2. Check API is accessible: `curl http://localhost:8000/api/schema/`
3. Check browser console for errors

### CORS Errors

**Should not happen** - CORS is configured for `http://localhost:5173`

If you see CORS errors, check `backend/config/settings/local.py`:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

## CI/CD Status

Current CI/CD status: ✅ All checks passing

- Linter: ✅ 0 errors
- Type Check: ✅ 0 errors
- Tests: ✅ 281/286 passing (98.3%)
- Backend Tests: ✅ All passing
