'use client'

import { formatDatetime } from '@/lib/utils'
import type { TaskWithId } from '@/features/tasks/types'

interface TaskItemProps {
  task: TaskWithId
}

/**
 * One task in the list: title, checkbox, full description (if any), due date and time.
 *
 * Title and description are plain text React children, so markup shows as typed (AC-2.3b).
 * The due date is formatted here, in the browser, after the data has arrived, so it uses the
 * viewer's timezone (rule 4, AC-2.5). No overdue marking and no completion time (A11, A19).
 */
export function TaskItem({ task }: TaskItemProps) {
  const checkboxId = `task-${task.id}-status`

  return (
    <li className="flex items-start gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      {/* Display-only: WP8 wires the toggle. Disabled, with no handler that does anything. */}
      <input
        id={checkboxId}
        type="checkbox"
        checked={task.status === 'completed'}
        disabled
        readOnly
        aria-label={`Mark "${task.title}" as completed`}
        className="mt-1 size-4 shrink-0"
      />
      <div className="min-w-0 flex-1">
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
      </div>
    </li>
  )
}
