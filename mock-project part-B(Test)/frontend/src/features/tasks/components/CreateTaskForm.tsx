'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createTask } from '@/features/tasks/actions/tasks.actions'
import { TASK_MESSAGES, taskFormSchema } from '@/features/tasks/schemas'
import type { TaskFormValues } from '@/features/tasks/schemas'
import { localInputToIso } from '@/features/tasks/lib/due-date'

const CREATED_MESSAGE = 'Task created'

const DEFAULT_VALUES: TaskFormValues = { title: '', description: '', dueDate: '' }

// The schema reads the browser's clock at each check, so one instance is safe to share.
const formSchema = taskFormSchema()

const INPUT_CLASS =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:outline-none aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900'

/**
 * The create-task form (AC-2.1a to AC-2.6a, AC-2.8, AC-3.1, AC-8.1, AC-8.2a, AC-8.4a).
 *
 * The field rules are the shared `taskFormSchema()`; none are written here. The due date is
 * turned into an ISO string with `localInputToIso` in the browser (ADR-0003), and `createTask`
 * gets exactly { title, description, dueDate }. `title` is the schema's trimmed value, because
 * zodResolver hands `onSubmit` the parsed output: it is what the server saves anyway (AC-2.2c),
 * so the browser and server agree.
 *
 * A refusal that names a field shows beside it; any other failure is a toast with the action's
 * own text. A missing text, or a thrown call, gets the fixed wording, and the raw error is only
 * logged (rule 5, ADR-0006). The list is not touched: the live listener shows the new task (AC-3.1).
 */
export function CreateTaskForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES,
  })
  const [saving, setSaving] = useState(false)
  // Set synchronously, so a second submit can't start a second call before a re-render.
  const inFlight = useRef(false)

  async function onSubmit(values: TaskFormValues) {
    if (inFlight.current) return
    inFlight.current = true
    setSaving(true)
    try {
      const dueDate = localInputToIso(values.dueDate)
      if (dueDate === null) {
        setError('dueDate', { type: 'validate', message: TASK_MESSAGES.dueDateInvalid })
        return
      }

      const result = await createTask({
        title: values.title,
        description: values.description,
        dueDate,
      })
      if (result.success) {
        toast.success(CREATED_MESSAGE)
        reset(DEFAULT_VALUES)
        return
      }

      const message = result.error ?? TASK_MESSAGES.saveFailed
      if (result.field) setError(result.field, { type: 'server', message })
      else toast.error(message)
    } catch (error) {
      // Never the thrown message (rule 5).
      console.error('Task create failed:', error)
      toast.error(TASK_MESSAGES.saveFailed)
    } finally {
      inFlight.current = false
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(event) => handleSubmit(onSubmit)(event)}
      noValidate
      className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="space-y-1.5">
        <label htmlFor="task-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="task-title"
          type="text"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'task-title-error' : undefined}
          className={INPUT_CLASS}
          {...register('title')}
        />
        {errors.title && (
          <p id="task-title-error" className="text-xs text-red-500" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="task-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="task-description"
          rows={3}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'task-description-error' : undefined}
          className={INPUT_CLASS}
          {...register('description')}
        />
        {errors.description && (
          <p id="task-description-error" className="text-xs text-red-500" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="task-due-date" className="text-sm font-medium">
          Due date
        </label>
        <input
          id="task-due-date"
          type="datetime-local"
          step={60}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? 'task-due-date-error' : undefined}
          className={INPUT_CLASS}
          {...register('dueDate')}
        />
        {errors.dueDate && (
          <p id="task-due-date-error" className="text-xs text-red-500" role="alert">
            {errors.dueDate.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {saving ? 'Saving...' : 'Add task'}
      </button>
    </form>
  )
}
