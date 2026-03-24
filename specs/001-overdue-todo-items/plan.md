# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todo-items` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-overdue-todo-items/spec.md`

## Summary

Incomplete todo items with a due date strictly before today's calendar date must be visually
distinguished in the existing todo list via a color treatment (red/amber) AND a visible "Overdue"
text badge. The overdue state is a **derived, read-only, frontend-only property** — computed at
render time from `todo.completed`, `todo.dueDate`, and the current local date. No backend or
schema changes are required.

## Technical Context

**Language/Version**: JavaScript — Node.js ≥ 16 (backend), React 18.2 (frontend)  
**Primary Dependencies**: React 18, Express.js 4, better-sqlite3 11, Jest 29, @testing-library/react  
**Storage**: SQLite via better-sqlite3 (backend). Overdue state is derived — NOT stored.  
**Testing**: Jest + @testing-library/react (frontend), Jest + supertest (backend)  
**Target Platform**: Modern web browser (single-user, macOS dev environment)  
**Project Type**: Web application — npm workspaces monorepo (packages/frontend + packages/backend)  
**Performance Goals**: O(1) overdue check per item; no perceptible latency impact  
**Constraints**: WCAG 2.1 AA, date-only comparison (no time-of-day), immediate UI update on interaction  
**Scale/Scope**: Single-user todo application; frontend-only change for this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. DRY / KISS / Single Responsibility | ✅ PASS | `isOverdue` extracted to `utils/dateUtils.js`; single pure function, no duplication |
| I. Naming conventions | ✅ PASS | `isOverdue`, `overdueBadge`, follow camelCase/PascalCase rules |
| II. TDD — tests before implementation | ✅ PASS | Tasks must order tests before source code; plan enforces this ordering |
| II. Coverage target ≥ 80% | ✅ PASS | New utility + modified component paths covered by unit tests |
| II. Test isolation / mocking | ✅ PASS | `jest.useFakeTimers()` / `jest.setSystemTime()` used to mock current date |
| III. Components presentational only | ✅ PASS | `isOverdue()` logic lives in `utils/dateUtils.js`, not inline in `TodoCard` |
| III. Monorepo boundaries respected | ✅ PASS | Frontend-only change; no cross-package imports added |
| IV. Design tokens for colors | ✅ PASS | Uses `--danger-color` from `theme.css`; no hardcoded arbitrary colors |
| IV. WCAG AA accessibility | ✅ PASS | Color + text label (FR-010); contrast ≥ 4.5:1 via existing danger tokens |
| V. No local-only state mutations | ✅ PASS | Overdue is derived at render time; no new persistence or API calls |

**Gate result: ALL PASS — proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todo-items/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

> No `contracts/` directory — this feature introduces no new public API endpoints or
> external-facing interfaces. The overdue state is a derived, frontend-only computed value.

### Source Code (repository root)

```text
packages/frontend/src/
├── utils/
│   ├── dateUtils.js                   # NEW: isOverdue(todo) pure utility function
│   └── __tests__/
│       └── dateUtils.test.js          # NEW: unit tests for isOverdue
├── components/
│   ├── TodoCard.js                    # MODIFIED: render overdue badge + card class
│   └── __tests__/
│       └── TodoCard.test.js           # MODIFIED: add overdue indicator test cases
└── App.css                            # MODIFIED: .todo-card-overdue + .overdue-badge styles
```

Backend (`packages/backend/`) is **not modified** — overdue state is not stored or served.

**Structure Decision**: Web application layout — frontend and backend are independent npm
packages in a monorepo. This feature touches only `packages/frontend/`. No new packages,
no new backend files.

## Complexity Tracking

> No constitution violations — complexity tracking table not applicable.
