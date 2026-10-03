import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'

const { add, collection, doc, requireAuth, runTransaction, tx } = vi.hoisted(() => {
  const add = vi.fn()
  // The real Admin SDK's doc() does not throw for any ID (checked against firebase-admin), so the
  // mock just returns a reference. A live rejection is simulated by making tx.get reject.
  const doc = vi.fn((id: string) => ({ id, path: `tasks/${id}` }))
  const tx = { get: vi.fn(), update: vi.fn() }
  const runTransaction = vi.fn(async (callback: (t: typeof tx) => Promise<unknown>) => callback(tx))
  return {
    add,
    collection: vi.fn(() => ({ add, doc })),
    doc,
    requireAuth: vi.fn(),
    runTransaction,
    tx,
  }
})

vi.mock('@/lib/firebase/admin', () => ({ adminDb: { collection, runTransaction }, adminAuth: {} }))
vi.mock('@/actions/auth.actions', () => ({ requireAuth }))

import * as taskActions from '@/features/tasks/actions/tasks.actions'
import { TASK_MESSAGES } from '@/features/tasks/schemas'

const { createTask, deleteTask, setTaskStatus, updateTask } = taskActions

// 10:30:45 UTC, so the current minute starts at 10:30:00.
const NOW = new Date('2027-03-05T10:30:45.000Z')
const valid = {
  title: 'Write report',
  description: 'Quarterly',
  dueDate: '2027-03-06T09:00:00.000Z',
}

type StoredTask = Record<string, unknown>

// A stored task owned by user-1 whose due date (2027-03-01 09:00 UTC) has already passed.
function ownedTask(overrides: StoredTask = {}): StoredTask {
  return {
    uid: 'user-1',
    title: 'Old title',
    description: 'Old description',
    dueDate: Timestamp.fromDate(new Date('2027-03-01T09:00:00.000Z')),
    status: 'pending',
    createdAt: Timestamp.fromDate(new Date('2027-01-01T00:00:00.000Z')),
    updatedAt: Timestamp.fromDate(new Date('2027-01-01T00:00:00.000Z')),
    deletedAt: null,
    _schemaVersion: 1,
    ...overrides,
  }
}

// What tx.get returns: the task, or null for a missing document.
function stored(data: StoredTask | null) {
  tx.get.mockImplementation(async () => {
    return { exists: data !== null, data: () => data ?? undefined }
  })
}

const updates = () => tx.update.mock.calls.map((call) => call[1] as Record<string, unknown>)

let errorSpy: MockInstance<typeof console.error>

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  add.mockReset().mockResolvedValue({ id: 'task-1' })
  collection.mockClear()
  doc.mockClear()
  tx.get.mockReset()
  tx.update.mockReset()
  runTransaction.mockClear()
  stored(ownedTask())
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

const ID = 'task-1'
const asUpdate = (extra: Record<string, unknown>) => updateTask({ id: ID, ...extra })

const everyAction: [string, (id: string) => Promise<unknown>][] = [
  ['updateTask', (id) => updateTask({ id, title: 'New title' })],
  ['setTaskStatus', (id) => setTaskStatus({ id, status: 'completed' })],
  ['deleteTask', (id) => deleteTask({ id })],
]

describe('shared behaviour of updateTask, setTaskStatus and deleteTask', () => {
  describe.each(everyAction)('%s', (_name, run) => {
    it('lets the sign-in redirect propagate and never touches the database', async () => {
      const redirectError = new Error('NEXT_REDIRECT')
      requireAuth.mockRejectedValue(redirectError)
      await expect(run(ID)).rejects.toBe(redirectError)
      expect(collection).not.toHaveBeenCalled()
      expect(runTransaction).not.toHaveBeenCalled()
      expect(tx.get).not.toHaveBeenCalled()
    })

    it('goes through runTransaction and reads before it writes', async () => {
      const result = await run(ID)
      expect(result).toEqual({ success: true })
      expect(runTransaction).toHaveBeenCalledTimes(1)
      expect(tx.get).toHaveBeenCalledTimes(1)
      expect(tx.update).toHaveBeenCalledTimes(1)
      expect(tx.get.mock.invocationCallOrder[0]!).toBeLessThan(
        tx.update.mock.invocationCallOrder[0]!
      )
    })

    it.each([
      ['a missing task', null],
      ["another user's task", ownedTask({ uid: 'someone-else' })],
      ['a deleted task', ownedTask({ deletedAt: Timestamp.fromMillis(1) })],
    ])('returns the same taskGone result for %s, with no write and no log', async (_n, data) => {
      stored(data)
      const result = await run(ID)
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.taskGone })
      expect(Object.keys(result as object)).toEqual(['success', 'error'])
      expect(tx.update).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('decides ownership from the session uid', async () => {
      requireAuth.mockResolvedValue({ uid: 'someone-else' })
      expect(await run(ID)).toEqual({ success: false, error: TASK_MESSAGES.taskGone })
      expect(tx.update).not.toHaveBeenCalled()
    })

    it.each([
      ['a/b', TASK_MESSAGES.taskIdSlash],
      ['', TASK_MESSAGES.taskIdRequired],
      ['.', TASK_MESSAGES.taskIdInvalid],
      ['..', TASK_MESSAGES.taskIdInvalid],
      ['__name__', TASK_MESSAGES.taskIdInvalid],
      ['a'.repeat(1501), TASK_MESSAGES.taskIdInvalid],
    ])('refuses the ID %j in the schema before any database call', async (id, error) => {
      const result = await run(id)
      expect(result).toEqual({ success: false, error })
      expect(collection).not.toHaveBeenCalled()
      expect(runTransaction).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('returns saveFailed when the read is rejected with an error naming the ID', async () => {
      tx.get.mockRejectedValue(
        new Error(`3 INVALID_ARGUMENT: bad path projects/secret-project/${ID}`)
      )
      const result = await run(ID)
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.saveFailed })
      expect(JSON.stringify(result)).not.toContain('INVALID_ARGUMENT')
      expect(JSON.stringify(result)).not.toContain('secret-project')
      expect(JSON.stringify(result)).not.toContain(ID)
      expect(tx.update).not.toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it('returns saveFailed when runTransaction rejects, logging once and leaking nothing', async () => {
      const failure = new Error('UNAVAILABLE: projects/secret-project/databases/(default)')
      runTransaction.mockRejectedValueOnce(failure)
      const result = await run(ID)
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.saveFailed })
      expect(JSON.stringify(result)).not.toContain('secret-project')
      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy.mock.calls[0]![1]).toBe(failure)
    })

    it('reads the server clock once per call', async () => {
      const nowSpy = vi.spyOn(Timestamp, 'now')
      await run(ID)
      expect(nowSpy).toHaveBeenCalledTimes(1)
    })

    it('decides from a fresh read if the transaction callback runs again (retry)', async () => {
      runTransaction.mockImplementationOnce(async (callback) => {
        await callback(tx)
        // The task is deleted between the two runs.
        stored(ownedTask({ deletedAt: Timestamp.fromMillis(1) }))
        return callback(tx)
      })
      const result = await run(ID)
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.taskGone })
      expect(tx.get).toHaveBeenCalledTimes(2)
      expect(tx.update).toHaveBeenCalledTimes(1) // the first run's write only
    })
  })

  it('exports exactly createTask, updateTask, setTaskStatus and deleteTask (AC-7.3, AC-7.6)', () => {
    expect(Object.keys(taskActions).sort()).toEqual(
      ['createTask', 'deleteTask', 'setTaskStatus', 'updateTask'].sort()
    )
  })
})

describe('updateTask', () => {
  it('redirects first, even for an invalid body', async () => {
    const redirectError = new Error('NEXT_REDIRECT')
    requireAuth.mockRejectedValue(redirectError)
    await expect(updateTask({})).rejects.toBe(redirectError)
    expect(runTransaction).not.toHaveBeenCalled()
  })

  const NEW_DUE = '2027-04-01T09:00:00.000Z'

  it.each([
    ['title only', { title: '  New title ' }, { title: 'New title' }],
    ['description only', { description: 'New description' }, { description: 'New description' }],
    ['description cleared', { description: '' }, { description: '' }],
    ['due date only', { dueDate: NEW_DUE }, { dueDate: 'DUE' }],
    [
      'all three',
      { title: 'T', description: 'D', dueDate: NEW_DUE },
      { title: 'T', description: 'D', dueDate: 'DUE' },
    ],
  ])('sends only the changed fields plus updatedAt: %s', async (_n, input, expected) => {
    const result = await asUpdate(input)
    expect(result).toEqual({ success: true })
    const update = updates()[0]!
    expect(Object.keys(update).sort()).toEqual([...Object.keys(expected), 'updatedAt'].sort())
    for (const [key, value] of Object.entries(expected)) {
      if (value === 'DUE') {
        expect(update.dueDate).toBeInstanceOf(Timestamp)
        expect((update.dueDate as Timestamp).toDate().toISOString()).toBe(NEW_DUE)
      } else {
        expect(update[key]).toBe(value)
      }
    }
    for (const never of ['createdAt', 'status', 'uid', 'deletedAt', '_schemaVersion']) {
      expect(update).not.toHaveProperty(never)
    }
  })

  it('two edits to different fields each write only their own field (AC-5.5)', async () => {
    await asUpdate({ title: 'From tab A' })
    await asUpdate({ description: 'From tab B' })
    const [first, second] = updates()
    expect(Object.keys(first!).sort()).toEqual(['title', 'updatedAt'])
    expect(Object.keys(second!).sort()).toEqual(['description', 'updatedAt'])
  })

  it.each([
    ['an empty edit', {}, TASK_MESSAGES.editEmpty],
    ['a status (the current one)', { title: 'T', status: 'pending' }, TASK_MESSAGES.editFields],
    ['a status (the other one)', { title: 'T', status: 'completed' }, TASK_MESSAGES.editFields],
    ['uid', { title: 'T', uid: 'someone-else' }, TASK_MESSAGES.editFields],
    ['deletedAt null', { title: 'T', deletedAt: null }, TASK_MESSAGES.editFields],
    ['createdAt', { title: 'T', createdAt: '2027-01-01T00:00:00.000Z' }, TASK_MESSAGES.editFields],
    ['updatedAt', { title: 'T', updatedAt: '2027-01-01T00:00:00.000Z' }, TASK_MESSAGES.editFields],
    ['_schemaVersion', { title: 'T', _schemaVersion: 1 }, TASK_MESSAGES.editFields],
  ])('refuses %s with no transaction and no write', async (_n, input, error) => {
    const result = await asUpdate(input)
    expect(result).toEqual({ success: false, error })
    expect(runTransaction).not.toHaveBeenCalled()
    expect(tx.update).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  describe('due date', () => {
    it('accepts a kept past due date (AC-2.6c)', async () => {
      const result = await asUpdate({ title: 'T', dueDate: '2027-03-01T09:00:00.000Z' })
      expect(result).toEqual({ success: true })
      expect(tx.update).toHaveBeenCalledTimes(1)
    })

    it.each([
      ['a different past date', '2027-03-02T09:00:00.000Z'],
      ['a change of time only on the same date', '2027-03-01T09:01:00.000Z'],
    ])('refuses %s with field dueDate (AC-2.6b)', async (_n, dueDate) => {
      const result = await asUpdate({ dueDate })
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.dueDatePast, field: 'dueDate' })
      expect(tx.update).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('accepts exactly 10 years ahead and refuses a minute more', async () => {
      expect(await asUpdate({ dueDate: '2037-03-05T10:30:00.000Z' })).toEqual({ success: true })
      tx.update.mockClear()
      expect(await asUpdate({ dueDate: '2037-03-05T10:31:00.000Z' })).toEqual({
        success: false,
        error: TASK_MESSAGES.dueDateTooFar,
        field: 'dueDate',
      })
      expect(tx.update).not.toHaveBeenCalled()
    })

    it.each([
      ['0000-01-01T00:00+23:59', TASK_MESSAGES.dueDatePast],
      ['9999-12-31T23:59-23:59', TASK_MESSAGES.dueDateTooFar],
    ])('refuses the extreme %s without crashing', async (dueDate, error) => {
      const result = await asUpdate({ dueDate })
      expect(result).toEqual({ success: false, error, field: 'dueDate' })
      expect(tx.update).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('does not range-check a due date equal to the stored one, even beyond 10 years', async () => {
      stored(ownedTask({ dueDate: Timestamp.fromDate(new Date('2040-01-01T00:00:00.000Z')) }))
      const result = await asUpdate({ dueDate: '2040-01-01T00:00:00.000Z' })
      expect(result).toEqual({ success: true })
    })
  })

  it('returns saveFailed when Timestamp.fromDate throws, logging once and leaking nothing', async () => {
    const failure = new Error('Timestamp seconds out of range: internal/path/lib.js')
    vi.spyOn(Timestamp, 'fromDate').mockImplementation(() => {
      throw failure
    })
    const result = await asUpdate({ dueDate: NEW_DUE })
    expect(result).toEqual({ success: false, error: TASK_MESSAGES.saveFailed })
    expect(JSON.stringify(result)).not.toContain('internal/path')
    expect(tx.update).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('Task update failed:', failure)
  })

  it('uses the one clock reading for updatedAt', async () => {
    const stamp = Timestamp.fromMillis(NOW.getTime())
    const nowSpy = vi.spyOn(Timestamp, 'now').mockReturnValue(stamp)
    await asUpdate({ title: 'T' })
    expect(nowSpy).toHaveBeenCalledTimes(1)
    expect(updates()[0]!.updatedAt).toBe(stamp)
  })

  it('does not log for a schema refusal, a due-date refusal or taskGone', async () => {
    await asUpdate({})
    await asUpdate({ dueDate: '2027-03-02T09:00:00.000Z' })
    stored(null)
    await asUpdate({ title: 'T' })
    expect(errorSpy).not.toHaveBeenCalled()
  })
})

describe('setTaskStatus', () => {
  it.each([
    ['pending', 'completed'],
    ['completed', 'pending'],
  ])('writes exactly { status, updatedAt } going %s to %s', async (from, to) => {
    stored(ownedTask({ status: from }))
    const stamp = Timestamp.fromMillis(NOW.getTime())
    vi.spyOn(Timestamp, 'now').mockReturnValue(stamp)
    const result = await setTaskStatus({ id: ID, status: to })
    expect(result).toEqual({ success: true })
    expect(updates()).toEqual([{ status: to, updatedAt: stamp }])
    expect(updates()[0]!.updatedAt).toBe(stamp)
  })

  it('works for a task whose due date has passed (AC-6.7)', async () => {
    const result = await setTaskStatus({ id: ID, status: 'completed' })
    expect(result).toEqual({ success: true })
    expect(Object.keys(updates()[0]!).sort()).toEqual(['status', 'updatedAt'])
  })

  it('succeeds when setting the status the task already has', async () => {
    stored(ownedTask({ status: 'completed' }))
    expect(await setTaskStatus({ id: ID, status: 'completed' })).toEqual({ success: true })
    expect(tx.update).toHaveBeenCalledTimes(1)
  })

  it('refuses done, and extra fields, with no transaction', async () => {
    expect(await setTaskStatus({ id: ID, status: 'done' })).toEqual({
      success: false,
      error: TASK_MESSAGES.statusInvalid,
    })
    expect(await setTaskStatus({ id: ID, status: 'completed', title: 'x' })).toEqual({
      success: false,
      error: TASK_MESSAGES.setStatusFields,
    })
    expect(runTransaction).not.toHaveBeenCalled()
  })
})

describe('deleteTask', () => {
  it('writes exactly { deletedAt, updatedAt }, both the same Timestamp object', async () => {
    const stamp = Timestamp.fromMillis(NOW.getTime())
    const nowSpy = vi.spyOn(Timestamp, 'now').mockReturnValue(stamp)
    const result = await deleteTask({ id: ID })
    expect(result).toEqual({ success: true })
    expect(nowSpy).toHaveBeenCalledTimes(1)
    const update = updates()[0]!
    expect(Object.keys(update).sort()).toEqual(['deletedAt', 'updatedAt'])
    expect(update.deletedAt).toBe(stamp)
    expect(update.updatedAt).toBe(stamp)
  })

  it('touches no other field (AC-7.2)', async () => {
    await deleteTask({ id: ID })
    for (const never of ['title', 'description', 'dueDate', 'status', 'uid', 'createdAt']) {
      expect(updates()[0]).not.toHaveProperty(never)
    }
  })

  it('refuses extra fields with no transaction', async () => {
    expect(await deleteTask({ id: ID, deletedAt: null })).toEqual({
      success: false,
      error: TASK_MESSAGES.deleteFields,
    })
    expect(runTransaction).not.toHaveBeenCalled()
  })
})

describe('signed out with an invalid body', () => {
  it.each([
    ['updateTask', updateTask],
    ['setTaskStatus', setTaskStatus],
    ['deleteTask', deleteTask],
  ])('%s rejects with the redirect and never touches the database', async (_name, action) => {
    const redirectError = new Error('NEXT_REDIRECT')
    requireAuth.mockRejectedValue(redirectError)
    await expect(action({})).rejects.toBe(redirectError)
    expect(collection).not.toHaveBeenCalled()
    expect(runTransaction).not.toHaveBeenCalled()
  })
})

describe('an admin session gets no access to the task of another user (AC-1.5)', () => {
  it.each(everyAction)('%s returns taskGone and writes nothing', async (_name, run) => {
    requireAuth.mockResolvedValue({ uid: 'admin-1', role: 'admin', admin: true })
    const result = await run(ID)
    expect(result).toEqual({ success: false, error: TASK_MESSAGES.taskGone })
    expect(Object.keys(result as object)).toEqual(['success', 'error'])
    expect(tx.update).not.toHaveBeenCalled()
  })
})

describe('stored task shapes', () => {
  it.each(everyAction)(
    '%s treats a task with no deletedAt field as not deleted',
    async (_n, run) => {
      const withoutDeletedAt = ownedTask()
      delete withoutDeletedAt.deletedAt
      stored(withoutDeletedAt)
      expect(await run(ID)).toEqual({ success: true })
      expect(tx.update).toHaveBeenCalledTimes(1)
    }
  )

  describe('a stored dueDate that is not a Timestamp', () => {
    beforeEach(() => stored(ownedTask({ dueDate: null })))

    it('refuses an edit to a past due date with field dueDate', async () => {
      const result = await asUpdate({ dueDate: '2027-03-01T09:00:00.000Z' })
      expect(result).toEqual({ success: false, error: TASK_MESSAGES.dueDatePast, field: 'dueDate' })
      expect(tx.update).not.toHaveBeenCalled()
    })

    it('accepts an edit to a valid future due date', async () => {
      const result = await asUpdate({ dueDate: '2027-04-01T09:00:00.000Z' })
      expect(result).toEqual({ success: true })
      expect(updates()[0]!.dueDate).toBeInstanceOf(Timestamp)
    })
  })
})

describe('source guard (AC-7.3)', () => {
  // Only the erasure route may erase a task: this module must never call .delete() or tx.delete.
  it('contains no .delete( and no tx.delete outside comments', () => {
    // Vitest runs from frontend/, the package root.
    const path = resolve(process.cwd(), 'src/features/tasks/actions/tasks.actions.ts')
    const code = readFileSync(path, 'utf-8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    expect(code.length).toBeGreaterThan(1000)
    expect(code).not.toContain('.delete(')
    expect(code).not.toContain('tx.delete')
  })
})
