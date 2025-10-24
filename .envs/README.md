# Environment Files

This directory contains environment configuration files for different environments.

## Directory Structure

```
.envs/
├── .local/              # Local development (gitignored - contains secrets)
├── .testing/            # CI/CD testing (committed - safe values only)
├── .local.example/      # Example files for local setup
├── .production.example/ # Example files for production
└── .staging.example/    # Example files for staging
```

## Environment Types

### `.local/` - Local Development (NOT COMMITTED)
- Used for local development with Docker Compose
- Contains actual secrets and credentials
- **Never commit this directory** - it's in `.gitignore`
- Copy from `.local.example/` and fill in real values

### `.testing/` - CI/CD Testing (COMMITTED)
- Used by GitHub Actions CI pipeline
- Contains safe, non-sensitive test values
- Safe to commit to git
- CI copies these to `.local/` before running tests

### `.local.example/` - Template for Local Setup
- Template files showing required environment variables
- Contains placeholder/example values
- Developers copy these to `.local/` and customize

### `.production.example/` - Template for Production
- Template for production deployment
- Shows required production environment variables

### `.staging.example/` - Template for Staging
- Template for staging deployment
- Shows required staging environment variables

## Setup Instructions

### For Local Development

1. Copy the example files:
   ```bash
   cp .envs/.local.example/.django .envs/.local/.django
   cp .envs/.local.example/.postgres .envs/.local/.postgres
   cp .envs/.local.example/.frontend .envs/.local/.frontend
   ```

2. Edit `.envs/.local/*` files with your actual values

3. Start Docker Compose:
   ```bash
   docker compose up
   ```

### For CI/CD

The CI pipeline automatically uses `.envs/.testing/` files:
- GitHub Actions copies `.testing/` → `.local/` before running tests
- No manual setup required

## Security Best Practices

1. **Never commit** `.envs/.local/` - it contains real secrets
2. **Always commit** `.envs/.testing/` - it only has safe test values
3. Use strong, unique secrets for production
4. Rotate secrets regularly
5. Use environment-specific secrets (dev ≠ staging ≠ production)

## Example Values

### Testing Environment (.envs/.testing/)
- Database: `postgres_user` / `postgres_password`
- Flower: Test credentials for CI
- Redis: Default connection string

### Local Development (.envs/.local/)
- Use real credentials from your local services
- Or keep simple values for local Docker services
- Your choice - it's gitignored!

### Production (.envs/.production/)
- Strong passwords (20+ characters)
- Unique per service
- Rotated regularly
- Managed via secrets management (AWS Secrets Manager, etc.)
