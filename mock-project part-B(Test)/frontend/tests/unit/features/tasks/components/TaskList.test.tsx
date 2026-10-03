import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Timestamp } from 'firebase/firestore'
import { TASK_MESSAGES } from '@/features/tasks/schemas'
import type { TaskWithId } from '@/features/tasks/types'

const { useAuth, useTasks, useSearchParams } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTasks: vi.fn(),
  useSearchParams: vi.fn(),
}))
vi.mock('@/hooks/useAuth', () => ({ useAuth }))
vi.mock('@/features/tasks/hooks/useTasks', () => ({ useTasks }))
vi.mock('next/navigation', () => ({ useSearchParams }))
// TaskItem imports the Server Actions and sonner. TaskList never calls them.
vi.mock('@/features/tasks/actions/tasks.actions', () => ({
  setTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { TaskList } from '@/features/tasks/components/TaskList'

function makeTask(id: string): TaskWithId {
  return {
    id,
    uid: 'user-1',
    title: `Task ${id}`,
    description: '',
    dueDate: Timestamp.fromDate(new Date('2027-03-05T10:30:00.000Z')),
    status: 'pending',
    createdAt: Timestamp.fromDate(new Date('2027-01-01T00:00:00.000Z')),
    updatedAt: Timestamp.fromDate(new Date('2027-01-01T00:00:00.000Z')),
    deletedAt: null,
    _schemaVersion: 1,
  }
}

function setPage(value: string | null) {
  useSearchParams.mockReturnValue({ get: (name: string) => (name === 'page' ? value : null) })
}

function setTasks(result: Partial<ReturnType<typeof useTasks>>) {
  useTasks.mockReturnValue({ tasks: [], hasNext: false, loading: false, error: null, ...result })
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuth.mockReturnValue({ user: { uid: 'user-1' }, loading: false })
  setPage(null)
  setTasks({})
})

describe('TaskList: auth gate', () => {
  it('shows a spinner while auth is loading and does not call useTasks', () => {
    useAuth.mockReturnValue({ user: null, loading: true })
    render(<TaskList />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(useTasks).not.toHaveBeenCalled()
  })

  it('renders nothing and does not call useTasks when there is no user', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    const { container } = render(<TaskList />)
    expect(container).toBeEmptyDOMElement()
    expect(useTasks).not.toHaveBeenCalled()
  })

  it('shows a spinner while tasks are loading (AC-4.10a)', () => {
    setTasks({ loading: true })
    render(<TaskList />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByText('No tasks yet')).toBeNull()
  })
})

describe('TaskList: error', () => {
  it('shows the fixed text and neither the empty state nor any task (AC-4.10b)', () => {
    setTasks({ error: TASK_MESSAGES.loadFailed, tasks: [makeTask('a')] })
    render(<TaskList />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(TASK_MESSAGES.loadFailed)
    expect(alert).toHaveClass('text-red-600')
    expect(screen.queryByText('No tasks yet')).toBeNull()
    expect(screen.queryByRole('listitem')).toBeNull()
  })

  it('never shows the raw error text', () => {
    // The hook only ever returns the fixed text; the component renders exactly what it gets
    // and reads nothing else, so a raw message elsewhere cannot appear.
    setTasks({ error: TASK_MESSAGES.loadFailed })
    const { container } = render(<TaskList />)
    expect(container.textContent).toBe(TASK_MESSAGES.loadFailed)
    expect(container.textContent).not.toMatch(/permission|firebase|index/i)
  })
})

describe('TaskList: empty', () => {
  it('shows "No tasks yet" on page 1 (AC-4.9)', () => {
    render(<TaskList />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).toBeNull()
  })

  it('shows "No tasks on this page" and a Previous link on page 3', () => {
    setPage('3')
    render(<TaskList />)
    expect(screen.getByText('No tasks on this page')).toBeInTheDocument()
    expect(screen.queryByText('No tasks yet')).toBeNull()
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '/tasks?page=2')
  })
})

describe('TaskList: tasks and paging', () => {
  it('shows the tasks in the order given, one item each', () => {
    setTasks({ tasks: [makeTask('c'), makeTask('a'), makeTask('b')] })
    render(<TaskList />)
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual(['Task c', 'Task a', 'Task b'])
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('page 1 with no next page: no Previous, no Next, shows "Page 1"', () => {
    setTasks({ tasks: [makeTask('a')], hasNext: false })
    render(<TaskList />)
    expect(screen.queryByRole('link', { name: 'Previous' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Next' })).toBeNull()
    expect(screen.getByText('Page 1')).toBeInTheDocument()
  })

  it('shows Next only when hasNext is true, linking to ?page=N+1', () => {
    setPage('2')
    setTasks({ tasks: [makeTask('a')], hasNext: true })
    render(<TaskList />)
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/tasks?page=3')
  })

  it('shows Previous only above page 1, linking to ?page=N-1', () => {
    setPage('2')
    setTasks({ tasks: [makeTask('a')], hasNext: false })
    render(<TaskList />)
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '/tasks?page=1')
    expect(screen.queryByRole('link', { name: 'Next' })).toBeNull()
    expect(screen.getByText('Page 2')).toBeInTheDocument()
  })

  it('passes the user ID and the page to useTasks', () => {
    setPage('4')
    render(<TaskList />)
    expect(useTasks).toHaveBeenCalledWith('user-1', 4)
  })
})

describe('TaskList: ?page= parsing', () => {
  it.each([['abc'], ['0'], ['-1'], ['1.5'], [''], [null]])('treats ?page=%s as page 1', (value) => {
    setPage(value)
    render(<TaskList />)
    expect(useTasks).toHaveBeenCalledWith('user-1', 1)
  })
})

describe('TaskList: states that must not mix', () => {
  it('loading with tasks still in the array shows only the spinner (AC-4.10a)', () => {
    setTasks({ loading: true, tasks: [makeTask('a')], hasNext: true })
    render(<TaskList />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByText(/^Page \d+$/)).toBeNull()
  })

  it('an error on page 3 shows only the fixed text (AC-4.10b)', () => {
    setPage('3')
    setTasks({ error: TASK_MESSAGES.loadFailed, tasks: [makeTask('a')], hasNext: true })
    const { container } = render(<TaskList />)
    expect(container.textContent).toBe(TASK_MESSAGES.loadFailed)
    expect(screen.queryByText('No tasks on this page')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByRole('listitem')).toBeNull()
    expect(screen.queryByText(/^Page \d+$/)).toBeNull()
  })

  it('page 1 with no tasks has no pager at all', () => {
    setTasks({ tasks: [], hasNext: false })
    render(<TaskList />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Previous' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Next' })).toBeNull()
    expect(screen.queryByText(/^Page \d+$/)).toBeNull()
  })

  it('?page=abc with tasks and hasNext says "Page 1" and links Next to ?page=2', () => {
    setPage('abc')
    setTasks({ tasks: [makeTask('a')], hasNext: true })
    render(<TaskList />)
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/tasks?page=2')
    expect(screen.queryByRole('link', { name: 'Previous' })).toBeNull()
  })
})

// What reaches useTasks after paginationSchema.shape.page and the MAX_PAGE cap (1000).
describe('TaskList: unusual ?page= values', () => {
  it.each([
    ['02', 2],
    [' 2', 2],
    ['+2', 2],
    ['1e2', 100],
    ['2abc', 1],
    ['1000', 1000],
    ['1001', 1],
    ['1e3', 1000],
    ['1e22', 1],
    ['2147483648', 1],
    ['9007199254740993', 1],
    ['9999999999999999999999', 1],
  ])('?page=%j reaches useTasks as page %s', (value, expected) => {
    setPage(value)
    render(<TaskList />)
    expect(useTasks).toHaveBeenCalledWith('user-1', expected)
  })

  it('page 1000 with hasNext shows Previous to ?page=999 and no Next', () => {
    setPage('1000')
    setTasks({ tasks: [makeTask('a')], hasNext: true })
    render(<TaskList />)
    expect(screen.getByText('Page 1000')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Next' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/tasks?page=999'
    )
  })

  it('page 999 with hasNext still shows Next to ?page=1000', () => {
    setPage('999')
    setTasks({ tasks: [makeTask('a')], hasNext: true })
    render(<TaskList />)
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/tasks?page=1000')
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute(
      'href',
      '/tasks?page=998'
    )
  })

  it('a capped value is page 1: "Page 1", Next to ?page=2, no Previous', () => {
    setPage('1001')
    setTasks({ tasks: [makeTask('a')], hasNext: true })
    render(<TaskList />)
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/tasks?page=2')
    expect(screen.queryByRole('link', { name: 'Previous' })).toBeNull()
  })
})
