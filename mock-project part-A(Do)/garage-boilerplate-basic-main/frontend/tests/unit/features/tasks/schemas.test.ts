import { describe, it, expect } from 'vitest'
import type { ZodTypeAny } from 'zod'
import { taskInputSchema, taskIdSchema, taskStatusSchema } from '@/features/tasks/schemas'

const valid = { title: 'Buy milk', description: '', dueDate: null }

function firstError(input: unknown, schema: ZodTypeAny = taskInputSchema): string | undefined {
  const result = schema.safeParse(input)
  return result.success ? undefined : result.error.errors[0]?.message
}

describe('taskInputSchema: title', () => {
  it('rejects an empty title', () => {
    expect(firstError({ ...valid, title: '' })).toBe('Title is required.')
  })

  it('rejects a whitespace-only title', () => {
    expect(firstError({ ...valid, title: '   ' })).toBe('Title is required.')
  })

  it('accepts 1 and 100 characters after trimming, and trims', () => {
    expect(taskInputSchema.parse({ ...valid, title: ' a ' }).title).toBe('a')
    expect(taskInputSchema.parse({ ...valid, title: ` ${'a'.repeat(100)} ` }).title).toHaveLength(100)
  })

  it('rejects 101 characters after trimming', () => {
    expect(firstError({ ...valid, title: 'a'.repeat(101) })).toBe(
      'Title must be 100 characters or fewer.',
    )
  })

  it('rejects a line break', () => {
    expect(firstError({ ...valid, title: 'line one\nline two' })).toBe(
      'Title must be a single line.',
    )
  })

  it('accepts emoji', () => {
    expect(taskInputSchema.parse({ ...valid, title: 'Ship it 🚀' }).title).toBe('Ship it 🚀')
  })
})

describe('taskInputSchema: description', () => {
  it('accepts an empty description', () => {
    expect(taskInputSchema.parse(valid).description).toBe('')
  })

  it('accepts 2,000 characters and keeps inner line breaks', () => {
    expect(taskInputSchema.parse({ ...valid, description: 'a'.repeat(2000) }).description).toHaveLength(2000)
    expect(taskInputSchema.parse({ ...valid, description: ' one\ntwo ' }).description).toBe('one\ntwo')
  })

  it('rejects 2,001 characters', () => {
    expect(firstError({ ...valid, description: 'a'.repeat(2001) })).toBe(
      'Description must be 2,000 characters or fewer.',
    )
  })
})

describe('taskInputSchema: dueDate', () => {
  it('accepts null, and stores an empty date input as null', () => {
    expect(taskInputSchema.parse(valid).dueDate).toBeNull()
    expect(taskInputSchema.parse({ ...valid, dueDate: '' }).dueDate).toBeNull()
  })

  it('accepts today, a past date and 2099-12-31', () => {
    const today = new Date().toISOString().slice(0, 10)
    for (const dueDate of [today, '2001-01-01', '2099-12-31']) {
      expect(taskInputSchema.parse({ ...valid, dueDate }).dueDate).toBe(dueDate)
    }
  })

  it('rejects 2100-01-01', () => {
    expect(firstError({ ...valid, dueDate: '2100-01-01' })).toBe(
      'Due date must be on or before 31 Dec 2099.',
    )
  })

  it('rejects a date that does not exist and a non-date string', () => {
    expect(firstError({ ...valid, dueDate: '2027-02-30' })).toBe('Due date must be a valid date.')
    expect(firstError({ ...valid, dueDate: 'tomorrow' })).toBe('Due date must be a valid date.')
  })
})

describe('taskInputSchema: unknown keys', () => {
  it.each(['uid', 'status', 'deletedAt', 'createdAt'])('rejects %s', (key) => {
    expect(taskInputSchema.safeParse({ ...valid, [key]: 'x' }).success).toBe(false)
  })
})

describe('taskIdSchema', () => {
  it('accepts a valid ID', () => {
    expect(taskIdSchema.safeParse('abc123').success).toBe(true)
  })

  it.each([
    ['an empty string', ''],
    ['a non-string', 42],
    ['an ID containing /', 'abc/comments/xyz'],
  ])('rejects %s', (_label, id) => {
    expect(taskIdSchema.safeParse(id).success).toBe(false)
  })
})

describe('taskStatusSchema', () => {
  it.each(['pending', 'completed'])('accepts %s', (status) => {
    expect(taskStatusSchema.safeParse(status).success).toBe(true)
  })

  it.each(['done', '', null, 'Completed'])('rejects %s', (status) => {
    expect(firstError(status, taskStatusSchema)).toBe(
      'Status must be pending or completed.',
    )
  })
})
