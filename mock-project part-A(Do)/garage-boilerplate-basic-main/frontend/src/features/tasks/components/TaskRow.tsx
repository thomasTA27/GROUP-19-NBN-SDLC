'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteTask, setTaskStatus } from '@/features/tasks/actions/tasks.actions'
import { formatDueDate } from '@/features/tasks/format'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import type { TaskStatus } from '@/features/tasks/schemas'
import type { Task } from '@/types/firestore'

const UPDATE_FAILED = 'Task could not be updated. Please try again.'
const DELETE_FAILED = 'Task could not be deleted. Please try again.'
const NOT_FOUND = 'Task not found.'

const iconButtonClass =
  'grid size-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50'

interface TaskRowProps {
  task: Task
  /** This row shows the edit form (A31). */
  isEditing: boolean
  /** Another form is open, so Edit is disabled (A31). */
  editDisabled: boolean
  onEdit: () => void
  onEditClose: () => void
  /** Called after a successful delete; the list moves focus (A38). */
  onDeleted: () => void
}

export function TaskRow({ task, isEditing, editDisabled, onEdit, onEditClose, onDeleted }: TaskRowProps) {
  const editButton = useRef<HTMLButtonElement>(null)
  const deleteButton = useRef<HTMLButtonElement>(null)
  const keepButton = useRef<HTMLButtonElement>(null)
  const returnFocusTo = useRef<'edit' | 'delete' | null>(null)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // Optimistic status (A42): shown while saving, and until the live list moves off the old status.
  const [optimistic, setOptimistic] = useState<{ from: TaskStatus; to: TaskStatus } | null>(null)
  const [savingStatus, setSavingStatus] = useState(false)

  const status =
    optimistic && (savingStatus || task.status === optimistic.from) ? optimistic.to : task.status
  const completed = status === 'completed'

  // Return focus after the edit form or the delete confirmation closes (A31, A34).
  useEffect(() => {
    if (isEditing || confirmingDelete) return
    if (returnFocusTo.current === 'edit') editButton.current?.focus()
    if (returnFocusTo.current === 'delete') deleteButton.current?.focus()
    returnFocusTo.current = null
  }, [isEditing, confirmingDelete])

  // The confirmation opens with focus on Keep, so Enter by mistake does not delete (A34).
  useEffect(() => {
    if (confirmingDelete) keepButton.current?.focus()
  }, [confirmingDelete])

  async function toggleStatus(checked: boolean) {
    if (savingStatus) return
    const to: TaskStatus = checked ? 'completed' : 'pending'
    setOptimistic({ from: task.status, to })
    setSavingStatus(true)
    try {
      const result = await setTaskStatus(task.id, to)
      if (!result.success) {
        setOptimistic(null)
        toast.error(result.error ?? UPDATE_FAILED)
      }
    } catch {
      setOptimistic(null)
      toast.error(UPDATE_FAILED)
    } finally {
      setSavingStatus(false)
    }
  }

  function closeEdit() {
    returnFocusTo.current = 'edit'
    onEditClose()
  }

  function keep() {
    returnFocusTo.current = 'delete'
    setConfirmingDelete(false)
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      const result = await deleteTask(task.id)
      if (result.success) {
        toast.success('Task deleted')
        onDeleted()
        return
      }
      toast.error(result.error ?? DELETE_FAILED)
      // Deleted elsewhere: the live list is already removing the row (A37).
      if (result.error === NOT_FOUND) setConfirmingDelete(false)
    } catch {
      toast.error(DELETE_FAILED)
    } finally {
      setDeleting(false)
    }
  }

  function onConfirmKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && !deleting) keep()
  }

  if (isEditing) {
    return (
      <li className="border-b border-zinc-200">
        <TaskForm task={task} onClose={closeEdit} />
      </li>
    )
  }

  const checkboxId = `task-status-${task.id}`

  return (
    <li
      data-task-id={task.id}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-zinc-200 px-5 py-3.5"
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={completed}
        // Native disabled per A42; whether focus survives this is open in SCR-4.
        disabled={savingStatus || confirmingDelete}
        onChange={(event) => void toggleStatus(event.target.checked)}
        className="mt-0.5 size-4.5 cursor-pointer accent-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed"
      />

      <div className="min-w-0">
        <label htmlFor={checkboxId} className="sr-only">
          Mark “{task.title}” as completed
        </label>
        <p className={cn('font-medium break-words', completed && 'text-zinc-500 line-through')}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 break-words whitespace-pre-line text-zinc-700">{task.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span>{task.dueDate ? `Due ${formatDueDate(task.dueDate)}` : formatDueDate(null)}</span>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800',
            )}
          >
            {completed ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="flex gap-1">
        <button
          ref={editButton}
          type="button"
          aria-label={`Edit task: ${task.title}`}
          // Also disabled while this row's delete confirmation is open, so it cannot reappear after an edit.
          disabled={editDisabled || confirmingDelete}
          onClick={onEdit}
          className={iconButtonClass}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>
        <button
          ref={deleteButton}
          type="button"
          aria-label={`Delete task: ${task.title}`}
          disabled={confirmingDelete}
          onClick={() => setConfirmingDelete(true)}
          className={cn(iconButtonClass, 'hover:bg-red-50 hover:text-red-600')}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {confirmingDelete && (
        <div
          role="group"
          aria-label="Confirm delete"
          onKeyDown={onConfirmKeyDown}
          className="col-start-2 col-end-4 flex flex-wrap items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-2.5"
        >
          <p className="mr-auto font-medium text-red-700">Delete this task?</p>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void confirmDelete()}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
          <button
            ref={keepButton}
            type="button"
            disabled={deleting}
            onClick={keep}
            className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep
          </button>
        </div>
      )}
    </li>
  )
}
