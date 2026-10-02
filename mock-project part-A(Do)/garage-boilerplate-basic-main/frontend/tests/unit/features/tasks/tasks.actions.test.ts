import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import {
  createTask,
  updateTask,
  setTaskStatus,
  deleteTask,
} from '@/features/tasks/actions/tasks.actions'

vi.mock('@/actions/auth.actions', () => ({ requireAuth: vi.fn() }))
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' },
}))

// Fake Firestore: collection('tasks').add() for create; doc() + runTransaction(tx) for the rest.
const add = vi.fn()
const doc = vi.fn((id: string) => ({ path: `tasks/${id}` }))
const collection = vi.fn(() => ({ add, doc }))
const tx = { get: vi.fn(), update: vi.fn(), delete: vi.fn() }
const runTransaction = vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx))

const ownTask = {
  uid: 'user-1',
  title: 'Old',
  description: '',
  dueDate: null,
  status: 'pending',
  deletedAt: null,
}

function storedTask(data: Record<string, unknown> | undefined) {
  tx.get.mockResolvedValue({ exists: data !== undefined, data: () => data })
}

beforeEach(() => {
  vi.mocked(requireAuth).mockReset().mockResolvedValue({ uid: 'user-1' } as never)
  add.mockReset().mockResolvedValue({ id: 'task-1' })
  tx.get.mockReset()
  tx.update.mockReset()
  tx.delete.mockReset()
  runTransaction.mockClear()
  collection.mockClear()
  doc.mockClear()
  storedTask(ownTask)
  Object.assign(adminDb, { collection, runTransaction })
})

const valid = { title: '  Buy milk  ', description: ' 2L ', dueDate: '2027-03-05' }

describe('createTask', () => {
  it('writes one task with server-set fields and returns its ID', async () => {
    const result = await createTask(valid)

    expect(result).toEqual({ success: true, data: 'task-1' })
    expect(collection).toHaveBeenCalledWith('tasks')
    expect(add).toHaveBeenCalledTimes(1)
    expect(add).toHaveBeenCalledWith({
      title: 'Buy milk',
      description: '2L',
      dueDate: '2027-03-05',
      uid: 'user-1',
      status: 'pending',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
      deletedAt: null,
      _schemaVersion: 1,
    })
  })

  it('stores an empty due date as null', async () => {
    await createTask({ ...valid, dueDate: '' })
    expect(add.mock.calls[0]?.[0]).toMatchObject({ dueDate: null })
  })

  it('rejects a uid in the input instead of using it, and writes nothing', async () => {
    const result = await createTask({ ...valid, uid: 'someone-else' })
    expect(result.success).toBe(false)
    expect(add).not.toHaveBeenCalled()
  })

  it('returns the first validation message and writes nothing', async () => {
    const result = await createTask({ ...valid, title: '   ' })
    expect(result).toEqual({ success: false, error: 'Title is required.' })
    expect(add).not.toHaveBeenCalled()
  })

  it('returns the save-failed message when Firestore throws, and does not throw', async () => {
    add.mockRejectedValue(new Error('unavailable'))
    await expect(createTask(valid)).resolves.toEqual({
      success: false,
      error: 'Task could not be saved. Please try again.',
    })
  })

  it('lets the requireAuth redirect through and writes nothing when signed out', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('NEXT_REDIRECT'))
    await expect(createTask(valid)).rejects.toThrow('NEXT_REDIRECT')
    expect(add).not.toHaveBeenCalled()
  })
})

describe('updateTask', () => {
  it("writes only the three fields and updatedAt to the owner's active task", async () => {
    const result = await updateTask('task-1', valid)

    expect(result).toEqual({ success: true })
    expect(doc).toHaveBeenCalledWith('task-1')
    expect(tx.update).toHaveBeenCalledTimes(1)
    expect(tx.update).toHaveBeenCalledWith(
      { path: 'tasks/task-1' },
      { title: 'Buy milk', description: '2L', dueDate: '2027-03-05', updatedAt: 'SERVER_TIMESTAMP' },
    )
  })

  it('rejects a status key, so an edit can never change status (A28)', async () => {
    const result = await updateTask('task-1', { ...valid, status: 'completed' })
    expect(result.success).toBe(false)
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('returns the first validation message and writes nothing', async () => {
    const result = await updateTask('task-1', { ...valid, title: 'a'.repeat(101) })
    expect(result).toEqual({ success: false, error: 'Title must be 100 characters or fewer.' })
    expect(runTransaction).not.toHaveBeenCalled()
  })
})

describe('setTaskStatus', () => {
  it.each([
    ['pending', 'completed'],
    ['completed', 'pending'],
  ])('changes %s to %s, writing only status and updatedAt', async (from, to) => {
    storedTask({ ...ownTask, status: from })

    expect(await setTaskStatus('task-1', to)).toEqual({ success: true })
    expect(tx.update).toHaveBeenCalledWith(
      { path: 'tasks/task-1' },
      { status: to, updatedAt: 'SERVER_TIMESTAMP' },
    )
  })

  it('returns success and writes nothing when the task already has that status (A44)', async () => {
    storedTask({ ...ownTask, status: 'completed' })
    expect(await setTaskStatus('task-1', 'completed')).toEqual({ success: true })
    expect(tx.update).not.toHaveBeenCalled()
  })

  it('rejects an invalid status and writes nothing', async () => {
    expect(await setTaskStatus('task-1', 'done')).toEqual({
      success: false,
      error: 'Status must be pending or completed.',
    })
    expect(runTransaction).not.toHaveBeenCalled()
  })
})

describe('deleteTask', () => {
  it('soft-deletes by writing only deletedAt and updatedAt, never delete()', async () => {
    expect(await deleteTask('task-1')).toEqual({ success: true })
    expect(tx.update).toHaveBeenCalledWith(
      { path: 'tasks/task-1' },
      { deletedAt: 'SERVER_TIMESTAMP', updatedAt: 'SERVER_TIMESTAMP' },
    )
    expect(tx.delete).not.toHaveBeenCalled()
  })
})

// AC17 / A37 / ADR-0006: the same result for every failed lookup, for all three actions.
const changeActions = [
  ['updateTask', (id: unknown) => updateTask(id, valid), 'Task could not be saved. Please try again.'],
  ['setTaskStatus', (id: unknown) => setTaskStatus(id, 'completed'), 'Task could not be updated. Please try again.'],
  ['deleteTask', (id: unknown) => deleteTask(id), 'Task could not be deleted. Please try again.'],
] as const

describe.each(changeActions)('%s ownership and failure handling', (_name, call, failedMessage) => {
  const notFound = { success: false, error: 'Task not found.' }

  it.each([
    ["another user's task", { ...ownTask, uid: 'user-2' }],
    ['a missing task', undefined],
    ['an already deleted task', { ...ownTask, deletedAt: 'SOME_TIMESTAMP' }],
    ['a task with no deletedAt field', { uid: 'user-1', status: 'pending' }],
  ])('returns "Task not found." for %s and writes nothing', async (_label, stored) => {
    storedTask(stored)
    expect(await call('task-1')).toEqual(notFound)
    expect(tx.update).not.toHaveBeenCalled()
  })

  it.each([
    ['an empty ID', ''],
    ['a non-string ID', 42],
    ['an ID containing /', 'abc/comments/xyz'],
  ])('returns "Task not found." for %s without reading Firestore', async (_label, id) => {
    expect(await call(id)).toEqual(notFound)
    expect(runTransaction).not.toHaveBeenCalled()
  })

  it('checks ownership inside the transaction (ADR-0002)', async () => {
    await call('task-1')
    expect(runTransaction).toHaveBeenCalledTimes(1)
    expect(tx.get).toHaveBeenCalledWith({ path: 'tasks/task-1' })
  })

  it('returns its failure message when Firestore throws, and does not throw', async () => {
    runTransaction.mockRejectedValueOnce(new Error('unavailable'))
    expect(await call('task-1')).toEqual({ success: false, error: failedMessage })
  })

  it('lets the requireAuth redirect through and touches nothing when signed out', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('NEXT_REDIRECT'))
    await expect(call('task-1')).rejects.toThrow('NEXT_REDIRECT')
    expect(runTransaction).not.toHaveBeenCalled()
  })
})
