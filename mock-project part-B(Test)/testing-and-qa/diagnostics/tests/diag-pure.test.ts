// DIAGNOSTIC ONLY (disposable copy; not part of the project, not a baseline test).
// Part 1 asserts the INTENDED behaviour: it passes on the original code and fails on a mutant that
// has a real behavioural gap. Part 2 records a trace so an original run and a mutant run can be compared.
import { appendFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  dateToLocalInput,
  dueDateProblem,
  isoToLocalInput,
  latestAllowedDueDate,
  localInputToIso,
  parseDueDateIso,
} from '@/features/tasks/lib/due-date'
import { deleteTaskRequestSchema } from '@/features/tasks/schemas'

describe('intended behaviour (assertions)', () => {
  it('690 minutes 60 is refused', () => expect(parseDueDateIso('2027-03-05T10:60Z').ok).toBe(false))
  it('693 seconds 60 is refused as format', () =>
    expect(parseDueDateIso('2027-03-05T10:00:60Z')).toEqual({ ok: false, reason: 'format' }))
  it('696 offset hours 24 is refused', () => expect(parseDueDateIso('2027-03-05T10:00+24:00').ok).toBe(false))
  it('699 offset minutes 60 is refused', () => expect(parseDueDateIso('2027-03-05T10:00+05:60').ok).toBe(false))
  it('633 trailing text after Z is refused', () => expect(parseDueDateIso('2027-03-05T10:00:00Zjunk').ok).toBe(false))
  it('633 trailing text after a numeric offset is refused', () =>
    expect(parseDueDateIso('2027-03-05T10:00+08:00 extra').ok).toBe(false))
  it('787 31 April is refused', () => expect(parseDueDateIso('2027-04-31T10:00Z').ok).toBe(false))
  it('796 month 00 is refused', () => expect(parseDueDateIso('2027-00-15T10:00Z').ok).toBe(false))
  it('802 day 00 is refused', () => expect(parseDueDateIso('2027-03-00T10:00Z').ok).toBe(false))
  it('780/782 29 Feb 2000 is a real date', () => expect(parseDueDateIso('2000-02-29T00:00Z').ok).toBe(true))
  it('780/782 29 Feb 2400 is a real date', () => expect(parseDueDateIso('2400-02-29T00:00Z').ok).toBe(true))
  it('727 a 5-digit year is not read as its last four digits', () =>
    expect(localInputToIso('12027-03-05T10:00')).toBeNull())
  it('727 leading text is refused', () => expect(localInputToIso('xx2027-03-05T10:00')).toBeNull())
  it('753 local minute 75 is refused', () => expect(localInputToIso('2027-03-05T10:75')).toBeNull())
  it('864 an ID that merely ends with __ is usable', () =>
    expect(deleteTaskRequestSchema.safeParse({ id: 'a__b__' }).success).toBe(true))
  it('865 an ID that starts with __ but does not end with __ is usable', () =>
    expect(deleteTaskRequestSchema.safeParse({ id: '__a__b' }).success).toBe(true))
  it('864/865 sanity: a reserved __x__ ID is still refused', () =>
    expect(deleteTaskRequestSchema.safeParse({ id: '__a__' }).success).toBe(false))
})

// Deterministic pseudo-random inputs plus boundary values, so the same inputs run on every variant.
let seed = 12345
const rnd = (n: number) => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed % n
}
const pad = (n: number, w = 2) => String(n).padStart(w, '0')

describe('trace for comparing an original run with a mutant run', () => {
  it('parseDueDateIso, 40,000 inputs', () => {
    const h = createHash('sha256')
    const years = [0, 1, 99, 1999, 2000, 2026, 2027, 2028, 2037, 2100, 2400, 9999]
    const offs = ['Z', '+00:00', '+05:30', '-03:00', '+14:00', '-12:00', '+23:59', '+24:00', '+99:00', '+05:60', '-00:75']
    const fractions = ['0', '000', '5', '0001']
    for (let i = 0; i < 40000; i++) {
      const minute = rnd(3) === 0 ? 55 + rnd(45) : rnd(60)
      let seconds = ''
      if (rnd(3) === 0) {
        seconds = ':' + pad(rnd(3) === 0 ? rnd(100) : 0) + (rnd(2) ? '.' + fractions[rnd(4)] : '')
      }
      const s = `${pad(years[rnd(years.length)]!, 4)}-${pad(rnd(15))}-${pad(rnd(34))}T${pad(rnd(27))}:${pad(minute)}${seconds}${offs[rnd(offs.length)]}`
      const r = parseDueDateIso(s)
      h.update(s + '=' + (r.ok ? 'ok' + r.date.getTime() : 'no:' + r.reason) + ';')
    }
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'parseDueDateIso', v: h.digest('hex') }) + '\n')
  })
  it('localInputToIso / isoToLocalInput / latestAllowedDueDate / dueDateProblem', () => {
    const h = createHash('sha256')
    for (let i = 0; i < 20000; i++) {
      const minute = rnd(3) === 0 ? 55 + rnd(45) : rnd(60)
      const s = `${pad(1990 + rnd(120), 4)}-${pad(rnd(15))}-${pad(rnd(34))}T${pad(rnd(27))}:${pad(minute)}`
      h.update(s + '=' + localInputToIso(s) + ';')
    }
    for (let i = 0; i < 5000; i++) {
      const d = new Date(Date.UTC(1999 + rnd(60), rnd(12), 1 + rnd(31), rnd(24), rnd(60)))
      const now = new Date(Date.UTC(2026 + rnd(3), rnd(12), 1 + rnd(31), rnd(24), rnd(60), rnd(60)))
      h.update(
        latestAllowedDueDate(now).toISOString() +
          dueDateProblem(d, now) +
          dateToLocalInput(d) +
          isoToLocalInput(d.toISOString()) +
          ';'
      )
    }
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'local+range', v: h.digest('hex') }) + '\n')
  })
})
