// DIAGNOSTIC ONLY (disposable copy; not part of the project, not a baseline test).
// Assertions state the INTENDED behaviour (pass on the original, fail on a mutant with a real gap).
// The trace test records observable state over many reachable interaction sequences so an original
// run and a mutant run can be compared.
import { appendFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import type { TaskActionResult, TaskWithId } from '@/features/tasks/types'

const { setTaskStatus, deleteTask, updateTask, toastSuccess, toastError } = vi.hoisted(() => ({
  setTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
  updateTask: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))
vi.mock('@/features/tasks/actions/tasks.actions', () => ({ setTaskStatus, deleteTask, updateTask }))
vi.mock('sonner', () => ({ toast: { success: toastSuccess, error: toastError } }))
import { TaskItem } from '@/features/tasks/components/TaskItem'

function deferred() {
  let resolve!: (result: TaskActionResult) => void
  const promise = new Promise<TaskActionResult>((res) => {
    resolve = res
  })
  return { promise, resolve }
}
const makeTask = (): TaskWithId => ({
  id: 't1',
  uid: 'user-1',
  title: 'Write the report',
  description: 'details',
  dueDate: Timestamp.fromDate(new Date(Date.now() + 30 * 86400000)),
  status: 'pending',
  createdAt: Timestamp.fromDate(new Date('2027-01-01T00:00:00.000Z')),
  updatedAt: Timestamp.fromDate(new Date('2027-01-01T00:00:00.000Z')),
  deletedAt: null,
  _schemaVersion: 1,
})
const renderItem = () =>
  render(
    <ul>
      <TaskItem task={makeTask()} />
    </ul>
  )

beforeEach(() => {
  vi.clearAllMocks()
  setTaskStatus.mockResolvedValue({ success: true })
  deleteTask.mockResolvedValue({ success: true })
  updateTask.mockResolvedValue({ success: true })
})
afterEach(() => cleanup())

describe('intended behaviour (assertions)', () => {
  it('388/389/396/404/406 focus is not moved when an item first renders', () => {
    renderItem()
    expect(document.activeElement).toBe(document.body)
  })
  it('485/507 the delete confirmation is not marked busy while idle', async () => {
    renderItem()
    await userEvent.click(screen.getByRole('button', { name: /^Delete "/ }))
    expect(screen.getByRole('group', { name: /Confirm deleting/ })).not.toHaveAttribute('aria-busy')
  })
  it('423/446/448 a second toggle click in the same tick shows no error toast and keeps the checkbox busy', async () => {
    const call = deferred()
    setTaskStatus.mockReturnValue(call.promise)
    renderItem()
    const checkbox = screen.getByRole('checkbox')
    act(() => {
      checkbox.click()
      checkbox.click()
    })
    expect(setTaskStatus).toHaveBeenCalledTimes(1)
    expect(toastError).not.toHaveBeenCalled()
    expect(checkbox).toBeDisabled()
    call.resolve({ success: true })
    await waitFor(() => expect(checkbox).toBeEnabled())
    expect(toastError).not.toHaveBeenCalled()
  })
  it('459/461 a second delete click in the same tick shows no error toast and keeps the confirmation open', async () => {
    const call = deferred()
    deleteTask.mockReturnValue(call.promise)
    renderItem()
    await userEvent.click(screen.getByRole('button', { name: /^Delete "/ }))
    const confirm = screen.getByRole('button', { name: 'Delete task' })
    act(() => {
      confirm.click()
      confirm.click()
    })
    expect(deleteTask).toHaveBeenCalledTimes(1)
    expect(toastError).not.toHaveBeenCalled()
    expect(screen.getByRole('group', { name: /Confirm deleting/ })).toBeInTheDocument()
    call.resolve({ success: true })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))
    expect(toastError).not.toHaveBeenCalled()
  })
  it('431 a thrown toggle is logged with its label', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    setTaskStatus.mockRejectedValue(new Error('boom'))
    renderItem()
    await userEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(toastError).toHaveBeenCalled())
    expect(spy).toHaveBeenCalledWith('Task change failed:', expect.any(Error))
  })
  it('479 Escape in the confirmation does not reach an ancestor key handler', async () => {
    const outer = vi.fn()
    render(
      <div onKeyDown={outer}>
        <ul>
          <TaskItem task={makeTask()} />
        </ul>
      </div>
    )
    await userEvent.click(screen.getByRole('button', { name: /^Delete "/ }))
    outer.mockClear()
    await userEvent.keyboard('{Escape}')
    expect(outer).not.toHaveBeenCalled()
  })
})

describe('trace', () => {
  it('observable state over reachable sequences', async () => {
    const lines: string[] = []
    const snap = (label: string) => {
      const a = document.activeElement
      lines.push(
        `${label}|active=${a === document.body ? 'body' : (a?.getAttribute('aria-label') ?? a?.tagName)}|` +
          `checkboxId=${document.querySelector('input[type=checkbox]')?.id}|` +
          `groups=${screen.queryAllByRole('group').length}|toasts=${toastError.mock.calls.length}/${toastSuccess.mock.calls.length}`
      )
    }
    const user = userEvent.setup()
    renderItem()
    snap('mount')
    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    snap('confirm-open')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    snap('confirm-cancel')
    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    await user.keyboard('{Escape}')
    snap('confirm-escape')
    await user.click(screen.getByRole('button', { name: /^Edit "/ }))
    snap('edit-open')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    snap('edit-cancel')
    await user.click(screen.getByRole('button', { name: /^Edit "/ }))
    await user.keyboard('{Escape}')
    snap('edit-escape')
    deleteTask.mockResolvedValueOnce({ success: false, error: 'This task no longer exists.' })
    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    await user.click(screen.getByRole('button', { name: 'Delete task' }))
    await waitFor(() => expect(toastError).toHaveBeenCalled())
    snap('delete-failed')
    await user.click(screen.getByRole('button', { name: /^Delete "/ }))
    snap('confirm-open-again')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    snap('cancel-again')
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'item-sequences', v: lines }) + '\n')
    fireEvent.click(document.body)
  })
})
