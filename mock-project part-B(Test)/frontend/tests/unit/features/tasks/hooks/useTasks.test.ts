// useCollection is mocked so the test can feed it results and capture the arguments the hook
// passes. The query itself is checked with the real firebase/firestore: the expected query is
// built with the real query(), where(), orderBy() and limit(), and compared with the real
// queryEqual, so no private field of a constraint is read. No network is used: getFirestore is
// lazy and no listener is attached.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { initializeApp } from 'firebase/app'
import {
  collection,
  getFirestore,
  limit,
  orderBy,
  query,
  queryEqual,
  where,
  type CollectionReference,
  type QueryConstraint,
} from 'firebase/firestore'
import { TASK_MESSAGES } from '@/features/tasks/schemas'

const { useCollection } = vi.hoisted(() => ({ useCollection: vi.fn() }))
vi.mock('@/hooks/useFirestore', () => ({ useCollection }))

const db = getFirestore(initializeApp({ projectId: 'fake-project-for-usetasks' }, 'usetasks-test'))
vi.mock('@/lib/firebase/firestore', () => ({
  getTasksCollection: () => collection(db, 'tasks'),
}))

import { useTasks } from '@/features/tasks/hooks/useTasks'

type Result = { data: unknown[]; loading: boolean; error: Error | null }

function mockResult(result: Partial<Result>) {
  useCollection.mockReturnValue({ data: [], loading: false, error: null, ...result })
}

const docs = (count: number) => Array.from({ length: count }, (_, i) => ({ id: `t${i}` }))
const ids = (tasks: { id: string }[]) => tasks.map((task) => task.id)
const range = (from: number, to: number) =>
  Array.from({ length: to - from }, (_, i) => `t${from + i}`)

// The query useCollection would build from the arguments the hook passed on its last call.
function hookQuery() {
  const [ref, ...constraints] = useCollection.mock.lastCall as [
    CollectionReference,
    ...QueryConstraint[],
  ]
  return query(ref, ...constraints)
}

function expectedQuery({
  uid = 'u1',
  max = 21,
  withDeletedAt = true,
  status = 'desc' as 'asc' | 'desc',
} = {}) {
  return query(
    collection(db, 'tasks'),
    where('uid', '==', uid),
    ...(withDeletedAt ? [where('deletedAt', '==', null)] : []),
    orderBy('status', status),
    orderBy('dueDate', 'asc'),
    orderBy('createdAt', 'asc'),
    limit(max)
  )
}

beforeEach(() => {
  useCollection.mockReset()
  mockResult({})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useTasks results', () => {
  it('while loading, returns loading true, no tasks and hasNext false', () => {
    mockResult({ loading: true })
    const { result } = renderHook(() => useTasks('u1', 1))
    expect(result.current).toEqual({ tasks: [], hasNext: false, loading: true, error: null })
  })

  it('while loading, ignores any data it still holds: no tasks and hasNext false', () => {
    mockResult({ loading: true, data: docs(41) })
    const { result } = renderHook(() => useTasks('u1', 2))
    expect(result.current).toEqual({ tasks: [], hasNext: false, loading: true, error: null })
  })

  it('when loaded, returns the tasks and hasNext, with no error', () => {
    mockResult({ data: docs(21) })
    const { result } = renderHook(() => useTasks('u1', 1))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.tasks).toHaveLength(20)
    expect(result.current.hasNext).toBe(true)
  })

  it('on an error, returns the fixed text and never the raw error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const raw = new Error(
      'Missing index. Create it here: https://console.firebase.google.com/project/nbn-prod-123/firestore/indexes'
    )
    mockResult({ error: raw })
    const { result } = renderHook(() => useTasks('u1', 1))
    expect(result.current.error).toBe(TASK_MESSAGES.loadFailed)
    const returned = JSON.stringify(result.current)
    expect(returned).not.toContain('console.firebase.google.com')
    expect(returned).not.toContain('nbn-prod-123')
    expect(Object.values(result.current)).not.toContain(raw)
    // The raw error is only logged, not returned.
    expect(consoleError).toHaveBeenCalledWith(expect.any(String), raw)
  })
})

describe('useTasks query', () => {
  it('is exactly uid, deletedAt null, status desc, dueDate asc, createdAt asc, limit 20 x N + 1', () => {
    renderHook(() => useTasks('u1', 1))
    expect(queryEqual(hookQuery(), expectedQuery())).toBe(true)
  })

  it('calls useCollection once per render', () => {
    renderHook(() => useTasks('u1', 1))
    expect(useCollection).toHaveBeenCalledTimes(1)
  })

  it('is not equal to the neighbouring wrong queries', () => {
    renderHook(() => useTasks('u1', 1))
    const actual = hookQuery()
    expect(queryEqual(actual, expectedQuery({ uid: 'u2' }))).toBe(false)
    expect(queryEqual(actual, expectedQuery({ status: 'asc' }))).toBe(false)
    expect(queryEqual(actual, expectedQuery({ withDeletedAt: false }))).toBe(false)
    expect(queryEqual(actual, expectedQuery({ max: 20 }))).toBe(false)
  })

  it('uses the uid it is given', () => {
    renderHook(() => useTasks('someone-else', 1))
    expect(queryEqual(hookQuery(), expectedQuery({ uid: 'someone-else' }))).toBe(true)
  })

  it('uses a different limit for each page: 21, then 41', () => {
    renderHook(() => useTasks('u1', 1))
    const page1 = hookQuery()
    renderHook(() => useTasks('u1', 2))
    const page2 = hookQuery()
    expect(queryEqual(page1, expectedQuery({ max: 21 }))).toBe(true)
    expect(queryEqual(page2, expectedQuery({ max: 41 }))).toBe(true)
    expect(queryEqual(page1, page2)).toBe(false)
  })

  it('gives an equal query for the same page twice', () => {
    renderHook(() => useTasks('u1', 2))
    const first = hookQuery()
    renderHook(() => useTasks('u1', 2))
    expect(queryEqual(first, hookQuery())).toBe(true)
  })

  it.each([0, -1, 1.5, NaN])('treats page %s as page 1', (page) => {
    mockResult({ data: docs(25) })
    const { result } = renderHook(() => useTasks('u1', page))
    expect(queryEqual(hookQuery(), expectedQuery({ max: 21 }))).toBe(true)
    expect(ids(result.current.tasks)).toEqual(range(0, 20))
    expect(result.current.hasNext).toBe(true)
  })
})

describe('useTasks paging', () => {
  it('page 1 with 21 documents: 20 tasks and hasNext true', () => {
    mockResult({ data: docs(21) })
    const { result } = renderHook(() => useTasks('u1', 1))
    expect(ids(result.current.tasks)).toEqual(range(0, 20))
    expect(result.current.hasNext).toBe(true)
  })

  it('page 1 with 20 documents: 20 tasks and hasNext false', () => {
    mockResult({ data: docs(20) })
    const { result } = renderHook(() => useTasks('u1', 1))
    expect(result.current.tasks).toHaveLength(20)
    expect(result.current.hasNext).toBe(false)
  })

  it('page 2 with 41 documents: documents 20 to 39 and hasNext true', () => {
    mockResult({ data: docs(41) })
    const { result } = renderHook(() => useTasks('u1', 2))
    expect(ids(result.current.tasks)).toEqual(range(20, 40))
    expect(result.current.hasNext).toBe(true)
  })

  it('page 2 with 40 documents: documents 20 to 39 and hasNext false', () => {
    mockResult({ data: docs(40) })
    const { result } = renderHook(() => useTasks('u1', 2))
    expect(ids(result.current.tasks)).toEqual(range(20, 40))
    expect(result.current.hasNext).toBe(false)
  })

  it('page 3 with 45 documents: documents 40 to 44 and hasNext false', () => {
    mockResult({ data: docs(45) })
    const { result } = renderHook(() => useTasks('u1', 3))
    expect(ids(result.current.tasks)).toEqual(range(40, 45))
    expect(result.current.hasNext).toBe(false)
  })

  it('a page beyond the data: no tasks and hasNext false', () => {
    mockResult({ data: docs(5) })
    const { result } = renderHook(() => useTasks('u1', 4))
    expect(result.current.tasks).toEqual([])
    expect(result.current.hasNext).toBe(false)
  })
})

describe('useTasks page change on one hook instance', () => {
  it('does not slice the previous page documents while the new page loads', () => {
    mockResult({ data: docs(21) })
    const { result, rerender } = renderHook(({ page }) => useTasks('u1', page), {
      initialProps: { page: 1 },
    })
    expect(queryEqual(hookQuery(), expectedQuery({ max: 21 }))).toBe(true)

    // useCollection restarts: loading is true again but it still holds the 21 old documents.
    mockResult({ loading: true, data: docs(21) })
    rerender({ page: 2 })
    expect(queryEqual(hookQuery(), expectedQuery({ max: 41 }))).toBe(true)
    expect(result.current).toEqual({ tasks: [], hasNext: false, loading: true, error: null })

    mockResult({ loading: false, data: docs(41) })
    rerender({ page: 2 })
    expect(ids(result.current.tasks)).toEqual(range(20, 40))
    expect(result.current.hasNext).toBe(true)
    expect(result.current.loading).toBe(false)
  })
})
