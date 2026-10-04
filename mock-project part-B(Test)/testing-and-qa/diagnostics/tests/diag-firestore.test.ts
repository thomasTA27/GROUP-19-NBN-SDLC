// DIAGNOSTIC ONLY (disposable copy). Runs the REAL src/lib/firebase/firestore.ts with the SDK's collection() faked.
import { describe, expect, it, vi } from 'vitest'

vi.mock('firebase/firestore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/firestore')>()),
  collection: vi.fn((_db: unknown, path: string) => ({ __path: path })),
}))
vi.mock('@/lib/firebase/client', () => ({ getClientDb: () => ({ fake: 'db' }) }))
import { getTasksCollection } from '@/lib/firebase/firestore'

describe('intended behaviour (assertions)', () => {
  it('986-988 getTasksCollection returns the tasks collection', () => {
    expect(getTasksCollection()).toEqual({ __path: 'tasks' })
  })
})
