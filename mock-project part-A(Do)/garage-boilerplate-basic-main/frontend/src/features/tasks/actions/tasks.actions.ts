'use server'

import { FieldValue, type Transaction } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import { taskIdSchema, taskInputSchema, taskStatusSchema } from '@/features/tasks/schemas'
import type { ActionResult } from '@/types'

const SAVE_FAILED = 'Task could not be saved. Please try again.'
const UPDATE_FAILED = 'Task could not be updated. Please try again.'
const DELETE_FAILED = 'Task could not be deleted. Please try again.'
// One message for every failed lookup, so callers cannot learn whether another user's task exists (ADR-0006).
const NOT_FOUND = { success: false, error: 'Task not found.' } as const

/**
 * The only place task ownership is checked (ADR-0002). Must be called inside
 * adminDb.runTransaction(), because the Admin SDK bypasses security rules.
 * Returns null unless the task exists, belongs to `uid` and is not deleted.
 * Not exported: every export of a 'use server' file is a callable endpoint.
 */
async function getOwnedActiveTask(tx: Transaction, taskId: string, uid: string) {
  const ref = adminDb.collection('tasks').doc(taskId)
  const snapshot = await tx.get(ref)
  const task = snapshot.data()
  // Fails closed: a missing deletedAt counts as deleted.
  if (!snapshot.exists || task?.uid !== uid || task?.deletedAt !== null) return null
  return { ref, task }
}

export async function createTask(input: unknown): Promise<ActionResult<string>> {
  // Outside the try: requireAuth() redirects by throwing, and that must not be caught (AC3).
  const session = await requireAuth()

  const parsed = taskInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  try {
    const now = FieldValue.serverTimestamp()
    const ref = await adminDb.collection('tasks').add({
      ...parsed.data,
      uid: session.uid,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      _schemaVersion: 1,
    })
    return { success: true, data: ref.id }
  } catch {
    return { success: false, error: SAVE_FAILED }
  }
}

export async function updateTask(taskId: unknown, input: unknown): Promise<ActionResult> {
  const session = await requireAuth()

  const id = taskIdSchema.safeParse(taskId)
  if (!id.success) return NOT_FOUND

  const parsed = taskInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  try {
    const found = await adminDb.runTransaction(async (tx) => {
      const owned = await getOwnedActiveTask(tx, id.data, session.uid)
      if (!owned) return false
      // Full replacement of the three editable fields; status and the rest are untouched (A28).
      tx.update(owned.ref, { ...parsed.data, updatedAt: FieldValue.serverTimestamp() })
      return true
    })
    return found ? { success: true } : NOT_FOUND
  } catch {
    return { success: false, error: SAVE_FAILED }
  }
}

export async function setTaskStatus(taskId: unknown, status: unknown): Promise<ActionResult> {
  const session = await requireAuth()

  const id = taskIdSchema.safeParse(taskId)
  if (!id.success) return NOT_FOUND

  const parsed = taskStatusSchema.safeParse(status)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  try {
    const found = await adminDb.runTransaction(async (tx) => {
      const owned = await getOwnedActiveTask(tx, id.data, session.uid)
      if (!owned) return false
      // Target status, not a flip: a repeated request writes nothing, not even updatedAt (A44).
      if (owned.task.status !== parsed.data) {
        tx.update(owned.ref, { status: parsed.data, updatedAt: FieldValue.serverTimestamp() })
      }
      return true
    })
    return found ? { success: true } : NOT_FOUND
  } catch {
    return { success: false, error: UPDATE_FAILED }
  }
}

export async function deleteTask(taskId: unknown): Promise<ActionResult> {
  const session = await requireAuth()

  const id = taskIdSchema.safeParse(taskId)
  if (!id.success) return NOT_FOUND

  try {
    const found = await adminDb.runTransaction(async (tx) => {
      const owned = await getOwnedActiveTask(tx, id.data, session.uid)
      if (!owned) return false
      // Soft delete only: the document is never removed (D10).
      const now = FieldValue.serverTimestamp()
      tx.update(owned.ref, { deletedAt: now, updatedAt: now })
      return true
    })
    return found ? { success: true } : NOT_FOUND
  } catch {
    return { success: false, error: DELETE_FAILED }
  }
}
