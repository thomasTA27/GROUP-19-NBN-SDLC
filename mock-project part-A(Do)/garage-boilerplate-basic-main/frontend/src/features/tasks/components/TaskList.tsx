'use client'

import { useMemo, useRef, useState } from 'react'
import { where } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useCollection } from '@/hooks/useFirestore'
import { getTasksCollection } from '@/lib/firebase/firestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { sortTasks } from '@/features/tasks/sort'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { TaskRow } from '@/features/tasks/components/TaskRow'

/** Waits for the signed-in user, so the query never runs with an empty uid. */
export function TaskList() {
  const { user, loading } = useAuth()
  if (loading || !user) return <LoadingSpinner className="mx-auto my-10" />
  // Keyed by uid: useCollection does not resubscribe when only its filters change.
  return <UserTaskList key={user.uid} uid={user.uid} />
}

function UserTaskList({ uid }: { uid: string }) {
  // Memoised: useCollection resubscribes whenever the ref changes, and getTasksCollection()
  // returns a new ref on every call (an unmemoised ref resubscribed 2,084 times in 200 ms).
  const tasksRef = useMemo(() => getTasksCollection(), [])
  // Both filters are required: rules are not filters, so the query must match the read rule (R4).
  const { data, loading, error } = useCollection(
    tasksRef,
    where('uid', '==', uid),
    where('deletedAt', '==', null),
  )
  const tasks = useMemo(() => sortTasks(data), [data])

  // Only one form is open at a time: 'create', a task ID being edited, or none (A31).
  const [openForm, setOpenForm] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)

  function closeCreate() {
    setOpenForm(null)
    // The button is disabled while the form is open, so focus once it is enabled again (A26).
    requestAnimationFrame(() => addButton.current?.focus())
  }

  // After a delete, focus the next task's Edit button, else the previous one's, else + Add Task (A38).
  function focusAfterDelete(deletedId: string) {
    const index = tasks.findIndex((t) => t.id === deletedId)
    const neighbour = tasks[index + 1] ?? tasks[index - 1]
    const target = neighbour
      ? listRef.current?.querySelector<HTMLButtonElement>(
          `li[data-task-id="${neighbour.id}"] button[aria-label^="Edit task:"]`,
        )
      : addButton.current
    target?.focus()
  }

  if (loading) return <LoadingSpinner className="mx-auto my-10" />
  if (error) {
    return (
      <p role="alert" className="px-5 py-6 text-sm text-red-600">
        Tasks could not be loaded. Refresh the page to try again.
      </p>
    )
  }

  const addTask = (
    <button
      ref={addButton}
      type="button"
      disabled={openForm !== null}
      onClick={() => setOpenForm('create')}
      className="inline-flex items-center rounded-md bg-orange-700 px-4 py-2 text-sm font-medium text-white hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      + Add Task
    </button>
  )

  return (
    <div>
      {tasks.length === 0 && openForm !== 'create' ? (
        <EmptyState title="No tasks yet" description="Add your first task to get started." />
      ) : (
        <ul ref={listRef}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isEditing={openForm === task.id}
              editDisabled={openForm !== null && openForm !== task.id}
              onEdit={() => setOpenForm(task.id)}
              onEditClose={() => setOpenForm(null)}
              onDeleted={() => focusAfterDelete(task.id)}
            />
          ))}
        </ul>
      )}

      {openForm === 'create' && <TaskForm onClose={closeCreate} />}

      <div className="px-5 py-3.5">{addTask}</div>
    </div>
  )
}
