import type { ActionResult } from '@/types'

/** The task form's fields: the ones a refusal can name, so its message shows beside them. */
export type TaskField = 'title' | 'description' | 'dueDate'

/**
 * What every task Server Action returns: `ActionResult` plus the one field that failed,
 * if any, so a check only the server can make (the due-date rules) shows beside its field.
 * `ActionResult` itself stays unchanged (ADR-0006).
 */
export interface TaskActionResult<T = undefined> extends ActionResult<T> {
  field?: TaskField
}
