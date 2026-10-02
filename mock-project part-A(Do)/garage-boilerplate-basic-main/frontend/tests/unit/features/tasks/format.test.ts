import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { formatDueDate } from '@/features/tasks/format'
import { formatDate } from '@/lib/utils'

describe('formatDueDate', () => {
  it('formats a YYYY-MM-DD date in en-AU', () => {
    expect(formatDueDate('2027-03-05')).toBe('5 Mar 2027')
  })

  it('shows "No due date" for null', () => {
    expect(formatDueDate(null)).toBe('No due date')
  })

  describe('in a time zone behind UTC (America/Los_Angeles)', () => {
    const originalTz = process.env.TZ

    beforeAll(() => {
      process.env.TZ = 'America/Los_Angeles'
    })

    afterAll(() => {
      process.env.TZ = originalTz
    })

    it('the shared formatDate() shifts the date back a day (why formatDueDate exists)', () => {
      // Proves the TZ switch took effect, so the next test is not passing by accident.
      expect(formatDate('2027-03-05')).toBe('4 Mar 2027')
    })

    it('formatDueDate keeps the calendar date the user picked', () => {
      expect(formatDueDate('2027-03-05')).toBe('5 Mar 2027')
    })
  })
})
