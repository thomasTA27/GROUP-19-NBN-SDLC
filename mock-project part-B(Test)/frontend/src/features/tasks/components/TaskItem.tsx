'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { formatDatetime } from '@/lib/utils'
import { deleteTask, setTaskStatus } from '@/features/tasks/actions/tasks.actions'
import { TASK_MESSAGES } from '@/features/tasks/schemas'
import { EditTaskForm } from '@/features/tasks/components/EditTaskForm'
import type { TaskActionResult, TaskWithId } from '@/features/tasks/types'

interface TaskItemProps {
  task: TaskWithId
}

const DELETED_MESSAGE = 'Task deleted'

const BUTTON_BASE_CLASS =
  'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

// DESIGN.md "Buttons": secondary and destructive.
const SECONDARY_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800`
const DESTRUCTIVE_BUTTON_CLASS = `${BUTTON_BASE_CLASS} bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600`

// What is running now. The item is busy for one thing at a time.
type Saving = 'toggle' | 'delete' | null

/**
 * One task in the list: title, checkbox, full description (if any), due date and time, and the
 * edit and delete controls.
 *
 * Title and description are plain text React children, so markup shows as typed (AC-2.3b).
 * The due date is formatted here, in the browser, after the data has arrived, so it uses the
 * viewer's timezone (rule 4, AC-2.5). No overdue marking and no completion time (A11, A19).
 *
 * The checkbox is controlled by the stored status and holds no copy of it, so a failed toggle
 * shows the stored status with no rollback (AC-6.5). Every change goes through a Server Action;
 * the list updates through the live listener, so nothing here removes or edits the item itself
 * (rule 1). Failures show the action's own text, or the fixed wording if the call throws (rule 5).
 *
 * Edit opens EditTaskForm in place of the title, description, due date and delete controls; the
 * checkbox stays. The status is not part of an edit, so a toggle while the form is open runs as
 * usual and never touches the form's values. The form's own call is independent of the toggle and
 * delete rule: it writes other fields, in its own transaction (ADR-0005, A28).
 */
export function TaskItem({ task }: TaskItemProps) {
  const checkboxId = `task-${task.id}-status`
  const [confirming, setConfirming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState<Saving>(null)
  // Set synchronously, so a second click can't start a second call before a re-render.
  const inFlight = useRef(false)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  // True when the confirmation closed after it was opened, so focus goes back to Delete.
  const restoreFocus = useRef(false)
  // True when the edit form closed after it was opened, so focus goes back to Edit.
  const restoreEditFocus = useRef(false)

  useEffect(() => {
    if (confirming) {
      cancelButtonRef.current?.focus()
    } else if (restoreFocus.current) {
      restoreFocus.current = false
      deleteButtonRef.current?.focus()
    }
  }, [confirming])

  useEffect(() => {
    if (!editing && restoreEditFocus.current) {
      restoreEditFocus.current = false
      editButtonRef.current?.focus()
    }
  }, [editing])

  function closeConfirmation() {
    restoreFocus.current = true
    setConfirming(false)
  }

  function closeEdit() {
    restoreEditFocus.current = true
    setEditing(false)
  }

  // Runs one action. 'skipped' means another call was already in flight, so nothing ran and the
  // caller must not touch saving, toasts or focus. Otherwise: the failure text, or null if it worked.
  async function run(
    kind: 'toggle' | 'delete',
    call: () => Promise<TaskActionResult>
  ): Promise<'skipped' | { failure: string | null }> {
    if (inFlight.current) return 'skipped'
    inFlight.current = true
    setSaving(kind)
    try {
      const result = await call()
      return { failure: result.success ? null : (result.error ?? TASK_MESSAGES.saveFailed) }
    } catch (error) {
      // The caller gets the fixed wording, never the thrown message (rule 5).
      console.error('Task change failed:', error)
      return { failure: TASK_MESSAGES.saveFailed }
    } finally {
      inFlight.current = false
    }
  }

  async function handleToggle() {
    // Sets a status, never flips it (ADR-0005). No date logic: overdue tasks toggle too (AC-6.7).
    const status = task.status === 'completed' ? 'pending' : 'completed'
    const outcome = await run('toggle', () => setTaskStatus({ id: task.id, status }))
    if (outcome === 'skipped') return
    // No success message for a toggle: the checkbox is the confirmation (A35, AC-8.2c).
    if (outcome.failure !== null) toast.error(outcome.failure)
    setSaving(null)
  }

  async function handleConfirmDelete() {
    const outcome = await run('delete', () => deleteTask({ id: task.id }))
    if (outcome === 'skipped') return
    const failure = outcome.failure
    if (failure === null) {
      // Stays busy: the live listener removes this item, and until it does a second click
      // must not start a second delete (AC-8.2b).
      toast.success(DELETED_MESSAGE)
      return
    }
    toast.error(failure)
    setSaving(null)
    closeConfirmation()
  }

  function handleConfirmationKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || saving !== null) return
    event.stopPropagation()
    closeConfirmation()
  }

  const toggling = saving === 'toggle'
  const deleting = saving === 'delete'

  return (
    <li className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <input
        id={checkboxId}
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={handleToggle}
        disabled={saving !== null}
        aria-busy={toggling || undefined}
        aria-label={`Mark "${task.title}" as completed`}
        className="mt-1 size-4 shrink-0"
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <EditTaskForm task={task} onClose={closeEdit} />
        ) : (
          <>
            <h3 className="font-medium break-words">{task.title}</h3>
            {task.description !== '' && (
              <p
                data-testid="task-description"
                className="mt-1 text-sm break-words whitespace-pre-wrap text-zinc-600 dark:text-zinc-400"
              >
                {task.description}
              </p>
            )}
            <p data-testid="task-due" className="mt-1 text-xs text-zinc-500">
              {formatDatetime(task.dueDate.toDate())}
            </p>
            <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
              {confirming ? (
                <div
                  role="group"
                  aria-label={`Confirm deleting "${task.title}"`}
                  aria-busy={deleting || undefined}
                  onKeyDown={handleConfirmationKeyDown}
                  className="flex min-w-0 flex-wrap items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={saving !== null}
                    className={DESTRUCTIVE_BUTTON_CLASS}
                  >
                    Delete task
                  </button>
                  <button
                    ref={cancelButtonRef}
                    type="button"
                    onClick={closeConfirmation}
                    disabled={saving !== null}
                    className={SECONDARY_BUTTON_CLASS}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    ref={editButtonRef}
                    type="button"
                    onClick={() => setEditing(true)}
                    aria-label={`Edit "${task.title}"`}
                    className={SECONDARY_BUTTON_CLASS}
                  >
                    Edit
                  </button>
                  <button
                    ref={deleteButtonRef}
                    type="button"
                    onClick={() => setConfirming(true)}
                    aria-label={`Delete "${task.title}"`}
                    className={SECONDARY_BUTTON_CLASS}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </li>
  )
}
