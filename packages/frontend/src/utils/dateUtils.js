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
