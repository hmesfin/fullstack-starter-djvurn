# DEBUG_DOGMA.md

> **When to use this:** When debugging feels unproductive or you're "chasing your tails"

This document contains hard-won debugging lessons and patterns for Django + Vue.js full-stack development.

## The Golden Rules

1. ✅ **Check Django settings FIRST** - `ATOMIC_REQUESTS`, middleware, caching config
2. ✅ **Fetch logs proactively** - Use `docker compose logs` instead of asking user
3. ✅ **Test backend APIs independently** - Use `curl` or Django shell before debugging full-stack
4. ✅ **Add comprehensive logging immediately** - Don't add it incrementally
5. ❌ **Don't chase symptoms** - Look for root cause patterns

## Django-Specific Gotchas

### ATOMIC_REQUESTS Transaction Rollback

**The Pattern:**
- Logs show: `"created: 1"` → Later: `"count: 0"`
- Data appears to exist, then vanishes
- Everything works in isolation but fails in integration

**Root Cause:** `DATABASES["default"]["ATOMIC_REQUESTS"] = True` wraps every request in a transaction. When `ValidationError` is raised, the **entire transaction rolls back**, including any model creation.

**Example:**
```python
# In a view or serializer
def validate(self, attrs):
    user = User.objects.get(email=email)

    # Create OTP
    otp = EmailVerificationOTP.create_for_user(user)  # Appears in logs ✓
    logger.info(f"OTP created: {otp.code}")  # This logs successfully

    # Raise validation error
    raise ValidationError({"email": "Email not verified"})  # ROLLBACK!

    # OTP creation was rolled back - doesn't exist in DB
```

**Solution 1: Use `@transaction.non_atomic_requests` decorator**
```python
from django.utils.decorators import method_decorator
from django.db import transaction

class EmailTokenObtainPairView(TokenObtainPairView):
    @method_decorator(transaction.non_atomic_requests)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        try:
            with transaction.atomic():
                # Main logic that might raise ValidationError
                return super().post(request, *args, **kwargs)
        except ValidationError as e:
            # Transaction rolled back - now create data outside it
            if 'email_verification_required' in e.detail:
                with transaction.atomic():
                    otp = EmailVerificationOTP.create_for_user(user)
            raise  # Re-raise to return proper error response
```

**Solution 2: Handle in serializer's `save()` method**
```python
def save(self):
    """Save is called after validation, outside the atomic block."""
    otp = EmailVerificationOTP.create_for_user(self.user)
```

**Debugging Commands:**
```bash
# Check if ATOMIC_REQUESTS is enabled
grep -r "ATOMIC_REQUESTS" backend/config/settings/

# Watch Django logs for transaction issues
docker compose logs -f django | grep -E "(created|Total|count)"
```

## Debugging Backend Issues

### When to Proactively Fetch Django Logs

✅ **Always fetch logs for:**
- Database operations (create, update, delete)
- Authentication/permission errors
- Celery task execution
- Email sending
- Any "data exists then disappears" symptom

### Efficient Log Commands

```bash
# Get recent logs with context
docker compose logs django --tail 100

# Filter for specific patterns
docker compose logs django --tail 200 | grep -E "(ERROR|WARNING|OTP|created)"

# Get logs from last 5 minutes
docker compose logs django --since 5m

# Follow logs in real-time
docker compose logs -f django

# Combine filters for debugging specific issues
docker compose logs django --tail 100 | grep -B 5 -A 5 "ValidationError"

# Search for specific user/email
docker compose logs django --tail 200 | grep "user@example.com"
```

## Debugging Frontend Issues

### API Integration Problems

**Check in this order:**
1. **Browser console** - JavaScript errors, React/Vue warnings
2. **Network tab** - Actual request/response data
3. **Backend logs** - Server-side errors

### Generated SDK Error Handling

**Problem:** The `@hey-api/openapi-ts` generated SDK may **return errors instead of throwing them**.

**Solution:** Always check for error property:
```typescript
const response = await apiAuthTokenCreate({ client: apiClient, body: data })

// Check if SDK returned error as data
if (response && 'error' in response && response.error) {
  throw response  // Throw it to be caught properly
}

// Now safe to use response.data
return response.data
```

### Axios Configuration

**Ensure axios throws on 4xx errors:**
```typescript
// In api-client.ts
const config = createConfig<ClientOptions>({
  baseURL: API_BASE_URL,
  validateStatus: (status) => status >= 200 && status < 300,  // CRITICAL
})
```

## Debugging Patterns to Avoid

### ❌ Don't Chase Symptoms

**Bad:**
- "Field name mismatch?" → Try `otp_code` vs `code`
- "Frontend not parsing?" → Debug event emission
- "Cache issue?" → Clear all caches

**Good:**
- See "created: 1" then "count: 0"? → **Transaction rollback**
- Check `ATOMIC_REQUESTS` in settings FIRST

### ❌ Don't Add Logging Incrementally

**Bad:**
```python
# Round 1: Add basic logging
logger.info("Creating OTP")

# Round 2: Add more context
logger.info(f"Creating OTP for user: {user.email}")

# Round 3: Add count
logger.info(f"OTP count: {count}")
```

**Good:**
```python
# Add comprehensive logging immediately
logger.info(f"OTP Creation - User: {user.email}, exists: {user.is_email_verified}")
logger.info(f"Before: {EmailVerificationOTP.objects.filter(user=user).count()} OTPs")
otp = EmailVerificationOTP.create_for_user(user)
logger.info(f"Created OTP: code={otp.code}, id={otp.id}")
logger.info(f"After: {EmailVerificationOTP.objects.filter(user=user).count()} OTPs")
```

### ❌ Don't Assume Frontend is the Problem

Backend transaction issues can manifest as:
- "Frontend not showing data" → Actually: Data rolled back
- "API client broken" → Actually: Django returning error as 200 OK
- "Event not firing" → Actually: Event fires but data doesn't exist

## Testing Backend APIs Independently

### Using curl

```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","first_name":"Test","last_name":"User"}'

# Test login
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Test OTP verification
curl -X POST http://localhost:8000/api/auth/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

### Using Django Shell

```bash
docker compose run --rm django python manage.py shell
```

```python
from apps.users.models import User, EmailVerificationOTP

# Check user exists
user = User.objects.get(email="test@example.com")
print(f"User verified: {user.is_email_verified}")

# Check OTPs
otps = EmailVerificationOTP.objects.filter(user=user).order_by('-created')
for otp in otps:
    print(f"OTP: {otp.code}, used: {otp.is_used}, expires: {otp.expires_at}")

# Create OTP manually
otp = EmailVerificationOTP.create_for_user(user)
print(f"Created: {otp.code}")

# Verify it exists
print(f"Count: {EmailVerificationOTP.objects.filter(user=user).count()}")
```

## The "5-Minute Rule"

If debugging the same issue for **more than 15 minutes**:

1. **STOP** - You're chasing symptoms
2. **Check settings** - `ATOMIC_REQUESTS`, middleware, caching
3. **Fetch logs** - Don't ask, just run `docker compose logs`
4. **Test backend independently** - Isolate the issue
5. **Look for patterns** - "created then disappeared" = transaction rollback

## Common Gotcha Checklist

When things aren't working, check:

- [ ] `DATABASES["default"]["ATOMIC_REQUESTS"]` - Transaction rollback?
- [ ] `CELERY_TASK_ALWAYS_EAGER` in test.py - Celery tasks running?
- [ ] `validateStatus` in api-client.ts - Axios throwing errors?
- [ ] Django logs showing errors - Run `docker compose logs django --tail 100`
- [ ] Frontend console errors - Check browser DevTools
- [ ] Network tab in browser - What's the actual API response?
- [ ] Backend tested independently - Does `curl` work?

## Real-World Example: OTP Not Persisting

**Symptom:** User registers, OTP email sent, but verification fails with "Invalid code"

**What we tried (symptoms):**
1. ❌ Frontend event emission debugging
2. ❌ Field name checking (`otp_code` vs `code`)
3. ❌ Axios error handling
4. ❌ Frontend SDK error parsing

**What we should have done (root cause):**
1. ✅ Run: `docker compose logs django | grep -E "(created|count)"`
2. ✅ See: `"OTP count: 1"` → `"OTP count: 0"`
3. ✅ Check: `grep ATOMIC_REQUESTS backend/config/settings/`
4. ✅ Fix: Add `@transaction.non_atomic_requests` decorator

**Time wasted:** 60 minutes
**Time if we followed dogma:** 5 minutes

---

**Remember:** When you say "we're chasing our tails," look at this file FIRST.
