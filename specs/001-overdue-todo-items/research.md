# Research: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-items`  
**Phase**: 0 — Outline & Research  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Research Task 1: Overdue Date Computation in JavaScript

**Question**: What is the correct, timezone-safe way to compute the overdue state in a
browser (React) using a date-only comparison?

### Decision
Use ISO date string comparison (`YYYY-MM-DD`) without constructing `Date` objects.

```js
// dateUtils.js
export function isOverdue(todo) {
  if (todo.completed || !todo.dueDate) return false;
  const today = new Date().toLocaleDateString('en-CA'); // → "YYYY-MM-DD" in local tz
  return todo.dueDate < today; // string lexicographic comparison is correct for YYYY-MM-DD
}
```

### Rationale
- `new Date(dateString)` where `dateString` is `YYYY-MM-DD` is parsed as **UTC midnight**,
  which causes off-by-one errors when the local timezone is behind UTC (e.g., US timezones).
  For example, `new Date('2026-03-24')` in UTC-5 displays as `2026-03-23` locally.
- `toLocaleDateString('en-CA')` formats the current local date as `YYYY-MM-DD` (Canada locale
  uses ISO date format), giving us the correct local calendar date without timezone shifts.
- String comparison of `YYYY-MM-DD` is lexicographically equivalent to chronological comparison.
  `'2026-03-23' < '2026-03-24'` is `true` — correct and cheap.
- The `todo.dueDate` field stored in the backend is already a `YYYY-MM-DD` string with no time
  component (confirmed in `todoService.js`).

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|-----------------|
| `new Date(todo.dueDate) < new Date()` | Parses `dueDate` as UTC midnight → off-by-one in negative-offset timezones |
| `Date.now()` comparison | Returns milliseconds; requires timezone-aware conversion |
| `dayjs` / `date-fns` library | Introduces a new dependency; unnecessary given the simplicity of the computation |
| Storing `isOverdue` in backend | Overdue is relative to "now" — would require real-time recomputation or TTL invalidation; derived state belongs on the client |

---

## Research Task 2: CSS Overdue Indicator — WCAG AA Compliance

**Question**: How should the overdue visual indicator be styled to satisfy FR-010
(color + text label) and NFR-001 (WCAG 2.1 AA, ≥ 4.5:1 contrast)?

### Decision
Two CSS changes:

1. **Card-level class** `.todo-card-overdue` — applies a subtle left border and light
   background tint using existing design tokens.
2. **Badge element** `.overdue-badge` — an inline `<span>` with "Overdue" text,
   styled as a pill/chip using `--danger-color`.

```css
/* App.css additions */
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
```

### Contrast Analysis
| Theme | Background (`--danger-color`) | Text | Contrast Ratio | Status |
|-------|-------------------------------|------|----------------|--------|
| Light | `#c62828` (solid fill) | `#ffffff` | ~5.9:1 | ✅ AA |
| Dark  | `#ef5350` (solid fill) | `#ffffff` | ~3.6:1 | ⚠️ |

**Dark mode resolution**: Use `#b71c1c` (deeper red) as the badge background in dark mode
to achieve ≥ 4.5:1 against white text:

```css
[data-theme="dark"] .overdue-badge {
  background-color: #c62828; /* deepens the badge in dark mode → ~5.9:1 */
}
```

Alternatively, since `--danger-color` in dark mode is `#ef5350`, we override the badge
specifically to use the light-mode danger value (`#c62828`) in dark mode, which is safe
because the badge background is solid (not `var(--bg-surface)`).

### Rationale
- Color alone is insufficient (FR-010 / NFR-001); the "Overdue" text label satisfies both
  color-blind users and screen reader users.
- Using `--danger-color` respects the design token system (Constitution Principle IV).
- The left border provides a secondary visual cue visible even in peripheral vision.
- `font-size: 12px` matches the existing caption size; `font-weight: 600` ensures legibility.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|-----------------|
| Red background on entire card | Too aggressive; degrades readability of title text |
| Outline/border only | Color alone prohibited by FR-010; no text label |
| Icon (⚠️) only | Color/icon alone prohibited by FR-010; no text label |
| New CSS custom property `--overdue-color` | Unnecessary complexity; `--danger-color` already correct semantic token |

---

## Research Task 3: Testing Date-Dependent Logic in Jest

**Question**: How do we write stable, deterministic tests for `isOverdue` and the
`TodoCard` overdue rendering when the result depends on the current date?

### Decision
Use Jest's **fake timers with `jest.setSystemTime()`** to freeze time at a known date.

```js
// In dateUtils.test.js and TodoCard.test.js:
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-03-24T12:00:00')); // "today" = 2026-03-24
});

afterAll(() => {
  jest.useRealTimers();
});
```

With time frozen at `2026-03-24`:
- `dueDate: '2026-03-23'` → overdue ✅
- `dueDate: '2026-03-24'` → NOT overdue (today is not overdue) ✅
- `dueDate: '2026-03-25'` → NOT overdue (future) ✅

### Rationale
- `jest.setSystemTime()` is the Jest-native, officially supported way to mock `Date` since
  Jest 27. It overrides `Date.now()`, `new Date()`, and `toLocaleDateString()` consistently.
- Tests become deterministic regardless of when CI runs.
- No third-party mocking libraries needed.
- Clean teardown with `jest.useRealTimers()` in `afterAll` prevents test pollution.

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|-----------------|
| Hard-coded dates far in the future (e.g., `2099-12-31`) | Brittle — breaks when that date arrives; also doesn't test "today is not overdue" boundary |
| Mock `Date` constructor manually | Fragile; Jest's built-in fake timers are more reliable and complete |
| `jest-date-mock` or `mockdate` packages | Third-party dependencies unnecessary when Jest 29 has native support |
| Relative date fixture (yesterday/today/tomorrow calculated at test time) | Requires computing relative dates in test setup, which re-introduces the `Date` usage we're testing |

---

## Summary of All Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | `isOverdue` uses `toLocaleDateString('en-CA')` for today's date | Avoids UTC parsing off-by-one; correct local calendar date |
| 2 | `isOverdue` extracted to `utils/dateUtils.js` | Constitution Principle III: components must be presentational; pure function is unit-testable in isolation |
| 3 | Badge uses `--danger-color` + dark-mode override for AA contrast | Respects design token system; achieves ≥ 4.5:1 in both themes |
| 4 | Both card class + badge rendered | FR-010: color treatment AND text label both required |
| 5 | `jest.setSystemTime()` for date mocking | Jest-native, deterministic, clean |
| 6 | No backend changes | Overdue is derived state; no persistence or API needed |
| 7 | No new npm dependencies | All required capabilities exist in current stack |
