import { isOverdue } from '../dateUtils';

describe('isOverdue', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-24T12:00:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns true for incomplete todo with yesterday due date', () => {
    const todo = { completed: 0, dueDate: '2026-03-23' };
    expect(isOverdue(todo)).toBe(true);
  });

  it('returns false for incomplete todo with today due date', () => {
    const todo = { completed: 0, dueDate: '2026-03-24' };
    expect(isOverdue(todo)).toBe(false);
  });

  it('returns false for incomplete todo with tomorrow due date', () => {
    const todo = { completed: 0, dueDate: '2026-03-25' };
    expect(isOverdue(todo)).toBe(false);
  });

  it('returns false for incomplete todo with no dueDate', () => {
    const todo = { completed: 0, dueDate: null };
    expect(isOverdue(todo)).toBe(false);
  });

  it('returns false for completed todo with yesterday due date', () => {
    const todo = { completed: 1, dueDate: '2026-03-23' };
    expect(isOverdue(todo)).toBe(false);
  });
});
