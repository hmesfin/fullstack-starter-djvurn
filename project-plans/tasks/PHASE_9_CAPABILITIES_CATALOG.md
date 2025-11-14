# Phase 9: Capabilities Catalog - Reusable Packages & Microservices

**Purpose**: Strategic planning for common software capabilities that can be built as standalone packages or microservices and integrated seamlessly with the djvurn starter.

**Goal**: Create a comprehensive catalog of capabilities, determine package vs microservice architecture for each, and define integration specifications.

---

## Decision Framework: Package vs Microservice

### Use Django Package When:
- ✅ Tightly coupled to Django ORM/models
- ✅ Needs direct database access for performance
- ✅ Simple install/config is important (`pip install`)
- ✅ Shares authentication context with main app
- ✅ Small to medium data volume
- ✅ Low latency requirements (no network hop)

**Examples**: RBAC, Audit Logging, Comments, Tagging

### Use Microservice When:
- ✅ Independent scaling requirements
- ✅ Different technology stack may be better (Node.js, Go, Python)
- ✅ External dependencies/integrations (Twilio, SendGrid, Stripe)
- ✅ High volume, needs separate infrastructure
- ✅ Asynchronous processing is core functionality
- ✅ Used by multiple applications, not just Django

**Examples**: Notifications, Email/SMS, Video Processing, Analytics

---

## Capabilities Catalog

### 1. Authentication & Authorization

#### 1.1 Advanced RBAC (Role-Based Access Control)
- **Type**: Django Package (`djvurn-rbac`)
- **Reasoning**: Tightly coupled to Django permissions, needs ORM access
- **Scope**:
  - Hierarchical roles (Owner → Admin → Manager → Member → Viewer)
  - Teams/Organizations (multi-tenancy)
  - Resource-level permissions (per-project, per-team)
  - Permission inheritance and delegation
  - Role templates (predefined role sets)
- **Integration**:
  - Django models: `Role`, `Team`, `OrganizationMembership`, `Permission`
  - DRF permissions: `HasRolePermission`, `IsTeamMember`
  - Vue components: `RoleSelector.vue`, `TeamManager.vue`
- **Dependencies**: Django, DRF
- **Data Models**: Owns teams, roles, memberships tables

#### 1.2 Social Authentication
- **Type**: Django Package (use `django-allauth`)
- **Reasoning**: Already exists, well-maintained
- **Scope**: OAuth2 (Google, GitHub, Twitter, etc.)

#### 1.3 Two-Factor Authentication (2FA)
- **Type**: Django Package (`djvurn-2fa`)
- **Reasoning**: Tightly coupled to user authentication flow
- **Scope**:
  - TOTP (Google Authenticator, Authy)
  - SMS-based codes
  - Backup codes
  - WebAuthn/FIDO2 (hardware keys)
- **Integration**:
  - Middleware for 2FA enforcement
  - Vue components: `TwoFactorSetup.vue`, `TwoFactorVerify.vue`

---

### 2. Communication & Messaging

#### 2.1 Notifications Service
- **Type**: Microservice (`djvurn-notifications`)
- **Reasoning**: Multiple channels, high volume, independent scaling, external integrations
- **Scope**:
  - Multi-channel: Email, SMS, Push (mobile), In-app, WebSocket
  - Notification templates (Jinja2)
  - User preferences (channel opt-in/out per notification type)
  - Delivery tracking (sent, delivered, read, failed)
  - Rate limiting and batching
  - Priority queues (urgent, normal, low)
- **Tech Stack**: FastAPI + PostgreSQL + Redis + Celery
- **Integration**:
  - REST API: `POST /api/notifications/send`
  - WebSocket: Real-time push to frontend
  - Event-driven: Listens to events from main app (user.created, project.updated)
- **External Dependencies**: SendGrid (email), Twilio (SMS), Firebase (push)
- **Data Models**: Owns notifications, templates, preferences tables

#### 2.2 Real-Time Messaging (Chat)
- **Type**: Microservice (`djvurn-messaging`)
- **Reasoning**: WebSocket-heavy, independent scaling, real-time infrastructure
- **Scope**:
  - Direct messages (1-on-1)
  - Group chats (multi-user)
  - Channels (team/project channels)
  - Message threading (replies)
  - Read receipts and typing indicators
  - File attachments and media
  - Message search and history
- **Tech Stack**: Node.js (Socket.io) or Python (Django Channels) + Redis + PostgreSQL
- **Integration**:
  - WebSocket API: `wss://messaging.example.com/ws`
  - REST API: Message history, search
  - Authentication: JWT from main app
- **Data Models**: Owns messages, channels, participants tables

#### 2.3 Email Service (Transactional)
- **Type**: Microservice (`djvurn-communications-email`)
- **Reasoning**: External API integration (SendGrid), high volume, template management
- **Scope**:
  - Send transactional emails (password reset, OTP, receipts)
  - Email templates with variables
  - Delivery tracking and webhooks
  - Email validation and verification
  - Bounce/complaint handling
  - A/B testing for email content
- **Tech Stack**: FastAPI + PostgreSQL + Redis
- **Integration**:
  - REST API: `POST /api/email/send`
  - Event-driven: Subscribe to `user.registered`, `order.completed`
- **External Dependencies**: SendGrid, Mailgun, or AWS SES

#### 2.4 SMS Service
- **Type**: Microservice (`djvurn-communications-sms`)
- **Reasoning**: External API (Twilio), cost management, compliance (opt-in/out)
- **Scope**:
  - Send SMS (OTP, alerts, reminders)
  - SMS templates
  - Delivery tracking
  - Opt-in/opt-out management (TCPA compliance)
  - Cost tracking per message
- **Tech Stack**: FastAPI + PostgreSQL
- **Integration**:
  - REST API: `POST /api/sms/send`
- **External Dependencies**: Twilio, AWS SNS

#### 2.5 Newsletters
- **Type**: Microservice (`djvurn-newsletters`)
- **Reasoning**: Marketing focus, large audience, scheduling, analytics
- **Scope**:
  - Newsletter creation (WYSIWYG editor)
  - Subscriber management (lists, segments, tags)
  - Scheduled sending
  - A/B testing (subject lines, content)
  - Analytics (open rate, click rate, unsubscribe rate)
  - Unsubscribe management and compliance (CAN-SPAM, GDPR)
- **Tech Stack**: FastAPI + PostgreSQL + Celery + Redis
- **Integration**:
  - REST API: Create/send newsletters
  - Admin UI: Newsletter builder
- **External Dependencies**: SendGrid, Mailchimp API

---

### 3. User Engagement & Social Features

#### 3.1 Comments System
- **Type**: Django Package (`djvurn-comments`)
- **Reasoning**: Tightly coupled to content (projects, posts), needs ORM for joins
- **Scope**:
  - Threaded comments (replies)
  - Reactions (👍, ❤️, 🎉)
  - Mentions (@username)
  - Rich text support (Markdown)
  - Spam detection and moderation
  - Notifications on replies/mentions
- **Integration**:
  - Generic foreign key to any model
  - Vue components: `CommentThread.vue`, `CommentForm.vue`
  - DRF serializers and ViewSets
- **Dependencies**: Main app for user auth, notifications service

#### 3.2 Invitations System
- **Type**: Django Package (`djvurn-invitations`)
- **Reasoning**: Tightly coupled to user/team models, simple workflow
- **Scope**:
  - Email invitations (signup via invite link)
  - Team/project invitations
  - Invitation token generation and expiry
  - Track invitation status (pending, accepted, expired)
  - Referral tracking (who invited whom)
- **Integration**:
  - Models: `Invitation`, `InvitationToken`
  - Views: Invitation accept/reject
  - Email: Uses email service for sending

#### 3.3 Activity Feeds
- **Type**: Django Package (`djvurn-activity`)
- **Reasoning**: Needs access to all models, activity aggregation
- **Scope**:
  - Track user activities (created project, commented, invited user)
  - News feed (aggregated activities from followed users/teams)
  - Real-time updates via WebSocket
  - Activity filtering and privacy controls
- **Integration**:
  - Signals to track activities
  - Vue components: `ActivityFeed.vue`, `ActivityItem.vue`

#### 3.4 Bookmarks / Favorites
- **Type**: Django Package (`djvurn-bookmarks`)
- **Reasoning**: Simple functionality, tightly coupled to content models
- **Scope**:
  - Bookmark any content (projects, posts, comments)
  - Collections (organize bookmarks)
  - Tags for bookmarks
- **Integration**:
  - Generic foreign key
  - Vue composable: `useBookmarks()`

---

### 4. Content Management

#### 4.1 Tagging System
- **Type**: Django Package (`djvurn-tags`)
- **Reasoning**: Tightly coupled to multiple models, simple queries
- **Scope**:
  - Tag any content (projects, posts, files)
  - Tag suggestions (autocomplete)
  - Tag hierarchies (parent/child tags)
  - Popular tags ranking
- **Integration**:
  - Generic foreign key or `django-taggit` wrapper
  - Vue components: `TagInput.vue`, `TagCloud.vue`

#### 4.2 File Storage & Media Management
- **Type**: Django Package (`djvurn-storage`)
- **Reasoning**: Django storage backend abstraction, simple interface
- **Scope**:
  - Abstraction over S3, local, CDN, Cloudinary
  - Image resizing and optimization (Pillow)
  - Video thumbnail generation
  - File metadata (EXIF, duration, dimensions)
  - Direct upload to S3 (signed URLs)
- **Integration**:
  - Django storage backend
  - Vue components: `FileUpload.vue`, `ImageGallery.vue`
- **External Dependencies**: AWS S3, Cloudinary

#### 4.3 Rich Text Editor
- **Type**: Django Package (`djvurn-editor`)
- **Reasoning**: Frontend + backend integration, content sanitization
- **Scope**:
  - WYSIWYG editor (TipTap, ProseMirror)
  - Markdown support
  - HTML sanitization
  - Media embeds (images, videos, YouTube)
  - Mentions and hashtags
- **Integration**:
  - Vue component: `RichTextEditor.vue`
  - Django field: `RichTextField`

#### 4.4 Search Service
- **Type**: Microservice (`djvurn-search`)
- **Reasoning**: Different tech stack (Elasticsearch, Meilisearch), independent scaling
- **Scope**:
  - Full-text search across all content
  - Faceted search (filters)
  - Autocomplete and suggestions
  - Search analytics (popular queries)
  - Indexing via events (content.created, content.updated)
- **Tech Stack**: Elasticsearch or Meilisearch + Python/Node.js indexer
- **Integration**:
  - REST API: `GET /api/search?q=query`
  - Event-driven: Subscribe to content events

---

### 5. Payments & Billing

#### 5.1 Payments Service
- **Type**: Microservice (`djvurn-payments`)
- **Reasoning**: External API (Stripe), PCI compliance, independent scaling
- **Scope**:
  - Payment processing (one-time, subscriptions)
  - Multiple payment methods (card, ACH, PayPal)
  - Invoicing and receipts
  - Refunds and disputes
  - Webhook handling (payment success/failure)
  - Payment history and analytics
- **Tech Stack**: FastAPI + PostgreSQL + Stripe SDK
- **Integration**:
  - REST API: Create payment intent, subscriptions
  - Webhooks: Payment status updates
- **External Dependencies**: Stripe, PayPal

#### 5.2 Subscription Management
- **Type**: Django Package (`djvurn-subscriptions`)
- **Reasoning**: Tightly coupled to users/teams, plan management
- **Scope**:
  - Subscription plans (Free, Pro, Enterprise)
  - Feature flags per plan
  - Usage tracking (API calls, storage, seats)
  - Plan upgrades/downgrades
  - Billing cycles and proration
- **Integration**:
  - Models: `Plan`, `Subscription`, `Usage`
  - Middleware: Feature gate based on subscription
  - Uses payments service for processing

---

### 6. Analytics & Monitoring

#### 6.1 Audit Logging
- **Type**: Django Package (`djvurn-audit`)
- **Reasoning**: Needs access to all models, tight integration with ORM
- **Scope**:
  - Track all CRUD operations (who did what, when)
  - IP address and user agent tracking
  - Diff tracking (before/after values)
  - Searchable audit log UI
  - Retention policies (archive old logs)
- **Integration**:
  - Django signals for model changes
  - Middleware for request tracking
  - Vue component: `AuditLogViewer.vue`

#### 6.2 Analytics Service
- **Type**: Microservice (`djvurn-analytics`)
- **Reasoning**: High volume events, time-series data, complex queries
- **Scope**:
  - Event tracking (page views, clicks, conversions)
  - Custom event attributes
  - Dashboards and reports
  - Funnel analysis
  - Cohort analysis
  - Data export (CSV, JSON)
- **Tech Stack**: ClickHouse or TimescaleDB + FastAPI
- **Integration**:
  - REST API: Track events
  - JavaScript SDK: Frontend tracking
  - Event-driven: Subscribe to application events

#### 6.3 Error Tracking
- **Type**: Microservice or SaaS (Sentry)
- **Reasoning**: Cross-stack (frontend + backend), specialized tooling
- **Scope**: Use existing tools like Sentry, Rollbar

---

### 7. Workflow & Automation

#### 7.1 Task Scheduler
- **Type**: Django Package (`djvurn-scheduler`)
- **Reasoning**: Tightly coupled to Django models, Celery integration
- **Scope**:
  - Scheduled tasks (cron-like)
  - Recurring tasks (daily reports, weekly digests)
  - Task dependencies (task A before task B)
  - Task history and logs
- **Integration**:
  - Celery Beat wrapper
  - Admin UI for managing schedules

#### 7.2 Workflow Engine
- **Type**: Django Package (`djvurn-workflows`)
- **Reasoning**: Tightly coupled to business logic, state machines
- **Scope**:
  - Define workflows (approval flows, onboarding)
  - State transitions (draft → review → approved → published)
  - Workflow templates
  - Human tasks (approvals, reviews)
  - Workflow analytics (bottlenecks, completion time)
- **Integration**:
  - Models: `Workflow`, `WorkflowState`, `WorkflowTransition`
  - Signals for state changes

#### 7.3 Background Jobs Dashboard
- **Type**: Django Package (`djvurn-jobs`)
- **Reasoning**: Celery monitoring, Django admin integration
- **Scope**:
  - View running/pending/failed jobs
  - Retry failed jobs
  - Job performance metrics
  - Job result storage
- **Integration**:
  - Celery backend monitoring
  - Admin UI: `JobDashboard.vue`

---

### 8. Compliance & Security

#### 8.1 GDPR Compliance Kit
- **Type**: Django Package (`djvurn-gdpr`)
- **Reasoning**: Tightly coupled to user data models
- **Scope**:
  - Data export (download my data)
  - Data deletion (right to be forgotten)
  - Consent management (terms, privacy, cookies)
  - Data retention policies
  - Breach notification workflow
- **Integration**:
  - Models: `Consent`, `DataExport`, `DeletionRequest`
  - Views: Export/delete user data
  - Admin: GDPR compliance dashboard

#### 8.2 Rate Limiting
- **Type**: Django Package (`djvurn-ratelimit`)
- **Reasoning**: Request-level middleware, tight integration
- **Scope**:
  - Per-user, per-IP, per-endpoint rate limits
  - Redis-backed counters
  - Custom rate limit strategies
  - Rate limit headers (X-RateLimit-*)
- **Integration**:
  - Middleware: `RateLimitMiddleware`
  - Decorators: `@ratelimit(rate="100/hour")`

#### 8.3 Content Moderation
- **Type**: Microservice (`djvurn-moderation`)
- **Reasoning**: External ML APIs (OpenAI moderation), independent scaling
- **Scope**:
  - Automatic content flagging (hate speech, spam)
  - Manual moderation queue
  - User reporting system
  - Moderation actions (hide, delete, warn user)
  - Appeals workflow
- **Tech Stack**: FastAPI + PostgreSQL + OpenAI API
- **Integration**:
  - REST API: Check content, report content
  - Webhooks: Moderation decision

---

### 9. Collaboration

#### 9.1 Team Management
- **Type**: Django Package (part of `djvurn-rbac`)
- **Reasoning**: Core to multi-tenancy, tightly coupled
- **Scope**:
  - Create/manage teams
  - Team invitations
  - Team roles (owner, admin, member)
  - Team switching UI

#### 9.2 Shared Workspaces
- **Type**: Django Package (`djvurn-workspaces`)
- **Reasoning**: Tightly coupled to content models
- **Scope**:
  - Workspace-scoped content (projects, files, docs)
  - Workspace members and permissions
  - Workspace settings and branding
- **Integration**:
  - Models: `Workspace`, `WorkspaceMembership`
  - Middleware: Current workspace context

#### 9.3 Real-Time Collaboration (Operational Transform)
- **Type**: Microservice (`djvurn-collab`)
- **Reasoning**: Complex real-time sync, WebSocket-heavy
- **Scope**:
  - Collaborative text editing (like Google Docs)
  - Operational Transform or CRDT
  - Presence indicators (who's viewing)
  - Cursor tracking
- **Tech Stack**: Node.js (Y.js, ShareDB) or Elixir (Phoenix)
- **Integration**:
  - WebSocket API

---

### 10. Integrations

#### 10.1 Webhooks Service
- **Type**: Django Package (`djvurn-webhooks`)
- **Reasoning**: Tightly coupled to application events
- **Scope**:
  - Configure webhooks (URL, events, headers)
  - Webhook retry logic (exponential backoff)
  - Webhook signatures (HMAC)
  - Webhook logs and debugging
  - Test webhook endpoints
- **Integration**:
  - Models: `Webhook`, `WebhookDelivery`
  - Signals: Trigger webhooks on events

#### 10.2 API Client SDKs
- **Type**: Standalone Libraries (npm, pip packages)
- **Reasoning**: Client libraries in multiple languages
- **Scope**:
  - Auto-generated from OpenAPI spec
  - JavaScript/TypeScript SDK
  - Python SDK
  - Go SDK
- **Integration**:
  - Published to npm, PyPI

#### 10.3 OAuth2 Provider
- **Type**: Django Package (`djvurn-oauth2`)
- **Reasoning**: Tightly coupled to Django auth
- **Scope**:
  - OAuth2 server (allow third-party apps)
  - Application registration
  - Scopes and permissions
  - Token management
- **Integration**:
  - Use `django-oauth-toolkit`

---

### 11. Developer Experience

#### 11.1 Admin Dashboard (Enhanced)
- **Type**: Django Package (`djvurn-admin`)
- **Reasoning**: Django admin extension
- **Scope**:
  - Custom admin UI (React Admin, Vue Admin)
  - Advanced filters and search
  - Bulk actions
  - Data visualization (charts, graphs)
  - Export to CSV/Excel
- **Integration**:
  - Replace Django admin

#### 11.2 API Documentation (Interactive)
- **Type**: Django Package (`djvurn-docs`)
- **Reasoning**: Auto-generated from DRF
- **Scope**:
  - Interactive API docs (Swagger/ReDoc)
  - Code examples in multiple languages
  - API changelog
  - Versioning
- **Integration**:
  - drf-spectacular extension

#### 11.3 Feature Flags
- **Type**: Django Package (`djvurn-flags`)
- **Reasoning**: Application-level feature control
- **Scope**:
  - Toggle features per user/team/environment
  - Gradual rollouts (% of users)
  - A/B testing integration
  - Feature flag analytics
- **Integration**:
  - Decorators: `@feature_flag("new_editor")`
  - Vue composable: `useFeatureFlag("new_editor")`

---

## Integration Architecture for Starter Project

To support all these capabilities, the starter needs:

### 1. Event Bus (for Microservices Communication)

**Package**: `djvurn-events` (Django package)

**Purpose**: Publish/subscribe pattern for application events

**Implementation**:
```python
# Publish event
from djvurn_events import publish_event

publish_event("user.created", {
    "user_id": user.id,
    "email": user.email,
    "created_at": user.created_at.isoformat(),
})

# Subscribe (in microservice)
@event_handler("user.created")
def on_user_created(event_data):
    # Send welcome email
    pass
```

**Tech Stack**: Redis Pub/Sub or RabbitMQ

### 2. Service Registry

**Package**: `djvurn-registry` (configuration package)

**Purpose**: Centralized configuration for all services

**Configuration** (`settings/services.py`):
```python
SERVICES = {
    "notifications": {
        "url": "https://notifications.example.com",
        "api_key": env("NOTIFICATIONS_API_KEY"),
    },
    "messaging": {
        "url": "https://messaging.example.com",
        "websocket": "wss://messaging.example.com/ws",
    },
    "email": {
        "url": "https://email.example.com",
    },
}
```

### 3. Unified Authentication (JWT)

All services accept JWT tokens from main app:
- Main app issues JWT with user_id, roles, teams
- Microservices validate JWT signature
- No shared database for auth

### 4. API Gateway (Optional)

**Tool**: Traefik, Kong, or AWS API Gateway

**Purpose**: Single entry point for all services

**Routing**:
```
/api/projects/*     → Django app
/api/notifications/* → Notifications service
/api/messaging/*    → Messaging service
/api/search/*       → Search service
```

---

## Prioritization Matrix

### Phase 9A: Essential Capabilities (Build First)
1. **djvurn-rbac** - Advanced RBAC (teams, roles, permissions)
2. **djvurn-notifications** - Multi-channel notifications
3. **djvurn-audit** - Audit logging
4. **djvurn-invitations** - User/team invitations
5. **djvurn-events** - Event bus for microservices

### Phase 9B: High-Value Capabilities
6. **djvurn-messaging** - Real-time chat
7. **djvurn-communications-email** - Email service
8. **djvurn-comments** - Comment system
9. **djvurn-storage** - File management
10. **djvurn-webhooks** - Webhook system

### Phase 9C: Specialized Capabilities
11. **djvurn-payments** - Payment processing
12. **djvurn-newsletters** - Newsletter management
13. **djvurn-search** - Full-text search
14. **djvurn-workflows** - Workflow engine
15. **djvurn-analytics** - Analytics service

---

## Starter Project Preparation Checklist

To prepare this starter for all capabilities:

### Code Structure Changes
- [ ] Add `settings/services.py` for service registry
- [ ] Add `apps/events/` for event bus
- [ ] Add `apps/integrations/` for third-party webhooks
- [ ] Create `docs/INTEGRATIONS.md` guide

### Configuration
- [ ] Environment variables for service URLs
- [ ] Service authentication (API keys, JWT)
- [ ] Feature flags configuration

### Frontend
- [ ] Create `src/lib/services/` for service clients
- [ ] WebSocket connection manager
- [ ] Event listener utilities

### Documentation
- [ ] Integration guide for each capability type
- [ ] Event schema documentation
- [ ] API contract versioning guide

---

## Next Steps

1. **Review & Refine**: Review this catalog, add/remove capabilities
2. **Prioritize**: Decide which 3-5 to build first
3. **Spec Individual Packages**: Create detailed specs for priority items
4. **Prepare Starter**: Make architectural changes to support integrations
5. **Create Package Templates**: Starter templates for packages and services

---

## Example: Detailed Spec Template

For each capability we decide to build, create a spec like:

### djvurn-notifications

**Repository**: `github.com/your-org/djvurn-notifications`

**Tech Stack**: FastAPI + PostgreSQL + Redis + Celery

**API Specification**:
```
POST /api/notifications/send
GET /api/notifications/user/{user_id}
PUT /api/notifications/preferences/{user_id}
WebSocket /ws/notifications
```

**Event Subscriptions**:
- `user.created` → Send welcome notification
- `project.shared` → Send collaboration notification

**Environment Variables**:
```
SENDGRID_API_KEY
TWILIO_ACCOUNT_SID
FIREBASE_SERVER_KEY
```

**Django Integration**:
```python
# Install
pip install djvurn-notifications-client

# Configure
NOTIFICATIONS_SERVICE_URL = "https://notifications.example.com"

# Usage
from djvurn_notifications import send_notification

send_notification(
    user_id=user.id,
    type="project_shared",
    channels=["email", "push"],
    data={"project_name": project.name}
)
```

**Vue Integration**:
```typescript
// Composable
import { useNotifications } from '@djvurn/notifications'

const { notifications, markAsRead, preferences } = useNotifications()
```

---

This catalog serves as the blueprint for building a comprehensive ecosystem of reusable capabilities around the djvurn starter.
