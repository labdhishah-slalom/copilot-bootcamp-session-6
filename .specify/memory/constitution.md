<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Added sections:
  - Core Principles (I–V, derived from docs/ guidelines)
  - Technology Stack
  - Development Workflow
  - Governance
Templates reviewed:
  - .specify/templates/plan-template.md ✅ no updates needed (Constitution Check section present)
  - .specify/templates/spec-template.md ✅ no updates needed
  - .specify/templates/tasks-template.md ✅ no updates needed
Deferred TODOs: none
-->

# Copilot Bootcamp Todo App Constitution

## Core Principles

### I. Code Quality & Simplicity (NON-NEGOTIABLE)

All code MUST follow DRY, KISS, and SOLID principles at all times.

- **DRY**: Common logic MUST be extracted into shared utilities or components;
  duplication across modules is not permitted.
- **KISS**: The simplest correct solution MUST be chosen. Premature optimization
  and over-engineering are prohibited.
- **Single Responsibility**: Every module, component, and function MUST have
  exactly one reason to change.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for
  components/classes, `UPPER_SNAKE_CASE` for constants. Names MUST be
  descriptive — abbreviations and single-letter identifiers (outside loops) are
  forbidden.
- **Formatting**: 2-space indentation, LF line endings, no trailing whitespace,
  lines SHOULD stay under 100 characters.

### II. Test-Driven Development (NON-NEGOTIABLE)

Tests MUST be written before implementation code.

- Tests describe expected behavior; they MUST fail before implementation and
  pass after.
- **Coverage target**: 80%+ across all packages; coverage reports MUST be
  reviewed on every PR.
- Unit tests MUST be isolated — no shared state between tests, all external
  dependencies MUST be mocked.
- Integration tests MUST cover component interactions and API communication.
- Test files MUST be co-located in `__tests__/` directories beside source files
  and named `{filename}.test.js`.
- End-to-end tests are out of scope for the current phase.

### III. Component Architecture & File Structure

The monorepo structure MUST be respected; frontend and backend are independent
packages with no cross-package imports.

- **Frontend** (`packages/frontend/src/`): React components live in
  `components/`, API interactions in `services/`, and utilities in `utils/`.
  Components MUST be presentational only — they MUST NOT contain data-fetching
  or business logic inline.
- **Backend** (`packages/backend/src/`): Route handlers, service layer, and
  middleware MUST be kept in separate files. No business logic inside route
  handlers.
- Import order MUST be: external libraries → internal modules → styles, with a
  blank line between each group.
- Circular dependencies are prohibited.

### IV. UI Consistency & Accessibility

The UI MUST adhere to the design system defined in `docs/ui-guidelines.md`.

- **Design tokens**: All colors MUST come from the defined palette (Halloween
  theme: orange `#ff6b35` / `#ff8c42`, purple `#9d4edd`). Hard-coded arbitrary
  color values are prohibited.
- **Spacing**: All spacing MUST follow the 8px grid (xs=8px, sm=16px, md=24px,
  lg=32px, xl=48px).
- **Typography**: Font sizes and weights from the system (body 16px, caption
  12px, headings 28px/18px) MUST be used consistently.
- **Accessibility**: All interactive elements MUST be keyboard-accessible; color
  contrast MUST meet WCAG AA standards; icon buttons MUST have descriptive
  `aria-label` or `title` attributes.
- **Dark/Light mode**: User preference MUST be persisted in `localStorage` and
  default to the system preference on first visit.

### V. Persistence & API Integrity

All user-facing state changes MUST be persisted to the backend immediately.

- The frontend MUST communicate with the backend exclusively through the
  Express.js REST API; no local-only state mutations for todo data are permitted.
- The backend MUST validate all input at API boundaries (title max 255 chars,
  expected types).
- Delete operations MUST be guarded by a confirmation dialog before issuing the
  API call.
- Single-user scope: no authentication or user-identification logic is required
  or permitted at this stage.

## Technology Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React, CSS                    |
| Backend   | Node.js, Express.js           |
| Testing   | Jest, @testing-library/react  |
| Monorepo  | npm workspaces                |
| Runtime   | Node.js ≥ 16, npm ≥ 7        |

Technology choices MUST NOT be changed without a constitution amendment.
Third-party packages MUST be evaluated for security (OWASP Top 10) before
adoption.

## Development Workflow

- **Linting**: ESLint MUST pass with zero errors before any commit. All
  auto-fixable issues SHOULD be resolved with `npm run lint:fix`.
- **Pre-commit gate**: Linting and all tests MUST be green before opening a
  pull request.
- **Commit messages**: MUST be descriptive and reference the relevant feature
  or bug. Format: `type: short description` (e.g., `feat: add due date to todo
  form`, `fix: prevent crash on empty title`).
- **Branch names**: MUST follow the pattern `###-feature-name` (e.g.,
  `001-create-todo`).
- **Code review**: All PRs MUST verify compliance with these principles before
  merge.

## Governance

This constitution supersedes all other informal practices. Any deviation MUST
be explicitly justified and documented.

- **Amendments** require: (1) a written rationale, (2) update to this file with
  version bump, and (3) propagation to affected templates and documentation.
- **Version policy**: MAJOR for principle removals or redefinitions; MINOR for
  new principles or sections; PATCH for clarifications and wording fixes.
- **Compliance review**: Performed on every PR as part of the Constitution Check
  gate in `plan.md`.
- For day-to-day guidance, refer to `docs/coding-guidelines.md`,
  `docs/testing-guidelines.md`, `docs/ui-guidelines.md`, and
  `docs/functional-requirements.md`.

**Version**: 1.0.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
