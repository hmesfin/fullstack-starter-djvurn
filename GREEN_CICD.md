# GREEN_CICD.md

**Keeping Your CI/CD Pipeline Green** - A survival guide for maintaining test quality.

## Philosophy

**Green CI/CD is not a destination, it's a discipline.**

- Red builds compound: one broken test makes it easier to ignore the next
- Green builds compound: confidence to refactor, deploy, iterate faster
- **The 5-minute rule**: If CI fails, fix it within 5 minutes or revert

## The Golden Rule

**Run tests locally BEFORE pushing. Always.**

CI is not your test runner. CI is your safety net.

## Quick Pre-Push Checklist

```bash
# Backend changes?
docker compose run --rm django pytest
docker compose run --rm django mypy apps

# Frontend changes?
docker compose run --rm frontend npm run type-check
docker compose run --rm frontend npm run test:run

# Mobile changes?
cd mobile && npm run type-check && npm run test:run

# All green? Push with confidence.
git push
```

## CI Pipeline Overview

Your CI runs **6 jobs** on every push to `main` or PR:

| Job | What It Does | Time | When It Fails |
|-----|-------------|------|---------------|
| **linter** | Pre-commit hooks (Ruff, Prettier, etc.) | ~1m | Code style violations |
| **pytest** | 227 Django tests + migrations check | ~2m | Backend logic errors, migration conflicts |
| **frontend-typecheck** | TypeScript strict mode validation | ~52s | Type errors in Vue code |
| **frontend-tests** | 350 Vue component/integration tests | ~52s | Frontend logic errors, broken components |
| **mobile-typecheck** | TypeScript strict mode for React Native | ~30s | Type errors in mobile code |
| **mobile-tests** | 364 mobile tests (379 total, 15 skipped) | ~32s | Mobile logic errors, broken screens |

**Total CI time**: ~3-4 minutes (jobs run in parallel)

## Local Testing Workflows

### Backend Development

**TDD workflow**:
```bash
# 1. Write failing test
docker compose run --rm django pytest apps/myapp/tests.py::test_my_feature -v

# 2. Implement feature
# ... edit code ...

# 3. Verify test passes
docker compose run --rm django pytest apps/myapp/tests.py::test_my_feature -v

# 4. Run full test suite
docker compose run --rm django pytest

# 5. Type check
docker compose run --rm django mypy apps

# 6. Push (CI will verify)
git push
```

**Quick commands**:
```bash
# Single test file
docker compose run --rm django pytest apps/users/tests.py -v

# Single test class
docker compose run --rm django pytest apps/users/tests.py::TestUserModel -v

# Single test method
docker compose run --rm django pytest apps/users/tests.py::TestUserModel::test_create_user -v

# With coverage report
docker compose run --rm django pytest --cov=apps --cov-report=html

# Failed tests only (after a failure)
docker compose run --rm django pytest --lf
```

### Frontend Development

**TDD workflow**:
```bash
# 1. Write failing test
docker compose run --rm frontend npm test -- ProjectList

# 2. Implement feature
# ... edit code ...

# 3. Watch mode (instant feedback)
docker compose run --rm frontend npm test

# 4. Type check
docker compose run --rm frontend npm run type-check

# 5. Run all tests
docker compose run --rm frontend npm run test:run

# 6. Push
git push
```

**Quick commands**:
```bash
# Watch mode (best for TDD)
docker compose run --rm frontend npm test

# Run all tests (CI mode)
docker compose run --rm frontend npm run test:run

# Single test file
docker compose run --rm frontend npm test -- ProjectList

# Coverage report
docker compose run --rm frontend npm run test:coverage

# Type check only
docker compose run --rm frontend npm run type-check
```

### Mobile Development

**TDD workflow** (mobile runs on host, not Docker):
```bash
cd mobile

# 1. Write failing test
npm test -- ForgotPasswordScreen

# 2. Implement feature
# ... edit code ...

# 3. Watch mode
npm test

# 4. Type check
npm run type-check

# 5. Run all tests
npm run test:run

# 6. Push
git push
```

**Quick commands**:
```bash
# Watch mode
npm test

# Run all tests
npm run test:run

# Single test file
npm test -- LoginScreen

# Coverage report
npm run test:coverage

# Type check
npm run type-check
```

## Common Failure Patterns

### 1. "Works on My Machine" Syndrome

**Symptom**: Tests pass locally, fail in CI

**Common causes**:
- Environment variables different (check `.envs/.testing/`)
- Database state assumptions (tests must be isolated)
- Timezone issues (use UTC in tests)
- Race conditions (async timing)

**Fix**:
```bash
# Use CI environment locally
docker compose down -v
cp .envs/.testing/.django .envs/.local/.django
cp .envs/.testing/.postgres .envs/.local/.postgres
docker compose up -d postgres
docker compose run --rm django python manage.py migrate
docker compose run --rm django pytest
```

### 2. Forgotten Migration

**Symptom**: `django.db.utils.ProgrammingError: column does not exist`

**Cause**: Model changed, migration not created/committed

**Fix**:
```bash
docker compose run --rm django python manage.py makemigrations
git add backend/apps/*/migrations/
git commit -m "migrations: add missing migration for <change>"
```

**Prevention**: CI checks this with `python manage.py makemigrations --check`

### 3. Type Errors After API Changes

**Symptom**: Frontend/mobile TypeScript errors after backend changes

**Cause**: Forgot to regenerate API client

**Fix**:
```bash
# Backend changes? Always regenerate client
docker compose run --rm frontend npm run generate:api

# Then type check
docker compose run --rm frontend npm run type-check
cd mobile && npm run type-check
```

**Prevention**: Make this part of your backend workflow

### 4. Test Isolation Failures

**Symptom**: Tests pass individually, fail when run together

**Cause**: Shared state, database pollution, mock leaks

**Fix (Backend)**:
```python
import pytest

@pytest.mark.django_db
class TestMyFeature:
    def test_something(self):
        # Each test gets fresh database
        pass
```

**Fix (Frontend/Mobile)**:
```typescript
beforeEach(() => {
  vi.clearAllMocks()  // Clear all mocks between tests
})
```

### 5. Skipped Tests Pile Up

**Symptom**: More and more tests marked `.skip` or `@pytest.mark.skip`

**Danger**: You're hiding problems, not fixing them

**Fix**:
- **Never skip without a TODO comment** explaining why
- **Track skipped tests** - create issues to fix them
- **Review skipped tests monthly** - fix or remove

**Current skipped tests** (documented and acceptable):
- 4 mobile form submission tests (test infrastructure limitation, components work in app)
- 11 other mobile tests (various infrastructure limitations)

### 6. Flaky Tests

**Symptom**: Tests pass/fail randomly

**Common causes**:
- Race conditions (async timing)
- External dependencies (API calls, network)
- Date/time dependencies (hardcoded dates)
- Random data without seeds

**Fix patterns**:
```typescript
// Bad: Race condition
fireEvent.click(button)
expect(mockFn).toHaveBeenCalled()

// Good: Wait for assertion
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled()
})

// Bad: Real API call
const data = await fetch('https://api.example.com/data')

// Good: Mocked
vi.mock('@/lib/api-client')

// Bad: Hardcoded date
expect(user.created).toBe('2024-01-01')

// Good: Relative assertion
expect(user.created).toBeInstanceOf(Date)
expect(user.created.getTime()).toBeLessThanOrEqual(Date.now())
```

## Pre-Commit Hooks

**What they catch**:
- Code formatting (Prettier, Black, Ruff)
- Import sorting
- Trailing whitespace
- Large files accidentally committed
- Merge conflict markers

**When they fail**:
```bash
# Auto-fix issues
git add .
git commit  # Hooks auto-fix and re-stage

# If hook fails due to Python version mismatch
git commit --no-verify  # ONLY for non-Python changes
```

**Note**: Your hooks currently need Python 3.13. Until installed, use `--no-verify` for mobile/frontend-only changes.

## Best Practices by Scenario

### Adding a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. TDD: Write test first
# ... write test ...

# 3. Verify test fails (RED)
docker compose run --rm django pytest apps/myapp/tests.py::test_new_feature

# 4. Implement feature (GREEN)
# ... write code ...
docker compose run --rm django pytest apps/myapp/tests.py::test_new_feature

# 5. Run full test suite
docker compose run --rm django pytest
docker compose run --rm django mypy apps

# 6. If backend API changed, regenerate client
docker compose run --rm frontend npm run generate:api
docker compose run --rm frontend npm run type-check

# 7. All green? Push
git push
```

### Refactoring Existing Code

```bash
# 1. Ensure all tests pass BEFORE refactoring
docker compose run --rm django pytest
docker compose run --rm frontend npm run test:run

# 2. Refactor
# ... refactor code ...

# 3. Tests should STILL pass (no behavior change)
docker compose run --rm django pytest
docker compose run --rm frontend npm run test:run

# 4. Type check
docker compose run --rm django mypy apps
docker compose run --rm frontend npm run type-check

# 5. If green, you successfully refactored
git push
```

### Fixing a Bug

```bash
# 1. Write test that reproduces bug (should fail)
# ... write test that demonstrates the bug ...
docker compose run --rm django pytest apps/myapp/tests.py::test_bug_reproduction

# 2. Fix bug
# ... fix code ...

# 3. Test should now pass
docker compose run --rm django pytest apps/myapp/tests.py::test_bug_reproduction

# 4. Run full suite (ensure no regressions)
docker compose run --rm django pytest

# 5. Push
git push
```

### Updating Dependencies

```bash
# Backend
# 1. Edit backend/pyproject.toml
# 2. Rebuild
docker compose build django
docker compose restart django

# 3. Run tests
docker compose run --rm django pytest
docker compose run --rm django mypy apps

# Frontend
# 1. Install dependency
docker compose run --rm frontend npm install <package>

# 2. Rebuild
docker compose build frontend
docker compose restart frontend

# 3. Run tests
docker compose run --rm frontend npm run test:run
docker compose run --rm frontend npm run type-check

# All green? Push
git push
```

## Monitoring CI Health

### Check Current CI Status

```bash
# Latest run
gh run list --limit 1

# Watch live
gh run watch

# View failed logs
gh run view --log-failed
```

### CI Is Red - What Now?

**Option 1: Fix Forward (preferred)**
```bash
# Pull latest
git pull

# Reproduce failure locally
docker compose run --rm django pytest  # or frontend, mobile

# Fix the issue
# ... fix code ...

# Verify fix
docker compose run --rm django pytest

# Push fix
git add .
git commit -m "fix: resolve CI failure in <test>"
git push
```

**Option 2: Revert (if fix is complex)**
```bash
# Revert the breaking commit
git revert HEAD
git push

# Fix in a new PR with proper testing
git checkout -b fix/proper-fix
# ... fix with tests ...
```

## Coverage Goals

**Minimum coverage** (enforced in reviews, not CI):
- Backend: 85% overall, 90% for data models, 95% for security
- Frontend: 85% overall
- Mobile: 85% overall

**Check coverage**:
```bash
# Backend
docker compose run --rm django pytest --cov=apps --cov-report=html
open backend/htmlcov/index.html

# Frontend
docker compose run --rm frontend npm run test:coverage
open frontend/coverage/index.html

# Mobile
cd mobile && npm run test:coverage
open coverage/index.html
```

## Emergency Procedures

### "CI is broken and blocking everyone"

1. **Notify team** (if applicable)
2. **Identify breaking commit**: `gh run list --limit 10`
3. **Quick revert**: `git revert <commit> && git push`
4. **Fix properly** in separate PR with tests
5. **Post-mortem**: Why did this pass locally but fail in CI?

### "Tests are flaky"

1. **Document the flake**: Create issue with failure logs
2. **Run test 10 times locally**: `for i in {1..10}; do docker compose run --rm django pytest <test> || break; done`
3. **Identify pattern**: Timing? External dependency? Race condition?
4. **Fix root cause**: Usually async timing or test isolation
5. **Verify fix**: Run 10 more times

### "CI is too slow"

Current CI time: ~3-4 minutes (acceptable)

**If it gets slower**:
1. Check Docker layer caching (GitHub Actions cache)
2. Identify slowest tests: `docker compose run --rm django pytest --durations=10`
3. Optimize slow tests (mock external calls, reduce setup)
4. Consider parallelization (pytest-xdist)

## Quick Reference Card

**Before every push**:
```bash
# Backend changes
docker compose run --rm django pytest && \
docker compose run --rm django mypy apps

# Frontend changes
docker compose run --rm frontend npm run test:run && \
docker compose run --rm frontend npm run type-check

# Mobile changes
cd mobile && npm run test:run && npm run type-check

# All green? Push safely.
```

**When CI fails**:
```bash
# 1. Check what failed
gh run view --log-failed

# 2. Reproduce locally
docker compose run --rm <service> <test-command>

# 3. Fix and verify
# ... fix code ...
docker compose run --rm <service> <test-command>

# 4. Push fix
git push
```

**Common fixes**:
```bash
# Forgot migration
docker compose run --rm django python manage.py makemigrations

# Forgot to regenerate API client
docker compose run --rm frontend npm run generate:api

# Database state issue
docker compose down -v && docker compose up -d

# Type errors
docker compose run --rm frontend npm run type-check
```

## Success Metrics

**You're winning when**:
- ✅ CI passes on first push >90% of the time
- ✅ Average time from failure to fix: <5 minutes
- ✅ No skipped tests without documented TODO
- ✅ Coverage trends upward over time
- ✅ Team trusts CI enough to deploy on green

**You're losing when**:
- ❌ "CI is always red anyway"
- ❌ Skipped tests pile up
- ❌ "Works on my machine" becomes common
- ❌ Deploying without green CI
- ❌ Test suite takes >10 minutes

## Further Reading

- **CLAUDE.md** - Project overview and quick start
- **DEV_WORKFLOW.md** - Detailed development workflows
- **DEBUG_DOGMA.md** - Debugging patterns and lessons
- **ARCHITECTURE.md** - System architecture and patterns

---

**Remember**: Green CI is a team sport. Keep it green, keep it fast, keep it trusted.
