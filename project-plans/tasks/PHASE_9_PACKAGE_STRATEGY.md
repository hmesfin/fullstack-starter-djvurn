# Phase 9: Package Strategy - Use, Wrap, or Build?

**Philosophy**: Don't reinvent the wheel. Use battle-tested packages, wrap them with opinionated integrations, and only build from scratch when necessary.

**The djvurn Ecosystem Goal**: Create a collection of **integration packages** that make existing Django packages work seamlessly with this starter's patterns (DRF, Vue 3, TypeScript, TDD, JWT auth).

---

## Decision Framework

### ✅ USE EXISTING (No djvurn package needed)

**When**:

- Well-maintained package exists (recent commits, active maintainers)
- Battle-tested (used in production by many projects)
- Good documentation
- Compatible with Django/DRF/our stack
- Extensible enough for our needs
- Active community (issues answered, PRs merged)

**Action**: Document integration in starter's docs, add to `pyproject.toml` dependencies

**Example**: `django-allauth`, `celery`, `Pillow`

---

### 🔧 WRAP EXISTING (Create djvurn-* integration package)

**When**:

- Good underlying package exists
- Needs opinionated defaults for this starter
- Needs DRF integration (serializers, ViewSets, permissions)
- Needs Vue.js components
- Needs TypeScript types/SDK
- Needs specific authentication pattern (JWT-based)
- Needs enhanced documentation for our use case

**Action**: Create `djvurn-*` package that:

- Wraps the underlying package
- Provides DRF integration layer
- Includes Vue components
- Includes TypeScript types
- Provides migration from vanilla package
- Documents integration patterns

**Example**: `djvurn-tags` (wraps `django-taggit`), `djvurn-notifications` (wraps `django-notifications-hq`)

---

### 🏗️ BUILD FROM SCRATCH

**When**:

- No good existing package
- Existing packages are abandoned/unmaintained
- Very specific requirements not covered
- Microservice architecture (separate service entirely)
- Want full control and ownership

**Action**: Build from scratch following TDD, document thoroughly

**Example**: Custom business logic, microservices

---

## Capabilities Breakdown

### 1. Authentication & Authorization

#### 1.1 Social Authentication

- **Strategy**: ✅ **USE EXISTING**
- **Package**: `django-allauth` (Jazzband)
- **Why**: Industry standard, supports 50+ providers, well-maintained
- **djvurn Action**: None - just document setup
- **Integration Docs**: Add to `docs/AUTHENTICATION.md`

#### 1.2 JWT Authentication

- **Strategy**: ✅ **USE EXISTING**
- **Package**: `djangorestframework-simplejwt` (Jazzband) - **ALREADY USING**
- **Why**: Perfect for DRF, well-maintained, we already use it
- **djvurn Action**: None

#### 1.3 Two-Factor Authentication (2FA)

- **Strategy**: ✅ **USE EXISTING**
- **Package**: `django-two-factor-auth` or `django-otp`
- **Why**: Both well-maintained, support TOTP, SMS, backup codes
- **djvurn Action**: Document integration with our JWT flow
- **Integration Docs**: Add to `docs/TWO_FACTOR_AUTH.md`

#### 1.4 Advanced RBAC (Roles, Teams, Permissions)

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Packages**:
  - `django-guardian` (object-level permissions)
  - `django-rules` (rule-based permissions)
- **djvurn Package**: `djvurn-rbac`
- **Why Wrap**: Need to add:
  - Teams/Organizations models
  - DRF permissions classes
  - Vue.js team management components
  - TypeScript types for roles/permissions
  - Integration with JWT (embed roles in token)
- **What djvurn-rbac Provides**:

  ```python
  from djvurn_rbac.models import Team, Role, Permission
  from djvurn_rbac.permissions import HasRolePermission
  from djvurn_rbac.serializers import TeamSerializer, RoleSerializer
  ```

  ```typescript
  import { useRBAC } from '@djvurn/rbac'
  import { TeamManager } from '@djvurn/rbac/components'
  ```

---

### 2. Communication & Messaging

#### 2.1 Email (Transactional)

- **Strategy**: 🏗️ **BUILD MICROSERVICE**
- **Package**: `djvurn-communications-email` (microservice)
- **Why**:
  - External API integration (SendGrid, Mailgun)
  - High volume, independent scaling
  - Template management and analytics
  - Shared across multiple Django apps
- **Tech Stack**: FastAPI + PostgreSQL + Celery + Redis

#### 2.2 SMS

- **Strategy**: 🏗️ **BUILD MICROSERVICE**
- **Package**: `djvurn-communications-sms` (microservice)
- **Why**:
  - External API integration (Twilio)
  - Cost management and compliance
  - Shared across multiple apps
- **Tech Stack**: FastAPI + PostgreSQL

#### 2.3 Push Notifications (Mobile)

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-push-notifications` (Jazzband)
- **djvurn Package**: `djvurn-push`
- **Why Wrap**: Add DRF integration, TypeScript types, React Native components
- **What djvurn-push Provides**:

  ```python
  from djvurn_push.api import PushNotificationViewSet
  ```

  ```typescript
  import { usePushNotifications } from '@djvurn/push'
  ```

#### 2.4 In-App Notifications

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-notifications-hq` (well-maintained, 2k+ stars)
- **djvurn Package**: `djvurn-notifications`
- **Why Wrap**: Add:
  - DRF serializers and ViewSets
  - WebSocket real-time delivery
  - Vue.js notification center component
  - TypeScript types
  - Notification preferences UI
- **What djvurn-notifications Provides**:

  ```python
  from djvurn_notifications.api import NotificationViewSet
  from djvurn_notifications.websocket import NotificationConsumer
  ```

  ```typescript
  import { NotificationCenter } from '@djvurn/notifications'
  ```

#### 2.5 Newsletters

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-newsletter` (Jazzband)
- **djvurn Package**: `djvurn-newsletters`
- **Why Wrap**: Add modern UI, DRF API, SendGrid integration
- **What djvurn-newsletters Provides**:
  - Vue.js newsletter builder (WYSIWYG)
  - Analytics dashboard
  - A/B testing UI

#### 2.6 Real-Time Chat/Messaging

- **Strategy**: 🏗️ **BUILD MICROSERVICE**
- **Package**: `djvurn-messaging` (microservice)
- **Why**:
  - WebSocket-heavy (better with Node.js or Django Channels)
  - Independent scaling
  - Real-time infrastructure (Redis, Socket.io)
- **Tech Stack**: Node.js (Socket.io) or Python (Django Channels) + Redis + PostgreSQL

---

### 3. Content & Social Features

#### 3.1 Tagging

- **Strategy**: ✅ **USE EXISTING**
- **Package**: `django-taggit` (Jazzband)
- **Why**: Perfect as-is, supports generic relations, well-maintained
- **djvurn Action**: Create Vue.js components (`TagInput.vue`, `TagCloud.vue`)
- **Provide**: Vue components package `@djvurn/taggit-components`

#### 3.2 Comments

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-contrib-comments` or `django-threadedcomments`
- **djvurn Package**: `djvurn-comments`
- **Why Wrap**: Add:
  - Threaded replies
  - Reactions (emoji)
  - Mentions (@username)
  - Markdown support
  - DRF serializers
  - Vue.js comment thread component
- **What djvurn-comments Provides**:

  ```python
  from djvurn_comments.api import CommentViewSet
  from djvurn_comments.models import ThreadedComment, Reaction
  ```

  ```typescript
  import { CommentThread } from '@djvurn/comments'
  ```

#### 3.3 Activity Feeds

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-activity-stream` (1.5k+ stars, active)
- **djvurn Package**: `djvurn-activity`
- **Why Wrap**: Add DRF API, Vue components, real-time WebSocket updates
- **What djvurn-activity Provides**:

  ```python
  from djvurn_activity.api import ActivityFeedViewSet
  ```

  ```typescript
  import { ActivityFeed } from '@djvurn/activity'
  ```

#### 3.4 Invitations

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-invitations` (800+ stars)
- **djvurn Package**: `djvurn-invitations`
- **Why Wrap**: Add team invitations, DRF API, Vue components
- **What djvurn-invitations Provides**:
  - Team/project invitation models
  - DRF endpoints for inviting users
  - Vue.js invitation flow components

#### 3.5 Bookmarks/Favorites

- **Strategy**: 🏗️ **BUILD FROM SCRATCH**
- **Package**: `djvurn-bookmarks`
- **Why**: Simple enough to build, no great existing package
- **Scope**: Generic bookmarking with collections

---

### 4. File & Media Management

#### 4.1 File Storage (S3, Local, CDN)

- **Strategy**: ✅ **USE EXISTING**
- **Package**: `django-storages` (Jazzband)
- **Why**: Industry standard, supports all major providers (S3, GCS, Azure)
- **djvurn Action**: Document setup, provide Vue upload components
- **Provide**: Vue components `@djvurn/upload-components`

#### 4.2 Image Processing

- **Strategy**: ✅ **USE EXISTING**
- **Package**: `Pillow` + `easy-thumbnails` or `sorl-thumbnail`
- **Why**: Battle-tested, handles resizing, optimization
- **djvurn Action**: Document setup

#### 4.3 Rich Text Editor

- **Strategy**: ✅ **USE EXISTING** (frontend)
- **Package**: `TipTap` or `ProseMirror` (JavaScript)
- **djvurn Action**: Provide Vue component wrapper
- **Provide**: `@djvurn/editor` (Vue component with Django field)

---

### 5. Workflows & Automation

#### 5.1 Task Scheduling

- **Strategy**: ✅ **USE EXISTING**
- **Package**: `django-celery-beat` (Jazzband)
- **Why**: Perfect for Celery-based scheduling, well-maintained
- **djvurn Action**: Document setup, provide admin UI enhancements

#### 5.2 State Machines / Workflows

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-fsm` (finite state machine)
- **djvurn Package**: `djvurn-workflows`
- **Why Wrap**: Add workflow builder UI, DRF integration, workflow analytics
- **What djvurn-workflows Provides**:
  - Workflow visualization
  - State transition API
  - Workflow templates

#### 5.3 Background Jobs Dashboard

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `flower` (Celery monitoring)
- **djvurn Package**: `djvurn-jobs` (optional enhancement)
- **Why Wrap**: Integrate with Django admin, add Vue.js dashboard
- **Note**: `flower` is probably fine as-is

---

### 6. Security & Compliance

#### 6.1 Rate Limiting

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-ratelimit` (Jazzband)
- **djvurn Package**: `djvurn-ratelimit`
- **Why Wrap**: Add per-user, per-team limits, DRF integration
- **What djvurn-ratelimit Provides**:

  ```python
  from djvurn_ratelimit.decorators import ratelimit
  from djvurn_ratelimit.throttles import UserRateThrottle
  ```

#### 6.2 Audit Logging

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-auditlog` (Jazzband)
- **djvurn Package**: `djvurn-audit`
- **Why Wrap**: Add DRF API, Vue.js audit log viewer, advanced filtering
- **What djvurn-audit Provides**:

  ```python
  from djvurn_audit.api import AuditLogViewSet
  ```

  ```typescript
  import { AuditLogViewer } from '@djvurn/audit'
  ```

#### 6.3 GDPR Compliance

- **Strategy**: 🏗️ **BUILD FROM SCRATCH**
- **Package**: `djvurn-gdpr`
- **Why**: No comprehensive package exists, very app-specific
- **Scope**: Data export, deletion, consent management

#### 6.4 Content Moderation

- **Strategy**: 🏗️ **BUILD MICROSERVICE**
- **Package**: `djvurn-moderation` (microservice)
- **Why**: External ML APIs (OpenAI moderation), independent scaling
- **Tech Stack**: FastAPI + PostgreSQL + OpenAI SDK

---

### 7. Payments & Billing

#### 7.1 Payments

- **Strategy**: 🏗️ **BUILD MICROSERVICE** (wrapper around Stripe/PayPal SDKs)
- **Package**: `djvurn-payments` (microservice)
- **Why**:
  - PCI compliance (isolate payment handling)
  - External APIs (Stripe, PayPal)
  - Shared across multiple apps
- **Tech Stack**: FastAPI + PostgreSQL + Stripe SDK
- **Note**: Could also be a Django package using `dj-stripe`

#### 7.2 Subscriptions

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `dj-stripe` (Stripe integration for Django)
- **djvurn Package**: `djvurn-subscriptions`
- **Why Wrap**: Add plan management, feature flags, usage tracking
- **What djvurn-subscriptions Provides**:
  - Subscription plan models
  - Feature gate middleware
  - Vue.js subscription management UI

---

### 8. Developer Tools

#### 8.1 Feature Flags

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-flags` (maintained by CFPB, 500+ stars)
- **djvurn Package**: `djvurn-flags`
- **Why Wrap**: Add DRF API, Vue.js toggle UI, TypeScript composable
- **What djvurn-flags Provides**:

  ```python
  from djvurn_flags.decorators import feature_flag
  from djvurn_flags.api import FeatureFlagViewSet
  ```

  ```typescript
  import { useFeatureFlag } from '@djvurn/flags'
  ```

#### 8.2 Webhooks

- **Strategy**: 🔧 **WRAP EXISTING**
- **Base Package**: `django-webhook` or build simple custom
- **djvurn Package**: `djvurn-webhooks`
- **Why Wrap**: Add webhook testing, retry logic, signature verification
- **What djvurn-webhooks Provides**:
  - Webhook registration UI
  - Test webhook endpoint
  - Delivery logs

#### 8.3 API Documentation

- **Strategy**: ✅ **USE EXISTING**
- **Package**: `drf-spectacular` - **ALREADY USING**
- **Why**: Perfect for DRF, auto-generates OpenAPI schema
- **djvurn Action**: None

---

### 9. Search & Analytics

#### 9.1 Full-Text Search

- **Strategy**: 🏗️ **BUILD MICROSERVICE**
- **Package**: `djvurn-search` (microservice)
- **Why**:
  - Different tech stack (Elasticsearch, Meilisearch)
  - Independent scaling
  - Index management
- **Tech Stack**: Meilisearch or Elasticsearch + Python indexer

#### 9.2 Analytics

- **Strategy**: 🏗️ **BUILD MICROSERVICE**
- **Package**: `djvurn-analytics` (microservice)
- **Why**:
  - High-volume time-series data
  - Different database (ClickHouse, TimescaleDB)
  - Independent scaling
- **Tech Stack**: ClickHouse + FastAPI

---

### 10. Infrastructure

#### 10.1 Event Bus

- **Strategy**: 🏗️ **BUILD FROM SCRATCH**
- **Package**: `djvurn-events` (Django package)
- **Why**: Core infrastructure for microservices communication
- **Scope**: Publish/subscribe, event schemas, Redis Pub/Sub or RabbitMQ

#### 10.2 Service Registry

- **Strategy**: 🏗️ **BUILD FROM SCRATCH**
- **Package**: Configuration in starter project
- **Why**: Simple config file for service URLs
- **Scope**: `settings/services.py` with service URLs and API keys

---

## Summary: Package Counts

### ✅ USE EXISTING (No djvurn package): **15 packages**

- django-allauth
- djangorestframework-simplejwt (already using)
- django-two-factor-auth
- django-taggit
- django-storages
- Pillow
- django-celery-beat
- drf-spectacular (already using)
- celery
- flower
- TipTap (frontend)
- Stripe SDK
- Twilio SDK
- SendGrid SDK
- Sentry SDK

### 🔧 WRAP EXISTING (Create djvurn-* wrapper): **15 packages**

1. djvurn-rbac (wraps django-guardian + django-rules)
2. djvurn-push (wraps django-push-notifications)
3. djvurn-notifications (wraps django-notifications-hq)
4. djvurn-newsletters (wraps django-newsletter)
5. djvurn-comments (wraps django-contrib-comments)
6. djvurn-activity (wraps django-activity-stream)
7. djvurn-invitations (wraps django-invitations)
8. djvurn-workflows (wraps django-fsm)
9. djvurn-ratelimit (wraps django-ratelimit)
10. djvurn-audit (wraps django-auditlog)
11. djvurn-subscriptions (wraps dj-stripe)
12. djvurn-flags (wraps django-flags)
13. djvurn-webhooks (wraps django-webhook or custom)
14. djvurn-editor (wraps TipTap)
15. djvurn-upload-components (Vue components for django-storages)

### 🏗️ BUILD FROM SCRATCH: **10 items**

**Django Packages (4)**:

1. djvurn-bookmarks
2. djvurn-gdpr
3. djvurn-events (event bus)
4. djvurn-workspaces

**Microservices (6)**:

1. djvurn-communications-email
2. djvurn-communications-sms
3. djvurn-messaging (chat)
4. djvurn-moderation
5. djvurn-search
6. djvurn-analytics

---

## The djvurn Wrapper Pattern

All `djvurn-*` wrapper packages follow this pattern:

### Package Structure

```
djvurn-{capability}/
├── backend/                    # Python package
│   ├── djvurn_{capability}/
│   │   ├── models.py          # Additional models
│   │   ├── api/
│   │   │   ├── serializers.py  # DRF serializers
│   │   │   ├── views.py        # DRF ViewSets
│   │   │   └── permissions.py  # DRF permissions
│   │   ├── signals.py         # Django signals
│   │   └── tests/
│   └── pyproject.toml
├── frontend/                   # Vue.js components
│   ├── src/
│   │   ├── components/        # Vue components
│   │   ├── composables/       # Vue composables
│   │   └── types/             # TypeScript types
│   └── package.json
├── docs/
│   ├── README.md
│   ├── INSTALLATION.md
│   └── INTEGRATION.md
└── examples/
    └── djvurn-starter-integration/
```

### Installation Experience

```bash
# Backend
pip install djvurn-notifications

# Frontend
npm install @djvurn/notifications
```

### Integration Example (djvurn-notifications)

**Backend** (`pyproject.toml`):

```toml
[project]
dependencies = [
    "django>=5.0",
    "djangorestframework>=3.14",
    "django-notifications-hq>=1.8",  # Underlying package
    "channels>=4.0",  # For WebSocket
]
```

**Python API**:

```python
# settings.py
INSTALLED_APPS += [
    'notifications',  # django-notifications-hq
    'djvurn_notifications',  # our wrapper
]

# Send notification (wraps django-notifications-hq)
from djvurn_notifications import notify

notify.send(
    sender=request.user,
    recipient=project.owner,
    verb="shared a project with you",
    target=project,
    channels=["in_app", "email"],  # Our extension
)

# DRF ViewSet (our addition)
from djvurn_notifications.api import NotificationViewSet

urlpatterns = [
    path('api/', include(router.urls)),
]
```

**Frontend** (`@djvurn/notifications`):

```typescript
// Vue component
import { NotificationCenter } from '@djvurn/notifications'
import { useNotifications } from '@djvurn/notifications'

const { notifications, unreadCount, markAsRead } = useNotifications()
```

**What the wrapper adds**:

1. ✅ DRF serializers and ViewSets
2. ✅ WebSocket real-time delivery
3. ✅ Multi-channel support (in-app, email, push)
4. ✅ Vue.js components
5. ✅ TypeScript types
6. ✅ Notification preferences API
7. ✅ Integration guide for djvurn starter

---

## Prioritization

### Phase 9A: Essential Wrappers (Build First)

1. **djvurn-rbac** - RBAC with teams (wrap django-guardian)
2. **djvurn-notifications** - In-app notifications (wrap django-notifications-hq)
3. **djvurn-audit** - Audit logging (wrap django-auditlog)
4. **djvurn-invitations** - User/team invitations (wrap django-invitations)
5. **djvurn-events** - Event bus (build from scratch)

### Phase 9B: High-Value Wrappers

6. **djvurn-comments** - Comment system (wrap django-contrib-comments)
7. **djvurn-activity** - Activity feeds (wrap django-activity-stream)
8. **djvurn-flags** - Feature flags (wrap django-flags)
9. **djvurn-webhooks** - Webhooks (wrap or build simple)
10. **djvurn-ratelimit** - Rate limiting (wrap django-ratelimit)

### Phase 9C: Microservices

11. **djvurn-communications-email** - Email service
12. **djvurn-messaging** - Real-time chat
13. **djvurn-search** - Full-text search
14. **djvurn-analytics** - Analytics service

---

## Next Steps

1. **Review Jazzband catalog**: Check all Jazzband packages for hidden gems
2. **Validate base packages**: Test each underlying package with Django 5.x
3. **Create wrapper template**: Cookiecutter template for djvurn-* packages
4. **Build first wrapper**: djvurn-rbac as proof of concept
5. **Document pattern**: Write guide for contributing new djvurn packages

---

## Resources

- **Jazzband packages**: <https://jazzband.co/>
- **Django Packages**: <https://djangopackages.org/>
- **Awesome Django**: <https://github.com/wsvincent/awesome-django>
