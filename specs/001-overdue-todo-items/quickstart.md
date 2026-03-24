# Quickstart: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-items`  
**Phase**: 1 — Design & Contracts  
**Audience**: Developer implementing this feature from scratch

---

## Prerequisites

- Node.js ≥ 16 and npm ≥ 7 installed
- Repository cloned and dependencies installed:

```bash
npm install          # installs all packages via npm workspaces
```

---

## Running the App Locally

```bash
# Terminal 1 — backend
cd packages/backend
npm start            # Express server on http://localhost:3001

# Terminal 2 — frontend
cd packages/frontend
npm start            # React dev server on http://localhost:3000
```

The frontend proxies API calls to the backend (`/api/*`) automatically via `package.json`
proxy configuration.

---

## Running Tests

```bash
# Frontend tests (Jest + @testing-library/react)
cd packages/frontend
npm test             # runs all tests once with coverage report

# Backend tests (Jest + supertest)
cd packages/backend
npm test
```

Coverage reports output to `packages/frontend/coverage/` and `packages/backend/coverage/`.

---

## Files to Create/Modify for this Feature

### 1. Create `packages/frontend/src/utils/dateUtils.js` (NEW)

This is the canonical location for the `isOverdue` function per Constitution Principle III
(business logic out of components, into utilities).

**Write the test first** (`__tests__/dateUtils.test.js`), then implement the function.

Key requirements for `isOverdue`:
- Returns `false` when `todo.completed` is truthy
- Returns `false` when `todo.dueDate` is null or empty string
- Returns `false` when `todo.dueDate` equals today's date (not overdue on due day)
- Returns `true` when `todo.dueDate` is strictly before today's local calendar date
- Uses `toLocaleDateString('en-CA')` for timezone-safe local date (see research.md)

### 2. Create `packages/frontend/src/utils/__tests__/dateUtils.test.js` (NEW)

Freeze time using `jest.setSystemTime()` before tests run:

```js
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-03-24T12:00:00'));
});
afterAll(() => {
  jest.useRealTimers();
});
```

Test cases to cover (see data-model.md truth table):
- `completed=0`, yesterday's date → `isOverdue` returns `true`
- `completed=0`, today's date → `isOverdue` returns `false`
- `completed=0`, tomorrow's date → `isOverdue` returns `false`
- `completed=0`, no dueDate → `isOverdue` returns `false`
- `completed=1`, yesterday's date → `isOverdue` returns `false`

### 3. Modify `packages/frontend/src/components/TodoCard.js`

- Import `isOverdue` from `../utils/dateUtils`
- Compute `const overdue = isOverdue(todo)` inside the component
- Add `todo-card-overdue` class to the card div when `overdue` is true
- Render `<span className="overdue-badge">Overdue</span>` inside `.todo-content` when `overdue`

### 4. Modify `packages/frontend/src/components/__tests__/TodoCard.test.js`

Set up fake timers (same pattern as dateUtils test). Add test cases:
- Overdue todo shows badge with "Overdue" text
- Overdue todo card has `todo-card-overdue` class
- Completed todo with past date does NOT show badge
- Todo with no due date does NOT show badge
- Todo due today does NOT show badge

### 5. Modify `packages/frontend/src/App.css`

Add at end of file (after existing `.todo-card` rules):

```css
/* Overdue indicator styles */
.todo-card-overdue {
  border-left: 4px solid var(--danger-color);
  background-color: color-mix(in srgb, var(--danger-color) 8%, var(--bg-surface));
}

.overdue-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background-color: var(--danger-color);
  color: #ffffff;
  margin-left: var(--space-xs);
  vertical-align: middle;
}

[data-theme="dark"] .overdue-badge {
  background-color: #c62828; /* WCAG AA: ~5.9:1 against white in dark mode */
}
```

---

## TDD Sequence (Required by Constitution Principle II)

Follow this order strictly — tests must fail before implementation:

```
1. Write dateUtils.test.js  →  run tests  →  confirm ALL fail (isOverdue not yet defined)
2. Implement dateUtils.js   →  run tests  →  confirm ALL pass
3. Write TodoCard overdue tests (in TodoCard.test.js)  →  run  →  confirm new tests FAIL
4. Modify TodoCard.js       →  run tests  →  confirm ALL pass
5. Add CSS to App.css       →  visual verification in browser
6. Full test suite          →  npm test (all packages green, ≥ 80% coverage)
```

---

## Acceptance Verification

After implementation, manually verify these scenarios in the browser:

| Scenario | Expected |
|----------|----------|
| Incomplete todo, `dueDate = yesterday` | Red left border + "Overdue" badge visible |
| Incomplete todo, `dueDate = today` | No overdue indicator |
| Incomplete todo, no `dueDate` | No overdue indicator |
| Completed todo, `dueDate = yesterday` | No overdue indicator (strikethrough only) |
| Mark overdue todo as complete | Badge disappears immediately (no reload) |
| Unmark completed past-due todo | Badge reappears immediately |
| Edit overdue todo due date to tomorrow | Badge disappears immediately |
| Clear due date on overdue todo | Badge disappears immediately |

---

## Design Reference

- Overdue badge color: `--danger-color` (`#c62828` light / `#c62828` dark — see research.md)
- Badge font: `12px / 600` weight (caption size, bold — matches existing `.caption` style)
- Card border: `4px solid var(--danger-color)` on left edge
- All spacing via existing tokens from `theme.css`
