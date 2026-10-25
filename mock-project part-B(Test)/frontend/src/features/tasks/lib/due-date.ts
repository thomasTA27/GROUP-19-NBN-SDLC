/**
 * Due-date helpers for tasks (ADR-0003). A due date is a single moment, to the minute.
 *
 * Shared by the browser and the server: `startOfMinute`, `latestAllowedDueDate`,
 * `dueDateProblem` and `parseDueDateIso`. They work on moments and UTC fields only, so they
 * give the same answer in any timezone and do no date formatting (.claude/rules/tasks.md rule 4).
 *
 * Browser only: `localInputToIso`, `isoToLocalInput` and `dateToLocalInput`. They read and
 * write a `datetime-local` value in the device's timezone (AC-2.5). Never call them on the server.
 */

const MINUTE_MS = 60_000
const DUE_DATE_MAX_YEARS = 10

/**
 * Which due-date rule a moment breaks: before the current minute, or over 10 years ahead.
 * 'invalid' means the due date or the clock isn't a real moment (an Invalid Date).
 */
export type DueDateProblem = 'invalid' | 'past' | 'too-far'

export type ParsedDueDate =
  { ok: true; date: Date } | { ok: false; reason: 'format' | 'not-whole-minute' }

export function startOfMinute(date: Date): Date {
  return new Date(Math.floor(date.getTime() / MINUTE_MS) * MINUTE_MS)
}

/**
 * The latest due date allowed for a task saved at `savedAt`: the same minute 10 calendar years
 * later, counted in UTC. When that date doesn't exist (29 February), the last day of the month
 * is used, so 28 February (spec A6, SCR-3). `setUTCFullYear` alone would give 1 March.
 */
export function latestAllowedDueDate(savedAt: Date): Date {
  const year = savedAt.getUTCFullYear() + DUE_DATE_MAX_YEARS
  const month = savedAt.getUTCMonth()
  const day = Math.min(savedAt.getUTCDate(), daysInMonth(year, month + 1))
  return new Date(Date.UTC(year, month, day, savedAt.getUTCHours(), savedAt.getUTCMinutes()))
}

/**
 * Checks a due date against `now`, the save moment: the server's clock in a Server Action
 * (A26), the browser's for the form's early check. Past means earlier than the start of the
 * current minute, so at 10:30:45 a due time of 10:30 is allowed and 10:29 isn't. An Invalid
 * Date fails closed: every comparison with NaN is false, so without this it would be allowed.
 */
export function dueDateProblem(dueDate: Date, now: Date): DueDateProblem | null {
  if (!Number.isFinite(dueDate.getTime()) || !Number.isFinite(now.getTime())) return 'invalid'
  if (dueDate.getTime() < startOfMinute(now).getTime()) return 'past'
  if (dueDate.getTime() > latestAllowedDueDate(now).getTime()) return 'too-far'
  return null
}

// YYYY-MM-DDTHH:mm, then optional seconds and fraction, then Z or ±HH:mm. An offset is required.
const ISO_DUE_DATE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:Z|([+-])(\d{2}):(\d{2}))$/

/**
 * Reads a due date sent to the server: an ISO 8601 date and time with a timezone offset
 * (`Z` or `±HH:mm`). Seconds and a fraction may be left out, but if present must be zero
 * (ADR-0003), so a due date is always a whole minute.
 */
export function parseDueDateIso(value: string): ParsedDueDate {
  const match = ISO_DUE_DATE.exec(value)
  if (!match) return { ok: false, reason: 'format' }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hours = Number(match[4])
  const minutes = Number(match[5])
  const seconds = Number(match[6] ?? '0')
  const fraction = match[7] ?? ''
  const offsetSign = match[8] === '-' ? -1 : 1
  const offsetHours = Number(match[9] ?? '0')
  const offsetMinutes = Number(match[10] ?? '0')

  if (
    !isCalendarDate(year, month, day) ||
    hours > 23 ||
    minutes > 59 ||
    seconds > 59 ||
    offsetHours > 23 ||
    offsetMinutes > 59
  ) {
    return { ok: false, reason: 'format' }
  }
  if (seconds !== 0 || /[1-9]/.test(fraction)) return { ok: false, reason: 'not-whole-minute' }

  // setUTCFullYear, not Date.UTC, which reads years 0–99 as 1900–1999.
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hours, minutes, 0, 0)
  const offsetMs = offsetSign * (offsetHours * 60 + offsetMinutes) * MINUTE_MS
  return { ok: true, date: new Date(date.getTime() - offsetMs) }
}

// What a `datetime-local` input gives with step=60: YYYY-MM-DDTHH:mm, with no timezone.
const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::00)?$/

/**
 * Browser only. Turns a `datetime-local` value into the moment it means in the device's
 * timezone, as an ISO string with an offset (`Z`). Returns null for an empty or invalid value.
 * On the day clocks go forward, a local time that doesn't exist is moved by the browser (ADR-0003).
 */
export function localInputToIso(value: string): string | null {
  const match = LOCAL_INPUT.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hours = Number(match[4])
  const minutes = Number(match[5])
  if (!isCalendarDate(year, month, day) || hours > 23 || minutes > 59) return null

  const date = new Date(2000, 0, 1)
  date.setFullYear(year, month - 1, day)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

/** Browser only. The `datetime-local` value for a due date sent or stored as an ISO string. */
export function isoToLocalInput(iso: string): string | null {
  const parsed = parseDueDateIso(iso)
  return parsed.ok ? dateToLocalInput(parsed.date) : null
}

/** Browser only. The `datetime-local` value (YYYY-MM-DDTHH:mm) for a moment, in the device's timezone. */
export function dateToLocalInput(date: Date): string {
  const pad = (n: number, width = 2) => String(n).padStart(width, '0')
  return (
    `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

// month is 1–12.
function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

function isCalendarDate(year: number, month: number, day: number): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
}
