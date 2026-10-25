// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  dateToLocalInput,
  dueDateProblem,
  isoToLocalInput,
  latestAllowedDueDate,
  localInputToIso,
  parseDueDateIso,
  startOfMinute,
} from '@/features/tasks/lib/due-date'

/**
 * Due-date rules (ADR-0003; spec A6, A26, AC-2.4, AC-2.6a–d; D2a). The server-side helpers
 * take "now" as an argument, so these tests set the clock. The local-value tests build their
 * expectations with the device-timezone Date constructor, so they pass in any timezone.
 */

const at = (iso: string) => new Date(iso)

describe('startOfMinute', () => {
  it('drops seconds and milliseconds', () => {
    expect(startOfMinute(at('2027-03-05T10:30:45.678Z'))).toEqual(at('2027-03-05T10:30:00.000Z'))
  })

  it('leaves a whole minute unchanged', () => {
    expect(startOfMinute(at('2027-03-05T10:30:00.000Z'))).toEqual(at('2027-03-05T10:30:00.000Z'))
  })
})

describe('past (AC-2.6a–c, A26)', () => {
  const now = at('2027-03-05T10:30:45.000Z')

  it('at 10:30:45 accepts a due time of 10:30', () => {
    expect(dueDateProblem(at('2027-03-05T10:30:00Z'), now)).toBeNull()
  })

  it('at 10:30:45 refuses a due time of 10:29', () => {
    expect(dueDateProblem(at('2027-03-05T10:29:00Z'), now)).toBe('past')
  })

  it('accepts the next minute and later', () => {
    expect(dueDateProblem(at('2027-03-05T10:31:00Z'), now)).toBeNull()
    expect(dueDateProblem(at('2027-03-06T09:00:00Z'), now)).toBeNull()
  })

  it('accepts the current minute at its first millisecond', () => {
    expect(dueDateProblem(at('2027-03-05T10:30:00Z'), at('2027-03-05T10:30:00.000Z'))).toBeNull()
  })

  it('refuses an earlier day (the AC-2.6 edit example: 2 March at 09:00)', () => {
    expect(dueDateProblem(at('2027-03-02T09:00:00Z'), now)).toBe('past')
  })
})

describe('Invalid Date (fails closed)', () => {
  const now = at('2027-03-05T10:30:45.000Z')

  it('refuses an Invalid Date due date', () => {
    expect(dueDateProblem(new Date(NaN), now)).toBe('invalid')
  })

  it('refuses a valid due date when the clock is an Invalid Date', () => {
    expect(dueDateProblem(at('2000-01-01T00:00:00Z'), new Date(NaN))).toBe('invalid')
  })
})

describe('10-year limit (AC-2.6d, A6, SCR-3)', () => {
  it('saved 2027-03-05 10:30 UTC: 2037-03-05 10:30 is accepted and 10:31 refused', () => {
    const savedAt = at('2027-03-05T10:30:00Z')
    expect(latestAllowedDueDate(savedAt)).toEqual(at('2037-03-05T10:30:00Z'))
    expect(dueDateProblem(at('2037-03-05T10:30:00Z'), savedAt)).toBeNull()
    expect(dueDateProblem(at('2037-03-05T10:31:00Z'), savedAt)).toBe('too-far')
  })

  it('counts to the minute: saved at 10:30:45, 10:30 is accepted and 10:31 refused', () => {
    const savedAt = at('2027-03-05T10:30:45.500Z')
    expect(latestAllowedDueDate(savedAt)).toEqual(at('2037-03-05T10:30:00Z'))
    expect(dueDateProblem(at('2037-03-05T10:30:00Z'), savedAt)).toBeNull()
    expect(dueDateProblem(at('2037-03-05T10:31:00Z'), savedAt)).toBe('too-far')
  })

  it('saved 2028-02-29: 2038-02-28 is the last day, and the next minute is refused', () => {
    const savedAt = at('2028-02-29T10:30:00Z')
    expect(latestAllowedDueDate(savedAt)).toEqual(at('2038-02-28T10:30:00Z'))
    expect(dueDateProblem(at('2038-02-28T10:30:00Z'), savedAt)).toBeNull()
    expect(dueDateProblem(at('2038-02-28T10:31:00Z'), savedAt)).toBe('too-far')
    expect(dueDateProblem(at('2038-03-01T00:00:00Z'), savedAt)).toBe('too-far')
  })

  it('does not use the 1 March that setUTCFullYear gives', () => {
    const naive = at('2028-02-29T10:30:00Z')
    naive.setUTCFullYear(2038)
    expect(naive).toEqual(at('2038-03-01T10:30:00Z'))
    expect(latestAllowedDueDate(at('2028-02-29T10:30:00Z'))).not.toEqual(naive)
  })

  it('keeps 28 February as 28 February', () => {
    expect(latestAllowedDueDate(at('2030-02-28T23:59:00Z'))).toEqual(at('2040-02-28T23:59:00Z'))
  })

  it('crosses the end of a year', () => {
    expect(latestAllowedDueDate(at('2027-12-31T23:59:00Z'))).toEqual(at('2037-12-31T23:59:00Z'))
  })

  it('counts in UTC, whatever offset the save moment was written with', () => {
    // 23:30 on 5 March in New York is 04:30 UTC on 6 March.
    const savedAt = at('2027-03-05T23:30:00-05:00')
    expect(latestAllowedDueDate(savedAt)).toEqual(at('2037-03-06T04:30:00Z'))
  })
})

describe('parseDueDateIso', () => {
  it('reads Z and ±HH:mm offsets as the same moment', () => {
    for (const value of [
      '2027-03-05T10:30:00.000Z',
      '2027-03-05T10:30Z',
      '2027-03-05T18:30:00+08:00',
      '2027-03-05T00:00-10:30',
      '2027-03-05T10:30:00.000000000-00:00',
    ]) {
      expect(parseDueDateIso(value)).toEqual({ ok: true, date: at('2027-03-05T10:30:00Z') })
    }
  })

  it('reads years 0–99 as written, not as 1900–1999', () => {
    const parsed = parseDueDateIso('0050-01-01T00:00Z')
    expect(parsed.ok && parsed.date.getUTCFullYear()).toBe(50)
  })

  it('accepts 29 February only in a leap year', () => {
    expect(parseDueDateIso('2028-02-29T10:30Z').ok).toBe(true)
    expect(parseDueDateIso('2027-02-29T10:30Z')).toEqual({ ok: false, reason: 'format' })
    expect(parseDueDateIso('2100-02-29T10:30Z')).toEqual({ ok: false, reason: 'format' })
  })

  it('refuses a value with no offset as a format problem', () => {
    expect(parseDueDateIso('2027-03-05T10:30:00')).toEqual({ ok: false, reason: 'format' })
  })

  it('refuses non-zero seconds or milliseconds', () => {
    expect(parseDueDateIso('2027-03-05T10:30:01Z')).toEqual({
      ok: false,
      reason: 'not-whole-minute',
    })
    expect(parseDueDateIso('2027-03-05T10:30:00.001Z')).toEqual({
      ok: false,
      reason: 'not-whole-minute',
    })
  })
})

describe('datetime-local value ↔ ISO string (browser)', () => {
  it.each(['2027-03-05T17:00', '2027-12-31T23:59', '2028-02-29T00:00', '2030-07-01T09:05'])(
    'round trip: %s → ISO → the same local value and moment',
    (value) => {
      const [date = '', time = ''] = value.split('T')
      const [year = NaN, month = NaN, day = NaN] = date.split('-').map(Number)
      const [hours = NaN, minutes = NaN] = time.split(':').map(Number)
      const moment = new Date(year, month - 1, day, hours, minutes)

      const iso = localInputToIso(value)
      expect(iso).toBe(moment.toISOString())
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/)
      if (iso === null) return
      expect(parseDueDateIso(iso)).toEqual({ ok: true, date: moment })
      expect(isoToLocalInput(iso)).toBe(value)
    }
  )

  it('accepts zero seconds in a local value', () => {
    expect(localInputToIso('2027-03-05T17:00:00')).toBe(localInputToIso('2027-03-05T17:00'))
  })

  it.each([
    '',
    '2027-03-05',
    '2027-03-05T17:00Z',
    '2027-03-05T17:00:15',
    '2027-02-30T17:00',
    '2027-03-05T24:00',
    'next Tuesday',
  ])('returns null for the local value %j', (value) => {
    expect(localInputToIso(value)).toBeNull()
  })

  it('returns null for an ISO string it would refuse', () => {
    expect(isoToLocalInput('2027-03-05T10:30:01Z')).toBeNull()
    expect(isoToLocalInput('not a date')).toBeNull()
  })

  it('pads every part of a local value', () => {
    expect(dateToLocalInput(new Date(2027, 0, 2, 3, 4))).toBe('2027-01-02T03:04')
  })
})
