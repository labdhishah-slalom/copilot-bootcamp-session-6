# Tasks: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-items`  
**Input**: Design documents from `/specs/001-overdue-todo-items/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅  
**Scope**: Frontend-only (`packages/frontend/`) — no backend changes required

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm the existing test suite is green before any changes are made

- [X] T001 Run baseline test suite — `npm test` in `packages/frontend` and `packages/backend` — confirm all existing tests pass before any changes

---

## Phase 2: Foundational — `isOverdue` Utility

**Purpose**: Core pure function that BOTH user stories depend on — must exist and be tested before any component work begins

**⚠️ TDD REQUIRED (Constitution Principle II)**: Write tests first, confirm they FAIL, then implement

- [X] T002 Write unit tests for `isOverdue` in `packages/frontend/src/utils/__tests__/dateUtils.test.js` — freeze time to `2026-03-24T12:00:00` using `jest.useFakeTimers()` / `jest.setSystemTime()`; cover all 5 truth-table cases from data-model.md (yesterday=true, today=false, tomorrow=false, no dueDate=false, completed+yesterday=false); run tests and confirm ALL FAIL (file does not exist yet)
- [X] T003 Implement `isOverdue(todo)` in `packages/frontend/src/utils/dateUtils.js` — use `toLocaleDateString('en-CA')` for timezone-safe local date; export as named export; run tests from T002 and confirm ALL PASS

**Checkpoint**: `isOverdue` utility is complete and fully tested — user story phases can now begin

---

## Phase 3: User Story 1 — Visual Overdue Indicator in Todo List (Priority: P1) 🎯 MVP

**Goal**: Incomplete todos with a past due date display a color treatment (red left border + tinted background) AND an "Overdue" text badge in the todo list view

**Independent Test**: Create an incomplete todo with yesterday's date; view the list; verify red border, background tint, and "Overdue" badge appear. Create a completed todo with yesterday's date; verify no badge.

**⚠️ TDD REQUIRED**: Write the component tests below FIRST, confirm they FAIL, then implement TodoCard changes

### Tests for User Story 1

- [X] T004 [US1] Add overdue rendering tests to `packages/frontend/src/components/__tests__/TodoCard.test.js` — freeze time (same pattern as T002); add 5 test cases: (1) overdue todo shows "Overdue" badge text, (2) overdue todo card has `todo-card-overdue` class, (3) completed todo with past date shows NO badge, (4) todo with no dueDate shows NO badge, (5) todo due today shows NO badge; run tests and confirm ALL NEW TESTS FAIL

### Implementation for User Story 1

- [X] T005 [P] [US1] Modify `packages/frontend/src/components/TodoCard.js` — import `isOverdue` from `../utils/dateUtils`; compute `const overdue = isOverdue(todo)` inside the component; conditionally add `todo-card-overdue` class to the card container div; conditionally render `<span className="overdue-badge">Overdue</span>` inside `.todo-content` after the title; run T004 tests and confirm ALL PASS
- [X] T006 [P] [US1] Add overdue CSS rules to `packages/frontend/src/App.css` — append `.todo-card-overdue` (4px solid left border + 8% danger color background tint using `color-mix`) and `.overdue-badge` (inline pill, 12px/600 weight, `--danger-color` background, white text, `--radius-sm` border-radius) and `[data-theme="dark"] .overdue-badge` (override background to `#c62828` for WCAG AA ≥4.5:1 contrast in dark mode); use design tokens from `theme.css` throughout — no hardcoded arbitrary colors

**Checkpoint**: User Story 1 is fully functional — overdue todos are visually distinguished in the list

---

## Phase 4: User Story 2 — Overdue Status Reflects Completion Changes (Priority: P2)

**Goal**: The overdue indicator is removed immediately when a todo is marked complete, and reappears immediately when marked incomplete again — driven by React re-render with the updated `completed` field

**Independent Test**: Toggle the completion status of an overdue todo; verify badge appears/disappears immediately without a page reload. No new implementation is required — behavior is inherited from `isOverdue` being evaluated at render time against the updated todo prop.

**⚠️ TDD**: Add tests first to confirm the behavior is correctly exercised

### Tests for User Story 2

- [X] T007 [US2] Add completion-toggle overdue tests to `packages/frontend/src/components/__tests__/TodoCard.test.js` — add 2 test cases: (1) a todo rendered with `completed=0` and past dueDate shows badge; re-render same component with `completed=1` and same past dueDate and verify badge is gone, (2) a todo rendered with `completed=1` and past dueDate shows no badge; re-render with `completed=0` and verify badge appears; run tests and confirm they PASS (no new implementation needed — behavior is already correct from T005)

**Checkpoint**: Both User Story 1 and User Story 2 are fully functional and tested

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate end-to-end correctness and coverage across the full feature

- [X] T008 [P] Run full frontend test suite — `npm test` in `packages/frontend` — confirm all tests pass (existing + new) and line coverage is ≥ 80% for `utils/dateUtils.js` and the modified component paths
- [X] T009 [P] Verify all 8 acceptance scenarios from `specs/001-overdue-todo-items/quickstart.md` manually in the browser — launch app (`npm start` in both packages), walk through each scenario row in the Acceptance Verification table and confirm expected outcomes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
  - T003 depends on T002: tests must fail before implementation
- **Phase 3 (US1, P1)**: Depends on Phase 2 completion (T003 done)
  - T004 must complete and fail before T005 implementation begins
  - T005 and T006 are parallel (different files, no shared dependency)
- **Phase 4 (US2, P2)**: Depends on Phase 3 completion (T005/T006 done)
  - T007 only; no new implementation needed
- **Phase 5 (Polish)**: Depends on Phase 4 — T008 and T009 are parallel

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately after Phase 2 — no dependency on US2
- **User Story 2 (P2)**: Depends on US1 (re-uses TodoCard.js overdue logic) — add tests only

### TDD Sequence (Required — Constitution Principle II)

```
T002: Write dateUtils.test.js  →  confirm ALL FAIL  →
T003: Implement dateUtils.js   →  confirm ALL PASS  →
T004: Write TodoCard tests     →  confirm NEW tests FAIL  →
T005: Modify TodoCard.js       →  confirm ALL PASS  →
T006: Add App.css styles       →  visual check in browser  →
T007: Write toggle tests       →  confirm PASS (no new impl)  →
T008+T009: Full validation
```

### Parallel Opportunities

- **Within Phase 3**: T005 (TodoCard.js) and T006 (App.css) can run in parallel — different files
- **Within Phase 5**: T008 (test suite) and T009 (browser verification) can run in parallel

---

## Parallel Example: User Story 1 (After T004 tests written)

```bash
# Stream A — Component logic
# Modify packages/frontend/src/components/TodoCard.js (T005)

# Stream B — Styles (independent file, no logic dependency)
# Modify packages/frontend/src/App.css (T006)

# After both complete:
npm test --prefix packages/frontend   # verify all T004 tests now pass
```

---

## Implementation Strategy

**MVP = Phase 3 (User Story 1 only)**  
Completing T001–T006 delivers the full core value: overdue todos are visually distinguishable.  
User Story 2 (T007) is a test-only addition confirming that React's re-render correctly removes/restores the indicator on completion toggle — it adds confidence and coverage, not new runtime behavior.

**Delivery order**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

No new npm packages, no backend changes, no API contract changes.
