import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Timestamp } from 'firebase/firestore'
import { TaskItem } from '@/features/tasks/components/TaskItem'
import { formatDatetime } from '@/lib/utils'
import type { TaskWithId } from '@/features/tasks/types'

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

  it('has a display-only checkbox: disabled for both statuses (WP8 makes it work)', () => {
    const { unmount } = renderItem(makeTask({ status: 'completed' }))
    expect(screen.getByRole('checkbox')).toBeDisabled()
    unmount()
    renderItem(makeTask({ status: 'pending' }))
    expect(screen.getByRole('checkbox')).toBeDisabled()
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
