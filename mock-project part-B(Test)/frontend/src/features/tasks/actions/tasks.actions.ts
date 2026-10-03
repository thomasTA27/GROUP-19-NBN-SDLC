'use server'

import { Timestamp } from 'firebase-admin/firestore'
import type { DocumentReference, Transaction } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import {
  TASK_MESSAGES,
  createTaskRequestSchema,
  deleteTaskRequestSchema,
  dueDateRangeError,
  setTaskStatusRequestSchema,
  toTaskRefusal,
  updateTaskRequestSchema,
} from '@/features/tasks/schemas'
import type { TaskActionResult } from '@/features/tasks/types'

// What an action's write step decides inside the transaction: refuse, or the fields to update.
type WriteDecision = { refusal: TaskActionResult } | { update: Record<string, unknown> }

/**
 * Runs one write to an existing task inside a transaction (ADR-0005, rule 3): read the task,
 * check it exists, belongs to `uid` and isn't deleted, then let `decide` choose the update.
 * A missing, foreign or deleted task all give the same taskGone refusal, so they can't be told
 * apart (AC-1.3, AC-7.4). The outcome is returned as a value, never thrown. The SDK may run
 * the callback again, so it has no side effects outside the transaction and decides only from
 * its own fresh read. Errors are left to the caller's try.
 */
async function runOwnedTaskWrite(
  id: string,
  uid: string,
  decide: (stored: Readonly<Record<string, unknown>>) => WriteDecision
): Promise<TaskActionResult> {
  return adminDb.runTransaction(async (tx: Transaction): Promise<TaskActionResult> => {
    const ref: DocumentReference = adminDb.collection('tasks').doc(id)
    const snap = await tx.get(ref)
    const stored: Readonly<Record<string, unknown>> | undefined = snap.data()
    if (!snap.exists || !stored || stored.uid !== uid || (stored.deletedAt ?? null) !== null) {
      return { success: false, error: TASK_MESSAGES.taskGone }
    }
    const decision = decide(stored)
    if ('refusal' in decision) return decision.refusal
    tx.update(ref, decision.update)
    return { success: true }
  })
}

/**
 * Creates a task for the signed-in user (ADR-0002). The owner comes from the session only, the
 * status is always pending, and one reading of the server's clock sets the due-date check,
 * createdAt and updatedAt (A26, AC-8.7a). Every failure returns fixed wording, never library
 * text (rule 5, AC-8.5).
 */
export async function createTask(input: unknown): Promise<TaskActionResult<string>> {
  // Outside any try, so the sign-in redirect propagates and nothing runs before it.
  const session = await requireAuth()

  const parsed = createTaskRequestSchema.safeParse(input)
  if (!parsed.success) return toTaskRefusal(parsed.error)

  const now = Timestamp.now()
  const dueDateError = dueDateRangeError(parsed.data.dueDate, now.toDate())
  if (dueDateError) return { success: false, error: dueDateError, field: 'dueDate' }

  try {
    const ref = await adminDb.collection('tasks').add({
      uid: session.uid,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: Timestamp.fromDate(parsed.data.dueDate),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      _schemaVersion: 1,
    })
    return { success: true, data: ref.id }
  } catch (error) {
    // Server-side only: the caller gets the fixed wording, never the error (rule 5).
    console.error('Task creation failed:', error)
    return { success: false, error: TASK_MESSAGES.saveFailed }
  }
}

/**
 * Edits the signed-in user's own task (ADR-0005). Writes only the fields the request defined,
 * plus updatedAt; status and the system fields are never written. The due date is range-checked
 * only when it differs from the stored one, so a past due date can be kept (AC-2.6b, 2.6c).
 */
export async function updateTask(input: unknown): Promise<TaskActionResult> {
  const session = await requireAuth()

  const parsed = updateTaskRequestSchema.safeParse(input)
  if (!parsed.success) return toTaskRefusal(parsed.error)
  const { id, title, description, dueDate } = parsed.data

  try {
    const now = Timestamp.now()
    return await runOwnedTaskWrite(id, session.uid, (stored) => {
      if (dueDate !== undefined) {
        const storedDueDate: unknown = stored.dueDate
        const changed =
          !(storedDueDate instanceof Timestamp) || storedDueDate.toMillis() !== dueDate.getTime()
        const dueDateError = changed ? dueDateRangeError(dueDate, now.toDate()) : null
        if (dueDateError) {
          return { refusal: { success: false, error: dueDateError, field: 'dueDate' } }
        }
      }
      const update: Record<string, unknown> = { updatedAt: now }
      if (title !== undefined) update.title = title
      if (description !== undefined) update.description = description
      if (dueDate !== undefined) update.dueDate = Timestamp.fromDate(dueDate)
      return { update }
    })
  } catch (error) {
    // Server-side only: the caller gets the fixed wording, never the error (rule 5).
    console.error('Task update failed:', error)
    return { success: false, error: TASK_MESSAGES.saveFailed }
  }
}

/** Sets the signed-in user's own task to the given status: writes only status and updatedAt. */
export async function setTaskStatus(input: unknown): Promise<TaskActionResult> {
  const session = await requireAuth()

  const parsed = setTaskStatusRequestSchema.safeParse(input)
  if (!parsed.success) return toTaskRefusal(parsed.error)
  const { id, status } = parsed.data

  try {
    const now = Timestamp.now()
    return await runOwnedTaskWrite(id, session.uid, () => ({ update: { status, updatedAt: now } }))
  } catch (error) {
    console.error('Task status change failed:', error)
    return { success: false, error: TASK_MESSAGES.saveFailed }
  }
}

/**
 * Soft-deletes the signed-in user's own task: writes deletedAt and updatedAt, both the one
 * clock reading. Nothing here erases a record or restores one (AC-7.3, AC-7.6).
 */
export async function deleteTask(input: unknown): Promise<TaskActionResult> {
  const session = await requireAuth()

  const parsed = deleteTaskRequestSchema.safeParse(input)
  if (!parsed.success) return toTaskRefusal(parsed.error)
  const { id } = parsed.data

  try {
    const now = Timestamp.now()
    return await runOwnedTaskWrite(id, session.uid, () => ({
      update: { deletedAt: now, updatedAt: now },
    }))
  } catch (error) {
    console.error('Task delete failed:', error)
    return { success: false, error: TASK_MESSAGES.saveFailed }
  }
}
