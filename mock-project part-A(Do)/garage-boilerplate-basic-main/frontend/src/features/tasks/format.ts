const dueDateFormat = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * Formats a 'YYYY-MM-DD' due date, e.g. "5 Mar 2027", or "No due date" for null.
 * Not formatDate() from @/lib/utils: that shows the previous day for users behind UTC (AC6, SCR-6).
 * The string parses as midnight UTC and is formatted in UTC, so the calendar date never shifts.
 */
export function formatDueDate(dueDate: string | null): string {
  return dueDate === null ? 'No due date' : dueDateFormat.format(new Date(dueDate))
}
