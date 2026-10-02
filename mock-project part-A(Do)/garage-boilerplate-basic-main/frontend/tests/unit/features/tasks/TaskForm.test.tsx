import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { createTask, updateTask } from '@/features/tasks/actions/tasks.actions'

vi.mock('@/features/tasks/actions/tasks.actions', () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const onClose = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

const title = () => screen.getByLabelText('Title')
const description = () => screen.getByLabelText(/description/i)
const dueDate = () => screen.getByLabelText(/due date/i)

describe('TaskForm: create', () => {
  it('moves focus to the title field when opened', async () => {
    render(<TaskForm onClose={onClose} />)
    // Focus is set in an effect after the first render, so wait for it.
    await waitFor(() => expect(title()).toHaveFocus())
  })

  it('blocks the call and shows each error under its field, keeping the values', async () => {
    const user = userEvent.setup()
    render(<TaskForm onClose={onClose} />)

    await user.type(description(), 'Keep me')
    await user.type(dueDate(), '2100-01-01')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Title is required.')).toHaveAttribute('role', 'alert')
    expect(screen.getByText('Due date must be on or before 31 Dec 2099.')).toBeInTheDocument()
    expect(title()).toHaveAttribute('aria-invalid', 'true')
    expect(title()).toHaveAccessibleDescription('Title is required.')
    expect(description()).toHaveValue('Keep me')
    expect(createTask).not.toHaveBeenCalled()
  })

  it('blocks a half-typed date instead of saving it as "no due date"', async () => {
    const user = userEvent.setup()
    render(<TaskForm onClose={onClose} />)
    // jsdom does not implement badInput, so simulate what a browser reports for e.g. 31/02/2027.
    Object.defineProperty(dueDate(), 'validity', { value: { badInput: true } })

    await user.type(title(), 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Due date must be a valid date.')).toHaveAttribute('role', 'alert')
    expect(dueDate()).toHaveAttribute('aria-invalid', 'true')
    expect(createTask).not.toHaveBeenCalled()
  })

  it('calls createTask with trimmed values, shows "Task created" and closes', async () => {
    vi.mocked(createTask).mockResolvedValue({ success: true, data: 'task-1' })
    const user = userEvent.setup()
    render(<TaskForm onClose={onClose} />)

    await user.type(title(), '  Buy milk  ')
    await user.type(description(), ' 2L ')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(createTask).toHaveBeenCalledWith({ title: 'Buy milk', description: '2L', dueDate: null })
    expect(toast.success).toHaveBeenCalledWith('Task created')
  })

  it.each([
    ['returns success: false', () => vi.mocked(createTask).mockResolvedValue({ success: false, error: 'Task could not be saved. Please try again.' })],
    ['call is rejected', () => vi.mocked(createTask).mockRejectedValue(new Error('offline'))],
  ])('shows the failure toast and keeps the form open when the %s', async (_label, arrange) => {
    arrange()
    const user = userEvent.setup()
    render(<TaskForm onClose={onClose} />)

    await user.type(title(), 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Task could not be saved. Please try again.'),
    )
    expect(onClose).not.toHaveBeenCalled()
    expect(title()).toHaveValue('Buy milk')
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled()
  })

  it('disables Create while saving, so a double click creates one task', async () => {
    let resolve!: (value: { success: boolean; data: string }) => void
    vi.mocked(createTask).mockReturnValue(new Promise((r) => (resolve = r)))
    const user = userEvent.setup()
    render(<TaskForm onClose={onClose} />)

    await user.type(title(), 'Buy milk')
    await user.dblClick(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    expect(createTask).toHaveBeenCalledTimes(1)
    resolve({ success: true, data: 'task-1' })
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('Cancel closes without saving', async () => {
    const user = userEvent.setup()
    render(<TaskForm onClose={onClose} />)

    await user.type(title(), 'Never saved')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(createTask).not.toHaveBeenCalled()
  })
})

describe('TaskForm: edit', () => {
  const task = { id: 'task-1', title: 'Old title', description: 'Old notes', dueDate: null }

  it('opens pre-filled, with an empty date for a null due date', async () => {
    render(<TaskForm task={task} onClose={onClose} />)
    expect(title()).toHaveValue('Old title')
    expect(description()).toHaveValue('Old notes')
    expect(dueDate()).toHaveValue('')
    await waitFor(() => expect(title()).toHaveFocus())
  })

  it('calls updateTask with the ID and trimmed values, shows "Task updated" and closes', async () => {
    vi.mocked(updateTask).mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<TaskForm task={{ ...task, dueDate: '2027-03-05' }} onClose={onClose} />)

    await user.clear(title())
    await user.type(title(), ' New title ')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(updateTask).toHaveBeenCalledWith('task-1', {
      title: 'New title',
      description: 'Old notes',
      dueDate: '2027-03-05',
    })
    expect(toast.success).toHaveBeenCalledWith('Task updated')
  })

  it('blocks updateTask on invalid input', async () => {
    const user = userEvent.setup()
    render(<TaskForm task={task} onClose={onClose} />)

    await user.clear(title())
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Title is required.')).toBeInTheDocument()
    expect(updateTask).not.toHaveBeenCalled()
  })

  it('keeps the edited values and shows the failure toast when saving fails', async () => {
    vi.mocked(updateTask).mockRejectedValue(new Error('offline'))
    const user = userEvent.setup()
    render(<TaskForm task={task} onClose={onClose} />)

    await user.type(title(), ' edited')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Task could not be saved. Please try again.'),
    )
    expect(title()).toHaveValue('Old title edited')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows "Task not found." and closes when the task was deleted elsewhere (A37)', async () => {
    vi.mocked(updateTask).mockResolvedValue({ success: false, error: 'Task not found.' })
    const user = userEvent.setup()
    render(<TaskForm task={task} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(toast.error).toHaveBeenCalledWith('Task not found.')
  })

  it('Cancel discards the changes without saving', async () => {
    const user = userEvent.setup()
    render(<TaskForm task={task} onClose={onClose} />)

    await user.type(title(), ' discarded')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(updateTask).not.toHaveBeenCalled()
  })
})
