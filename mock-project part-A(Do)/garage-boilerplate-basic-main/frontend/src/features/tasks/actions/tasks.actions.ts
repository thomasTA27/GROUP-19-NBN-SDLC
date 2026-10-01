'use server'

import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import { taskInputSchema } from '@/features/tasks/schemas'
import type { ActionResult } from '@/types'

const SAVE_FAILED = 'Task could not be saved. Please try again.'

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
