'use server'

import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import {
  TASK_MESSAGES,
  createTaskRequestSchema,
  dueDateRangeError,
  toTaskRefusal,
} from '@/features/tasks/schemas'
import type { TaskActionResult } from '@/features/tasks/types'

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
