import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import { createTask } from '@/features/tasks/actions/tasks.actions'

vi.mock('@/actions/auth.actions', () => ({ requireAuth: vi.fn() }))
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' },
}))

const add = vi.fn()
const collection = vi.fn(() => ({ add }))

beforeEach(() => {
  vi.mocked(requireAuth).mockReset().mockResolvedValue({ uid: 'user-1' } as never)
  add.mockReset().mockResolvedValue({ id: 'task-1' })
  collection.mockClear()
  Object.assign(adminDb, { collection })
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
