# Claude Code Configuration

This directory contains Claude Code configuration, commands, and templates for this starter project.

## Directory Structure

```
.claude/
├── README.md                           # This file
├── PLANNING_GUIDE.md                   # User guide for the planning system
├── PLANNING_TOOL_TRANSFORMATION.md     # Transformation roadmap
├── commands/
│   └── plan-app.md                     # /plan-app slash command
└── templates/
    ├── PROJECT_PLAN_TEMPLATE.md        # High-level plan template
    └── PHASE_TASKS_TEMPLATE.md         # Detailed phase tasks template
```

## Philosophy

**Planning is the bottleneck, not coding.** Poor planning leads to project failure. Good plans enable successful agent execution.

This planning system focuses on creating comprehensive, executable plans that agents can follow to build your app.

## Slash Commands

### `/plan-app` - AI-Driven App Planning

Transforms your app idea into a comprehensive, TDD-driven, session-based implementation plan.

**Usage**:
```
/plan-app
```

**What it does**:
1. **Discovery**: Asks intelligent questions about your app (complexity, features, entities, workflows)
2. **Requirements**: Generates detailed technical requirements document
3. **Planning**: Creates high-level project plan with phases and timelines
4. **Task Breakdown**: Generates session-by-session task documents with TDD workflows

**Output**:
- `project-plans/<app-name>/REQUIREMENTS.md` - Technical specs
- `project-plans/<app-name>/PROJECT_PLAN.md` - High-level plan
- `project-plans/<app-name>/tasks/PHASE_X_*.md` - Detailed session tasks

**Learn more**: See `PLANNING_GUIDE.md`

## Templates

Templates use `{{VARIABLE}}` syntax for placeholders. The `/plan-app` command uses these to generate project plans.

### PROJECT_PLAN_TEMPLATE.md

High-level project plan structure with:
- Overview and technical stack
- Phase breakdown with sessions
- Data models and API endpoints summary
- Success criteria
- Testing strategy
- Timeline estimates

### PHASE_TASKS_TEMPLATE.md

Detailed phase task document with:
- Session objectives and duration
- TDD workflow (RED-GREEN-REFACTOR)
- Files to create/modify
- Test coverage requirements
- Exit criteria
- Dependencies between sessions

## How It Works

### 1. Discovery Phase

The slash command invokes an AI-driven discovery process:
- Asks strategic questions based on app type
- Adapts follow-up questions based on user's answers
- Gathers all necessary requirements

### 2. Requirements Generation

Creates a comprehensive technical specification:
- Data models (fields, relationships, indexes, validation)
- API endpoints (routes, methods, permissions, request/response schemas)
- Frontend components (hierarchy, props, state)
- Zod schemas (runtime validation mirroring backend)
- Test coverage requirements per module

### 3. Plan Generation

Generates structured project plan:
- **PROJECT_PLAN.md**: High-level overview, phases, timelines, success criteria
- **PHASE_X_*.md**: Detailed session breakdowns with TDD workflows

### 4. Session-Based Execution

Each session is sized for optimal context usage:
- **Basic apps**: ~15K tokens/session
- **Intermediate apps**: ~18K tokens/session
- **Advanced apps**: ~20K tokens/session

Target: Leave 30K+ tokens buffer to avoid context fatigue.

## Context Budget Management

### Session Sizing Rules

**Backend (Django)**:
- Models: 3-5 models per session
- Serializers: 3-5 serializers per session
- ViewSets: 3-5 ViewSets per session
- Business logic: 1-2 complex workflows per session

**Frontend (Vue.js)**:
- Components: 5-7 components per session
- Views: 3-4 views per session
- Composables: 3-5 composables per session
- Stores: 2-3 stores per session

**Mobile (React Native)**:
- Screens: 3-4 screens per session
- Components: 5-7 components per session
- Hooks: 3-5 hooks per session

## TDD Enforcement

Every session follows the RED-GREEN-REFACTOR cycle:

1. **RED Phase**: Write failing tests first
   - Expected result: ❌ Tests fail (implementation doesn't exist)

2. **GREEN Phase**: Write minimal code to pass tests
   - Expected result: ✅ Tests pass

3. **REFACTOR Phase**: Optimize while keeping tests passing
   - Expected result: ✅ Tests still pass after refactoring

## Integration with Starter

The planning system understands this starter's architecture:

### Backend (Django)
- Custom user model: `apps.users.User` (email-based, no username)
- API-only backend (no Django templates except emails)
- DRF with OpenAPI schema generation (`drf-spectacular`)
- Token + JWT authentication
- Docker-first workflow (all commands via `docker compose run --rm`)

### Frontend (Vue.js)
- Vue 3 Composition API with `<script setup lang="ts">`
- Shadcn-vue components (copy-paste, not npm package)
- Auto-generated TypeScript client from Django OpenAPI schema
- Zod validation schemas (mirror backend validation)
- TanStack Query (vue-query) for data fetching

### Infrastructure
- Docker Compose for all services (Django, Frontend Vite dev server, PostgreSQL, Redis, Celery, Mailpit)
- PostgreSQL database
- Redis for caching and Celery broker
- Celery for async tasks
- Mailpit for local email testing

## Customization

### Modifying Templates

Edit templates in `.claude/templates/` to change:
- Plan structure
- Session organization
- TDD workflow steps
- Exit criteria

Changes apply to all future planned apps.

### Modifying the Slash Command

Edit `.claude/commands/plan-app.md` to:
- Change discovery questions
- Adjust session sizing rules
- Add new complexity levels
- Customize output format

## Example Workflow

```bash
# 1. Invoke planner
/plan-app

# Claude asks: "What app would you like to build?"
# User: "A task management app"

# Claude asks follow-up questions about complexity, features, etc.
# User answers...

# 2. Claude generates:
# - project-plans/tasks/REQUIREMENTS.md
# - project-plans/tasks/PROJECT_PLAN.md
# - project-plans/tasks/tasks/PHASE_1_BACKEND_FOUNDATION.md
# - project-plans/tasks/tasks/PHASE_2_FRONTEND_FOUNDATION.md
# - etc.

# 3. User reviews generated plans, edits if needed

# 4. Execute Session 1 (manually or with agents)
# Follow PHASE_1_BACKEND_FOUNDATION.md > Session 1
# - Write tests (RED)
# - Implement (GREEN)
# - Refactor (REFACTOR)
# - Check exit criteria
# - Commit

# 5. Execute Session 2
# Repeat...
```

## File Naming Conventions

Generated files follow this pattern:

```
project-plans/<app-name>/
├── REQUIREMENTS.md                          # Technical requirements
├── PROJECT_PLAN.md                          # High-level plan
└── tasks/
    ├── PHASE_1_BACKEND_FOUNDATION.md        # Backend sessions
    ├── PHASE_2_FRONTEND_FOUNDATION.md       # Frontend sessions
    ├── PHASE_3_INTEGRATION_TESTING.md       # Integration sessions
    └── PHASE_4_POLISH_DEPLOY.md             # Polish & deploy sessions
```

## Best Practices

### Before Planning
1. Have a clear app idea
2. Think through core features
3. Identify main entities (data models)
4. Consider user workflows

### During Discovery
1. Be specific in answers
2. Ask clarifying questions
3. Think about edge cases
4. Mention performance/scale needs

### During Execution
1. Follow TDD strictly (RED-GREEN-REFACTOR)
2. Work through sessions sequentially
3. Don't skip exit criteria
4. Commit after each session
5. Run type checking frequently

### After Planning
1. Review all generated plans
2. Edit/customize as needed
3. Ensure realistic timelines
4. Validate technical feasibility

## Troubleshooting

### Generated plan is too complex
- Choose "Basic" complexity during discovery
- Request fewer features
- Split into multiple smaller apps

### Sessions are too large
- Edit phase task documents manually
- Split large sessions into smaller ones
- Reduce number of entities per session

### Context fatigue mid-session
- Take a break between sessions
- Resume with: "Continue Session X from exit criteria"
- Claude will check progress and continue

### Plan doesn't match vision
- Edit `REQUIREMENTS.md` before starting
- Adjust phase task documents
- Re-run discovery with more specific answers

## Contributing

To improve the planning system:

1. **Add new question types**: Edit `plan-app.md` discovery section
2. **Improve templates**: Update template structure in `.claude/templates/`
3. **Add complexity presets**: Create new sections in `plan-app.md`
4. **Document patterns**: Add to `PLANNING_GUIDE.md`

## Support Resources

- **PLANNING_GUIDE.md**: Complete user guide for the planning system
- **PLANNING_TOOL_TRANSFORMATION.md**: Transformation roadmap and future features
- **ARCHITECTURE.md**: Project structure and patterns (root directory)
- **DEV_WORKFLOW.md**: Commands and workflows reference (root directory)
- **DEBUG_DOGMA.md**: Debugging patterns and lessons (root directory)

## Roadmap

See `PLANNING_TOOL_TRANSFORMATION.md` for upcoming features:
- Pre-built app templates (Blog, E-commerce, SaaS, etc.)
- Visual diagrams (Mermaid ERDs, workflow sequences)
- Agent integration for plan execution
- Complexity calculator
- Progress tracking

## Version History

- **v1.0**: Initial planning system
  - `/plan-app` slash command (renamed from `/scaffold-app`)
  - AI-driven discovery phase
  - Requirements generation
  - Session-based task breakdown
  - TDD workflow enforcement
  - Context budget management

---

**Ready to plan your app?** Run `/plan-app` to get started! 🚀
