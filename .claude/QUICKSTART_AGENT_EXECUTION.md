# Quick Start: Automated Plan Execution

This guide shows you how to use the agent execution system to automatically build your application from a plan, with TDD enforcement and human-in-the-loop checkpoints.

## Prerequisites

1. **Plan created**: You must have a project plan (via `/plan-app`)
2. **Git repository**: Your project must be a git repo (for commits)
3. **Docker running**: Backend/frontend containers must be available

## 5-Minute Walkthrough

### Step 1: Create a Plan (if you haven't already)

```bash
# Interactive planning (recommended)
/plan-app

# Select template: blog
# Answer customization questions
# Creates: project-plans/my-blog/PROJECT_PLAN.md
#          project-plans/my-blog/REQUIREMENTS.md
```

### Step 2: Initialize Execution State

```bash
/initialize-project my-blog blog
```

**Output**:
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ PROJECT INITIALIZED: my-blog
│
│ App Type: blog
│ Total Phases: 4
│ Total Sessions: 11
│ Estimated Time: 30 hours
│ Estimated Tests: ~600 tests
└─────────────────────────────────────────────────────────────┘

PHASE BREAKDOWN:

Phase 1: Backend Foundation (4 sessions, 10.5h)
  Session 1: Models + Admin (2.5h)
  Session 2: Serializers + ViewSets (3h)
  Session 3: Permissions + Business Logic (2.5h)
  Session 4: Media Uploads + Optimization (2.5h)

Phase 2: Frontend Foundation (4 sessions, 10h)
  ...

NEXT STEPS:

1. Review the plan:
   cat project-plans/my-blog/PROJECT_PLAN.md

2. Start execution:
   /execute-session my-blog 1

STATE FILE: project-plans/my-blog/.agent-state.json
```

### Step 3: Execute Session 1 (Models + Admin)

```bash
/execute-session my-blog 1
```

**What happens**:

#### Checkpoint 1: BEFORE_START

```
┌─────────────────────────────────────────────────────────────┐
│ CHECKPOINT: BEFORE START                                    │
│ Session 1: Models + Admin                                   │
└─────────────────────────────────────────────────────────────┘

I will now:
1. Create Django app 'blog'
2. Write comprehensive tests for Post, Comment, Category, Tag models
3. Tests will FAIL initially (that's expected!)

Estimated time: ~45 minutes (RED phase)

What would you like to do?

1. ✅ Start Session (proceed with RED phase)
2. ⏭️  Skip Session
3. ⏸️  Pause
```

**You type**: `1` (Start Session)

#### RED Phase Execution

```
🔴 RED PHASE - Writing tests...

[Agent launches backend-builder]
[Agent reads REQUIREMENTS.md]
[Agent writes comprehensive tests]
[Agent runs tests - they all FAIL]

✓ RED phase complete
```

#### Checkpoint 2: AFTER_RED

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ RED PHASE COMPLETE                                        │
│                                                              │
│ Tests written: 72                                            │
│ Tests failing: 72 (expected!)                                │
│                                                              │
│ Files created:                                               │
│   - backend/apps/blog/__init__.py                            │
│   - backend/apps/blog/tests/test_models.py                   │
│   - backend/apps/blog/tests/conftest.py                      │
│                                                              │
│ Sample tests:                                                │
│   - test_create_post_with_valid_data                         │
│   - test_post_title_required                                 │
│   - test_post_slug_auto_generated                            │
│   - test_post_status_choices                                 │
│   - test_comment_nesting                                     │
└─────────────────────────────────────────────────────────────┘

All tests are FAILING (as expected in RED phase!)

What would you like to do?

1. ✅ Proceed to GREEN phase (implement models)
2. 🔄 Revise tests (I want to modify them first)
3. ⏭️  Skip this session
```

**You type**: `1` (Proceed to GREEN)

#### GREEN Phase Execution

```
🟢 GREEN PHASE - Implementing models...

[Agent launches backend-builder]
[Agent reads failing tests]
[Agent implements models to pass tests]
[Agent creates migrations]
[Agent runs tests - they all PASS]
[Agent measures coverage]

✓ GREEN phase complete
```

#### Checkpoint 3: AFTER_GREEN

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ GREEN PHASE COMPLETE                                      │
│                                                              │
│ Tests: 72/72 passing ✓                                      │
│ Coverage: 93%                                                │
│                                                              │
│ Files created/modified:                                      │
│   - backend/apps/blog/models.py                              │
│   - backend/apps/blog/admin.py                               │
│   - backend/apps/blog/migrations/0001_initial.py             │
│   - backend/config/settings/base.py (added 'blog' to INSTALLED_APPS) │
│                                                              │
│ Models implemented:                                          │
│   ✓ Post (with auto-slug, status workflow)                  │
│   ✓ Comment (with nested replies)                           │
│   ✓ Category (with unique slug)                             │
│   ✓ Tag (with unique slug)                                  │
└─────────────────────────────────────────────────────────────┘

All tests PASSING! Ready to refactor.

What would you like to do?

1. ✅ Proceed to REFACTOR phase (improve code quality)
2. ✅ Skip refactor (code is good enough)
3. 🔄 Modify implementation (I want to change something)
```

**You type**: `1` (Proceed to REFACTOR)

#### REFACTOR Phase Execution

```
🔵 REFACTOR PHASE - Improving code quality...

[Agent launches backend-builder]
[Agent adds docstrings]
[Agent adds type hints]
[Agent optimizes queries]
[Agent runs tests - still PASS]

✓ REFACTOR phase complete
```

#### Checkpoint 4: AFTER_REFACTOR

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ REFACTOR PHASE COMPLETE                                   │
│                                                              │
│ Improvements made:                                           │
│   ✓ Added comprehensive docstrings to all models            │
│   ✓ Added type hints to all methods                         │
│   ✓ Added database indexes for common queries               │
│   ✓ Optimized __str__ methods                               │
│                                                              │
│ Tests: 72/72 passing ✓                                      │
│ Coverage: 93%                                                │
│ Type checking: PASS ✓                                       │
└─────────────────────────────────────────────────────────────┘

Ready to commit!

What would you like to do?

1. ✅ Commit & Continue (create git commit and mark session complete)
2. 🔄 Further refactoring (I want to improve more)
```

**You type**: `1` (Commit)

#### Git Commit

```
Creating git commit...

git add backend/apps/blog/
git commit -m "feat: implement blog models + admin

Completed Session 1: Models + Admin

Phase: Backend Foundation
Tests: 72/72 passing
Coverage: 93%
Time: 1.5h (estimated: 2.5h)

Files modified:
- backend/apps/blog/models.py
- backend/apps/blog/admin.py
- backend/apps/blog/tests/test_models.py
- backend/apps/blog/migrations/0001_initial.py

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

✓ Commit created: a1b2c3d
```

#### Checkpoint 5: SESSION_COMPLETE

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ SESSION 1 COMPLETE: Models + Admin                       │
│                                                              │
│ Tests: 72/72 passing ✓                                      │
│ Coverage: 93%                                                │
│ Time: 1.5h (estimated: 2.5h) - 40% faster! 🎉             │
│ Commit: a1b2c3d                                              │
│                                                              │
│ Overall Progress: 1/11 sessions complete (9%)                │
│                  Phase 1: 1/4 complete (25%)                 │
└─────────────────────────────────────────────────────────────┘

What would you like to do?

1. ✅ Continue to Session 2 (Serializers + ViewSets)
2. ⏸️  Pause execution (resume later with /execute-session my-blog 2)
3. 📊 Show overall progress (/show-progress my-blog)
```

**You type**: `1` (Continue)

[Process repeats for Session 2...]

### Step 4: Check Progress Anytime

```bash
/show-progress my-blog
```

**Output**:
```
┌─────────────────────────────────────────────────────────────┐
│ PROJECT PROGRESS: my-blog                                   │
│                                                              │
│ Status: in_progress                                          │
│ Progress: 2/11 sessions (18%)                                │
│ Current: Phase 1, Session 3                                  │
└─────────────────────────────────────────────────────────────┘

OVERALL METRICS:

  Tests: 162/162 passing
  Coverage: 92% average
  Time: 3.2h spent / 30h estimated
  Remaining: ~26.8h

PHASE BREAKDOWN:

Phase 1: Backend Foundation [in_progress]
  Sessions: 2/4 complete

  ✓ Session 1: Models + Admin
    ✓ 72/72 tests, 93% coverage, 1.5h

  ✓ Session 2: Serializers + ViewSets
    ✓ 90/90 tests, 92% coverage, 1.7h

  ⏳ Session 3: Permissions + Business Logic
    🔴 RED phase, 60 tests written

  ○ Session 4: Media Uploads + Optimization
    ⏸️  Not started

NEXT STEPS:

⏸️  Paused at checkpoint: after_red

Resume execution:
  /execute-session my-blog 3
```

## User Control Points

You have full control at every checkpoint:

### At BEFORE_START
- **Start**: Proceed with RED phase
- **Skip**: Skip this session entirely
- **Pause**: Stop and resume later

### At AFTER_RED
- **Implement**: Proceed to GREEN phase
- **Revise Tests**: Modify tests yourself, then resume
- **Retry RED**: Agent rewrites tests
- **Skip**: Skip session

### At AFTER_GREEN
- **Refactor**: Proceed to REFACTOR phase
- **Skip Refactor**: Jump to commit
- **Modify**: Change implementation yourself
- **Retry GREEN**: Agent re-implements

### At AFTER_REFACTOR
- **Commit**: Create git commit and complete session
- **Further Refactoring**: Agent improves more
- **Retry REFACTOR**: Agent refactors again

### At SESSION_COMPLETE
- **Continue**: Proceed to next session
- **Pause**: Stop execution
- **Show Progress**: View overall stats

## What If Something Goes Wrong?

### Tests Fail in GREEN Phase

```
❌ GREEN PHASE FAILED

Tests: 58/72 passing
Failing tests:
  - test_post_publish_workflow
  - test_comment_approval_required
  ...

Error: AssertionError in test_post_publish_workflow
  Expected published_at to be set, got None

What would you like to do?

1. 🔄 Retry GREEN phase (agent will fix the failures)
2. 🔧 Fix manually (I'll modify the code myself)
3. ⏸️  Pause (stop and debug)
```

### Coverage Below Target

```
⚠️  COVERAGE WARNING

Coverage: 87% (target: 90%)

Missing coverage in:
  - backend/apps/blog/models.py lines 45-52 (publish workflow)

What would you like to do?

1. ✅ Accept lower coverage (proceed anyway)
2. 🔄 Add more tests (agent will write additional tests)
3. 🔧 I'll add tests manually
```

### Blocker Detected

```
🚫 BLOCKER: Missing Dependency

Session 5 (API Client + Zod Schemas) requires:
  - Session 3 (Permissions + Business Logic) - INCOMPLETE
  - Session 4 (Media Uploads + Optimization) - INCOMPLETE

Cannot proceed until dependencies are complete.

Next: /execute-session my-blog 3
```

## Pro Tips

1. **Review tests before implementing**: At AFTER_RED checkpoint, review the tests to ensure they match your expectations

2. **Customize at checkpoints**: You can pause and modify files manually at any checkpoint, then resume

3. **Monitor progress**: Use `/show-progress` frequently to see overall status

4. **Resume anytime**: If interrupted, just run `/execute-session <project> <session>` to pick up where you left off

5. **Trust but verify**: The agent follows TDD strictly, but review the code at each checkpoint

## Common Workflows

### Execute One Session at a Time
```bash
/initialize-project my-blog blog
/execute-session my-blog 1
# Review, approve at checkpoints
/execute-session my-blog 2
# Review, approve at checkpoints
...
```

### Execute Entire Phase (Future: Phase 3.4)
```bash
/initialize-project my-blog blog
/execute-phase my-blog 1
# Agent executes all 4 sessions in Phase 1
# You approve at each checkpoint
```

### Resume After Interruption
```bash
# Session 3 was in progress when you stopped
/show-progress my-blog
# Shows: Session 3, RED phase, awaiting_approval

/execute-session my-blog 3
# Picks up at the checkpoint where you left off
```

## What Gets Created

After Session 1 completes, you'll have:

```
backend/
  apps/
    blog/
      __init__.py
      apps.py
      models.py              # Post, Comment, Category, Tag models
      admin.py               # Admin registrations
      tests/
        __init__.py
        conftest.py          # pytest fixtures
        test_models.py       # 72 comprehensive tests
      migrations/
        0001_initial.py      # Initial migration

project-plans/
  my-blog/
    PROJECT_PLAN.md
    REQUIREMENTS.md
    .agent-state.json        # Execution state (updated)
```

And a git commit:
```
a1b2c3d feat: implement blog models + admin
```

## Next Steps

After completing all sessions:
- **Deploy**: Your app is fully built, tested, and ready to deploy
- **Customize**: Add optional enhancements from PROJECT_PLAN.md
- **Extend**: Use the same system to build additional features

---

**That's it!** The agent handles all the TDD workflow, you just approve at checkpoints and review the code. 🚀

Happy building!
