# Data Model: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-items`  
**Phase**: 1 — Design & Contracts  
**Status**: Complete

---

## Entities

### Todo Item (existing — no schema change)

The backend SQLite schema is **not modified**. The overdue state is derived at display time.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | integer | ✅ | Auto-increment primary key |
| `title` | string | ✅ | Max 255 characters |
| `dueDate` | string \| null | ❌ | Calendar date as `YYYY-MM-DD`; no time component |
| `completed` | integer (0/1) | ✅ | `0` = incomplete, `1` = complete |
| `createdAt` | string | ✅ | ISO datetime, set by backend on creation |

---

## Derived Property: Overdue State

`isOverdue` is a **computed, read-only, frontend-only property** evaluated at render time.
It is **not stored** in the database, not returned by the API, and not part of the backend
data model.

### Definition

```
isOverdue(todo) → boolean

= true  iff  todo.completed === 0 (or falsy)
          AND todo.dueDate is not null/empty
          AND todo.dueDate < today's local calendar date (YYYY-MM-DD string)
```

### Implementation (canonical)

Located in `packages/frontend/src/utils/dateUtils.js`:

```js
/**
 * Returns true if the given todo item is overdue.
 * A todo is overdue when it is incomplete, has a due date,
 * and that due date is strictly before today's local calendar date.
 *
 * @param {Object} todo
 * @param {number} todo.completed  - 0 = incomplete, 1 = complete
 * @param {string|null} todo.dueDate - YYYY-MM-DD or null
 * @returns {boolean}
 */
export function isOverdue(todo) {
  if (todo.completed || !todo.dueDate) return false;
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
  return todo.dueDate < today;
}
```

### Truth Table

| `completed` | `dueDate` | `dueDate` vs today | `isOverdue` |
|-------------|-----------|-------------------|-------------|
| `0` | `'2026-03-23'` (yesterday) | before | **`true`** |
| `0` | `'2026-03-24'` (today) | equal | `false` |
| `0` | `'2026-03-25'` (tomorrow) | after | `false` |
| `0` | `null` | — | `false` |
| `1` | `'2026-03-23'` (yesterday) | before | `false` |
| `1` | `null` | — | `false` |

*(Evaluated with today = `2026-03-24`)*

---

## State Transitions for Overdue Indicator

```
Incomplete todo, past dueDate
        │
        ▼
  [ isOverdue = true ]  ←──────────────────────────┐
        │                                           │
        │ User marks complete                       │ User marks incomplete
        ▼                                           │
  [ isOverdue = false ] ─── user unmarks ──────────┘
        │
        │ User edits dueDate to future date
        ▼
  [ isOverdue = false ]

        │ User clears dueDate (sets to null)
        ▼
  [ isOverdue = false ]  (no due date → never overdue)
```

All transitions take effect **immediately on re-render** — triggered by React state update
in `App.js` when `todos` list is updated after a toggle or edit API call.

---

## Visual Representation in UI

### TodoCard rendering (logic)

```
if isOverdue(todo):
  card className += ' todo-card-overdue'
  render <span className="overdue-badge">Overdue</span>
         inside .todo-content, after the title
```

### CSS additions to App.css

| Class | Purpose | Token used |
|-------|---------|------------|
| `.todo-card-overdue` | Card-level color treatment (border + tint) | `--danger-color` |
| `.overdue-badge` | Inline text badge ("Overdue") | `--danger-color` |

### Accessibility (NFR-001)

- The "Overdue" badge text is readable by screen readers without additional `aria-*` attributes.
- Color is never the sole indicator — the text label satisfies WCAG 2.1 SC 1.4.1.
- The badge is always visible (not hover-dependent), satisfying FR-006.
- Contrast ≥ 4.5:1 achieved via explicit dark-mode override (see research.md Task 2).

---

## Files Changed Summary

| File | Change type | Description |
|------|-------------|-------------|
| `packages/frontend/src/utils/dateUtils.js` | **NEW** | `isOverdue(todo)` pure function |
| `packages/frontend/src/utils/__tests__/dateUtils.test.js` | **NEW** | Unit tests for `isOverdue` |
| `packages/frontend/src/components/TodoCard.js` | **MODIFIED** | Import `isOverdue`; add badge + card class |
| `packages/frontend/src/components/__tests__/TodoCard.test.js` | **MODIFIED** | Add overdue rendering test cases |
| `packages/frontend/src/App.css` | **MODIFIED** | `.todo-card-overdue` and `.overdue-badge` styles |

No backend files changed.
