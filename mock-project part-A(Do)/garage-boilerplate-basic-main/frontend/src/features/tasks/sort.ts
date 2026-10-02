import type { Task } from '@/types/firestore'

type SortableTask = Pick<Task, 'dueDate' | 'createdAt'>

/**
 * List order from spec A3 (ADR-0003): earliest due date first, ties by createdAt (oldest
 * first), tasks with no due date last. Sorted here because Firestore orderBy puts null first.
 */
export function compareTasks(a: SortableTask, b: SortableTask): number {
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === null) return 1
    if (b.dueDate === null) return -1
    // 'YYYY-MM-DD' strings sort the same as the dates they name.
    return a.dueDate < b.dueDate ? -1 : 1
  }
  return a.createdAt.toMillis() - b.createdAt.toMillis()
}

/** Returns a sorted copy; does not mutate `tasks`. */
export function sortTasks<T extends SortableTask>(tasks: readonly T[]): T[] {
  return [...tasks].sort(compareTasks)
}
