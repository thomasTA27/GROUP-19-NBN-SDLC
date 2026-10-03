import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'

const { add, collection, requireAuth } = vi.hoisted(() => {
  const add = vi.fn()
  return { add, collection: vi.fn(() => ({ add })), requireAuth: vi.fn() }
})

vi.mock('@/lib/firebase/admin', () => ({ adminDb: { collection }, adminAuth: {} }))
vi.mock('@/actions/auth.actions', () => ({ requireAuth }))

import { createTask } from '@/features/tasks/actions/tasks.actions'
import { TASK_MESSAGES } from '@/features/tasks/schemas'

// 10:30:45 UTC, so the current minute starts at 10:30:00.
const NOW = new Date('2027-03-05T10:30:45.000Z')
const valid = {
  title: 'Write report',
  description: 'Quarterly',
  dueDate: '2027-03-06T09:00:00.000Z',
}

let errorSpy: MockInstance<typeof console.error>

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  add.mockReset().mockResolvedValue({ id: 'task-1' })
  collection.mockClear()
  requireAuth.mockReset().mockResolvedValue({ uid: 'user-1' })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('createTask', () => {
  it('lets the sign-in redirect propagate and never touches the database when signed out', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    requireAuth.mockRejectedValue(redirectError)
    await expect(createTask(valid)).rejects.toBe(redirectError)
    expect(collection).not.toHaveBeenCalled()
    expect(add).not.toHaveBeenCalled()
  })

  it('stores exactly the expected document and returns its id', async () => {
    const result = await createTask({ ...valid, title: '  \t Write report \n' })
    expect(result).toEqual({ success: true, data: 'task-1' })
    expect(collection).toHaveBeenCalledWith('tasks')
    expect(add).toHaveBeenCalledTimes(1)

    const doc = add.mock.calls[0]![0] as Record<string, unknown>
    expect(Object.keys(doc).sort()).toEqual(
      [
        '_schemaVersion',
        'createdAt',
        'deletedAt',
        'description',
        'dueDate',
        'status',
        'title',
        'uid',
        'updatedAt',
      ].sort()
    )
    expect(doc).toMatchObject({
      uid: 'user-1',
      title: 'Write report',
      description: 'Quarterly',
      status: 'pending',
      deletedAt: null,
      _schemaVersion: 1,
    })
    expect(doc.dueDate).toBeInstanceOf(Timestamp)
    expect((doc.dueDate as Timestamp).toDate().toISOString()).toBe('2027-03-06T09:00:00.000Z')
    expect(doc.createdAt).toBeInstanceOf(Timestamp)
    expect((doc.createdAt as Timestamp).isEqual(doc.updatedAt as Timestamp)).toBe(true)
    expect((doc.createdAt as Timestamp).toMillis()).toBe(NOW.getTime())
  })

  it('stores an omitted description as an empty string', async () => {
    await createTask({ title: valid.title, dueDate: valid.dueDate })
    expect(add.mock.calls[0]![0]).toMatchObject({ description: '' })
  })

  it('takes the owner from the session, never from the input', async () => {
    await createTask(valid)
    expect(add.mock.calls[0]![0]).toMatchObject({ uid: 'user-1' })
  })

  it('reads the server clock once and uses that one reading everywhere', async () => {
    const first = Timestamp.fromMillis(NOW.getTime())
    const second = Timestamp.fromMillis(NOW.getTime() + 15 * 60_000)
    const nowSpy = vi.spyOn(Timestamp, 'now').mockReturnValueOnce(first).mockReturnValue(second)

    // 10:30 is allowed at the first reading (10:30:45) but past at the second (10:45:45).
    const result = await createTask({ ...valid, dueDate: '2027-03-05T10:30:00.000Z' })

    expect(result.success).toBe(true)
    expect(nowSpy).toHaveBeenCalledTimes(1)
    const doc = add.mock.calls[0]![0] as Record<string, unknown>
    expect(doc.createdAt).toBe(first)
    expect(doc.updatedAt).toBe(first)
  })

  it('checks sign-in before parsing: signed out with an invalid body still redirects', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    requireAuth.mockRejectedValue(redirectError)
    await expect(createTask({})).rejects.toBe(redirectError)
    expect(collection).not.toHaveBeenCalled()
    expect(add).not.toHaveBeenCalled()
  })

  describe.each([
    ['uid', 'someone-else'],
    ['createdAt', '1990-01-01T00:00:00.000Z'],
    ['updatedAt', '1990-01-01T00:00:00.000Z'],
    ['deletedAt', null],
    ['deletedAt', '2027-01-01T00:00:00.000Z'],
    ['_schemaVersion', 1],
    ['unknownField', 'x'],
  ])('input that includes %s', (key, value) => {
    it('is refused and writes nothing (AC-1.4a, 2.10a, 2.10b)', async () => {
      const result = await createTask({ ...valid, [key]: value })
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.createFields })
      expect(add).not.toHaveBeenCalled()
    })
  })

  describe('status', () => {
    it('creates a pending task when it is omitted', async () => {
      await createTask(valid)
      expect(add.mock.calls[0]![0]).toMatchObject({ status: 'pending' })
    })

    it('accepts an explicit pending', async () => {
      const result = await createTask({ ...valid, status: 'pending' })
      expect(result.success).toBe(true)
      expect(add.mock.calls[0]![0]).toMatchObject({ status: 'pending' })
    })

    it.each([
      ['completed', TASK_MESSAGES.statusNewMustBePending],
      ['done', TASK_MESSAGES.statusInvalid],
    ])('refuses %s and writes nothing (AC-3.2b, 3.2c)', async (status, error) => {
      const result = await createTask({ ...valid, status })
      expect(result).toEqual({ success: false, error })
      expect(add).not.toHaveBeenCalled()
    })
  })

  describe('due date', () => {
    it('refuses a past due date, with the dueDate field', async () => {
      const result = await createTask({ ...valid, dueDate: '2027-03-05T10:29:00.000Z' })
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.dueDatePast, field: 'dueDate' })
      expect(add).not.toHaveBeenCalled()
    })

    it('accepts the current minute', async () => {
      const result = await createTask({ ...valid, dueDate: '2027-03-05T10:30:00.000Z' })
      expect(result.success).toBe(true)
      expect(add).toHaveBeenCalledTimes(1)
    })

    it('accepts exactly 10 years ahead and refuses one minute more', async () => {
      const ok = await createTask({ ...valid, dueDate: '2037-03-05T10:30:00.000Z' })
      expect(ok.success).toBe(true)
      expect(add).toHaveBeenCalledTimes(1)

      add.mockClear()
      const tooFar = await createTask({ ...valid, dueDate: '2037-03-05T10:31:00.000Z' })
      expect(tooFar).toEqual({
        success: false,
        error: TASK_MESSAGES.dueDateTooFar,
        field: 'dueDate',
      })
      expect(add).not.toHaveBeenCalled()
    })

    it.each([
      ['0000-01-01T00:00+23:59', TASK_MESSAGES.dueDatePast],
      ['9999-12-31T23:59-23:59', TASK_MESSAGES.dueDateTooFar],
    ])('refuses the extreme %s without crashing', async (dueDate, error) => {
      const result = await createTask({ ...valid, dueDate })
      expect(result).toEqual({ success: false, error, field: 'dueDate' })
      expect(add).not.toHaveBeenCalled()
    })
  })

  describe('refusals name the right field and write nothing', () => {
    it.each([
      ['empty title', { ...valid, title: '' }, TASK_MESSAGES.titleRequired, 'title'],
      [
        'whitespace-only title',
        { ...valid, title: ' \t\n\u00a0' },
        TASK_MESSAGES.titleRequired,
        'title',
      ],
      [
        'missing title',
        { description: '', dueDate: valid.dueDate },
        TASK_MESSAGES.titleRequired,
        'title',
      ],
      [
        '201-character title',
        { ...valid, title: 'a'.repeat(201) },
        TASK_MESSAGES.titleTooLong,
        'title',
      ],
      [
        '10,001-character description',
        { ...valid, description: 'a'.repeat(10_001) },
        TASK_MESSAGES.descriptionTooLong,
        'description',
      ],
      ['missing due date', { title: valid.title }, TASK_MESSAGES.dueDateRequired, 'dueDate'],
      ['empty due date', { ...valid, dueDate: '' }, TASK_MESSAGES.dueDateRequired, 'dueDate'],
      [
        'due date without an offset',
        { ...valid, dueDate: '2027-03-06T09:00' },
        TASK_MESSAGES.dueDateFormat,
        'dueDate',
      ],
      [
        'due date with seconds',
        { ...valid, dueDate: '2027-03-06T09:00:30.000Z' },
        TASK_MESSAGES.dueDateNotWholeMinute,
        'dueDate',
      ],
    ])('%s', async (_name, input, error, field) => {
      const result = await createTask(input)
      expect(result).toEqual({ success: false, error, field })
      expect(add).not.toHaveBeenCalled()
    })

    it.each([null, 'a string', 42, []])(
      'refuses a body that is %j with "Invalid request"',
      async (input) => {
        const result = await createTask(input)
        expect(result).toEqual({ success: false, error: TASK_MESSAGES.invalidRequest })
        expect(add).not.toHaveBeenCalled()
      }
    )
  })

  describe('failures', () => {
    it('returns the fixed wording when the database fails, never the raw text', async () => {
      const failure = new Error('PERMISSION_DENIED: projects/secret-project/databases/(default)')
      add.mockRejectedValue(failure)
      const result = await createTask(valid)
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.saveFailed })
      expect(JSON.stringify(result)).not.toContain('secret-project')
      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledWith('Task creation failed:', failure)
    })

    it('returns the fixed wording when Timestamp.fromDate throws', async () => {
      const failure = new Error('Timestamp seconds out of range: internal/path/lib.js')
      vi.spyOn(Timestamp, 'fromDate').mockImplementation(() => {
        throw failure
      })
      const result = await createTask(valid)
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.saveFailed })
      expect(JSON.stringify(result)).not.toContain('internal/path')
      expect(add).not.toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledWith('Task creation failed:', failure)
    })

    it('does not log on success, on a schema refusal or on a due-date refusal', async () => {
      await createTask(valid)
      await createTask({ ...valid, title: '' })
      await createTask({ ...valid, dueDate: '2027-03-05T10:29:00.000Z' })
      expect(errorSpy).not.toHaveBeenCalled()
    })
  })

  it('allows two tasks with the same title: both succeed and both call add (AC-2.7)', async () => {
    add.mockResolvedValueOnce({ id: 'task-1' }).mockResolvedValueOnce({ id: 'task-2' })
    const first = await createTask(valid)
    const second = await createTask(valid)
    expect(first).toEqual({ success: true, data: 'task-1' })
    expect(second).toEqual({ success: true, data: 'task-2' })
    expect(add).toHaveBeenCalledTimes(2)
    expect(collection).toHaveBeenCalledTimes(2)
    expect(collection).toHaveBeenCalledWith('tasks')
  })
})
