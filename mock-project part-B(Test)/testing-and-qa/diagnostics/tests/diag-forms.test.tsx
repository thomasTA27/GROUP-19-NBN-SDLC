// DIAGNOSTIC ONLY (disposable copy; not part of the project, not a baseline test).
import { appendFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Timestamp } from 'firebase/firestore'
import type { TaskWithId } from '@/features/tasks/types'

const { createTask, updateTask, toastSuccess, toastError } = vi.hoisted(() => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))
vi.mock('@/features/tasks/actions/tasks.actions', () => ({ createTask, updateTask }))
vi.mock('sonner', () => ({ toast: { success: toastSuccess, error: toastError } }))

const hooks = vi.hoisted(() => ({ forceNull: false }))
vi.mock('@/features/tasks/lib/due-date', async (importActual) => {
  const actual = await importActual<typeof import('@/features/tasks/lib/due-date')>()
  return { ...actual, localInputToIso: (v: string) => (hooks.forceNull ? null : actual.localInputToIso(v)) }
})

import { CreateTaskForm } from '@/features/tasks/components/CreateTaskForm'
import { EditTaskForm } from '@/features/tasks/components/EditTaskForm'

const pad = (n: number) => String(n).padStart(2, '0')
function localIn(daysAhead: number) {
  const d = new Date(Date.now() + daysAhead * 86400000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const title = () => screen.getByLabelText('Title') as HTMLInputElement
const description = () => screen.getByLabelText('Description') as HTMLTextAreaElement
const dueDate = () => screen.getByLabelText('Due date') as HTMLInputElement
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
async function submitCreate() {
  fireEvent.change(title(), { target: { value: 'New task' } })
  fireEvent.change(dueDate(), { target: { value: localIn(5) } })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Add task|Saving/ }))
  })
}
async function saveEdit(newTitle = 'Changed') {
  fireEvent.change(title(), { target: { value: newTitle } })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  hooks.forceNull = false
  createTask.mockResolvedValue({ success: true })
  updateTask.mockResolvedValue({ success: true })
})
afterEach(() => cleanup())

describe('intended behaviour (assertions)', () => {
  it('203 the create form starts with an empty description and resets to empty after a save', async () => {
    render(<CreateTaskForm />)
    expect(description().value).toBe('')
    await submitCreate()
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())
    expect(description().value).toBe('')
    expect(title().value).toBe('')
  })
  it('239 a thrown create is logged with its label', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    createTask.mockRejectedValue(new Error('boom'))
    render(<CreateTaskForm />)
    await submitCreate()
    await waitFor(() => expect(toastError).toHaveBeenCalled())
    expect(spy).toHaveBeenCalledWith('Task create failed:', expect.any(Error))
  })
  it('331 a thrown edit is logged with its label', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    updateTask.mockRejectedValue(new Error('boom'))
    render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
    await saveEdit()
    await waitFor(() => expect(toastError).toHaveBeenCalled())
    expect(spy).toHaveBeenCalledWith('Task update failed:', expect.any(Error))
  })
})

describe('trace', () => {
  it('server field error and the "validate" fallback, create and edit', async () => {
    const out: Record<string, unknown> = {}
    const dom = (label: string) => {
      out[label] = {
        alerts: screen.queryAllByRole('alert').map((a) => a.textContent),
        invalid: ['Title', 'Description', 'Due date'].map((l) => screen.getByLabelText(l).getAttribute('aria-invalid')),
        describedby: ['Title', 'Due date'].map((l) => screen.getByLabelText(l).getAttribute('aria-describedby')),
        toasts: toastError.mock.calls.length,
        active: document.activeElement === document.body ? 'body' : (document.activeElement as HTMLElement)?.id,
      }
    }
    // create: server names a field
    createTask.mockResolvedValue({ success: false, error: 'Title is taken (diag)', field: 'title' })
    render(<CreateTaskForm />)
    await submitCreate()
    await waitFor(() => expect(screen.queryAllByRole('alert').length).toBeGreaterThan(0))
    dom('create-server-error')
    fireEvent.change(title(), { target: { value: 'Another title' } })
    await waitFor(() => expect(screen.queryAllByRole('alert').length).toBe(0))
    dom('create-after-retype')
    cleanup()
    // create: localInputToIso returns null after the schema passed
    hooks.forceNull = true
    render(<CreateTaskForm />)
    await submitCreate()
    dom('create-validate-fallback')
    cleanup()
    hooks.forceNull = false
    // edit: server names a field
    updateTask.mockResolvedValue({ success: false, error: 'Title is taken (diag)', field: 'title' })
    render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
    await saveEdit()
    await waitFor(() => expect(screen.queryAllByRole('alert').length).toBeGreaterThan(0))
    dom('edit-server-error')
    fireEvent.change(title(), { target: { value: 'Retyped' } })
    await waitFor(() => expect(screen.queryAllByRole('alert').length).toBe(0))
    dom('edit-after-retype')
    cleanup()
    // edit: validate fallback (due date changed, conversion returns null)
    hooks.forceNull = true
    render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
    fireEvent.change(dueDate(), { target: { value: localIn(6) } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    })
    dom('edit-validate-fallback')
    cleanup()
    hooks.forceNull = false
    // edit: focus stays where the user put it while the form re-renders (290)
    render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
    await waitFor(() => expect(title()).toHaveFocus())
    description().focus()
    fireEvent.change(description(), { target: { value: 'details more' } })
    fireEvent.change(description(), { target: { value: 'details more again' } })
    dom('edit-focus-after-typing')
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'forms', v: out }) + '\n')
  })
})

describe('trace 203', () => {
  it('empty due date: message on an untouched form, and after a successful save and reset', async () => {
    const out: Record<string, unknown> = {}
    render(<CreateTaskForm />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add task|Saving/ }))
    })
    out['untouched-submit'] = screen.queryAllByRole('alert').map((a) => a.textContent)
    cleanup()
    render(<CreateTaskForm />)
    await submitCreate()
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())
    fireEvent.change(title(), { target: { value: 'Second task' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add task|Saving/ }))
    })
    out['after-reset-submit-without-date'] = screen.queryAllByRole('alert').map((a) => a.textContent)
    out['dueDateDomValue'] = dueDate().value
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'empty-due-date', v: out }) + '\n')
  })
})
