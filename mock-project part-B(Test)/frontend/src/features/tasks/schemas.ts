import { z } from 'zod'
import type { Task } from '@/types'
import type { TaskActionResult, TaskField } from '@/features/tasks/types'
import { dueDateProblem, localInputToIso, parseDueDateIso } from '@/features/tasks/lib/due-date'

/**
 * The tasks feature's field rules, defined once and shared by the browser forms and the
 * Server Actions (ADR-0006). Every check has its own message stating the rule and its limit
 * (spec A36), and anything without one gets "Invalid request", so no Zod default text or
 * library error ever reaches the user (.claude/rules/tasks.md rule 5, AC-8.5).
 *
 * The request schemas are strict: a field that isn't theirs, including any system field
 * (uid, createdAt, updatedAt, deletedAt, _schemaVersion), is refused whatever its value
 * (AC-2.10a, AC-2.10b).
 */

const TITLE_MAX_CHARS = 200
const DESCRIPTION_MAX_CHARS = 10_000

export const TASK_MESSAGES = {
  invalidRequest: 'Invalid request',
  titleRequired: 'Title is required',
  titleTooLong: 'Title must be 200 characters or fewer',
  descriptionTooLong: 'Description must be 10,000 characters or fewer',
  dueDateRequired: 'Due date is required',
  dueDateInvalid: 'Due date must be a valid date and time',
  dueDateFormat:
    'Due date must be an ISO 8601 date and time with a timezone offset, such as 2027-03-05T10:30:00.000Z',
  dueDateNotWholeMinute: 'Due date must be to the minute, with zero seconds and milliseconds',
  dueDatePast: "Due date can't be in the past",
  dueDateTooFar: "Due date can't be more than 10 years from now",
  statusInvalid: 'Status must be pending or completed',
  statusNewMustBePending: 'A new task must start as pending',
  createFields: 'A new task can only include a title, description, due date and status',
  editFields: 'An edit can only change the title, description and due date',
  editEmpty: 'An edit must change at least one of the title, description and due date',
  setStatusFields: 'A status change can only include the task ID and status',
  deleteFields: 'A delete can only include the task ID',
  taskIdRequired: 'Task ID is required',
  taskIdSlash: "Task ID can't contain '/'",
  taskIdInvalid: 'Task ID is not valid',
  taskGone: 'This task no longer exists.',
  saveFailed: "Your change couldn't be saved. Please try again.",
  loadFailed: "Tasks couldn't be loaded. Please refresh the page.",
} as const

const TASK_STATUSES = ['pending', 'completed'] as const satisfies readonly Task['status'][]

const TASK_FIELDS: readonly TaskField[] = ['title', 'description', 'dueDate']
const OWN_MESSAGES: ReadonlySet<string> = new Set(Object.values(TASK_MESSAGES))

// For any problem without its own message: a wrong type, or a body that isn't an object.
const invalidRequest: z.ZodErrorMap = () => ({ message: TASK_MESSAGES.invalidRequest })

// Characters are Unicode code points (spec A27): 👍 is 1, 🇦🇺 is 2, a line break is 1. A CRLF
// pair is two code points but one line break, so it counts as 1. Only the count changes; the
// value itself is kept as sent.
function charCount(value: string): number {
  return [...value.replace(/\r\n/g, '\n')].length
}

// ── Field rules ──────────────────────────────────────────────────────────────

// Zod's trim() is JavaScript's trim(), so whitespace is the same in the browser and on the
// server (A2, SCR-4). The length is counted after trimming, and the trimmed title is what's saved.
const titleRule = z
  .string({
    required_error: TASK_MESSAGES.titleRequired,
    invalid_type_error: TASK_MESSAGES.invalidRequest,
  })
  .trim()
  .min(1, TASK_MESSAGES.titleRequired)
  .refine((title) => charCount(title) <= TITLE_MAX_CHARS, TASK_MESSAGES.titleTooLong)

// Not trimmed: the description is saved exactly as entered (AC-3.1).
const descriptionRule = z
  .string({
    required_error: TASK_MESSAGES.invalidRequest,
    invalid_type_error: TASK_MESSAGES.invalidRequest,
  })
  .refine(
    (description) => charCount(description) <= DESCRIPTION_MAX_CHARS,
    TASK_MESSAGES.descriptionTooLong
  )

// As sent to the server: an ISO string with an offset, to the minute (ADR-0003). Outputs a Date.
const dueDateRequestRule = z
  .string({
    required_error: TASK_MESSAGES.dueDateRequired,
    invalid_type_error: TASK_MESSAGES.invalidRequest,
  })
  .min(1, TASK_MESSAGES.dueDateRequired)
  .transform((value, ctx) => {
    const parsed = parseDueDateIso(value)
    if (parsed.ok) return parsed.date
    ctx.addIssue({
      code: 'custom',
      message:
        parsed.reason === 'format'
          ? TASK_MESSAGES.dueDateFormat
          : TASK_MESSAGES.dueDateNotWholeMinute,
    })
    return z.NEVER
  })

const statusRule = z.enum(TASK_STATUSES, {
  errorMap: () => ({ message: TASK_MESSAGES.statusInvalid }),
})

const TASK_ID_MAX_BYTES = 1500

// Firestore can't use these as a document ID: over 1,500 bytes, '.' or '..', or '__...__'. The
// message never repeats the ID.
function isUsableDocumentId(id: string): boolean {
  return (
    new TextEncoder().encode(id).length <= TASK_ID_MAX_BYTES &&
    id !== '.' &&
    id !== '..' &&
    !/^__[\s\S]*__$/.test(id)
  )
}

// A refused ID never reaches the database. A '/' would point the lookup at another path.
const taskIdRule = z
  .string({
    required_error: TASK_MESSAGES.taskIdRequired,
    invalid_type_error: TASK_MESSAGES.invalidRequest,
  })
  .min(1, TASK_MESSAGES.taskIdRequired)
  .refine((id) => !id.includes('/'), TASK_MESSAGES.taskIdSlash)
  .refine(isUsableDocumentId, TASK_MESSAGES.taskIdInvalid)

/**
 * The past and 10-year rules (AC-2.6a, 2.6b, 2.6d) as a message, or null when the due date is
 * allowed. `now` is the save moment: in a Server Action, the server's clock.
 */
export function dueDateRangeError(dueDate: Date, now: Date): string | null {
  const problem = dueDateProblem(dueDate, now)
  if (problem === 'invalid') return TASK_MESSAGES.dueDateInvalid
  if (problem === 'past') return TASK_MESSAGES.dueDatePast
  if (problem === 'too-far') return TASK_MESSAGES.dueDateTooFar
  return null
}

// ── Request schemas (Server Actions) ─────────────────────────────────────────

function requestObject<T extends z.ZodRawShape>(shape: T, fieldsMessage: string) {
  return z.object(shape, { errorMap: invalidRequest }).strict(fieldsMessage)
}

/**
 * Create. The status may be left out and means pending; any other status is refused
 * (AC-3.2b, 3.2c). The past and 10-year checks need the server's clock, so the action runs
 * `dueDateRangeError` after parsing.
 */
export const createTaskRequestSchema = requestObject(
  {
    title: titleRule,
    description: descriptionRule.default(''),
    dueDate: dueDateRequestRule,
    status: statusRule
      .refine((status): status is 'pending' => status === 'pending', {
        message: TASK_MESSAGES.statusNewMustBePending,
      })
      .default('pending'),
  },
  TASK_MESSAGES.createFields
)

/**
 * Edit. Only the fields being changed are sent, and at least one must be (ADR-0005). Any
 * status is refused, even the current one (AC-5.3), and so is a deletedAt (AC-7.6). The
 * action checks the due date's range only if it differs from the stored one (AC-2.6c).
 */
export const updateTaskRequestSchema = requestObject(
  {
    id: taskIdRule,
    title: titleRule.optional(),
    description: descriptionRule.optional(),
    dueDate: dueDateRequestRule.optional(),
  },
  TASK_MESSAGES.editFields
).refine(
  ({ title, description, dueDate }) =>
    title !== undefined || description !== undefined || dueDate !== undefined,
  { message: TASK_MESSAGES.editEmpty }
)

/** Set status: the target status, not "flip" (ADR-0005). */
export const setTaskStatusRequestSchema = requestObject(
  { id: taskIdRule, status: statusRule },
  TASK_MESSAGES.setStatusFields
)

export const deleteTaskRequestSchema = requestObject({ id: taskIdRule }, TASK_MESSAGES.deleteFields)

export type CreateTaskInput = z.input<typeof createTaskRequestSchema>
export type UpdateTaskInput = z.input<typeof updateTaskRequestSchema>
export type SetTaskStatusInput = z.input<typeof setTaskStatusRequestSchema>
export type DeleteTaskInput = z.input<typeof deleteTaskRequestSchema>

/**
 * Turns a failed parse into a task action's refusal: the first problem's message, and the
 * form field it belongs to, if any (ADR-0006). A message that isn't one of TASK_MESSAGES
 * becomes "Invalid request", so library text can't get through.
 */
export function toTaskRefusal(error: z.ZodError): TaskActionResult<never> {
  const issue = error.issues[0]
  const message =
    issue && OWN_MESSAGES.has(issue.message) ? issue.message : TASK_MESSAGES.invalidRequest
  const field = TASK_FIELDS.find((name) => name === issue?.path[0])
  return field ? { success: false, error: message, field } : { success: false, error: message }
}

// ── Form schema (browser) ────────────────────────────────────────────────────

export interface TaskFormSchemaOptions {
  /** The clock for the early due-date checks. Defaults to the browser's, read at each check. */
  now?: () => Date
  /**
   * The edit form's loaded due date, as a `datetime-local` value. When it's submitted
   * unchanged, the early due-date checks are skipped, so a past due date can be kept (AC-2.6c).
   */
  unchangedDueDate?: string
}

/**
 * The create and edit forms' schema. Same title and description rules as the server. The due
 * date is the `datetime-local` value, checked early against the browser's clock for quick
 * feedback; the server's answer wins (ADR-0003). The form converts it with `localInputToIso`.
 */
export function taskFormSchema({
  now = () => new Date(),
  unchangedDueDate,
}: TaskFormSchemaOptions = {}) {
  return z.object(
    {
      title: titleRule,
      description: descriptionRule,
      dueDate: z
        .string({
          required_error: TASK_MESSAGES.dueDateRequired,
          invalid_type_error: TASK_MESSAGES.invalidRequest,
        })
        .superRefine((value, ctx) => {
          if (value === '') {
            ctx.addIssue({ code: 'custom', message: TASK_MESSAGES.dueDateRequired })
            return
          }
          const iso = localInputToIso(value)
          if (iso === null) {
            ctx.addIssue({ code: 'custom', message: TASK_MESSAGES.dueDateInvalid })
            return
          }
          if (value === unchangedDueDate) return
          const message = dueDateRangeError(new Date(iso), now())
          if (message) ctx.addIssue({ code: 'custom', message })
        }),
    },
    { errorMap: invalidRequest }
  )
}

export type TaskFormValues = z.infer<ReturnType<typeof taskFormSchema>>
