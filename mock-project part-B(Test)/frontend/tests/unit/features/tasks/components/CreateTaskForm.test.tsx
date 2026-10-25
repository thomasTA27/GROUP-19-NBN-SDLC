import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TASK_MESSAGES } from '@/features/tasks/schemas'
import type { TaskActionResult } from '@/features/tasks/types'

const { createTask, toastSuccess, toastError } = vi.hoisted(() => ({
  createTask: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))
vi.mock('@/features/tasks/actions/tasks.actions', () => ({ createTask }))
vi.mock('sonner', () => ({ toast: { success: toastSuccess, error: toastError } }))

// Lets one test replace localInputToIso, called by both the form schema and the form itself.
// With no override set it is the real function.
const dueDateHooks = vi.hoisted(() => ({
  override: null as
    null | ((value: string, real: (value: string) => string | null) => string | null),
}))
vi.mock('@/features/tasks/lib/due-date', async (importActual) => {
  const actual = await importActual<typeof import('@/features/tasks/lib/due-date')>()
  return {
    ...actual,
    localInputToIso: (value: string) =>
      dueDateHooks.override
        ? dueDateHooks.override(value, actual.localInputToIso)
        : actual.localInputToIso(value),
  }
})

import { CreateTaskForm } from '@/features/tasks/components/CreateTaskForm'

// "Now" for every test: the early past and 10-year checks read the browser clock, so a fixed
// one keeps the due dates below valid whenever the suite runs.
const NOW = new Date('2027-01-01T00:00:00.000Z')
// 5:00 pm in Perth (UTC+8) is 09:00 UTC (AC-2.5).
const VALID_DUE_LOCAL = '2027-03-05T17:00'
const VALID_DUE_ISO = '2027-03-05T09:00:00.000Z'

const originalTz = process.env.TZ

beforeEach(() => {
  process.env.TZ = 'Australia/Perth'
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  vi.clearAllMocks()
  dueDateHooks.override = null
  createTask.mockResolvedValue({ success: true })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  if (originalTz === undefined) delete process.env.TZ
  else process.env.TZ = originalTz
})

// A call the test settles by hand, so it can look at the form while the call is in flight.
function deferred() {
  let resolve!: (result: TaskActionResult) => void
  const promise = new Promise<TaskActionResult>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function titleInput() {
  return screen.getByLabelText('Title') as HTMLInputElement
}
function descriptionInput() {
  return screen.getByLabelText('Description') as HTMLTextAreaElement
}
function dueDateInput() {
  return screen.getByLabelText('Due date') as HTMLInputElement
}
function submitButton() {
  return screen.getByRole('button', { name: /Add task|Saving/ })
}

// fireEvent.change sets the value in one step, which keeps 10,000-character cases fast.
function fill({
  title = 'Write the report',
  description = '',
  dueDate = VALID_DUE_LOCAL,
}: { title?: string; description?: string; dueDate?: string } = {}) {
  fireEvent.change(titleInput(), { target: { value: title } })
  fireEvent.change(descriptionInput(), { target: { value: description } })
  fireEvent.change(dueDateInput(), { target: { value: dueDate } })
}

async function submit() {
  await act(async () => {
    fireEvent.click(submitButton())
  })
}

describe('CreateTaskForm', () => {
  it('runs in the pinned timezone (proof the TZ setting takes effect)', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Australia/Perth')
  })

  describe('structure (AC-8.4a)', () => {
    it('has a real label tied to each field', () => {
      render(<CreateTaskForm />)
      expect(titleInput()).toHaveAttribute('id', 'task-title')
      expect(screen.getByText('Title')).toHaveAttribute('for', 'task-title')
      expect(descriptionInput().tagName).toBe('TEXTAREA')
      expect(screen.getByText('Description')).toHaveAttribute('for', 'task-description')
      expect(dueDateInput()).toHaveAttribute('type', 'datetime-local')
      expect(screen.getByText('Due date')).toHaveAttribute('for', 'task-due-date')
    })

    it('turns the browser validation off, sets step 60, and sets no limit attributes', () => {
      const { container } = render(<CreateTaskForm />)
      expect(container.querySelector('form')).toHaveAttribute('novalidate')
      expect(dueDateInput()).toHaveAttribute('step', '60')
      expect(dueDateInput()).not.toHaveAttribute('min')
      expect(dueDateInput()).not.toHaveAttribute('max')
      expect(titleInput()).not.toHaveAttribute('maxlength')
      expect(descriptionInput()).not.toHaveAttribute('maxlength')
    })

    it('submits with Enter in the title field', async () => {
      const user = userEvent.setup()
      render(<CreateTaskForm />)
      fill({ title: '' })
      await user.type(titleInput(), 'Keyboard task{Enter}')
      await waitFor(() => expect(createTask).toHaveBeenCalledTimes(1))
      expect(createTask).toHaveBeenCalledWith({
        title: 'Keyboard task',
        description: '',
        dueDate: VALID_DUE_ISO,
      })
    })

    it('shows no error on a fresh form', () => {
      render(<CreateTaskForm />)
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
      expect(titleInput()).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('title rule (AC-2.1a, AC-2.2a, AC-2.2b, AC-2.2c)', () => {
    it('accepts a title of 1 character', async () => {
      render(<CreateTaskForm />)
      fill({ title: 'a' })
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('accepts a title of 200 characters', async () => {
      render(<CreateTaskForm />)
      fill({ title: 'x'.repeat(200) })
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses a title of 201 characters, naming the limit, and calls no action', async () => {
      render(<CreateTaskForm />)
      fill({ title: 'x'.repeat(201) })
      await submit()
      expect(await screen.findByText('Title must be 200 characters or fewer')).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })

    it('refuses an empty title', async () => {
      render(<CreateTaskForm />)
      fill({ title: '' })
      await submit()
      expect(await screen.findByText('Title is required')).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })

    it('refuses a title of only whitespace', async () => {
      render(<CreateTaskForm />)
      fill({ title: ' \t\n  ' })
      await submit()
      expect(await screen.findByText('Title is required')).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })

    it('counts the length after trimming: 200 characters inside whitespace is accepted', async () => {
      render(<CreateTaskForm />)
      fill({ title: `  ${'x'.repeat(200)}  ` })
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
    })

    it('sends the schema’s trimmed title, not the text as typed (AC-2.2c)', async () => {
      render(<CreateTaskForm />)
      fill({ title: '  Write the report  ' })
      await submit()
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Write the report' })
      )
    })
  })

  describe('description rule (AC-2.1c, AC-2.3a)', () => {
    it('accepts an empty description', async () => {
      render(<CreateTaskForm />)
      fill({ description: '' })
      await submit()
      expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ description: '' }))
    })

    it('accepts a description of 10,000 characters', async () => {
      render(<CreateTaskForm />)
      fill({ description: 'y'.repeat(10_000) })
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses a description of 10,001 characters, naming the limit, and calls no action', async () => {
      render(<CreateTaskForm />)
      fill({ description: 'y'.repeat(10_001) })
      await submit()
      expect(
        await screen.findByText('Description must be 10,000 characters or fewer')
      ).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })

    it('sends the description exactly as typed, with its line breaks and no trimming', async () => {
      render(<CreateTaskForm />)
      fill({ description: '  <b>first</b>\nsecond  ' })
      await submit()
      expect(createTask).toHaveBeenCalledWith(
        expect.objectContaining({ description: '  <b>first</b>\nsecond  ' })
      )
    })
  })

  describe('due date rule (AC-2.1b, AC-2.4, AC-2.6a)', () => {
    it('refuses an empty due date and calls no action', async () => {
      render(<CreateTaskForm />)
      fill({ dueDate: '' })
      await submit()
      expect(await screen.findByText('Due date is required')).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })

    it('refuses a past due date and calls no action', async () => {
      render(<CreateTaskForm />)
      fill({ dueDate: '2026-12-31T10:00' })
      await submit()
      expect(await screen.findByText("Due date can't be in the past")).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })

    it('accepts a future due date', async () => {
      render(<CreateTaskForm />)
      fill({ dueDate: VALID_DUE_LOCAL })
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses a due date more than 10 years ahead, naming the limit', async () => {
      render(<CreateTaskForm />)
      fill({ dueDate: '2037-01-02T10:00' })
      await submit()
      expect(
        await screen.findByText("Due date can't be more than 10 years from now")
      ).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })

    it('shows an error only beside the invalid fields (AC-2.8)', async () => {
      render(<CreateTaskForm />)
      fill({ title: '', description: 'fine', dueDate: VALID_DUE_LOCAL })
      await submit()
      expect(await screen.findAllByRole('alert')).toHaveLength(1)
      expect(titleInput()).toHaveAttribute('aria-invalid', 'true')
      expect(descriptionInput()).toHaveAttribute('aria-invalid', 'false')
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('accessibility of errors (AC-2.8, AC-8.4a)', () => {
    it('ties each error to its field with role="alert", aria-invalid and aria-describedby', async () => {
      render(<CreateTaskForm />)
      fill({ title: '', description: 'y'.repeat(10_001), dueDate: '' })
      await submit()
      await screen.findAllByRole('alert')

      const pairs = [
        [titleInput(), 'Title is required'],
        [descriptionInput(), 'Description must be 10,000 characters or fewer'],
        [dueDateInput(), 'Due date is required'],
      ] as const
      for (const [input, message] of pairs) {
        expect(input).toHaveAttribute('aria-invalid', 'true')
        const describedBy = input.getAttribute('aria-describedby')
        expect(describedBy).toBeTruthy()
        const error = document.getElementById(describedBy!)
        expect(error).toHaveAttribute('role', 'alert')
        expect(error).toHaveTextContent(message)
      }
    })
  })

  describe('what is sent (AC-2.4, AC-2.5, AC-3.1)', () => {
    it('sends exactly { title, description, dueDate }, with 5:00 pm Perth as 09:00 UTC', async () => {
      render(<CreateTaskForm />)
      fill({ title: 'Write the report', description: 'Some details', dueDate: VALID_DUE_LOCAL })
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
      const sent = createTask.mock.calls[0]![0] as Record<string, unknown>
      expect(sent).toEqual({
        title: 'Write the report',
        description: 'Some details',
        dueDate: VALID_DUE_ISO,
      })
      expect(Object.keys(sent).sort()).toEqual(['description', 'dueDate', 'title'])
      for (const key of [
        'status',
        'uid',
        'createdAt',
        'updatedAt',
        'deletedAt',
        '_schemaVersion',
      ]) {
        expect(sent).not.toHaveProperty(key)
      }
    })

    it('does not block a title another task already has (AC-2.7)', async () => {
      render(<CreateTaskForm />)
      fill({ title: 'Same title' })
      await submit()
      await waitFor(() => expect(submitButton()).not.toBeDisabled())
      fill({ title: 'Same title' })
      await submit()
      await waitFor(() => expect(createTask).toHaveBeenCalledTimes(2))
      expect(createTask.mock.calls[0]![0]).toEqual(createTask.mock.calls[1]![0])
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })
  })

  describe('server refusals (ADR-0006)', () => {
    it('shows a refusal that names dueDate beside the due date, with no toast', async () => {
      createTask.mockResolvedValue({
        success: false,
        error: TASK_MESSAGES.dueDatePast,
        field: 'dueDate',
      })
      render(<CreateTaskForm />)
      fill()
      await submit()

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(TASK_MESSAGES.dueDatePast)
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'true')
      expect(dueDateInput()).toHaveAttribute('aria-describedby', alert.id)
      expect(toastError).not.toHaveBeenCalled()
      expect(toastSuccess).not.toHaveBeenCalled()
    })

    it.each([
      ['title', TASK_MESSAGES.titleTooLong, titleInput],
      ['description', TASK_MESSAGES.descriptionTooLong, descriptionInput],
    ] as const)('shows a refusal that names %s beside it', async (field, error, getInput) => {
      createTask.mockResolvedValue({ success: false, error, field })
      render(<CreateTaskForm />)
      fill()
      await submit()
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(error)
      expect(getInput()).toHaveAttribute('aria-describedby', alert.id)
      expect(toastError).not.toHaveBeenCalled()
    })

    it('shows a refusal with no field as a toast with the action’s own text, and no field error', async () => {
      createTask.mockResolvedValue({ success: false, error: 'A new task must start as pending' })
      render(<CreateTaskForm />)
      fill()
      await submit()
      await waitFor(() =>
        expect(toastError).toHaveBeenCalledWith('A new task must start as pending')
      )
      expect(toastError).toHaveBeenCalledTimes(1)
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
      expect(titleInput()).toHaveAttribute('aria-invalid', 'false')
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'false')
    })

    it('shows the fixed wording when a failure has no text', async () => {
      createTask.mockResolvedValue({ success: false })
      render(<CreateTaskForm />)
      fill()
      await submit()
      await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.saveFailed))
    })

    it('shows the fixed wording, logs the raw error and shows no raw message when the call throws', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const raw = new Error('PERMISSION_DENIED at projects/secret/databases/(default)')
      createTask.mockRejectedValue(raw)
      render(<CreateTaskForm />)
      fill()
      await submit()

      await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.saveFailed))
      expect(toastError).toHaveBeenCalledTimes(1)
      expect(consoleError).toHaveBeenCalledWith(expect.anything(), raw)
      expect(toastError.mock.calls.flat().join(' ')).not.toContain('PERMISSION_DENIED')
      expect(document.body.textContent).not.toContain('PERMISSION_DENIED')
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(titleInput().value).toBe('Write the report')
      expect(submitButton()).not.toBeDisabled()
    })
  })

  describe('success and failure (AC-8.1a, AC-8.1b, AC-8.2a)', () => {
    it('on success shows a success toast, no error toast, and clears the form', async () => {
      render(<CreateTaskForm />)
      fill({ title: 'Write the report', description: 'Some details' })
      await submit()

      await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Task created'))
      expect(toastError).not.toHaveBeenCalled()
      await waitFor(() => expect(titleInput().value).toBe(''))
      expect(descriptionInput().value).toBe('')
      expect(dueDateInput().value).toBe('')
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('on a failure keeps what the user typed and shows no success toast', async () => {
      createTask.mockResolvedValue({ success: false, error: 'Something broke.' })
      render(<CreateTaskForm />)
      fill({ title: 'Write the report', description: 'Some details' })
      await submit()

      await waitFor(() => expect(toastError).toHaveBeenCalledWith('Something broke.'))
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(titleInput().value).toBe('Write the report')
      expect(descriptionInput().value).toBe('Some details')
      expect(dueDateInput().value).toBe(VALID_DUE_LOCAL)
    })

    it('on a field refusal keeps what the user typed and shows no success toast', async () => {
      createTask.mockResolvedValue({
        success: false,
        error: TASK_MESSAGES.dueDatePast,
        field: 'dueDate',
      })
      render(<CreateTaskForm />)
      fill({ title: 'Write the report', description: 'Some details' })
      await submit()

      await screen.findByRole('alert')
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(titleInput().value).toBe('Write the report')
      expect(descriptionInput().value).toBe('Some details')
      expect(dueDateInput().value).toBe(VALID_DUE_LOCAL)
    })
  })

  describe('characters are Unicode code points (A27)', () => {
    it('accepts a title of 200 thumbs-up emoji (200 code points, 400 UTF-16 units)', async () => {
      render(<CreateTaskForm />)
      fill({ title: '👍'.repeat(200) })
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
      expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ title: '👍'.repeat(200) }))
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses 199 plain characters plus the Australian flag (201 code points)', async () => {
      render(<CreateTaskForm />)
      fill({ title: `${'x'.repeat(199)}🇦🇺` })
      await submit()
      expect(await screen.findByText(TASK_MESSAGES.titleTooLong)).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })

    it('accepts a description of 10,000 line breaks (each counts as 1)', async () => {
      render(<CreateTaskForm />)
      fill({ description: '\n'.repeat(10_000) })
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses a description of 10,001 line breaks', async () => {
      render(<CreateTaskForm />)
      fill({ description: '\n'.repeat(10_001) })
      await submit()
      expect(await screen.findByText(TASK_MESSAGES.descriptionTooLong)).toBeInTheDocument()
      expect(createTask).not.toHaveBeenCalled()
    })
  })

  describe('clock edges, judged by the browser clock for the early check (A26, A6)', () => {
    // Perth is UTC+8, so the clock 10:30:45Z is 18:30:45 in Perth.
    it.each([
      ['the current minute is accepted', '2027-03-05T10:30:45Z', '2027-03-05T18:30', true],
      [
        'one minute before the current minute is refused',
        '2027-03-05T10:30:45Z',
        '2027-03-05T18:29',
        false,
      ],
      ['exactly 10 years ahead is accepted', '2027-03-05T10:30:45Z', '2037-03-05T18:30', true],
      [
        'one minute past 10 years ahead is refused',
        '2027-03-05T10:30:45Z',
        '2037-03-05T18:31',
        false,
      ],
      [
        '29 February + 10 years is 28 February: accepted',
        '2028-02-29T10:30:45Z',
        '2038-02-28T18:30',
        true,
      ],
      [
        '29 February + 10 years, one minute later: refused',
        '2028-02-29T10:30:45Z',
        '2038-02-28T18:31',
        false,
      ],
    ] as const)('%s', async (_name, clock, dueDate, accepted) => {
      vi.setSystemTime(new Date(clock))
      render(<CreateTaskForm />)
      fill({ dueDate })
      await submit()
      if (accepted) {
        await waitFor(() => expect(createTask).toHaveBeenCalledTimes(1))
        expect(screen.queryAllByRole('alert')).toHaveLength(0)
      } else {
        expect(await screen.findByRole('alert')).toHaveTextContent(/Due date can't be/)
        expect(createTask).not.toHaveBeenCalled()
      }
    })
  })

  describe('more server refusals', () => {
    it('shows the fixed wording beside the field when a refusal names a field but has no text, with no toast', async () => {
      createTask.mockResolvedValue({ success: false, field: 'title' })
      render(<CreateTaskForm />)
      fill()
      await submit()
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(TASK_MESSAGES.saveFailed)
      expect(titleInput()).toHaveAttribute('aria-describedby', alert.id)
      expect(toastError).not.toHaveBeenCalled()
      expect(toastSuccess).not.toHaveBeenCalled()
    })

    it('lets the user fix the due date after a server refusal and submit again', async () => {
      createTask.mockResolvedValueOnce({
        success: false,
        error: TASK_MESSAGES.dueDatePast,
        field: 'dueDate',
      })
      render(<CreateTaskForm />)
      fill()
      await submit()
      expect(await screen.findByRole('alert')).toHaveTextContent(TASK_MESSAGES.dueDatePast)
      expect(createTask).toHaveBeenCalledTimes(1)

      fireEvent.change(dueDateInput(), { target: { value: '2027-03-06T17:00' } })
      await submit()

      await waitFor(() => expect(createTask).toHaveBeenCalledTimes(2))
      expect(createTask.mock.calls[1]![0]).toEqual({
        title: 'Write the report',
        description: '',
        dueDate: '2027-03-06T09:00:00.000Z',
      })
      await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'false')
      expect(toastError).not.toHaveBeenCalled()
      await waitFor(() => expect(titleInput().value).toBe(''))
      expect(descriptionInput().value).toBe('')
      expect(dueDateInput().value).toBe('')
    })
  })

  describe('the null branch after localInputToIso', () => {
    // Reachable only with a stub: the schema calls localInputToIso on the same value just
    // before onSubmit, and the function is pure, so in real use both calls agree. The stub
    // answers the schema's call (the first) with the real result and every later call with null.
    it('shows the invalid-date text beside the due date, calls no action, and re-enables the button', async () => {
      let calls = 0
      dueDateHooks.override = (value, real) => (++calls === 1 ? real(value) : null)
      render(<CreateTaskForm />)
      fill()
      await submit()

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(TASK_MESSAGES.dueDateInvalid)
      expect(dueDateInput()).toHaveAttribute('aria-describedby', alert.id)
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'true')
      expect(createTask).not.toHaveBeenCalled()
      expect(toastError).not.toHaveBeenCalled()
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(calls).toBe(2)
      expect(submitButton()).not.toBeDisabled()
      expect(submitButton()).toHaveTextContent('Add task')
    })
  })

  describe('keyboard (AC-8.4a)', () => {
    it('tabs through Title, Description, Due date, then the Add task button', async () => {
      const user = userEvent.setup()
      render(<CreateTaskForm />)
      await user.tab()
      expect(titleInput()).toHaveFocus()
      await user.tab()
      expect(descriptionInput()).toHaveFocus()
      await user.tab()
      expect(dueDateInput()).toHaveFocus()
      await user.tab()
      expect(screen.getByRole('button', { name: 'Add task' })).toHaveFocus()
    })
  })

  describe('editing while a save is in flight', () => {
    // Records current behaviour, it doesn't endorse it (like the "accepted" test in
    // TaskItem.test.tsx). The inputs stay editable while saving. When the call then succeeds,
    // reset() clears the form, so what the user typed during the save is discarded, and the
    // saved task has the title that was sent.
    it('discards a title typed during the save when the call succeeds', async () => {
      const call = deferred()
      createTask.mockReturnValue(call.promise)
      render(<CreateTaskForm />)
      fill({ title: 'Sent title' })
      await submit()
      expect(titleInput()).not.toBeDisabled()

      fireEvent.change(titleInput(), { target: { value: 'Typed during the save' } })
      expect(titleInput().value).toBe('Typed during the save')

      await act(async () => {
        call.resolve({ success: true })
      })
      await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Task created'))
      expect(titleInput().value).toBe('')
      expect(createTask).toHaveBeenCalledTimes(1)
      expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Sent title' }))
    })
  })

  describe('saving state', () => {
    it('disables the button and shows "Saving..." while the call is in flight', async () => {
      const call = deferred()
      createTask.mockReturnValue(call.promise)
      render(<CreateTaskForm />)
      fill()
      expect(submitButton()).not.toBeDisabled()
      await submit()

      expect(submitButton()).toBeDisabled()
      expect(submitButton()).toHaveTextContent('Saving...')

      await act(async () => {
        call.resolve({ success: true })
      })
      await waitFor(() => expect(submitButton()).not.toBeDisabled())
      expect(submitButton()).toHaveTextContent('Add task')
    })

    it('starts one call when two submits land inside one act()', async () => {
      const call = deferred()
      createTask.mockReturnValue(call.promise)
      const { container } = render(<CreateTaskForm />)
      fill()
      const form = container.querySelector('form')!

      await act(async () => {
        fireEvent.submit(form)
        fireEvent.submit(form)
      })
      expect(createTask).toHaveBeenCalledTimes(1)

      await act(async () => {
        call.resolve({ success: true })
      })
      await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))
      expect(createTask).toHaveBeenCalledTimes(1)
    })

    it('starts one call when the button is clicked twice while saving', async () => {
      const call = deferred()
      createTask.mockReturnValue(call.promise)
      render(<CreateTaskForm />)
      fill()
      await submit()
      await submit()
      expect(createTask).toHaveBeenCalledTimes(1)
      await act(async () => {
        call.resolve({ success: true })
      })
    })
  })
})
