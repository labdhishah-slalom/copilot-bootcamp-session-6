# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-items`  
**Created**: 2026-03-24  
**Status**: Draft  
**Input**: User description: "Support for Overdue Todo Items — Users need a clear, visual way to identify which todos have not been completed by their due date."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Overdue Indicator in Todo List (Priority: P1)

When a user opens their todo list, any incomplete todo item whose due date has already passed is immediately visually distinguishable from non-overdue items — without the user needing to manually compare dates. The overdue state is clearly signalled through a visual treatment such as a distinct color, label, or icon.

**Why this priority**: This is the core value of the feature. Without this baseline visual distinction, the feature delivers no benefit. All other stories depend on correctly identifying overdue items first.

**Independent Test**: Can be fully tested by creating an incomplete todo with a past due date, viewing the todo list, and verifying the overdue visual indicator appears on that item while normal items are unaffected.

**Acceptance Scenarios**:

1. **Given** an incomplete todo with a due date of yesterday, **When** the user views the todo list, **Then** that todo displays a clear visual overdue indicator (e.g., distinct styling, "Overdue" label, or warning color).
2. **Given** an incomplete todo with a due date of today, **When** the user views the todo list, **Then** that todo does NOT display an overdue indicator.
3. **Given** an incomplete todo with no due date, **When** the user views the todo list, **Then** that todo does NOT display an overdue indicator.
4. **Given** a completed todo with a due date of yesterday, **When** the user views the todo list, **Then** that todo does NOT display an overdue indicator.

---

### User Story 2 - Overdue Status Reflects Completion Changes (Priority: P2)

When a user marks an overdue todo as complete, the overdue indicator is removed immediately. Conversely, if a user marks a previously completed past-due todo as incomplete again, the overdue indicator reappears. This ensures the overdue state is always consistent with the current completion status.

**Why this priority**: Without this, the UI becomes misleading. A completed todo showing as overdue creates confusion and erodes trust in the indicator. This story is necessary for the feature to be correct and trustworthy.

**Independent Test**: Can be fully tested by toggling the completion status of an overdue todo and verifying the overdue indicator appears and disappears respectively.

**Acceptance Scenarios**:

1. **Given** an incomplete todo currently displaying an overdue indicator, **When** the user marks it as complete, **Then** the overdue indicator is removed immediately without a page reload.
2. **Given** a completed todo with a past due date (no overdue indicator), **When** the user marks it as incomplete, **Then** the overdue indicator reappears immediately.

---

### Edge Cases

- **Todo due exactly today**: A todo with today's date as the due date is NOT overdue — due date must be strictly before today.
- **Todo with no due date**: Never treated as overdue, regardless of when it was created.
- **All todos overdue**: The entire list may display overdue indicators; no special handling beyond per-item styling required.
- **No todos overdue**: The list renders normally with no overdue indicators shown.
- **Overdue todo that is edited**: If a user updates the due date of an overdue todo to a future date, the overdue indicator must be removed immediately.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST visually distinguish incomplete todo items whose due date is strictly before the current date.
- **FR-002**: A todo item is considered overdue only when ALL of the following are true: it is not completed, it has a due date set, and its due date is before today's date.
- **FR-003**: Completed todo items MUST NOT display an overdue indicator, even if their due date has passed.
- **FR-004**: Todo items without a due date MUST NOT display an overdue indicator.
- **FR-005**: A todo item due on today's date MUST NOT display an overdue indicator.
- **FR-006**: The overdue indicator MUST be visible in the default todo list view without requiring any additional user action (e.g., no hover, no extra click).
- **FR-007**: The overdue status of a todo MUST update immediately when a user changes its completion status, without requiring a page reload.
- **FR-008**: The overdue status of a todo MUST update immediately when a user changes its due date to a future date.
- **FR-009**: The overdue determination MUST be based on the current local date at the time the list is rendered.

### Key Entities

- **Todo Item**: Represents a task with a title, optional due date, and a completion status. The overdue state is a derived property — not stored, but computed at display time based on the due date and completion status.
- **Overdue State**: A derived, read-only property of a Todo Item. It evaluates to `true` when the item is incomplete, has a due date, and that due date is before today's date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify all overdue todos in the list at a glance, with no manual date comparison required, within 5 seconds of opening the todo list.
- **SC-002**: Zero overdue indicators are shown on completed todos or todos without due dates, across all tested scenarios.
- **SC-003**: Overdue indicators accurately reflect the current date — items due today are never flagged, and items due yesterday are always flagged — verified on a new page load.
- **SC-004**: 100% of overdue indicators update correctly and immediately (no page reload needed) when a user toggles the completion status of an overdue todo.
- **SC-005**: Users report reduced time spent manually scanning due dates to find overdue tasks compared to the baseline experience without this feature.

## Assumptions

- "Overdue" is defined as a due date strictly before today's date; a todo due today is not overdue.
- The application is single-user, so timezone handling defaults to the user's local browser date — no multi-timezone support is required.
- The overdue state is a derived/computed value and does not need to be persisted to the backend.
- No separate "overdue" filter view or dedicated overdue section is required — visual distinction within the existing list is sufficient.
- No push notifications, email alerts, or sound cues are in scope for this feature.
- The existing todo data model already supports optional due dates, consistent with the current functional requirements.
