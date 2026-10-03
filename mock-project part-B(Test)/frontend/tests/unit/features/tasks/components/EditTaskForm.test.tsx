import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { TASK_MESSAGES } from '@/features/tasks/schemas'
import type { TaskActionResult, TaskWithId } from '@/features/tasks/types'

const { updateTask, toastSuccess, toastError } = vi.hoisted(() => ({
  updateTask: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))
vi.mock('@/features/tasks/actions/tasks.actions', () => ({ updateTask }))
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

import { EditTaskForm } from '@/features/tasks/components/EditTaskForm'

// "Now" for every test: the early past and 10-year checks read the browser clock.
const NOW = new Date('2027-01-01T00:00:00.000Z')
// 5:00 pm in Perth (UTC+8) is 09:00 UTC (AC-2.5). The task below is due then.
const LOADED_DUE_LOCAL = '2027-03-05T17:00'
const FUTURE_DUE_LOCAL = '2027-03-06T17:00'
const FUTURE_DUE_ISO = '2027-03-06T09:00:00.000Z'
// A due date that has already passed at NOW: 10:00 am in Perth on 1 December 2026.
const PAST_DUE_LOCAL = '2026-12-01T10:00'

const originalTz = process.env.TZ

beforeEach(() => {
  process.env.TZ = 'Australia/Perth'
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  vi.clearAllMocks()
  dueDateHooks.override = null
  updateTask.mockResolvedValue({ success: true })
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

function makeTask(overrides: Partial<TaskWithId> = {}): TaskWithId {
  return {
    id: 't1',
    uid: 'user-1',
    title: 'Write the report',
    description: 'Some details',
    dueDate: Timestamp.fromDate(new Date('2027-03-05T09:00:00.000Z')),
    status: 'pending',
    createdAt: Timestamp.fromDate(new Date('2026-12-01T00:00:00.000Z')),
    updatedAt: Timestamp.fromDate(new Date('2026-12-01T00:00:00.000Z')),
    deletedAt: null,
    _schemaVersion: 1,
    ...overrides,
  }
}

// Due 10:00 am Perth on 1 December 2026: already past at NOW.
function makePastTask(overrides: Partial<TaskWithId> = {}) {
  return makeTask({
    dueDate: Timestamp.fromDate(new Date('2026-12-01T02:00:00.000Z')),
    ...overrides,
  })
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
function saveButton() {
  return screen.getByRole('button', { name: 'Save' })
}
function cancelButton() {
  return screen.getByRole('button', { name: 'Cancel' })
}
function editGroup() {
  return screen.getByRole('group', { name: /^Edit "/ })
}

function setTitle(value: string) {
  fireEvent.change(titleInput(), { target: { value } })
}
function setDescription(value: string) {
  fireEvent.change(descriptionInput(), { target: { value } })
}
function setDueDate(value: string) {
  fireEvent.change(dueDateInput(), { target: { value } })
}

async function save() {
  await act(async () => {
    fireEvent.click(saveButton())
  })
}

// The exact object the action got on its only call, with the keys it must never have.
const FORBIDDEN_KEYS = ['status', 'uid', 'createdAt', 'updatedAt', 'deletedAt', '_schemaVersion']
function expectSent(expected: Record<string, unknown>) {
  expect(updateTask).toHaveBeenCalledTimes(1)
  const sent = updateTask.mock.calls[0]![0] as Record<string, unknown>
  expect(sent).toEqual(expected)
  expect(Object.keys(sent).sort()).toEqual(Object.keys(expected).sort())
  for (const key of FORBIDDEN_KEYS) expect(sent).not.toHaveProperty(key)
}

describe('EditTaskForm', () => {
  it('runs in the pinned timezone (proof the TZ setting takes effect)', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Australia/Perth')
  })

  describe('structure (AC-2.8, AC-8.4a)', () => {
    it('starts with the stored title, description and due date as a datetime-local value', () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      expect(titleInput().value).toBe('Write the report')
      expect(descriptionInput().value).toBe('Some details')
      expect(dueDateInput().value).toBe(LOADED_DUE_LOCAL)
    })

    it('has a real label tied to each field, with ids that include the task id', () => {
      render(<EditTaskForm task={makeTask({ id: 'abc' })} onClose={vi.fn()} />)
      expect(titleInput()).toHaveAttribute('id', 'task-abc-edit-title')
      expect(screen.getByText('Title')).toHaveAttribute('for', 'task-abc-edit-title')
      expect(descriptionInput().tagName).toBe('TEXTAREA')
      expect(descriptionInput()).toHaveAttribute('id', 'task-abc-edit-description')
      expect(screen.getByText('Description')).toHaveAttribute('for', 'task-abc-edit-description')
      expect(dueDateInput()).toHaveAttribute('type', 'datetime-local')
      expect(dueDateInput()).toHaveAttribute('id', 'task-abc-edit-due-date')
      expect(screen.getByText('Due date')).toHaveAttribute('for', 'task-abc-edit-due-date')
    })

    it('turns the browser validation off, sets step 60, and sets no limit attributes', () => {
      const { container } = render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      expect(container.querySelector('form')).toHaveAttribute('novalidate')
      expect(dueDateInput()).toHaveAttribute('step', '60')
      expect(dueDateInput()).not.toHaveAttribute('min')
      expect(dueDateInput()).not.toHaveAttribute('max')
      expect(titleInput()).not.toHaveAttribute('maxlength')
      expect(descriptionInput()).not.toHaveAttribute('maxlength')
    })

    it('has real Save (submit) and Cancel (button) buttons', () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      expect(saveButton()).toHaveAttribute('type', 'submit')
      expect(cancelButton()).toHaveAttribute('type', 'button')
    })

    it('shows no error on a fresh form', () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
      expect(titleInput()).toHaveAttribute('aria-invalid', 'false')
      expect(descriptionInput()).toHaveAttribute('aria-invalid', 'false')
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'false')
      expect(editGroup()).not.toHaveAttribute('aria-busy')
    })

    it('uses ids that stay unique when two edit forms exist', () => {
      const { container } = render(
        <>
          <EditTaskForm task={makeTask({ id: 'a', title: 'First' })} onClose={vi.fn()} />
          <EditTaskForm task={makeTask({ id: 'b', title: 'Second' })} onClose={vi.fn()} />
        </>
      )
      const ids = [...container.querySelectorAll('[id]')].map((element) => element.id)
      expect(ids.length).toBeGreaterThanOrEqual(6)
      expect(new Set(ids).size).toBe(ids.length)

      const titles = screen.getAllByLabelText('Title')
      expect(titles).toHaveLength(2)
      expect(titles[0]).toHaveAttribute('id', 'task-a-edit-title')
      expect(titles[1]).toHaveAttribute('id', 'task-b-edit-title')
      expect(screen.getAllByLabelText('Due date')).toHaveLength(2)
    })

    it('keeps each form’s errors beside its own fields when two forms exist', async () => {
      render(
        <>
          <EditTaskForm task={makeTask({ id: 'a', title: 'First' })} onClose={vi.fn()} />
          <EditTaskForm task={makeTask({ id: 'b', title: 'Second' })} onClose={vi.fn()} />
        </>
      )
      const [firstTitle] = screen.getAllByLabelText('Title') as HTMLInputElement[]
      fireEvent.change(firstTitle!, { target: { value: '' } })
      await act(async () => {
        fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]!)
      })
      const alerts = await screen.findAllByRole('alert')
      expect(alerts).toHaveLength(1)
      expect(firstTitle).toHaveAttribute('aria-describedby', alerts[0]!.id)
      expect(screen.getAllByLabelText('Title')[1]).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('title rule (AC-2.1a, AC-2.2a, AC-2.2b, AC-2.2c)', () => {
    it('accepts a title of 1 character', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('a')
      await save()
      expectSent({ id: 't1', title: 'a' })
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('accepts a title of 200 characters', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('x'.repeat(200))
      await save()
      expectSent({ id: 't1', title: 'x'.repeat(200) })
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses a title of 201 characters, naming the limit, and calls no action', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('x'.repeat(201))
      await save()
      expect(await screen.findByText('Title must be 200 characters or fewer')).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('refuses an empty title', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('')
      await save()
      expect(await screen.findByText('Title is required')).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('refuses a title of only whitespace', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle(' \t\n  ')
      await save()
      expect(await screen.findByText('Title is required')).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('counts the length after trimming: 200 characters inside whitespace is accepted', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle(`  ${'x'.repeat(200)}  `)
      await save()
      expectSent({ id: 't1', title: 'x'.repeat(200) })
    })

    it('sends the trimmed title, not the text as typed (AC-2.2c)', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('  New title  ')
      await save()
      expectSent({ id: 't1', title: 'New title' })
    })

    it('accepts 200 thumbs-up emoji (200 code points, 400 UTF-16 units)', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('👍'.repeat(200))
      await save()
      expectSent({ id: 't1', title: '👍'.repeat(200) })
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses 199 plain characters plus the Australian flag (201 code points)', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle(`${'x'.repeat(199)}🇦🇺`)
      await save()
      expect(await screen.findByText(TASK_MESSAGES.titleTooLong)).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })
  })

  describe('description rule (AC-2.1c, AC-2.3a)', () => {
    it('accepts an empty description and sends it, so a description can be cleared', async () => {
      render(<EditTaskForm task={makeTask({ description: 'Old' })} onClose={vi.fn()} />)
      setDescription('')
      await save()
      expectSent({ id: 't1', description: '' })
    })

    it('accepts a description of 10,000 characters', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDescription('y'.repeat(10_000))
      await save()
      expectSent({ id: 't1', description: 'y'.repeat(10_000) })
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses a description of 10,001 characters, naming the limit, and calls no action', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDescription('y'.repeat(10_001))
      await save()
      expect(
        await screen.findByText('Description must be 10,000 characters or fewer')
      ).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('counts a line break as 1: 10,000 accepted, 10,001 refused', async () => {
      const { unmount } = render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDescription('\n'.repeat(10_000))
      await save()
      expect(updateTask).toHaveBeenCalledTimes(1)
      unmount()

      updateTask.mockClear()
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDescription('\n'.repeat(10_001))
      await save()
      expect(await screen.findByText(TASK_MESSAGES.descriptionTooLong)).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('sends the description exactly as typed, with its line breaks and no trimming', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDescription('  <b>first</b>\nsecond  ')
      await save()
      expectSent({ id: 't1', description: '  <b>first</b>\nsecond  ' })
    })
  })

  describe('due date rule (AC-2.1b, AC-2.4, AC-2.6a, AC-2.6b)', () => {
    it('refuses an empty due date and calls no action', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDueDate('')
      await save()
      expect(await screen.findByText('Due date is required')).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('accepts a different future due date and sends it as an ISO string with an offset', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDueDate(FUTURE_DUE_LOCAL)
      await save()
      expectSent({ id: 't1', dueDate: FUTURE_DUE_ISO })
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('refuses a due date changed to the past and calls no action', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDueDate('2026-12-31T10:00')
      await save()
      expect(await screen.findByText("Due date can't be in the past")).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('refuses a due date more than 10 years ahead, naming the limit', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDueDate('2037-01-02T10:00')
      await save()
      expect(
        await screen.findByText("Due date can't be more than 10 years from now")
      ).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it('shows an error only beside the invalid field (AC-2.8)', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('')
      setDescription('fine')
      await save()
      expect(await screen.findAllByRole('alert')).toHaveLength(1)
      expect(titleInput()).toHaveAttribute('aria-invalid', 'true')
      expect(descriptionInput()).toHaveAttribute('aria-invalid', 'false')
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'false')
    })

    it('ties each error to its field with role="alert", aria-invalid and aria-describedby', async () => {
      render(<EditTaskForm task={makeTask({ id: 'abc' })} onClose={vi.fn()} />)
      setTitle('')
      setDescription('y'.repeat(10_001))
      setDueDate('')
      await save()
      await screen.findAllByRole('alert')

      const pairs = [
        [titleInput(), 'task-abc-edit-title-error', 'Title is required'],
        [
          descriptionInput(),
          'task-abc-edit-description-error',
          'Description must be 10,000 characters or fewer',
        ],
        [dueDateInput(), 'task-abc-edit-due-date-error', 'Due date is required'],
      ] as const
      for (const [input, errorId, message] of pairs) {
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(input).toHaveAttribute('aria-describedby', errorId)
        const error = document.getElementById(errorId)
        expect(error).toHaveAttribute('role', 'alert')
        expect(error).toHaveTextContent(message)
      }
    })
  })

  describe('only the changed fields are sent (AC-5.1, AC-5.2, AC-5.3)', () => {
    it('sends only the title when only the title changed', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      await save()
      expectSent({ id: 't1', title: 'New title' })
    })

    it('sends only the description when only the description changed', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDescription('New details')
      await save()
      expectSent({ id: 't1', description: 'New details' })
    })

    it('sends only the due date when only the due date changed', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDueDate(FUTURE_DUE_LOCAL)
      await save()
      expectSent({ id: 't1', dueDate: FUTURE_DUE_ISO })
    })

    it('sends exactly the two changed fields when two changed', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      setDueDate(FUTURE_DUE_LOCAL)
      await save()
      expectSent({ id: 't1', title: 'New title', dueDate: FUTURE_DUE_ISO })
    })

    it('sends title and description when those two changed, and not the due date', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      setDescription('New details')
      await save()
      expectSent({ id: 't1', title: 'New title', description: 'New details' })
    })

    it('sends all three when all three changed', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      setDescription('New details')
      setDueDate(FUTURE_DUE_LOCAL)
      await save()
      expectSent({
        id: 't1',
        title: 'New title',
        description: 'New details',
        dueDate: FUTURE_DUE_ISO,
      })
    })

    it('does not send a field the user changed and then changed back', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('Something else')
      setTitle('Write the report')
      setDescription('New details')
      await save()
      expectSent({ id: 't1', description: 'New details' })
    })

    it.each([['pending' as const], ['completed' as const]])(
      'edits a %s task the same way and never sends the status (AC-5.3, AC-5.4)',
      async (status) => {
        render(<EditTaskForm task={makeTask({ status })} onClose={vi.fn()} />)
        setTitle('New title')
        await save()
        expectSent({ id: 't1', title: 'New title' })
      }
    )
  })

  describe('Save is disabled until something changes (ADR-0005)', () => {
    it('is disabled when the form opens', () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      expect(saveButton()).toBeDisabled()
    })

    it('is enabled after a real change', () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      expect(saveButton()).toBeEnabled()
    })

    it.each([
      ['title', () => setTitle('Changed'), () => setTitle('Write the report')],
      ['description', () => setDescription('Changed'), () => setDescription('Some details')],
      ['due date', () => setDueDate(FUTURE_DUE_LOCAL), () => setDueDate(LOADED_DUE_LOCAL)],
    ])(
      'is disabled again when the %s is typed back to the original',
      async (_name, change, back) => {
        render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
        await act(async () => change())
        expect(saveButton()).toBeEnabled()
        await act(async () => back())
        expect(saveButton()).toBeDisabled()
      }
    )

    it('stays enabled while a second field is still changed after one is typed back', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('Changed')
      setDescription('Changed too')
      setTitle('Write the report')
      expect(saveButton()).toBeEnabled()
    })

    it('calls no action when a submit gets through with nothing changed', async () => {
      const { container } = render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      await act(async () => {
        fireEvent.submit(container.querySelector('form')!)
      })
      expect(updateTask).not.toHaveBeenCalled()
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(toastError).not.toHaveBeenCalled()
    })
  })

  describe('a due date that has already passed (AC-2.6b, AC-2.6c, AC-5.4)', () => {
    it.each([['pending' as const], ['completed' as const]])(
      'a %s task with a past due date loads with that due date and no error',
      (status) => {
        render(<EditTaskForm task={makePastTask({ status })} onClose={vi.fn()} />)
        expect(dueDateInput().value).toBe(PAST_DUE_LOCAL)
        expect(screen.queryAllByRole('alert')).toHaveLength(0)
      }
    )

    it.each([['pending' as const], ['completed' as const]])(
      'editing only the title of a %s task saves, with no error and no due date sent (AC-2.6c)',
      async (status) => {
        const onClose = vi.fn()
        render(<EditTaskForm task={makePastTask({ status })} onClose={onClose} />)
        setTitle('New title')
        await save()

        expectSent({ id: 't1', title: 'New title' })
        expect(screen.queryAllByRole('alert')).toHaveLength(0)
        expect(toastError).not.toHaveBeenCalled()
        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
      }
    )

    it('editing only the description of a past-due task saves without the due date', async () => {
      render(<EditTaskForm task={makePastTask()} onClose={vi.fn()} />)
      setDescription('New details')
      await save()
      expectSent({ id: 't1', description: 'New details' })
    })

    it.each([
      ['a different day', '2026-12-02T10:00'],
      ['the time alone', '2026-12-01T10:01'],
      ['the time alone, one minute earlier', '2026-12-01T09:59'],
    ])(
      'changing it to a different past time (%s) shows the error and calls no action (AC-2.6b)',
      async (_name, value) => {
        render(<EditTaskForm task={makePastTask()} onClose={vi.fn()} />)
        setDueDate(value)
        await save()
        expect(await screen.findByText("Due date can't be in the past")).toBeInTheDocument()
        expect(dueDateInput()).toHaveAttribute('aria-invalid', 'true')
        expect(updateTask).not.toHaveBeenCalled()
        expect(toastSuccess).not.toHaveBeenCalled()
      }
    )

    it('refuses a past change on a completed task as well (AC-5.4)', async () => {
      render(<EditTaskForm task={makePastTask({ status: 'completed' })} onClose={vi.fn()} />)
      setDueDate('2026-12-02T10:00')
      await save()
      expect(await screen.findByText("Due date can't be in the past")).toBeInTheDocument()
      expect(updateTask).not.toHaveBeenCalled()
    })

    it.each([['pending' as const], ['completed' as const]])(
      'changing it to a future time on a %s task sends it',
      async (status) => {
        render(<EditTaskForm task={makePastTask({ status })} onClose={vi.fn()} />)
        setDueDate(FUTURE_DUE_LOCAL)
        await save()
        expectSent({ id: 't1', dueDate: FUTURE_DUE_ISO })
        expect(screen.queryAllByRole('alert')).toHaveLength(0)
      }
    )

    it('lets the user fix a refused past change by typing the original back, then save another field', async () => {
      render(<EditTaskForm task={makePastTask()} onClose={vi.fn()} />)
      setDueDate('2026-12-02T10:00')
      await save()
      await screen.findByRole('alert')

      setDueDate(PAST_DUE_LOCAL)
      setTitle('New title')
      await save()
      expectSent({ id: 't1', title: 'New title' })
      await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(0))
    })
  })

  describe('success (AC-8.2a)', () => {
    it('shows a success toast, no error toast, and calls onClose once', async () => {
      const onClose = vi.fn()
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('New title')
      await save()

      await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('Task updated'))
      expect(toastSuccess).toHaveBeenCalledTimes(1)
      expect(toastError).not.toHaveBeenCalled()
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('server refusals (ADR-0006, AC-7.4, AC-8.1a, AC-8.1b)', () => {
    it('shows a refusal that names dueDate beside the due date, with no toast and the form open', async () => {
      const onClose = vi.fn()
      updateTask.mockResolvedValue({
        success: false,
        error: TASK_MESSAGES.dueDatePast,
        field: 'dueDate',
      })
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setDueDate(FUTURE_DUE_LOCAL)
      await save()

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(TASK_MESSAGES.dueDatePast)
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'true')
      expect(dueDateInput()).toHaveAttribute('aria-describedby', alert.id)
      expect(toastError).not.toHaveBeenCalled()
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
      expect(dueDateInput().value).toBe(FUTURE_DUE_LOCAL)
    })

    it.each([
      ['title', TASK_MESSAGES.titleTooLong, titleInput, () => setTitle('New title')],
      [
        'description',
        TASK_MESSAGES.descriptionTooLong,
        descriptionInput,
        () => setDescription('New details'),
      ],
    ] as const)(
      'shows a refusal that names %s beside it',
      async (field, error, getInput, change) => {
        updateTask.mockResolvedValue({ success: false, error, field })
        render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
        change()
        await save()
        const alert = await screen.findByRole('alert')
        expect(alert).toHaveTextContent(error)
        expect(getInput()).toHaveAttribute('aria-describedby', alert.id)
        expect(toastError).not.toHaveBeenCalled()
        expect(toastSuccess).not.toHaveBeenCalled()
      }
    )

    it('shows a refusal with no field as a toast with the action’s own text, and no field error', async () => {
      const onClose = vi.fn()
      updateTask.mockResolvedValue({ success: false, error: 'An edit must change something' })
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('New title')
      await save()

      await waitFor(() => expect(toastError).toHaveBeenCalledWith('An edit must change something'))
      expect(toastError).toHaveBeenCalledTimes(1)
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('shows "This task no longer exists." as a toast and keeps the form open with the user’s values (AC-7.4)', async () => {
      const onClose = vi.fn()
      updateTask.mockResolvedValue({ success: false, error: TASK_MESSAGES.taskGone })
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('New title')
      setDescription('New details')
      await save()

      await waitFor(() => expect(toastError).toHaveBeenCalledWith('This task no longer exists.'))
      expect(toastError).toHaveBeenCalledTimes(1)
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
      expect(titleInput().value).toBe('New title')
      expect(descriptionInput().value).toBe('New details')
      expect(saveButton()).toBeEnabled()
      expect(cancelButton()).toBeEnabled()
    })

    it('shows the fixed wording when a failure has no text', async () => {
      updateTask.mockResolvedValue({ success: false })
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      await save()
      await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.saveFailed))
      expect(toastSuccess).not.toHaveBeenCalled()
    })

    it('shows the fixed wording beside the field when a refusal names a field but has no text, with no toast', async () => {
      updateTask.mockResolvedValue({ success: false, field: 'title' })
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      await save()
      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(TASK_MESSAGES.saveFailed)
      expect(titleInput()).toHaveAttribute('aria-describedby', alert.id)
      expect(toastError).not.toHaveBeenCalled()
      expect(toastSuccess).not.toHaveBeenCalled()
    })

    it('shows the fixed wording, logs the raw error and shows no raw message when the call throws', async () => {
      const onClose = vi.fn()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      const raw = new Error('PERMISSION_DENIED at projects/secret/databases/(default)')
      updateTask.mockRejectedValue(raw)
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('New title')
      await save()

      await waitFor(() => expect(toastError).toHaveBeenCalledWith(TASK_MESSAGES.saveFailed))
      expect(toastError).toHaveBeenCalledTimes(1)
      expect(consoleError).toHaveBeenCalledWith(expect.anything(), raw)
      expect(toastError.mock.calls.flat().join(' ')).not.toContain('PERMISSION_DENIED')
      expect(document.body.textContent).not.toContain('PERMISSION_DENIED')
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
      expect(saveButton()).toBeEnabled()
    })

    it.each([
      ['a field refusal', { success: false, error: TASK_MESSAGES.titleTooLong, field: 'title' }],
      ['a refusal with no field', { success: false, error: 'Something broke.' }],
      ['a refusal with no text', { success: false }],
      ['a thrown call', new Error('boom')],
    ] as const)('keeps every value the user typed after %s', async (_name, outcome) => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
      if (outcome instanceof Error) updateTask.mockRejectedValue(outcome)
      else updateTask.mockResolvedValue(outcome)
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      setDescription('New details')
      setDueDate(FUTURE_DUE_LOCAL)
      await save()
      await waitFor(() => expect(saveButton()).toBeEnabled())

      expect(titleInput().value).toBe('New title')
      expect(descriptionInput().value).toBe('New details')
      expect(dueDateInput().value).toBe(FUTURE_DUE_LOCAL)
      expect(toastSuccess).not.toHaveBeenCalled()
    })

    it('lets the user fix the due date after a server refusal and save again', async () => {
      const onClose = vi.fn()
      updateTask.mockResolvedValueOnce({
        success: false,
        error: TASK_MESSAGES.dueDatePast,
        field: 'dueDate',
      })
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setDueDate(FUTURE_DUE_LOCAL)
      await save()
      expect(await screen.findByRole('alert')).toHaveTextContent(TASK_MESSAGES.dueDatePast)

      setDueDate('2027-03-07T17:00')
      await save()

      await waitFor(() => expect(updateTask).toHaveBeenCalledTimes(2))
      expect(updateTask.mock.calls[1]![0]).toEqual({
        id: 't1',
        dueDate: '2027-03-07T09:00:00.000Z',
      })
      await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('the null branch after localInputToIso', () => {
    // Reachable only with a stub: the schema calls localInputToIso on the same value just
    // before onSubmit, and the function is pure. The stub answers the schema's calls with the
    // real result and the form's own call (the last one) with null.
    it('shows the invalid-date text beside the due date, calls no action, and re-enables Save', async () => {
      let calls = 0
      dueDateHooks.override = (value, real) => {
        calls += 1
        // The first call is the schema's check of the changed value, the second is the form's.
        return calls === 1 ? real(value) : null
      }
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setDueDate(FUTURE_DUE_LOCAL)
      await save()

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent(TASK_MESSAGES.dueDateInvalid)
      expect(dueDateInput()).toHaveAttribute('aria-describedby', alert.id)
      expect(dueDateInput()).toHaveAttribute('aria-invalid', 'true')
      expect(updateTask).not.toHaveBeenCalled()
      expect(toastError).not.toHaveBeenCalled()
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(saveButton()).toBeEnabled()
    })
  })

  describe('Cancel and Escape (A20)', () => {
    it('Cancel calls onClose and no action, with no confirmation and no toast', async () => {
      const onClose = vi.fn()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('Changed')
      fireEvent.click(cancelButton())

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(updateTask).not.toHaveBeenCalled()
      expect(confirmSpy).not.toHaveBeenCalled()
      expect(toastSuccess).not.toHaveBeenCalled()
      expect(toastError).not.toHaveBeenCalled()
    })

    it('Cancel works with nothing changed', () => {
      const onClose = vi.fn()
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      fireEvent.click(cancelButton())
      expect(onClose).toHaveBeenCalledTimes(1)
      expect(updateTask).not.toHaveBeenCalled()
    })

    it.each([
      ['the title', () => titleInput()],
      ['the description', () => descriptionInput()],
      ['the due date', () => dueDateInput()],
      ['the Cancel button', () => cancelButton()],
    ])('Escape in %s does the same as Cancel', (_name, target) => {
      const onClose = vi.fn()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('Changed')
      fireEvent.keyDown(target(), { key: 'Escape' })

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(updateTask).not.toHaveBeenCalled()
      expect(confirmSpy).not.toHaveBeenCalled()
    })

    it('does not close on other keys', () => {
      const onClose = vi.fn()
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      fireEvent.keyDown(titleInput(), { key: 'a' })
      fireEvent.keyDown(titleInput(), { key: 'Enter' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('does nothing on Escape while a save is running, and Cancel is disabled', async () => {
      const onClose = vi.fn()
      const call = deferred()
      updateTask.mockReturnValue(call.promise)
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('New title')
      await save()

      expect(cancelButton()).toBeDisabled()
      fireEvent.keyDown(titleInput(), { key: 'Escape' })
      fireEvent.click(cancelButton())
      expect(onClose).not.toHaveBeenCalled()

      await act(async () => {
        call.resolve({ success: true })
      })
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    })

    it('does not let Escape reach a parent handler', () => {
      const parentKeyDown = vi.fn()
      render(
        <div onKeyDown={parentKeyDown}>
          <EditTaskForm task={makeTask()} onClose={vi.fn()} />
        </div>
      )
      fireEvent.keyDown(titleInput(), { key: 'Escape' })
      expect(parentKeyDown).not.toHaveBeenCalled()
    })
  })

  describe('focus', () => {
    // react-hook-form's setFocus moves focus in a timer, so focus lands just after mount.
    it('puts focus on the Title field when the form opens', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      await waitFor(() => expect(titleInput()).toHaveFocus())
    })
  })

  describe('one call at a time', () => {
    it('starts one call when two submits land inside one act()', async () => {
      const call = deferred()
      updateTask.mockReturnValue(call.promise)
      const { container } = render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      const form = container.querySelector('form')!

      await act(async () => {
        fireEvent.submit(form)
        fireEvent.submit(form)
      })
      expect(updateTask).toHaveBeenCalledTimes(1)

      await act(async () => {
        call.resolve({ success: true })
      })
      await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(1))
      expect(updateTask).toHaveBeenCalledTimes(1)
    })

    it('starts one call when Save is clicked twice while saving', async () => {
      const call = deferred()
      updateTask.mockReturnValue(call.promise)
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      await save()
      await save()
      expect(updateTask).toHaveBeenCalledTimes(1)
      await act(async () => {
        call.resolve({ success: true })
      })
    })

    it('disables Save and Cancel and sets aria-busy on the group while saving, then clears them on failure', async () => {
      const call = deferred()
      updateTask.mockReturnValue(call.promise)
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('New title')
      expect(saveButton()).toBeEnabled()
      await save()

      expect(saveButton()).toBeDisabled()
      expect(cancelButton()).toBeDisabled()
      expect(editGroup()).toHaveAttribute('aria-busy', 'true')

      await act(async () => {
        call.resolve({ success: false, error: 'Something broke.' })
      })
      await waitFor(() => expect(saveButton()).toBeEnabled())
      expect(cancelButton()).toBeEnabled()
      expect(editGroup()).not.toHaveAttribute('aria-busy')
    })

    it('can save again after a failure', async () => {
      updateTask.mockResolvedValueOnce({ success: false, error: 'Something broke.' })
      const onClose = vi.fn()
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('New title')
      await save()
      await waitFor(() => expect(saveButton()).toBeEnabled())
      await save()
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
      expect(updateTask).toHaveBeenCalledTimes(2)
    })
  })

  describe('a live update while the form is open (ADR-0005)', () => {
    it('keeps what the user typed and judges changes against what the form loaded', async () => {
      const { rerender } = render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('My edit')

      rerender(
        <EditTaskForm
          task={makeTask({
            title: 'Changed elsewhere',
            description: 'Also changed elsewhere',
            status: 'completed',
          })}
          onClose={vi.fn()}
        />
      )
      expect(titleInput().value).toBe('My edit')
      expect(descriptionInput().value).toBe('Some details')

      await save()
      expectSent({ id: 't1', title: 'My edit' })
    })

    it('e. a live change to the due date leaves the due date field and the payload alone', async () => {
      const { rerender } = render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      setTitle('My edit')

      rerender(
        <EditTaskForm
          task={makeTask({ dueDate: Timestamp.fromDate(new Date('2027-06-01T09:00:00.000Z')) })}
          onClose={vi.fn()}
        />
      )
      expect(dueDateInput().value).toBe(LOADED_DUE_LOCAL)

      await save()
      expectSent({ id: 't1', title: 'My edit' })
    })

    it('e. the unchanged-due-date check keeps using the loaded due date, even when the prop moves to a different past date', async () => {
      const { rerender } = render(<EditTaskForm task={makePastTask()} onClose={vi.fn()} />)
      setTitle('My edit')

      rerender(
        <EditTaskForm
          task={makePastTask({ dueDate: Timestamp.fromDate(new Date('2026-11-01T02:00:00.000Z')) })}
          onClose={vi.fn()}
        />
      )
      expect(dueDateInput().value).toBe(PAST_DUE_LOCAL)

      await save()
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
      expectSent({ id: 't1', title: 'My edit' })
    })
  })

  describe('clock edges for a CHANGED due date (A26, A6, AC-2.6a, AC-2.6b)', () => {
    // Perth is UTC+8, so the clock 10:30:45Z is 18:30:45 in Perth. The task's stored due date
    // (17:00 on 5 March 2027) is a different value from every one typed here.
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
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      expect(dueDateInput().value).not.toBe(dueDate)

      setDueDate(dueDate)
      await save()
      if (accepted) {
        // The expected moment is worked out by hand from Perth being UTC+8.
        expectSent({ id: 't1', dueDate: new Date(`${dueDate}:00+08:00`).toISOString() })
        expect(screen.queryAllByRole('alert')).toHaveLength(0)
      } else {
        expect(await screen.findByRole('alert')).toHaveTextContent(/Due date can't be/)
        expect(updateTask).not.toHaveBeenCalled()
      }
    })
  })

  describe('a due date inside the repeated hour when daylight saving ends (ADR-0003)', () => {
    // 2027-04-03T16:30:00Z is the SECOND 02:30 on 4 April in Sydney: clocks go from 03:00 AEDT
    // (UTC+11) back to 02:00 AEST (UTC+10), so 02:30 happens twice, at 15:30Z and at 16:30Z.
    // The due date input can only show "2027-04-04T02:30" for this task, and that text does not
    // say which of the two moments it is. localInputToIso reads it with the browser's rules, which
    // pick the FIRST 02:30 (15:30Z). So sending the due date back, untouched, would move the task
    // one hour earlier. The form avoids it because it sends only the fields the user changed (AC-5.2).
    const REPEATED = () =>
      makeTask({ dueDate: Timestamp.fromDate(new Date('2027-04-03T16:30:00.000Z')) })

    beforeEach(() => {
      process.env.TZ = 'Australia/Sydney'
    })

    it('shows the ambiguous local time, which would read back one hour earlier', () => {
      render(<EditTaskForm task={REPEATED()} onClose={vi.fn()} />)
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Australia/Sydney')
      expect(dueDateInput().value).toBe('2027-04-04T02:30')
      expect(new Date(2027, 3, 4, 2, 30).toISOString()).toBe('2027-04-03T15:30:00.000Z')
    })

    it('editing only the title sends { id, title } and no due date', async () => {
      render(<EditTaskForm task={REPEATED()} onClose={vi.fn()} />)
      setTitle('New title')
      await save()
      expectSent({ id: 't1', title: 'New title' })
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })

    it('editing only the description sends { id, description } and no due date', async () => {
      render(<EditTaskForm task={REPEATED()} onClose={vi.fn()} />)
      setDescription('New details')
      await save()
      expectSent({ id: 't1', description: 'New details' })
      expect(screen.queryAllByRole('alert')).toHaveLength(0)
    })
  })

  describe('behaviour records (they document what happens, they do not endorse it)', () => {
    // f. Records current behaviour, does not endorse it. A trailing space makes the title
    // dirty, so Save enables and the trimmed title is sent. That equals the stored title, so the
    // server writes the same text again (and a new updatedAt).
    it('f. a trailing space on the title enables Save and sends the trimmed title, equal to the stored one', async () => {
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      expect(saveButton()).toBeDisabled()
      setTitle('Write the report ')
      expect(saveButton()).toBeEnabled()

      await save()
      expectSent({ id: 't1', title: 'Write the report' })
      expect(updateTask.mock.calls[0]![0].title).toBe(makeTask().title)
    })

    // h. Records current behaviour, does not endorse it. The inputs are not disabled while a
    // save runs, so the user can keep typing. What is typed meanwhile is not sent, and when the
    // save succeeds the form closes and it is dropped (the TaskItem test of the same name shows
    // the close). Here onClose is a mock, so the form stays mounted.
    it('h. keeps the inputs editable while a save is in flight, and does not send what is typed meanwhile', async () => {
      const onClose = vi.fn()
      const call = deferred()
      updateTask.mockReturnValue(call.promise)
      render(<EditTaskForm task={makeTask()} onClose={onClose} />)
      setTitle('Sent title')
      await save()

      expect(editGroup()).toHaveAttribute('aria-busy', 'true')
      for (const input of [titleInput(), descriptionInput(), dueDateInput()]) {
        expect(input).not.toBeDisabled()
        expect(input).not.toHaveAttribute('readonly')
      }
      setTitle('Typed during the save')
      expect(titleInput().value).toBe('Typed during the save')

      await act(async () => {
        call.resolve({ success: true })
      })
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
      expectSent({ id: 't1', title: 'Sent title' })
    })
  })

  describe('keyboard (AC-8.4a)', () => {
    it('g. tabs through Title, Description, Due date, Save, then Cancel once a change is made', async () => {
      const user = userEvent.setup()
      render(<EditTaskForm task={makeTask()} onClose={vi.fn()} />)
      await waitFor(() => expect(titleInput()).toHaveFocus())
      setTitle('Changed')
      expect(saveButton()).toBeEnabled()

      await user.tab()
      expect(descriptionInput()).toHaveFocus()
      await user.tab()
      expect(dueDateInput()).toHaveFocus()
      await user.tab()
      expect(saveButton()).toHaveFocus()
      await user.tab()
      expect(cancelButton()).toHaveFocus()
    })
  })
})
