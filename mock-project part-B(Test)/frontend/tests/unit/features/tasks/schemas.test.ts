// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { defaultErrorMap, z } from 'zod'
import {
  TASK_MESSAGES,
  createTaskRequestSchema,
  deleteTaskRequestSchema,
  dueDateRangeError,
  setTaskStatusRequestSchema,
  taskFormSchema,
  toTaskRefusal,
  updateTaskRequestSchema,
} from '@/features/tasks/schemas'
import { dateToLocalInput, localInputToIso } from '@/features/tasks/lib/due-date'

/**
 * Field rules for tasks (spec §2, AC-3.2b/c, AC-5.3, AC-7.6; D2a): for each rule an accepted
 * case, a refused case, and the values on each side of its limit. Every refusal also checks
 * its wording: only the tasks schema's own messages, never Zod's default text (A36, AC-8.5).
 */

const DUE = '2027-03-05T10:30:00.000Z'
const DUE_DATE = new Date(Date.UTC(2027, 2, 5, 10, 30))
const ID = 'aB3xYz09QwErTy123456'
const OWN_MESSAGES: string[] = Object.values(TASK_MESSAGES)

const create = (fields: Record<string, unknown>) => ({ title: 'Buy milk', dueDate: DUE, ...fields })

function accepted<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input)
  if (!result.success)
    throw new Error(`expected acceptance: ${JSON.stringify(result.error.issues)}`)
  return result.data
}

// Asserts the input is refused and its first problem has `message`. Every problem's wording is
// one of TASK_MESSAGES and differs from what Zod would have said by default.
function refused(schema: z.ZodTypeAny, input: unknown, message: string) {
  const result = schema.safeParse(input)
  expect(result.success).toBe(false)
  const issues = result.error?.issues ?? []
  for (const issue of issues) {
    expect(OWN_MESSAGES).toContain(issue.message)
    const zodDefault = defaultErrorMap(issue, { data: undefined, defaultError: '' }).message
    expect(issue.message).not.toBe(zodDefault)
  }
  expect(issues[0]?.message).toBe(message)
}

describe('title (AC-2.1a, AC-2.2a–c)', () => {
  it.each([
    ['empty', ''],
    ['spaces', '   '],
    ['a tab', '\t'],
    ['a line break', '\n'],
    ['a non-breaking space', '\u00a0'], // U+00A0 no-break space
    // space, tab, CR, LF, U+00A0 no-break space, U+3000 ideographic space,
    // U+FEFF zero-width no-break space (BOM), U+2028 line separator
    ['mixed whitespace', ' \t\r\n\u00a0\u3000\ufeff\u2028'],
  ])('refuses a title that is %s, on create and edit', (_label, title) => {
    refused(createTaskRequestSchema, create({ title }), TASK_MESSAGES.titleRequired)
    refused(updateTaskRequestSchema, { id: ID, title }, TASK_MESSAGES.titleRequired)
  })

  it('refuses a create with no title', () => {
    refused(createTaskRequestSchema, { dueDate: DUE }, TASK_MESSAGES.titleRequired)
  })

  it('accepts a title of 1 character', () => {
    expect(accepted(createTaskRequestSchema, create({ title: 'a' })).title).toBe('a')
  })

  it('accepts 200 characters and refuses 201, on create and edit', () => {
    accepted(createTaskRequestSchema, create({ title: 'a'.repeat(200) }))
    accepted(updateTaskRequestSchema, { id: ID, title: 'a'.repeat(200) })
    refused(createTaskRequestSchema, create({ title: 'a'.repeat(201) }), TASK_MESSAGES.titleTooLong)
    refused(updateTaskRequestSchema, { id: ID, title: 'a'.repeat(201) }, TASK_MESSAGES.titleTooLong)
  })

  it('counts code points: 200 × 👍 (400 UTF-16 units) is accepted, 201 × 👍 is refused', () => {
    expect('👍'.repeat(200).length).toBe(400)
    accepted(createTaskRequestSchema, create({ title: '👍'.repeat(200) }))
    refused(
      createTaskRequestSchema,
      create({ title: '👍'.repeat(201) }),
      TASK_MESSAGES.titleTooLong
    )
  })

  it('counts the flag 🇦🇺 as 2: 198 + 🇦🇺 is accepted, 199 + 🇦🇺 (201 code points) is refused', () => {
    accepted(createTaskRequestSchema, create({ title: 'a'.repeat(198) + '🇦🇺' }))
    refused(
      createTaskRequestSchema,
      create({ title: 'a'.repeat(199) + '🇦🇺' }),
      TASK_MESSAGES.titleTooLong
    )
  })

  it('trims whitespace before counting', () => {
    const data = accepted(
      createTaskRequestSchema,
      // ends with LF and U+00A0 no-break space
      create({ title: ' \t' + 'a'.repeat(200) + '\n\u00a0' })
    )
    expect(data.title).toBe('a'.repeat(200))
    refused(
      createTaskRequestSchema,
      create({ title: ' ' + 'a'.repeat(201) + ' ' }),
      TASK_MESSAGES.titleTooLong
    )
  })

  it('counts a CRLF pair as 1: 198 pairs between two letters (200) accepted, 199 (201) refused', () => {
    const title = 'a' + '\r\n'.repeat(198) + 'a'
    expect(accepted(createTaskRequestSchema, create({ title })).title).toBe(title)
    refused(
      createTaskRequestSchema,
      create({ title: 'a' + '\r\n'.repeat(199) + 'a' }),
      TASK_MESSAGES.titleTooLong
    )
  })

  it('saves the title without leading or trailing whitespace, and keeps inner whitespace', () => {
    expect(accepted(createTaskRequestSchema, create({ title: '  Buy\t the milk \n' })).title).toBe(
      'Buy\t the milk'
    )
    // starts with U+00A0 no-break space
    expect(accepted(updateTaskRequestSchema, { id: ID, title: '\u00a0Call Sam ' }).title).toBe(
      'Call Sam'
    )
  })

  it("treats only what trim() removes as whitespace: a zero-width space isn't removed", () => {
    // U+200B zero-width space, which trim() does not remove
    expect(accepted(createTaskRequestSchema, create({ title: '\u200b' })).title).toBe('\u200b')
  })

  it('refuses a title that is not a string with the fixed text', () => {
    refused(createTaskRequestSchema, create({ title: 42 }), TASK_MESSAGES.invalidRequest)
    refused(updateTaskRequestSchema, { id: ID, title: null }, TASK_MESSAGES.invalidRequest)
  })
})

describe('description (AC-2.1c, AC-2.3a)', () => {
  it('accepts a create with no description, saved as empty', () => {
    expect(accepted(createTaskRequestSchema, create({})).description).toBe('')
  })

  it('accepts an empty description, on create and edit', () => {
    expect(accepted(createTaskRequestSchema, create({ description: '' })).description).toBe('')
    expect(accepted(updateTaskRequestSchema, { id: ID, description: '' }).description).toBe('')
  })

  it('accepts 10,000 characters and refuses 10,001, on create and edit', () => {
    accepted(createTaskRequestSchema, create({ description: 'a'.repeat(10_000) }))
    accepted(updateTaskRequestSchema, { id: ID, description: 'a'.repeat(10_000) })
    refused(
      createTaskRequestSchema,
      create({ description: 'a'.repeat(10_001) }),
      TASK_MESSAGES.descriptionTooLong
    )
    refused(
      updateTaskRequestSchema,
      { id: ID, description: 'a'.repeat(10_001) },
      TASK_MESSAGES.descriptionTooLong
    )
  })

  it('counts code points: 10,000 × 👍 is accepted, 9,999 + 🇦🇺 is refused', () => {
    accepted(createTaskRequestSchema, create({ description: '👍'.repeat(10_000) }))
    refused(
      createTaskRequestSchema,
      create({ description: 'a'.repeat(9_999) + '🇦🇺' }),
      TASK_MESSAGES.descriptionTooLong
    )
  })

  it('counts each line break as 1: 10,000 are accepted, 10,001 refused', () => {
    accepted(createTaskRequestSchema, create({ description: '\n'.repeat(10_000) }))
    refused(
      createTaskRequestSchema,
      create({ description: '\n'.repeat(10_001) }),
      TASK_MESSAGES.descriptionTooLong
    )
  })

  it('counts a CRLF pair as 1: 10,000 pairs are accepted, 10,001 refused', () => {
    accepted(createTaskRequestSchema, create({ description: '\r\n'.repeat(10_000) }))
    refused(
      createTaskRequestSchema,
      create({ description: '\r\n'.repeat(10_001) }),
      TASK_MESSAGES.descriptionTooLong
    )
  })

  it('returns a description with CRLF pairs unchanged', () => {
    const description = '\r\n'.repeat(10_000)
    const saved = accepted(createTaskRequestSchema, create({ description })).description
    expect(saved).toBe(description)
    expect(saved.length).toBe(20_000)
    const mixed = 'line 1\r\nline 2\n\r\nline 3\r'
    expect(accepted(createTaskRequestSchema, create({ description: mixed })).description).toBe(
      mixed
    )
  })

  it('keeps markup exactly as typed (AC-2.3b)', () => {
    const description = '<b>bold</b> **bold** <script>alert(1)</script> &amp;'
    expect(accepted(createTaskRequestSchema, create({ description })).description).toBe(description)
  })

  it('keeps line breaks and surrounding whitespace exactly as typed (AC-2.3c, AC-3.1)', () => {
    const description = '\n  first line\n\nsecond line  \n'
    expect(accepted(createTaskRequestSchema, create({ description })).description).toBe(description)
  })

  it('refuses a description that is not a string with the fixed text', () => {
    refused(createTaskRequestSchema, create({ description: null }), TASK_MESSAGES.invalidRequest)
  })
})

describe('due date in a request (AC-2.1b, AC-2.4)', () => {
  it('refuses a create with no due date, or an empty one', () => {
    refused(createTaskRequestSchema, { title: 'Buy milk' }, TASK_MESSAGES.dueDateRequired)
    refused(createTaskRequestSchema, create({ dueDate: '' }), TASK_MESSAGES.dueDateRequired)
    refused(updateTaskRequestSchema, { id: ID, dueDate: '' }, TASK_MESSAGES.dueDateRequired)
  })

  it.each([
    '2027-03-05T10:30:00.000Z',
    '2027-03-05T10:30:00Z',
    '2027-03-05T10:30Z',
    '2027-03-05T18:30:00.000+08:00',
    '2027-03-05T05:30-05:00',
  ])('accepts %s as the same moment', (dueDate) => {
    expect(accepted(createTaskRequestSchema, create({ dueDate })).dueDate).toEqual(DUE_DATE)
    expect(accepted(updateTaskRequestSchema, { id: ID, dueDate }).dueDate).toEqual(DUE_DATE)
  })

  it.each([
    'tomorrow',
    '05/03/2027 10:30',
    '2027-03-05',
    '2027-03-05 10:30:00Z',
    '2027-13-05T10:30:00Z',
    '2027-02-29T10:30:00Z',
    '2027-03-05T24:00:00Z',
    '2027-03-05T10:30:00+08',
    '+002027-03-05T10:30:00.000Z',
  ])('refuses the malformed value %s', (dueDate) => {
    refused(createTaskRequestSchema, create({ dueDate }), TASK_MESSAGES.dueDateFormat)
  })

  it.each(['2027-03-05T10:30:00.000', '2027-03-05T10:30'])(
    'refuses %s, which has no timezone offset',
    (dueDate) => {
      refused(createTaskRequestSchema, create({ dueDate }), TASK_MESSAGES.dueDateFormat)
      refused(updateTaskRequestSchema, { id: ID, dueDate }, TASK_MESSAGES.dueDateFormat)
    }
  )

  it.each(['2027-03-05T10:30:01Z', '2027-03-05T10:30:59.000+08:00'])(
    'refuses %s, which has non-zero seconds',
    (dueDate) => {
      refused(createTaskRequestSchema, create({ dueDate }), TASK_MESSAGES.dueDateNotWholeMinute)
    }
  )

  it.each(['2027-03-05T10:30:00.001Z', '2027-03-05T10:30:00.000000001Z'])(
    'refuses %s, which has non-zero milliseconds',
    (dueDate) => {
      refused(createTaskRequestSchema, create({ dueDate }), TASK_MESSAGES.dueDateNotWholeMinute)
    }
  )

  it('refuses a due date that is not a string with the fixed text', () => {
    refused(
      createTaskRequestSchema,
      create({ dueDate: DUE_DATE.getTime() }),
      TASK_MESSAGES.invalidRequest
    )
    refused(createTaskRequestSchema, create({ dueDate: DUE_DATE }), TASK_MESSAGES.invalidRequest)
    refused(createTaskRequestSchema, create({ dueDate: null }), TASK_MESSAGES.invalidRequest)
  })

  it('accepts what the browser sends: a datetime-local value converted to ISO', () => {
    const iso = localInputToIso('2027-03-05T17:00')
    expect(iso).not.toBeNull()
    expect(accepted(createTaskRequestSchema, create({ dueDate: iso })).dueDate).toEqual(
      new Date(2027, 2, 5, 17, 0)
    )
  })

  it("leaves the past and 10-year checks to the action, which knows the server's clock", () => {
    expect(
      accepted(createTaskRequestSchema, create({ dueDate: '2000-01-01T00:00Z' })).dueDate
    ).toEqual(new Date(Date.UTC(2000, 0, 1)))
  })
})

describe('dueDateRangeError (AC-2.6a, AC-2.6b, AC-2.6d)', () => {
  const now = new Date('2027-03-05T10:30:45.000Z')

  it('at 10:30:45 accepts a due time of 10:30 and refuses 10:29 as past', () => {
    expect(dueDateRangeError(new Date('2027-03-05T10:30:00Z'), now)).toBeNull()
    expect(dueDateRangeError(new Date('2027-03-05T10:29:00Z'), now)).toBe(TASK_MESSAGES.dueDatePast)
  })

  it('refuses a change to a different past date (the AC-2.6 edit example)', () => {
    expect(dueDateRangeError(new Date('2027-03-02T09:00:00Z'), now)).toBe(TASK_MESSAGES.dueDatePast)
  })

  it('accepts 10 years ahead to the minute and refuses the next minute', () => {
    expect(dueDateRangeError(new Date('2037-03-05T10:30:00Z'), now)).toBeNull()
    expect(dueDateRangeError(new Date('2037-03-05T10:31:00Z'), now)).toBe(
      TASK_MESSAGES.dueDateTooFar
    )
  })

  it('refuses an Invalid Date due date or clock with the invalid-date message', () => {
    expect(dueDateRangeError(new Date(NaN), now)).toBe(TASK_MESSAGES.dueDateInvalid)
    expect(dueDateRangeError(new Date('2000-01-01T00:00:00Z'), new Date(NaN))).toBe(
      TASK_MESSAGES.dueDateInvalid
    )
  })
})

describe('status on create (AC-3.2b, AC-3.2c)', () => {
  it('creates a pending task when the status is left out', () => {
    expect(accepted(createTaskRequestSchema, create({})).status).toBe('pending')
  })

  it('accepts pending', () => {
    expect(accepted(createTaskRequestSchema, create({ status: 'pending' })).status).toBe('pending')
  })

  it('refuses completed', () => {
    refused(
      createTaskRequestSchema,
      create({ status: 'completed' }),
      TASK_MESSAGES.statusNewMustBePending
    )
  })

  it.each(['done', 'PENDING', '', 1, null])('refuses the status %j', (status) => {
    refused(createTaskRequestSchema, create({ status }), TASK_MESSAGES.statusInvalid)
  })
})

describe('edit (AC-5.1, AC-5.3, ADR-0005)', () => {
  it('keeps only the fields that were sent', () => {
    expect(accepted(updateTaskRequestSchema, { id: ID, title: 'New title' })).toStrictEqual({
      id: ID,
      title: 'New title',
    })
    expect(accepted(updateTaskRequestSchema, { id: ID, dueDate: DUE })).toStrictEqual({
      id: ID,
      dueDate: DUE_DATE,
    })
  })

  it.each(['pending', 'completed', 'done'])(
    'refuses an edit that includes the status %s',
    (status) => {
      refused(updateTaskRequestSchema, { id: ID, title: 'x', status }, TASK_MESSAGES.editFields)
      refused(updateTaskRequestSchema, { id: ID, status }, TASK_MESSAGES.editFields)
    }
  )

  it('refuses an edit with no changed field', () => {
    refused(updateTaskRequestSchema, { id: ID }, TASK_MESSAGES.editEmpty)
    refused(updateTaskRequestSchema, { id: ID, title: undefined }, TASK_MESSAGES.editEmpty)
  })
})

describe('set status (AC-3.2c, ADR-0005)', () => {
  it.each(['pending', 'completed'])('accepts %s', (status) => {
    expect(accepted(setTaskStatusRequestSchema, { id: ID, status })).toEqual({ id: ID, status })
  })

  it.each(['done', '', null, undefined])('refuses the status %j', (status) => {
    refused(setTaskStatusRequestSchema, { id: ID, status }, TASK_MESSAGES.statusInvalid)
  })

  it('refuses any other field', () => {
    refused(
      setTaskStatusRequestSchema,
      { id: ID, status: 'completed', title: 'x' },
      TASK_MESSAGES.setStatusFields
    )
  })
})

describe('delete', () => {
  it('accepts a task ID', () => {
    expect(accepted(deleteTaskRequestSchema, { id: ID })).toEqual({ id: ID })
  })

  it('refuses any other field', () => {
    refused(deleteTaskRequestSchema, { id: ID, title: 'x' }, TASK_MESSAGES.deleteFields)
  })
})

describe('system and unknown fields (AC-2.10a, AC-2.10b, AC-7.6)', () => {
  // Includes the values the app itself sets, so the refusal can't depend on the value.
  const fields: [string, unknown][] = [
    ['uid', 'user-a'],
    ['uid', ''],
    ['createdAt', '1990-01-01T00:00:00.000Z'],
    ['createdAt', DUE],
    ['updatedAt', DUE],
    ['deletedAt', null],
    ['deletedAt', DUE],
    ['_schemaVersion', 1],
    ['_schemaVersion', 2],
    ['priority', 'high'],
    ['id', ID],
  ]

  it.each(fields)('refuses %s = %j on create', (name, value) => {
    refused(createTaskRequestSchema, create({ [name]: value }), TASK_MESSAGES.createFields)
  })

  it.each(fields.filter(([name]) => name !== 'id'))('refuses %s = %j on edit', (name, value) => {
    refused(
      updateTaskRequestSchema,
      { id: ID, title: 'x', [name]: value },
      TASK_MESSAGES.editFields
    )
    refused(updateTaskRequestSchema, { id: ID, [name]: value }, TASK_MESSAGES.editFields)
  })

  it('refuses clearing the deletion time through any request (AC-7.6)', () => {
    refused(updateTaskRequestSchema, { id: ID, deletedAt: null }, TASK_MESSAGES.editFields)
    refused(
      setTaskStatusRequestSchema,
      { id: ID, status: 'pending', deletedAt: null },
      TASK_MESSAGES.setStatusFields
    )
    refused(deleteTaskRequestSchema, { id: ID, deletedAt: null }, TASK_MESSAGES.deleteFields)
  })
})

describe('task ID', () => {
  const schemas = [
    ['edit', updateTaskRequestSchema, { title: 'x' }],
    ['set status', setTaskStatusRequestSchema, { status: 'completed' }],
    ['delete', deleteTaskRequestSchema, {}],
  ] as const

  it.each(schemas)('%s: accepts an ID', (_name, schema, rest) => {
    expect(accepted(schema, { id: ID, ...rest }).id).toBe(ID)
  })

  it.each(schemas)('%s: refuses a missing or empty ID', (_name, schema, rest) => {
    refused(schema, { ...rest }, TASK_MESSAGES.taskIdRequired)
    refused(schema, { id: '', ...rest }, TASK_MESSAGES.taskIdRequired)
  })

  it.each(schemas)("%s: refuses an ID containing '/'", (_name, schema, rest) => {
    refused(schema, { id: 'abc/def', ...rest }, TASK_MESSAGES.taskIdSlash)
    refused(schema, { id: '/', ...rest }, TASK_MESSAGES.taskIdSlash)
  })

  const usable = [
    'abc',
    'task-1',
    '_a_',
    '__a',
    'a__',
    '...',
    'a'.repeat(1500),
    '\u00e9'.repeat(750), // 1,500 bytes
  ]
  const unusable = [
    '.',
    '..',
    '__name__',
    '__a__',
    '____',
    'a'.repeat(1501),
    '\u00e9'.repeat(751), // 1,502 bytes
  ]

  it.each(schemas)('%s: accepts IDs Firestore can use', (_name, schema, rest) => {
    for (const id of usable) expect(accepted(schema, { id, ...rest }).id).toBe(id)
  })

  it.each(schemas)(
    '%s: refuses IDs Firestore cannot use, without repeating them',
    (_n, schema, rest) => {
      for (const id of unusable) {
        refused(schema, { id, ...rest }, TASK_MESSAGES.taskIdInvalid)
        const result = schema.safeParse({ id, ...rest })
        expect(JSON.stringify(result.error?.issues)).not.toContain(id)
      }
    }
  )

  it.each(schemas)('%s: refuses a __x__ ID with a line break inside', (_name, schema, rest) => {
    refused(schema, { id: '__a\nb__', ...rest }, TASK_MESSAGES.taskIdInvalid)
  })

  it.each(schemas)('%s: refuses an ID that is not a string', (_name, schema, rest) => {
    refused(schema, { id: 7, ...rest }, TASK_MESSAGES.invalidRequest)
  })
})

describe('bodies that are not objects', () => {
  const schemas = [
    createTaskRequestSchema,
    updateTaskRequestSchema,
    setTaskStatusRequestSchema,
    deleteTaskRequestSchema,
    taskFormSchema(),
  ]

  it.each([null, undefined, 'title', 42, true, [], [DUE]])(
    'refuses %j with the fixed text',
    (body) => {
      for (const schema of schemas) refused(schema, body, TASK_MESSAGES.invalidRequest)
    }
  )
})

describe('toTaskRefusal (ADR-0006)', () => {
  const refusalFor = (schema: z.ZodTypeAny, input: unknown) => {
    const result = schema.safeParse(input)
    if (result.success) throw new Error('expected a refusal')
    return toTaskRefusal(result.error)
  }

  it('names the field a field rule belongs to', () => {
    expect(refusalFor(createTaskRequestSchema, create({ title: '' }))).toEqual({
      success: false,
      error: TASK_MESSAGES.titleRequired,
      field: 'title',
    })
    expect(
      refusalFor(updateTaskRequestSchema, { id: ID, description: 'a'.repeat(10_001) })
    ).toEqual({
      success: false,
      error: TASK_MESSAGES.descriptionTooLong,
      field: 'description',
    })
    expect(refusalFor(createTaskRequestSchema, create({ dueDate: '2027-03-05T10:30' }))).toEqual({
      success: false,
      error: TASK_MESSAGES.dueDateFormat,
      field: 'dueDate',
    })
  })

  it('names no field for a request-level refusal', () => {
    expect(refusalFor(createTaskRequestSchema, create({ uid: 'user-a' }))).toEqual({
      success: false,
      error: TASK_MESSAGES.createFields,
    })
    expect(refusalFor(updateTaskRequestSchema, { id: ID })).toEqual({
      success: false,
      error: TASK_MESSAGES.editEmpty,
    })
    expect(refusalFor(setTaskStatusRequestSchema, { id: ID, status: 'done' })).toEqual({
      success: false,
      error: TASK_MESSAGES.statusInvalid,
    })
  })

  it("replaces any message that isn't one of the schema's own with the fixed text", () => {
    const error = new z.ZodError([
      {
        code: 'custom',
        path: ['title'],
        message: '7 PERMISSION_DENIED: Missing or insufficient permissions.',
      },
    ])
    expect(toTaskRefusal(error)).toEqual({
      success: false,
      error: TASK_MESSAGES.invalidRequest,
      field: 'title',
    })
    expect(toTaskRefusal(new z.ZodError([]))).toEqual({
      success: false,
      error: TASK_MESSAGES.invalidRequest,
    })
  })
})

describe('form schema (browser early checks, ADR-0003)', () => {
  const now = new Date('2027-03-05T10:30:45.000Z')
  const local = (iso: string) => dateToLocalInput(new Date(iso))
  const form = (fields: Record<string, unknown>) => ({
    title: 'Buy milk',
    description: '',
    dueDate: local('2027-03-06T09:00:00Z'),
    ...fields,
  })

  it('uses the same title and description rules', () => {
    const schema = taskFormSchema({ now: () => now })
    expect(accepted(schema, form({ title: '  Buy milk ' })).title).toBe('Buy milk')
    accepted(schema, form({ title: 'a'.repeat(200), description: 'a'.repeat(10_000) }))
    // a space and U+00A0 no-break space
    refused(schema, form({ title: ' \u00a0' }), TASK_MESSAGES.titleRequired)
    refused(schema, form({ title: 'a'.repeat(199) + '🇦🇺' }), TASK_MESSAGES.titleTooLong)
    refused(schema, form({ description: 'a'.repeat(10_001) }), TASK_MESSAGES.descriptionTooLong)
  })

  it('refuses an empty or invalid due date', () => {
    const schema = taskFormSchema({ now: () => now })
    refused(schema, form({ dueDate: '' }), TASK_MESSAGES.dueDateRequired)
    refused(schema, form({ dueDate: '2027-02-30T10:00' }), TASK_MESSAGES.dueDateInvalid)
  })

  it('at 10:30:45 accepts 10:30 and refuses 10:29 as past', () => {
    const schema = taskFormSchema({ now: () => now })
    accepted(schema, form({ dueDate: local('2027-03-05T10:30:00Z') }))
    refused(schema, form({ dueDate: local('2027-03-05T10:29:00Z') }), TASK_MESSAGES.dueDatePast)
  })

  it('accepts 10 years ahead to the minute and refuses the next minute', () => {
    const schema = taskFormSchema({ now: () => now })
    accepted(schema, form({ dueDate: local('2037-03-05T10:30:00Z') }))
    refused(schema, form({ dueDate: local('2037-03-05T10:31:00Z') }), TASK_MESSAGES.dueDateTooFar)
  })

  it('keeps an unchanged past due date but refuses a change to another past one (AC-2.6b, c)', () => {
    const loaded = local('2027-03-01T09:00:00Z')
    const schema = taskFormSchema({ now: () => now, unchangedDueDate: loaded })
    accepted(schema, form({ dueDate: loaded }))
    refused(schema, form({ dueDate: local('2027-03-02T09:00:00Z') }), TASK_MESSAGES.dueDatePast)
    refused(schema, form({ dueDate: local('2027-03-01T09:01:00Z') }), TASK_MESSAGES.dueDatePast)
  })

  it("reads the browser's clock at each check by default", () => {
    const schema = taskFormSchema()
    const hour = 60 * 60 * 1000
    accepted(schema, form({ dueDate: dateToLocalInput(new Date(Date.now() + hour)) }))
    refused(
      schema,
      form({ dueDate: dateToLocalInput(new Date(Date.now() - hour)) }),
      TASK_MESSAGES.dueDatePast
    )
  })
})

describe('wording (AC-2.8, A36, AC-8.5)', () => {
  it("uses the spec's example wording, with each limit stated", () => {
    expect(TASK_MESSAGES.titleTooLong).toBe('Title must be 200 characters or fewer')
    expect(TASK_MESSAGES.dueDatePast).toBe("Due date can't be in the past")
    expect(TASK_MESSAGES.descriptionTooLong).toContain('10,000')
    expect(TASK_MESSAGES.dueDateTooFar).toContain('10 years')
  })

  it('defines the fixed failure texts', () => {
    expect(TASK_MESSAGES.taskGone).toBe('This task no longer exists.')
    expect(TASK_MESSAGES.loadFailed).toBe("Tasks couldn't be loaded. Please refresh the page.")
    expect(TASK_MESSAGES.saveFailed).toBe("Your change couldn't be saved. Please try again.")
  })

  it("gives wrong types the fixed text, never Zod's default text", () => {
    const cases: [z.ZodTypeAny, unknown][] = [
      [createTaskRequestSchema, create({ title: {} })],
      [createTaskRequestSchema, create({ description: 5 })],
      [createTaskRequestSchema, create({ dueDate: [] })],
      [updateTaskRequestSchema, { id: ID, description: false }],
      [setTaskStatusRequestSchema, { id: [], status: 'pending' }],
      [taskFormSchema(), { title: 1, description: '', dueDate: '' }],
      [taskFormSchema(), { title: 'x', description: '', dueDate: 5 }],
    ]
    for (const [schema, input] of cases) refused(schema, input, TASK_MESSAGES.invalidRequest)
  })
})
