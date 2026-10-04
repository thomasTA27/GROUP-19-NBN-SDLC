// DIAGNOSTIC ONLY (disposable copy). Same mock scaffold as the project's tasks.actions.test.ts.
import { appendFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'

const { add, collection, doc, requireAuth, runTransaction, tx } = vi.hoisted(() => {
  const add = vi.fn()
  const doc = vi.fn((id: string) => ({ id, path: `tasks/${id}` }))
  const tx = { get: vi.fn(), update: vi.fn() }
  const runTransaction = vi.fn(async (callback: (t: typeof tx) => Promise<unknown>) => callback(tx))
  return { add, collection: vi.fn(() => ({ add, doc })), doc, requireAuth: vi.fn(), runTransaction, tx }
})
vi.mock('@/lib/firebase/admin', () => ({ adminDb: { collection, runTransaction }, adminAuth: {} }))
vi.mock('@/actions/auth.actions', () => ({ requireAuth }))
import { deleteTask, setTaskStatus, updateTask } from '@/features/tasks/actions/tasks.actions'

const task = () => ({
  uid: 'user-1',
  title: 'T',
  description: '',
  dueDate: Timestamp.fromDate(new Date('2027-03-01T09:00:00Z')),
  status: 'pending',
  deletedAt: null,
})
beforeEach(() => {
  vi.clearAllMocks()
  requireAuth.mockResolvedValue({ uid: 'user-1' })
  tx.get.mockResolvedValue({ exists: true, data: () => task() })
})
const runs = [
  ['updateTask', () => updateTask({ id: 't1', title: 'New' })],
  ['setTaskStatus', () => setTaskStatus({ id: 't1', status: 'completed' })],
  ['deleteTask', () => deleteTask({ id: 't1' })],
] as const

describe('intended behaviour (assertions)', () => {
  it.each(runs)('90 %s reads and writes the tasks collection', async (_n, run) => {
    await run()
    expect(collection).toHaveBeenCalledWith('tasks')
  })
  it('183 setTaskStatus logs its failure with its label', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    runTransaction.mockRejectedValueOnce(new Error('boom'))
    await setTaskStatus({ id: 't1', status: 'completed' })
    expect(spy).toHaveBeenCalledWith('Task status change failed:', expect.any(Error))
  })
  it('196 deleteTask logs its failure with its label', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    runTransaction.mockRejectedValueOnce(new Error('boom'))
    await deleteTask({ id: 't1' })
    expect(spy).toHaveBeenCalledWith('Task delete failed:', expect.any(Error))
  })
})

describe('trace', () => {
  it('97 outcome for every (exists, data) combination, coherent and incoherent', async () => {
    const out: Record<string, unknown> = {}
    for (const exists of [true, false]) {
      for (const hasData of [true, false]) {
        tx.update.mockClear()
        tx.get.mockResolvedValue({ exists, data: () => (hasData ? task() : undefined) })
        const r = await deleteTask({ id: 't1' })
        out[`exists=${exists},data=${hasData}`] = { success: r.success, wrote: tx.update.mock.calls.length }
      }
    }
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'snapshot-combos', v: out }) + '\n')
  })
})
