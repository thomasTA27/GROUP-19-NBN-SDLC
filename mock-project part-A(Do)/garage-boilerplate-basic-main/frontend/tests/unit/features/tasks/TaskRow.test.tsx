import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import type { Timestamp } from 'firebase/firestore'
import { TaskRow } from '@/features/tasks/components/TaskRow'
import { deleteTask, setTaskStatus } from '@/features/tasks/actions/tasks.actions'
import type { Task } from '@/types/firestore'

vi.mock('@/features/tasks/actions/tasks.actions', () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  setTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const ts = {} as Timestamp
const baseTask: Task = {
  id: 'task-1',
  uid: 'user-1',
  title: 'Buy milk',
  description: '',
  dueDate: '2027-03-05',
  status: 'pending',
  createdAt: ts,
  updatedAt: ts,
  deletedAt: null,
  _schemaVersion: 1,
}

const handlers = { onEdit: vi.fn(), onEditClose: vi.fn(), onDeleted: vi.fn() }

function renderRow(task: Partial<Task> = {}, props: { isEditing?: boolean; editDisabled?: boolean } = {}) {
  const ui = (t: Task, p: typeof props) => (
    <ul>
      <TaskRow task={t} isEditing={!!p.isEditing} editDisabled={!!p.editDisabled} {...handlers} />
    </ul>
  )
  const full = { ...baseTask, ...task }
  const view = render(ui(full, props))
  return { ...view, rerenderRow: (p: typeof props) => view.rerender(ui(full, p)) }
}

const checkbox = () => screen.getByRole('checkbox', { name: 'Mark “Buy milk” as completed' })
const deleteButton = () => screen.getByRole('button', { name: 'Delete task: Buy milk' })
const editButton = () => screen.getByRole('button', { name: 'Edit task: Buy milk' })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TaskRow: display', () => {
  it('shows title, due date, Pending badge and an unchecked box for a pending task', () => {
    renderRow()
    expect(checkbox()).not.toBeChecked()
    expect(screen.getByText('Due 5 Mar 2027')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows a checked box, Completed badge and struck-through title for a completed task', () => {
    renderRow({ status: 'completed', dueDate: null })
    expect(checkbox()).toBeChecked()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Buy milk')).toHaveClass('line-through')
    expect(screen.getByText('No due date')).toBeInTheDocument()
  })

  it('shows task text literally, never as HTML (A10)', () => {
    renderRow({ title: '<b>hi</b>' })
    expect(screen.getByText('<b>hi</b>')).toBeInTheDocument()
  })
})

describe('TaskRow: status checkbox', () => {
  it('updates at once, calls setTaskStatus with the target status, and shows no toast on success', async () => {
    let resolve!: (r: { success: boolean }) => void
    vi.mocked(setTaskStatus).mockReturnValue(new Promise((r) => (resolve = r)))
    const user = userEvent.setup()
    renderRow()

    await user.click(checkbox())

    expect(setTaskStatus).toHaveBeenCalledWith('task-1', 'completed')
    expect(checkbox()).toBeChecked()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Buy milk')).toHaveClass('line-through')
    expect(checkbox()).toBeDisabled()

    resolve({ success: true })
    await waitFor(() => expect(checkbox()).toBeEnabled())
    expect(checkbox()).toBeChecked()
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('toggles a completed task back to pending with the Space key', async () => {
    vi.mocked(setTaskStatus).mockResolvedValue({ success: true })
    const user = userEvent.setup()
    renderRow({ status: 'completed' })

    checkbox().focus()
    await user.keyboard(' ')

    expect(setTaskStatus).toHaveBeenCalledWith('task-1', 'pending')
  })

  it.each([
    ['returns success: false', () => vi.mocked(setTaskStatus).mockResolvedValue({ success: false, error: 'Task could not be updated. Please try again.' })],
    ['call is rejected', () => vi.mocked(setTaskStatus).mockRejectedValue(new Error('offline'))],
  ])('reverts and shows the failure toast when the %s', async (_label, arrange) => {
    arrange()
    const user = userEvent.setup()
    renderRow()

    await user.click(checkbox())

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Task could not be updated. Please try again.'),
    )
    expect(checkbox()).not.toBeChecked()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(checkbox()).toBeEnabled()
  })
})

describe('TaskRow: delete', () => {
  it('asks for confirmation first, with focus on Keep, and disables the checkbox (A34, A45)', async () => {
    const user = userEvent.setup()
    renderRow()

    await user.click(deleteButton())

    expect(screen.getByText('Delete this task?')).toBeInTheDocument()
    expect(deleteTask).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus())
    expect(checkbox()).toBeDisabled()
    expect(editButton()).toBeDisabled()
  })

  it.each([
    ['Keep', async (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Keep' }))],
    ['Escape', async (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}')],
  ])('%s closes without deleting and returns focus to Delete', async (_label, close) => {
    const user = userEvent.setup()
    renderRow()

    await user.click(deleteButton())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus())
    await close(user)

    expect(screen.queryByText('Delete this task?')).not.toBeInTheDocument()
    expect(deleteTask).not.toHaveBeenCalled()
    await waitFor(() => expect(deleteButton()).toHaveFocus())
  })

  it('the confirming Delete calls deleteTask, shows "Task deleted" and is disabled while deleting', async () => {
    let resolve!: (r: { success: boolean }) => void
    vi.mocked(deleteTask).mockReturnValue(new Promise((r) => (resolve = r)))
    const user = userEvent.setup()
    renderRow()

    await user.click(deleteButton())
    await user.dblClick(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteTask).toHaveBeenCalledTimes(1)
    expect(deleteTask).toHaveBeenCalledWith('task-1')
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()

    resolve({ success: true })
    await waitFor(() => expect(handlers.onDeleted).toHaveBeenCalledTimes(1))
    expect(toast.success).toHaveBeenCalledWith('Task deleted')
  })

  it.each([
    ['returns success: false', () => vi.mocked(deleteTask).mockResolvedValue({ success: false, error: 'Task could not be deleted. Please try again.' })],
    ['call is rejected', () => vi.mocked(deleteTask).mockRejectedValue(new Error('offline'))],
  ])('shows the delete failure toast when the %s', async (_label, arrange) => {
    arrange()
    const user = userEvent.setup()
    renderRow()

    await user.click(deleteButton())
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Task could not be deleted. Please try again.'),
    )
    expect(handlers.onDeleted).not.toHaveBeenCalled()
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('closes the confirmation on "Task not found." (A37)', async () => {
    vi.mocked(deleteTask).mockResolvedValue({ success: false, error: 'Task not found.' })
    const user = userEvent.setup()
    renderRow()

    await user.click(deleteButton())
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.queryByText('Delete this task?')).not.toBeInTheDocument())
    expect(toast.error).toHaveBeenCalledWith('Task not found.')
  })
})

describe('TaskRow: edit', () => {
  it('Edit calls onEdit, and is disabled while another form is open (A31)', async () => {
    const user = userEvent.setup()
    const { rerenderRow } = renderRow()

    await user.click(editButton())
    expect(handlers.onEdit).toHaveBeenCalledTimes(1)

    rerenderRow({ editDisabled: true })
    expect(editButton()).toBeDisabled()
  })

  it('shows the form with no checkbox while editing, and returns focus to Edit on close (A31, A45)', async () => {
    const user = userEvent.setup()
    const { rerenderRow } = renderRow({}, { isEditing: true })

    expect(screen.getByRole('form', { name: 'Edit task' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(handlers.onEditClose).toHaveBeenCalledTimes(1)

    rerenderRow({ isEditing: false })
    await waitFor(() => expect(editButton()).toHaveFocus())
  })
})
