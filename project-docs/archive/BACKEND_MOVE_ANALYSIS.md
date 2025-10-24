# Analysis: Moving apps/ to backend/

## Overview

This document analyzes what's required to move the `apps/` directory into a `backend/` directory at the project root.

**Current Structure:**

```
/
├── apps/           # Django apps
├── config/         # Django settings/urls
├── frontend/       # Vue.js frontend
├── manage.py
└── ...
```

**Proposed Structure:**

```
/
├── backend/
│   ├── apps/       # Django apps
│   ├── config/     # Django settings/urls
│   └── manage.py
├── frontend/       # Vue.js frontend
└── ...
```

## Files That Need Changes

### 1. Python Path Configuration (Critical)

These files add `apps/` to Python's sys.path and need updating:

#### `manage.py` (Line 24)

```python
# Current:
sys.path.append(str(current_path / "apps"))

# Change to:
sys.path.append(str(current_path / "backend" / "apps"))
```

#### `config/wsgi.py` (Line 26)

```python
# Current:
sys.path.append(str(BASE_DIR / "apps"))

# Change to:
sys.path.append(str(BASE_DIR / "backend" / "apps"))
```

#### `config/asgi.py` (Line 20)

```python
# Current:
sys.path.append(str(BASE_DIR / "apps"))

# Change to:
sys.path.append(str(BASE_DIR / "backend" / "apps"))
```

### 2. Settings Configuration

#### `config/settings/base.py`

**APPS_DIR definition (Line 11):**

```python
# Current:
APPS_DIR = BASE_DIR / "apps"

# Change to:
APPS_DIR = BASE_DIR / "backend" / "apps"
```

**LOCALE_PATHS (Line 44):**

```python
# Current:
LOCALE_PATHS = [str(BASE_DIR / "locale")]

# Change to:
LOCALE_PATHS = [str(BASE_DIR / "backend" / "locale")]
```

**FIXTURE_DIRS (Line 210):**

```python
# Current:
FIXTURE_DIRS = (str(APPS_DIR / "fixtures"),)

# No change needed (uses APPS_DIR variable)
```

**TEMPLATES DIRS (Line 166):**

```python
# Current:
"DIRS": [str(APPS_DIR / "templates")],

# No change needed (uses APPS_DIR variable)
```

**MIGRATION_MODULES (Line 99):**

```python
# Current:
MIGRATION_MODULES = {"sites": "apps.contrib.sites.migrations"}

# No change needed (import path remains the same due to sys.path)
```

### 3. Coverage Configuration

#### `pyproject.toml` (Lines 11-13)

```toml
# Current:
[tool.coverage.run]
include = ["apps/**"]
omit = ["*/migrations/*", "*/tests/*"]

# Change to:
[tool.coverage.run]
include = ["backend/apps/**"]
omit = ["*/migrations/*", "*/tests/*"]
```

### 4. Docker Configuration

#### `docker-compose.yml` (Line 19)

```yaml
# Current:
volumes:
  - /app/.venv
  - .:/app:z

# No change needed - entire project root mounted
```

#### `compose/local/django/Dockerfile`

```dockerfile
# No changes needed - WORKDIR is /app which is the project root
# All Python imports work via sys.path modifications
```

### 5. Documentation

#### `CLAUDE.md`

- Update all references to `apps/` directory structure
- Update architecture diagrams
- Update file paths in examples

### 6. Git Ignore

#### `.gitignore` (Line 287)

```
# Current:
apps/media/

# Change to:
backend/apps/media/
```

### 7. Files That DON'T Need Changes

**Import statements remain unchanged** because `sys.path` includes `backend/apps/`:

- `from apps.users.models import User` ✅ Still works
- `from apps.projects.api import views` ✅ Still works
- All Django app references like `"apps.users"` in `INSTALLED_APPS` ✅ Still work

**Docker mounts remain unchanged:**

- `.:/app:z` mounts entire project root, so `backend/` is accessible

## Directory Structure to Move

Move these to `backend/`:

```
apps/                    → backend/apps/
config/                  → backend/config/
locale/                  → backend/locale/
manage.py                → backend/manage.py
pyproject.toml           → backend/pyproject.toml
uv.lock                  → backend/uv.lock
.python-version          → backend/.python-version
tests/ (if exists)       → backend/tests/
```

## Files to Keep at Root

```
frontend/               # Frontend stays at root
compose/                # Docker configs reference both backend/frontend
docker-compose.yml      # References both backend/frontend
docker-compose.*.yml    # All docker compose files
.envs/                  # Environment variables
.gitignore              # Project-wide ignore
.pre-commit-config.yaml # Project-wide hooks
README.md               # Project README
CLAUDE.md               # Project documentation
docs/                   # Project-wide documentation (or move to backend/?)
```

## Migration Steps (Recommended Order)

1. **Create backend directory:**

   ```bash
   mkdir backend
   ```

2. **Move directories:**

   ```bash
   mv apps backend/
   mv config backend/
   mv locale backend/
   mv manage.py backend/
   mv pyproject.toml backend/
   mv uv.lock backend/
   mv .python-version backend/
   ```

3. **Update Python path files:**
   - `backend/manage.py`
   - `backend/config/wsgi.py`
   - `backend/config/asgi.py`

4. **Update settings:**
   - `backend/config/settings/base.py` (APPS_DIR, LOCALE_PATHS)

5. **Update pyproject.toml:**
   - Coverage paths

6. **Update .gitignore:**
   - `backend/apps/media/`

7. **Update documentation:**
   - `CLAUDE.md`
   - `README.md`

8. **Test thoroughly:**

   ```bash
   # Rebuild Docker containers
   docker compose build

   # Run migrations
   docker compose run --rm django python manage.py migrate

   # Run tests
   docker compose run --rm django pytest

   # Start services
   docker compose up
   ```

## Docker Considerations

**Dockerfile changes needed:**

#### `compose/local/django/Dockerfile`

```dockerfile
# Current WORKDIR:
WORKDIR ${APP_HOME}  # /app

# After move, Django code is in /app/backend/
# Options:
# 1. Change WORKDIR to /app/backend
# 2. Keep WORKDIR as /app and update COPY commands
```

**Recommended approach:**

```dockerfile
# Keep WORKDIR as /app (project root)
WORKDIR ${APP_HOME}

# Copy backend-specific files
COPY backend/pyproject.toml backend/uv.lock ./backend/
RUN cd backend && uv sync --no-install-project

# Copy full backend directory
COPY backend/ ./backend/

# Set working directory to backend for Django commands
WORKDIR ${APP_HOME}/backend
```

**Update docker-compose.yml:**

```yaml
services:
  django:
    volumes:
      - .:/app:z
    # Django commands now run from /app/backend
    command: /start  # Script needs to: cd /app/backend && python manage.py ...
```

**Update startup scripts:**

#### `compose/local/django/start`

```bash
#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

cd /app/backend
python manage.py migrate
exec uvicorn config.asgi:application --host 0.0.0.0 --reload --reload-include '*.html'
```

## Alternative: Monorepo with Separate Contexts

Instead of moving into `backend/`, consider keeping the current structure but using Docker build contexts:

```yaml
services:
  django:
    build:
      context: .        # Root for shared files
      dockerfile: ./compose/local/django/Dockerfile
```

This maintains current simplicity while allowing future separation.

## Risks & Considerations

### High Risk

1. **Import path breakage** - Any hardcoded paths will fail
2. **Docker volume mounts** - May need adjustment
3. **CI/CD pipelines** - Any automation referencing paths
4. **Pre-commit hooks** - Path-based configurations

### Medium Risk

1. **IDE configurations** - May need Python path updates
2. **Test discovery** - pytest/coverage path configurations
3. **Database migrations** - Migration references to apps

### Low Risk

1. **Git history** - Using `git mv` preserves history
2. **Import statements** - Handled by sys.path

## Benefits of Moving to backend/

1. **Clear separation:** Frontend and backend clearly separated at root level
2. **Independent deployment:** Easier to deploy frontend/backend separately
3. **Polyglot projects:** Makes it easier to add other services (e.g., Go microservice)
4. **Cleaner root:** Project root less cluttered

## Downsides

1. **Additional complexity:** Extra directory level
2. **Docker context changes:** Need to update Dockerfiles and scripts
3. **Migration effort:** Non-trivial change requiring careful testing
4. **Breaking change:** Any external tools/scripts referencing paths will break

## Recommendation

**If you're just starting:** Keep current structure. It's simpler and works well for monorepo.

**If you plan to:**

- Deploy frontend/backend to different hosts
- Add multiple backend services
- Have team members work exclusively on frontend or backend
- Use separate CI/CD pipelines for frontend/backend

**Then:** The move to `backend/` is worth the effort.

## Estimated Effort

- **Planning/Analysis:** 1 hour (done)
- **File moves and updates:** 2-3 hours
- **Docker adjustments:** 2-3 hours
- **Testing:** 2-4 hours
- **Documentation updates:** 1-2 hours

**Total: 8-13 hours** for complete migration with thorough testing.
