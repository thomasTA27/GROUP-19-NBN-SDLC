import { z } from 'zod'
import { idSchema } from '@/lib/validations/common'

// Shared by the task form and the Server Actions, so both apply the same rules (AC7, AC13).

const MAX_DUE_DATE = '2099-12-31'

/** True when `value` is `YYYY-MM-DD` and names a real calendar date (rejects 2027-02-30). */
function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number) as [number, number, number]
  // setUTCFullYear, not Date.UTC: Date.UTC maps years 0–99 to 1900–1999.
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

const titleSchema = z
  .string({ required_error: 'Title is required.', invalid_type_error: 'Title is required.' })
  .trim()
  .min(1, 'Title is required.')
  .max(100, 'Title must be 100 characters or fewer.')
  .refine((title) => !/[\r\n]/.test(title), 'Title must be a single line.')

const descriptionSchema = z
  .string()
  .trim()
  .max(2000, 'Description must be 2,000 characters or fewer.')

// The date input sends '' when empty; it is stored as null (D4).
const dueDateSchema = z
  .union([z.string(), z.null()], {
    errorMap: () => ({ message: 'Due date must be a valid date.' }),
  })
  .transform((value) => (value === '' ? null : value))
  .superRefine((value, ctx) => {
    if (value === null) return
    if (!isCalendarDate(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Due date must be a valid date.' })
    } else if (value > MAX_DUE_DATE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Due date must be on or before 31 Dec 2099.',
      })
    }
  })

export const taskInputSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    dueDate: dueDateSchema,
  })
  .strict()

/** Rejects `/` so a client-supplied ID cannot address a document outside /tasks (ADR-0007). */
export const taskIdSchema = idSchema.refine((id) => !id.includes('/'), 'Task not found.')

export const taskStatusSchema = z.enum(['pending', 'completed'], {
  errorMap: () => ({ message: 'Status must be pending or completed.' }),
})

export type TaskFormValues = z.input<typeof taskInputSchema>
export type TaskInput = z.output<typeof taskInputSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
