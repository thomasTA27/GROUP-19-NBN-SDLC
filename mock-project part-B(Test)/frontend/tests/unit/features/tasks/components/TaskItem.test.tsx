import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { TASK_MESSAGES } from '@/features/tasks/schemas'
import { formatDatetime } from '@/lib/utils'
import type { TaskActionResult, TaskWithId } from '@/features/tasks/types'

const { setTaskStatus, deleteTask, toastSuccess, toastError } = vi.hoisted(() => ({
  setTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))
vi.mock('@/features/tasks/actions/tasks.actions', () => ({ setTaskStatus, deleteTask }))
vi.mock('sonner', () => ({ toast: { success: toastSuccess, error: toastError } }))

import { TaskItem } from '@/features/tasks/components/TaskItem'

const confirmSpy = vi.spyOn(window, 'confirm')
const alertSpy = vi.spyOn(window, 'alert')

beforeEach(() => {
  vi.clearAllMocks()
  setTaskStatus.mockResolvedValue({ success: true })
  deleteTask.mockResolvedValue({ success: true })
  confirmSpy.mockReturnValue(true)
  alertSpy.mockReturnValue(undefined)
})

// No browser dialog in any path of any test in this file (A20).
afterEach(() => {
  expect(confirmSpy).not.toHaveBeenCalled()
  expect(alertSpy).not.toHaveBeenCalled()
})

// A call the test settles by hand, so it can look at the item while the call is in flight.
function deferred() {
  let resolve!: (result: TaskActionResult) => void
  const promise = new Promise<TaskActionResult>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function makeTask(overrides: Partial<TaskWithId> = {}): TaskWithId {
  return {
    id: 't1',
    uid: 'user-1',
    title: 'Write the report',
    description: '',
    dueDate: Timestamp.fromDate(new Date('2027-03-05T10:30:00.000Z')),
    status: 'pending',
    createdAt: Timestamp.fromDate(new Date('2027-01-01T00:00:00.000Z')),
    updatedAt: Timestamp.fromDate(new Date('2027-01-01T00:00:00.000Z')),
    deletedAt: null,
    _schemaVersion: 1,
    ...overrides,
  }
}

function renderItem(task: TaskWithId) {
  return render(
    <ul>
      <TaskItem task={task} />
    </ul>
  )
}

describe('TaskItem', () => {
  it('shows markup in the description as text, not as elements (AC-2.3b)', () => {
    const { container } = renderItem(makeTask({ description: '<b>bold</b> and **bold**' }))
    expect(screen.getByTestId('task-description')).toHaveTextContent('<b>bold</b> and **bold**')
    expect(container.querySelector('b')).toBeNull()
  })

  it('keeps line breaks in the description (AC-2.3c)', () => {
    renderItem(makeTask({ description: 'first\nsecond' }))
    const description = screen.getByTestId('task-description')
    expect(description).toHaveClass('whitespace-pre-wrap')
    expect(description.textContent).toBe('first\nsecond')
  })

  it('shows no description element when the task has none', () => {
    renderItem(makeTask({ description: '' }))
    expect(screen.queryByTestId('task-description')).toBeNull()
  })

  it('has a long-text-safe layout (AC-8.3)', () => {
    renderItem(makeTask({ title: 'x'.repeat(300), description: 'y'.repeat(300) }))
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('break-words')
    expect(screen.getByTestId('task-description')).toHaveClass('break-words')
    expect(screen.getByRole('listitem').querySelector('.min-w-0')).not.toBeNull()
  })

  it('ticks the checkbox for a completed task and not for a pending one', () => {
    const { unmount } = renderItem(makeTask({ status: 'completed' }))
    expect(screen.getByRole('checkbox', { name: /Write the report/ })).toBeChecked()
    unmount()
    renderItem(makeTask({ status: 'pending' }))
    expect(screen.getByRole('checkbox', { name: /Write the report/ })).not.toBeChecked()
  })

  describe('due date text (AC-2.4, AC-2.5)', () => {
    const originalTz = process.env.TZ
    beforeEach(() => {
      process.env.TZ = 'Australia/Perth'
    })
    afterEach(() => {
      if (originalTz === undefined) delete process.env.TZ
      else process.env.TZ = originalTz
    })

    it('really runs in the pinned timezone (proof the TZ setting takes effect)', () => {
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Australia/Perth')
      expect(new Date('2027-03-05T09:00:00.000Z').getTimezoneOffset()).toBe(-480)
    })

    it('shows 09:00 UTC as 5:00 pm in Perth, the same on two tasks with the same moment', () => {
      const moment = new Date('2027-03-05T09:00:00.000Z')
      renderItem(makeTask({ id: 'a', dueDate: Timestamp.fromDate(moment) }))
      renderItem(makeTask({ id: 'b', dueDate: Timestamp.fromDate(moment) }))
      const [first, second] = screen.getAllByTestId('task-due')
      expect(first?.textContent).toBe('5 Mar 2027, 05:00 pm')
      expect(second?.textContent).toBe(first?.textContent)
    })

    it('shows the same moment as 9:00 am on a UTC device', () => {
      process.env.TZ = 'UTC'
      renderItem(makeTask({ dueDate: Timestamp.fromDate(new Date('2027-03-05T09:00:00.000Z')) }))
      expect(screen.getByTestId('task-due').textContent).toBe('5 Mar 2027, 09:00 am')
    })
  })

  it('does not mark a past due date as overdue (A11)', () => {
    const task = makeTask({
      dueDate: Timestamp.fromDate(new Date('2000-01-01T00:00:00.000Z')),
    })
    renderItem(task)
    expect(screen.getByTestId('task-due').textContent).toBe(formatDatetime(task.dueDate.toDate()))
    expect(screen.getByTestId('task-due').textContent).not.toMatch(/overdue|late|past/i)
    expect(screen.queryByText(/overdue/i)).toBeNull()
    expect(screen.getByRole('listitem').textContent).not.toMatch(/overdue|late|past/i)
  })

  it('has an enabled checkbox at rest, for both statuses (WP8 replaces the display-only checkbox)', () => {
    const { unmount } = renderItem(makeTask({ status: 'completed' }))
    expect(screen.getByRole('checkbox')).toBeEnabled()
    unmount()
    renderItem(makeTask({ status: 'pending' }))
    expect(screen.getByRole('checkbox')).toBeEnabled()
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-busy')
  })

  it('shows markup in the title as text, not as elements (AC-2.3b)', () => {
    const { container } = renderItem(makeTask({ title: '<i>x</i> **y**' }))
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('<i>x</i> **y**')
    expect(container.querySelector('i')).toBeNull()
  })

  it('keeps five blank lines in a row in the description', () => {
    const text = 'top\n\n\n\n\n\nbottom'
    renderItem(makeTask({ description: text }))
    expect(screen.getByTestId('task-description').textContent).toBe(text)
    expect(screen.getByTestId('task-description')).toHaveClass('whitespace-pre-wrap')
  })

  // Today's behaviour: only an empty string hides the description. A description made only of
  // whitespace is shown as an element (it looks empty, and whitespace-pre-wrap keeps it as typed).
  it('shows a description element for a whitespace-only description, kept as stored', () => {
    renderItem(makeTask({ description: '   \n  ' }))
    expect(screen.getByTestId('task-description').textContent).toBe('   \n  ')
  })
})

describe('TaskItem: toggle (AC-6.1, 6.2, 6.5, 6.7, 8.1a, 8.2c, 8.4b)', () => {
  it('sets "completed" on a pending task', async () => {
    renderItem(makeTask({ status: 'pending' }))
    await userEvent.click(screen.getByRole('checkbox'))
    expect(setTaskStatus).toHaveBeenCalledTimes(1)
    expect(setTaskStatus).toHaveBeenCalledWith({ id: 't1', status: 'completed' })
  })

  it('sets "pending" on a completed task', async () => {
    renderItem(makeTask({ status: 'completed' }))
    await userEvent.click(screen.getByRole('checkbox'))
    expect(setTaskStatus).toHaveBeenCalledTimes(1)
    expect(setTaskStatus).toHaveBeenCalledWith({ id: 't1', status: 'pending' })
  })

  it('never calls the delete action', async () => {
    renderItem(makeTask())
    await userEvent.click(screen.getByRole('checkbox'))
    expect(deleteTask).not.toHaveBeenCalled()
  })

  it('is disabled with aria-busy while the call is pending, ignores a second click, then re-enables', async () => {
    const call = deferred()
    setTaskStatus.mockReturnValue(call.promise)
    renderItem(makeTask())
    const checkbox = screen.getByRole('checkbox')

    await userEvent.click(checkbox)
    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveAttribute('aria-busy', 'true')

    await userEvent.click(checkbox)
    expect(setTaskStatus).toHaveBeenCalledTimes(1)

    call.resolve({ success: true })
    await waitFor(() => expect(checkbox).toBeEnabled())
    expect(checkbox).not.toHaveAttribute('aria-busy')
  })

  it('shows no toast of any kind on success (A35, AC-8.2c)', async () => {
    renderItem(makeTask())
    await userEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeEnabled())
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
  })

  it.each([['pending' as const], ['completed' as const]])(
    'on a failed result for a %s task: shows the action text, no success toast, and the stored status (AC-6.5, 8.1a)',
    async (status) => {
      setTaskStatus.mockResolvedValue({ success: false, error: TASK_MESSAGES.taskGone })
      renderItem(makeTask({ status }))
      const checkbox = screen.getByRole('checkbox')

      await userEvent.click(checkbox)
      await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.taskGone))

      expect(toastError).toHaveBeenCalledTimes(1)
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(checkbox).toBeEnabled()
      if (status === 'completed') expect(checkbox).toBeChecked()
      else expect(checkbox).not.toBeChecked()
    }
  )

  it('on a thrown action: shows the fixed wording, not the thrown message, and logs the raw error (rule 5)', async () => {
    const thrown = new Error('firestore/permission-denied: secret internals')
    setTaskStatus.mockRejectedValue(thrown)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    renderItem(makeTask())

    await userEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.saveFailed))

    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastError).not.toHaveBeenCalledWith(thrown.message)
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith(expect.anything(), thrown)
    expect(screen.getByRole('checkbox')).toBeEnabled()
    consoleError.mockRestore()
  })

  it('can still be toggled when the due date has passed (AC-6.7)', async () => {
    renderItem(makeTask({ dueDate: Timestamp.fromDate(new Date('2000-01-01T00:00:00.000Z')) }))
    await userEvent.click(screen.getByRole('checkbox'))
    expect(setTaskStatus).toHaveBeenCalledWith({ id: 't1', status: 'completed' })
  })

  it('has an accessible name that includes the title (AC-8.4b)', () => {
    renderItem(makeTask({ title: 'Pay the invoice' }))
    expect(screen.getByRole('checkbox', { name: /Pay the invoice/ })).toBeInTheDocument()
  })
})

describe('TaskItem: delete (AC-7.4, 7.5, 7.9, 8.1a, 8.1b, 8.2b, 8.4a, 8.4c, A20, A22)', () => {
  function deleteButton() {
    return screen.getByRole('button', { name: /^Delete "Write the report"$/ })
  }
  function confirmGroup() {
    return screen.getByRole('group', { name: /Write the report/ })
  }
  function confirmButton() {
    return screen.getByRole('button', { name: 'Delete task' })
  }
  function cancelButton() {
    return screen.getByRole('button', { name: 'Cancel' })
  }

  it('shows a Delete button with the title in its name and no confirmation at rest', () => {
    renderItem(makeTask())
    expect(deleteButton()).toBeInTheDocument()
    expect(screen.queryByRole('group')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete task' })).toBeNull()
  })

  it('opens the confirmation in place, moves focus to Cancel, and calls no action yet', async () => {
    renderItem(makeTask())
    await userEvent.click(deleteButton())

    expect(confirmGroup()).toBeInTheDocument()
    expect(confirmButton()).toBeInTheDocument()
    expect(cancelButton()).toHaveFocus()
    expect(screen.queryByRole('button', { name: /^Delete "/ })).toBeNull()
    expect(deleteTask).not.toHaveBeenCalled()
    expect(setTaskStatus).not.toHaveBeenCalled()
    expect(screen.getByRole('listitem')).toBeInTheDocument()
  })

  it('Cancel closes it, calls no action, returns focus to Delete, and leaves the task as it was (AC-7.5)', async () => {
    renderItem(makeTask({ description: 'keep me' }))
    await userEvent.click(deleteButton())
    await userEvent.click(cancelButton())

    expect(screen.queryByRole('group')).toBeNull()
    expect(deleteButton()).toHaveFocus()
    expect(deleteTask).not.toHaveBeenCalled()
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Write the report')
    expect(screen.getByTestId('task-description')).toHaveTextContent('keep me')
  })

  it('Escape closes it the same way as Cancel (AC-8.4a)', async () => {
    renderItem(makeTask())
    await userEvent.click(deleteButton())
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('group')).toBeNull()
    expect(deleteButton()).toHaveFocus()
    expect(deleteTask).not.toHaveBeenCalled()
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
  })

  it('can be opened, cancelled and opened again', async () => {
    renderItem(makeTask())
    await userEvent.click(deleteButton())
    await userEvent.click(cancelButton())
    await userEvent.click(deleteButton())
    expect(cancelButton()).toHaveFocus()
  })

  it('can be used with the keyboard alone (AC-8.4a)', async () => {
    renderItem(makeTask())
    deleteButton().focus()
    await userEvent.keyboard('{Enter}')
    expect(cancelButton()).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(deleteButton()).toHaveFocus()
    await userEvent.keyboard(' ')
    await userEvent.tab({ shift: true })
    expect(confirmButton()).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(deleteTask).toHaveBeenCalledTimes(1)
  })

  it('"Delete task" calls deleteTask with { id } exactly once, and nothing else', async () => {
    renderItem(makeTask())
    await userEvent.click(deleteButton())
    await userEvent.click(confirmButton())

    expect(deleteTask).toHaveBeenCalledTimes(1)
    expect(deleteTask).toHaveBeenCalledWith({ id: 't1' })
    expect(setTaskStatus).not.toHaveBeenCalled()
  })

  it('disables both buttons and sets aria-busy while in flight, and ignores a second click', async () => {
    const call = deferred()
    deleteTask.mockReturnValue(call.promise)
    renderItem(makeTask())
    await userEvent.click(deleteButton())
    await userEvent.click(confirmButton())

    expect(confirmButton()).toBeDisabled()
    expect(cancelButton()).toBeDisabled()
    expect(confirmGroup()).toHaveAttribute('aria-busy', 'true')

    await userEvent.click(confirmButton())
    await userEvent.keyboard('{Escape}')
    expect(deleteTask).toHaveBeenCalledTimes(1)
    expect(confirmGroup()).toBeInTheDocument()

    call.resolve({ success: true })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())
  })

  it('on success shows a success toast and no error toast, and removes nothing itself (AC-8.2b)', async () => {
    renderItem(makeTask())
    await userEvent.click(deleteButton())
    await userEvent.click(confirmButton())

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))
    expect(toastSuccess).toHaveBeenCalledWith('Task deleted')
    expect(toastError).not.toHaveBeenCalled()
    // The live listener removes the item. Until then both buttons stay disabled.
    expect(screen.getByRole('listitem')).toBeInTheDocument()
    expect(confirmButton()).toBeDisabled()
    expect(cancelButton()).toBeDisabled()
  })

  it('on a failed result shows the action text, no success toast, keeps the item, closes and refocuses Delete (AC-8.1b)', async () => {
    deleteTask.mockResolvedValue({ success: false, error: TASK_MESSAGES.taskGone })
    renderItem(makeTask())
    await userEvent.click(deleteButton())
    await userEvent.click(confirmButton())

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.taskGone))
    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(screen.getByRole('listitem')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Write the report')
    expect(screen.queryByRole('group')).toBeNull()
    await waitFor(() => expect(deleteButton()).toHaveFocus())
    expect(deleteButton()).toBeEnabled()
  })

  it('on a thrown action shows only the fixed wording and logs the raw error (rule 5)', async () => {
    const thrown = new Error('FirebaseError: 7 PERMISSION_DENIED')
    deleteTask.mockRejectedValue(thrown)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    renderItem(makeTask())
    await userEvent.click(deleteButton())
    await userEvent.click(confirmButton())

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.saveFailed))
    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastError).not.toHaveBeenCalledWith(thrown.message)
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith(expect.anything(), thrown)
    expect(screen.getByRole('listitem')).toBeInTheDocument()
    expect(screen.queryByRole('group')).toBeNull()
    await waitFor(() => expect(deleteButton()).toHaveFocus())
    consoleError.mockRestore()
  })

  it('can delete an overdue task (AC-6.7 applies to the due date only)', async () => {
    renderItem(makeTask({ dueDate: Timestamp.fromDate(new Date('2000-01-01T00:00:00.000Z')) }))
    await userEvent.click(deleteButton())
    await userEvent.click(confirmButton())
    expect(deleteTask).toHaveBeenCalledWith({ id: 't1' })
  })

  it('has accessible names that include the title: checkbox, Delete button and group (AC-8.4b, 8.4c)', async () => {
    renderItem(makeTask({ title: 'Book the venue' }))
    expect(screen.getByRole('checkbox', { name: /Book the venue/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Delete "Book the venue"/ }))
    expect(screen.getByRole('group', { name: /Book the venue/ })).toBeInTheDocument()
  })

  it('uses real buttons that never submit a form', async () => {
    renderItem(makeTask())
    expect(deleteButton()).toHaveAttribute('type', 'button')
    await userEvent.click(deleteButton())
    expect(confirmButton()).toHaveAttribute('type', 'button')
    expect(cancelButton()).toHaveAttribute('type', 'button')
  })

  it('wraps and can shrink so long text and buttons cause no sideways scroll (AC-8.3)', async () => {
    renderItem(makeTask({ title: 'x'.repeat(300) }))
    await userEvent.click(screen.getByRole('button', { name: /^Delete "x+"$/ }))
    const group = screen.getByRole('group')
    expect(group).toHaveClass('flex-wrap', 'min-w-0')
    expect(group.parentElement).toHaveClass('flex-wrap', 'min-w-0')
  })
})

describe('TaskItem: no browser dialogs (A20)', () => {
  it('calls neither window.confirm nor window.alert through toggle, cancel, delete, failure and throw', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    renderItem(makeTask())
    const user = userEvent.setup()

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    await user.keyboard('{Escape}')

    deleteTask.mockResolvedValueOnce({ success: false, error: TASK_MESSAGES.taskGone })
    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    await user.click(screen.getByRole('button', { name: 'Delete task' }))
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1))

    deleteTask.mockRejectedValueOnce(new Error('boom'))
    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    await user.click(screen.getByRole('button', { name: 'Delete task' }))
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(2))

    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    await user.click(screen.getByRole('button', { name: 'Delete task' }))
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(alertSpy).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

describe('TaskItem: one call at a time', () => {
  const openConfirmation = () => screen.getByRole('button', { name: /^Delete "/ })
  const confirmButton = () => screen.getByRole('button', { name: 'Delete task' })
  const cancelButton = () => screen.getByRole('button', { name: 'Cancel' })
  const group = () => screen.getByRole('group')

  it('a. disables the checkbox while a delete is pending, and a click on it changes nothing', async () => {
    const call = deferred()
    deleteTask.mockReturnValue(call.promise)
    renderItem(makeTask())
    await userEvent.click(openConfirmation())
    await userEvent.click(confirmButton())

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
    await userEvent.click(checkbox)

    expect(setTaskStatus).not.toHaveBeenCalled()
    expect(confirmButton()).toBeDisabled()
    expect(cancelButton()).toBeDisabled()
    expect(group()).toHaveAttribute('aria-busy', 'true')
    expect(checkbox).not.toHaveAttribute('aria-busy')

    call.resolve({ success: true })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())
  })

  it('b. after a successful delete the checkbox and both buttons stay disabled, still busy', async () => {
    renderItem(makeTask())
    await userEvent.click(openConfirmation())
    await userEvent.click(confirmButton())
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
    await userEvent.click(checkbox)
    await userEvent.click(confirmButton())

    expect(setTaskStatus).not.toHaveBeenCalled()
    expect(deleteTask).toHaveBeenCalledTimes(1)
    expect(confirmButton()).toBeDisabled()
    expect(cancelButton()).toBeDisabled()
    expect(group()).toHaveAttribute('aria-busy', 'true')
  })

  it('c. while a toggle is pending, the confirmation opens but "Delete task" is disabled and starts no delete', async () => {
    const call = deferred()
    setTaskStatus.mockReturnValue(call.promise)
    renderItem(makeTask())
    await userEvent.click(screen.getByRole('checkbox'))

    await userEvent.click(openConfirmation())
    expect(confirmButton()).toBeDisabled()
    await userEvent.click(confirmButton())
    expect(deleteTask).not.toHaveBeenCalled()

    call.resolve({ success: true })
    await waitFor(() => expect(confirmButton()).toBeEnabled())
    expect(deleteTask).not.toHaveBeenCalled()
  })
})

describe('TaskItem: failures, siblings, prop changes and focus', () => {
  const openConfirmation = () => screen.getByRole('button', { name: /^Delete "/ })
  const confirmButton = () => screen.getByRole('button', { name: 'Delete task' })
  const cancelButton = () => screen.getByRole('button', { name: 'Cancel' })

  it.each([['pending' as const], ['completed' as const]])(
    'd. a failed toggle of a %s task keeps showing the stored status, in flight and after (AC-6.5)',
    async (status) => {
      const call = deferred()
      setTaskStatus.mockReturnValue(call.promise)
      renderItem(makeTask({ status }))
      const checkbox = screen.getByRole<HTMLInputElement>('checkbox')
      const expectStored = () => expect(checkbox.checked).toBe(status === 'completed')

      await userEvent.click(checkbox)
      expectStored()
      expect(toastError).not.toHaveBeenCalled()

      call.resolve({ success: false, error: TASK_MESSAGES.taskGone })
      await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.taskGone))
      await waitFor(() => expect(checkbox).toBeEnabled())
      expectStored()
      expect(toastError).toHaveBeenCalledTimes(1)
      expect(toastSuccess).not.toHaveBeenCalled()
    }
  )

  it('e. a failed toggle with no error text falls back to the fixed wording', async () => {
    setTaskStatus.mockResolvedValue({ success: false })
    renderItem(makeTask())
    await userEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.saveFailed))
    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it('e. a failed delete with no error text falls back to the fixed wording', async () => {
    deleteTask.mockResolvedValue({ success: false })
    renderItem(makeTask())
    await userEvent.click(openConfirmation())
    await userEvent.click(confirmButton())
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.saveFailed))
    expect(toastError).toHaveBeenCalledTimes(1)
    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it('f. toggling one item does not disable, mark busy or call anything for the other', async () => {
    const call = deferred()
    setTaskStatus.mockReturnValue(call.promise)
    render(
      <ul>
        <TaskItem task={makeTask({ id: 'a', title: 'First' })} />
        <TaskItem task={makeTask({ id: 'b', title: 'Second' })} />
      </ul>
    )
    await userEvent.click(screen.getByRole('checkbox', { name: /First/ }))

    const other = screen.getByRole('checkbox', { name: /Second/ })
    expect(screen.getByRole('checkbox', { name: /First/ })).toBeDisabled()
    expect(other).toBeEnabled()
    expect(other).not.toHaveAttribute('aria-busy')
    expect(screen.getByRole('button', { name: 'Delete "Second"' })).toBeEnabled()
    expect(setTaskStatus).toHaveBeenCalledTimes(1)
    expect(setTaskStatus).toHaveBeenCalledWith({ id: 'a', status: 'completed' })
    expect(deleteTask).not.toHaveBeenCalled()

    call.resolve({ success: true })
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /First/ })).toBeEnabled())
  })

  it('f. deleting one item leaves the other item and its controls alone', async () => {
    const call = deferred()
    deleteTask.mockReturnValue(call.promise)
    render(
      <ul>
        <TaskItem task={makeTask({ id: 'a', title: 'First' })} />
        <TaskItem task={makeTask({ id: 'b', title: 'Second' })} />
      </ul>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete "First"' }))
    await userEvent.click(confirmButton())

    expect(deleteTask).toHaveBeenCalledWith({ id: 'a' })
    expect(screen.getByRole('checkbox', { name: /Second/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Delete "Second"' })).toBeEnabled()
    expect(screen.getAllByRole('group')).toHaveLength(1)

    call.resolve({ success: true })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())
  })

  it('g. the checkbox follows the task prop after a successful toggle', async () => {
    const { rerender } = renderItem(makeTask({ status: 'pending' }))
    await userEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeEnabled())

    rerender(
      <ul>
        <TaskItem task={makeTask({ status: 'completed' })} />
      </ul>
    )
    expect(screen.getByRole('checkbox')).toBeChecked()

    rerender(
      <ul>
        <TaskItem task={makeTask({ status: 'pending' })} />
      </ul>
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  // Finding, not a feature: TaskItem keeps its confirmation state when the same instance gets a
  // different task. TaskList gives each item key={task.id}, so React remounts it and this can't
  // happen in the app. This test records what a bare re-render without that key would do.
  it('g. records that an open confirmation survives a different task id on the same instance', async () => {
    const { rerender } = renderItem(makeTask({ id: 'a', title: 'First' }))
    await userEvent.click(openConfirmation())

    rerender(
      <ul>
        <TaskItem task={makeTask({ id: 'b', title: 'Second' })} />
      </ul>
    )
    expect(screen.getByRole('group', { name: /Second/ })).toBeInTheDocument()
    await userEvent.click(confirmButton())
    expect(deleteTask).toHaveBeenCalledWith({ id: 'b' })
  })

  it('g. a different key remounts the item and closes the confirmation (how TaskList renders it)', async () => {
    const { rerender } = render(
      <ul>
        <TaskItem key="a" task={makeTask({ id: 'a', title: 'First' })} />
      </ul>
    )
    await userEvent.click(openConfirmation())
    rerender(
      <ul>
        <TaskItem key="b" task={makeTask({ id: 'b', title: 'Second' })} />
      </ul>
    )
    expect(screen.queryByRole('group')).toBeNull()
    expect(deleteTask).not.toHaveBeenCalled()
  })

  it('h. after a successful toggle and before the prop changes, the checkbox is enabled and shows the stored status (accepted)', async () => {
    renderItem(makeTask({ status: 'pending' }))
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    await waitFor(() => expect(checkbox).toBeEnabled())
    expect(checkbox).not.toBeChecked()
    expect(checkbox).not.toHaveAttribute('aria-busy')
    expect(toastError).not.toHaveBeenCalled()
    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it('i. Delete, Cancel, Delete, Cancel: focus goes to Cancel on each open and back to Delete on each close', async () => {
    renderItem(makeTask())
    for (let round = 0; round < 2; round++) {
      await userEvent.click(openConfirmation())
      expect(cancelButton()).toHaveFocus()
      await userEvent.click(cancelButton())
      expect(openConfirmation()).toHaveFocus()
    }
  })

  it('i. Delete, Escape, Delete, Escape: the same focus movement with the keyboard', async () => {
    renderItem(makeTask())
    for (let round = 0; round < 2; round++) {
      await userEvent.click(openConfirmation())
      expect(cancelButton()).toHaveFocus()
      await userEvent.keyboard('{Escape}')
      expect(openConfirmation()).toHaveFocus()
    }
  })

  it('j. Escape pressed on the group while a delete is in flight does not close it', async () => {
    const call = deferred()
    deleteTask.mockReturnValue(call.promise)
    renderItem(makeTask())
    await userEvent.click(openConfirmation())
    await userEvent.click(confirmButton())

    // Fired on the group itself: the buttons are disabled, so a real key press has no target.
    fireEvent.keyDown(screen.getByRole('group'), { key: 'Escape' })
    expect(screen.getByRole('group')).toBeInTheDocument()
    expect(screen.getByRole('group')).toHaveAttribute('aria-busy', 'true')

    call.resolve({ success: true })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('does not close on other keys', async () => {
    renderItem(makeTask())
    await userEvent.click(openConfirmation())
    fireEvent.keyDown(screen.getByRole('group'), { key: 'a' })
    expect(screen.getByRole('group')).toBeInTheDocument()
  })
})

describe('TaskItem: two clicks before a re-render (the in-flight guard)', () => {
  // Both clicks land inside one act(), so React has not yet re-rendered the disabled state
  // between them. Only the in-flight ref stops the second call.
  // Passes without the ref guard too: React drops the second change event of a controlled
  // checkbox. Kept as a behaviour check. The delete test below is the one that needs the guard.
  it('a double click on the checkbox starts one toggle', async () => {
    const call = deferred()
    setTaskStatus.mockReturnValue(call.promise)
    renderItem(makeTask())
    const checkbox = screen.getByRole('checkbox')
    act(() => {
      checkbox.click()
      checkbox.click()
    })
    expect(setTaskStatus).toHaveBeenCalledTimes(1)
    call.resolve({ success: true })
    await waitFor(() => expect(checkbox).toBeEnabled())
  })

  it('a double click on "Delete task" starts one delete', async () => {
    const call = deferred()
    deleteTask.mockReturnValue(call.promise)
    renderItem(makeTask())
    await userEvent.click(screen.getByRole('button', { name: /^Delete "/ }))
    const confirm = screen.getByRole('button', { name: 'Delete task' })
    act(() => {
      confirm.click()
      confirm.click()
    })
    expect(deleteTask).toHaveBeenCalledTimes(1)
    call.resolve({ success: true })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))
  })
})
