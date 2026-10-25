'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { updateTask } from '@/features/tasks/actions/tasks.actions'
import { TASK_MESSAGES, taskFormSchema } from '@/features/tasks/schemas'
import type { TaskFormValues } from '@/features/tasks/schemas'
import { dateToLocalInput, localInputToIso } from '@/features/tasks/lib/due-date'
import type { TaskWithId } from '@/features/tasks/types'

interface EditTaskFormProps {
  task: TaskWithId
  /** Closes the form: Cancel, Escape, or a successful save. The caller returns focus to Edit. */
  onClose: () => void
}

const UPDATED_MESSAGE = 'Task updated'

// Same classes as CreateTaskForm's inputs and TaskItem's buttons (DESIGN.md "Buttons").
const INPUT_CLASS =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:outline-none aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900'
const BUTTON_BASE_CLASS =
  'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
const PRIMARY_BUTTON_CLASS = `${BUTTON_BASE_CLASS} bg-black text-white transition-colors hover:bg-zinc-800 focus-visible:outline-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200`
const SECONDARY_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800`

/**
 * The inline edit form, shown inside a task's list item (AC-2.6b, 2.6c, 2.8, 5.1 to 5.4, 7.1,
 * 7.4, 8.1a, 8.1b, 8.2a, 8.4a). There is no edit page (spec A8, section 9).
 *
 * The field rules are the shared `taskFormSchema`; none are written here. The form is judged
 * against the values it loaded (ADR-0005): they are captured once, so a live update to the task
 * while the form is open changes neither the baseline nor what the user typed. The loaded due date
 * is passed as `unchangedDueDate`, so a past due date can be kept while another field changes
 * (AC-2.6c), but changing it to a different past time is refused (AC-2.6b).
 *
 * `updateTask` gets `{ id, ...changed }` where `changed` holds only the fields react-hook-form
 * reports as dirty (AC-5.2), never the status or a system field (AC-5.3). `title` is the schema's
 * trimmed value, as in CreateTaskForm. Save stays disabled until a field differs from its loaded
 * value, so typing a change back disables it again.
 *
 * A refusal that names a field shows beside it; any other failure is a toast with the action's own
 * text (this includes "This task no longer exists.", AC-7.4). A missing text, or a thrown call,
 * gets the fixed wording, and the raw error is only logged (rule 5, ADR-0006). The list is not
 * touched: the live listener shows the new values (AC-8.1b).
 */
export function EditTaskForm({ task, onClose }: EditTaskFormProps) {
  // Captured once. The due date is read in the browser, so it is in the viewer's timezone (rule 4).
  const [loaded] = useState<TaskFormValues>(() => ({
    title: task.title,
    description: task.description,
    dueDate: dateToLocalInput(task.dueDate.toDate()),
  }))
  const [formSchema] = useState(() => taskFormSchema({ unchangedDueDate: loaded.dueDate }))

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: loaded,
  })
  const [saving, setSaving] = useState(false)
  // Set synchronously, so a second submit can't start a second call before a re-render.
  const inFlight = useRef(false)

  const ids = {
    title: `task-${task.id}-edit-title`,
    description: `task-${task.id}-edit-description`,
    dueDate: `task-${task.id}-edit-due-date`,
  }

  // When the form opens, focus goes to Title.
  useEffect(() => {
    setFocus('title')
  }, [setFocus])

  async function onSubmit(values: TaskFormValues) {
    if (inFlight.current) return

    // Only what the user changed (AC-5.2). Never a status or a system field (AC-5.3).
    const changed: { title?: string; description?: string; dueDate?: string } = {}
    if (dirtyFields.title) changed.title = values.title
    if (dirtyFields.description) changed.description = values.description
    if (dirtyFields.dueDate) {
      const dueDate = localInputToIso(values.dueDate)
      if (dueDate === null) {
        setError('dueDate', { type: 'validate', message: TASK_MESSAGES.dueDateInvalid })
        return
      }
      changed.dueDate = dueDate
    }
    // Save is disabled with nothing changed; this covers a submit that still gets through.
    if (Object.keys(changed).length === 0) return

    inFlight.current = true
    setSaving(true)
    try {
      const result = await updateTask({ id: task.id, ...changed })
      if (result.success) {
        toast.success(UPDATED_MESSAGE)
        onClose()
        return
      }

      const message = result.error ?? TASK_MESSAGES.saveFailed
      if (result.field) setError(result.field, { type: 'server', message })
      else toast.error(message)
    } catch (error) {
      // Never the thrown message (rule 5).
      console.error('Task update failed:', error)
      toast.error(TASK_MESSAGES.saveFailed)
    } finally {
      inFlight.current = false
      setSaving(false)
    }
  }

  // Escape does the same as Cancel, but not while a save is running.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || saving) return
    event.stopPropagation()
    onClose()
  }

  return (
    <div
      role="group"
      aria-label={`Edit "${task.title}"`}
      aria-busy={saving || undefined}
      onKeyDown={handleKeyDown}
    >
      <form onSubmit={(event) => handleSubmit(onSubmit)(event)} noValidate className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor={ids.title} className="text-sm font-medium">
            Title
          </label>
          <input
            id={ids.title}
            type="text"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? `${ids.title}-error` : undefined}
            className={INPUT_CLASS}
            {...register('title')}
          />
          {errors.title && (
            <p id={`${ids.title}-error`} className="text-xs text-red-500" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.description} className="text-sm font-medium">
            Description
          </label>
          <textarea
            id={ids.description}
            rows={3}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? `${ids.description}-error` : undefined}
            className={INPUT_CLASS}
            {...register('description')}
          />
          {errors.description && (
            <p id={`${ids.description}-error`} className="text-xs text-red-500" role="alert">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.dueDate} className="text-sm font-medium">
            Due date
          </label>
          <input
            id={ids.dueDate}
            type="datetime-local"
            step={60}
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? `${ids.dueDate}-error` : undefined}
            className={INPUT_CLASS}
            {...register('dueDate')}
          />
          {errors.dueDate && (
            <p id={`${ids.dueDate}-error`} className="text-xs text-red-500" role="alert">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button type="submit" disabled={saving || !isDirty} className={PRIMARY_BUTTON_CLASS}>
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={SECONDARY_BUTTON_CLASS}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
