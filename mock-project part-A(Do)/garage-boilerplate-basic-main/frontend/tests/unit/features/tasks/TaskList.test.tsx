import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Timestamp } from 'firebase/firestore'
import { TaskList } from '@/features/tasks/components/TaskList'
import { useAuth } from '@/hooks/useAuth'
import { useCollection } from '@/hooks/useFirestore'
import { deleteTask } from '@/features/tasks/actions/tasks.actions'
import type { Task } from '@/types/firestore'

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('@/hooks/useFirestore', () => ({ useCollection: vi.fn() }))
vi.mock('@/lib/firebase/firestore', () => ({ getTasksCollection: () => 'TASKS_REF' }))
vi.mock('firebase/firestore', () => ({
  where: (field: string, op: string, value: unknown) => ({ field, op, value }),
}))
vi.mock('@/features/tasks/actions/tasks.actions', () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  setTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function task(id: string, title: string, dueDate: string | null, createdAtMs: number): Task {
  const ts = { toMillis: () => createdAtMs } as Timestamp
  return {
    id,
    uid: 'user-1',
    title,
    description: '',
    dueDate,
    status: 'pending',
    createdAt: ts,
    updatedAt: ts,
    deletedAt: null,
    _schemaVersion: 1,
  }
}

function collectionReturns(result: Partial<ReturnType<typeof useCollection<Task>>>) {
  vi.mocked(useCollection).mockReturnValue({ data: [], loading: false, error: null, ...result })
}

const addTask = () => screen.getByRole('button', { name: '+ Add Task' })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAuth).mockReturnValue({ user: { uid: 'user-1' }, loading: false } as never)
  collectionReturns({})
})

describe('TaskList', () => {
  it("queries only the user's active tasks, with both filters the rules need", () => {
    render(<TaskList />)
    expect(useCollection).toHaveBeenCalledWith(
      'TASKS_REF',
      { field: 'uid', op: '==', value: 'user-1' },
      { field: 'deletedAt', op: '==', value: null },
    )
  })

  it('shows a spinner while loading', () => {
    collectionReturns({ loading: true })
    render(<TaskList />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows an inline error when the subscription fails', () => {
    collectionReturns({ error: new Error('permission-denied') })
    render(<TaskList />)
    expect(screen.getByRole('alert')).toHaveTextContent('Tasks could not be loaded.')
  })

  it('shows "No tasks yet" with + Add Task below it when there are no tasks (A25)', () => {
    render(<TaskList />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(addTask()).toBeEnabled()
  })

  it('lists tasks in A3 order: due date, then createdAt, no due date last', () => {
    collectionReturns({
      data: [
        task('c', 'No date', null, 1),
        task('b', 'Later', '2027-03-05', 1),
        task('a', 'Sooner', '2027-01-10', 2),
      ],
    })
    render(<TaskList />)
    const titles = screen.getAllByRole('listitem').map((li) => within(li).getByRole('checkbox').id)
    expect(titles).toEqual(['task-status-a', 'task-status-b', 'task-status-c'])
  })

  it('opening the create form disables + Add Task and every Edit button (A31)', async () => {
    collectionReturns({ data: [task('a', 'One', null, 1)] })
    const user = userEvent.setup()
    render(<TaskList />)

    await user.click(addTask())

    expect(screen.getByRole('form', { name: 'Create task' })).toBeInTheDocument()
    expect(addTask()).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Edit task: One' })).toBeDisabled()
  })

  it('Cancel on the create form returns focus to + Add Task (A26)', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    await user.click(addTask())
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('form', { name: 'Create task' })).not.toBeInTheDocument()
    await waitFor(() => expect(addTask()).toHaveFocus())
  })

  it('after a delete, focus moves to the next task’s Edit button (A38)', async () => {
    vi.mocked(deleteTask).mockResolvedValue({ success: true })
    collectionReturns({ data: [task('a', 'One', '2027-01-01', 1), task('b', 'Two', '2027-02-01', 1)] })
    const user = userEvent.setup()
    render(<TaskList />)

    await user.click(screen.getByRole('button', { name: 'Delete task: One' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit task: Two' })).toHaveFocus())
  })

  it('after deleting the last task, focus moves to + Add Task (A38)', async () => {
    vi.mocked(deleteTask).mockResolvedValue({ success: true })
    collectionReturns({ data: [task('a', 'Only', null, 1)] })
    const user = userEvent.setup()
    render(<TaskList />)

    await user.click(screen.getByRole('button', { name: 'Delete task: Only' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(addTask()).toHaveFocus())
  })
})
