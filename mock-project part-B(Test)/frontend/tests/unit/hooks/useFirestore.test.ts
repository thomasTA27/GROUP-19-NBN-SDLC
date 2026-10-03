import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CollectionReference, QueryConstraint } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirestore'

interface FakeQuery {
  path: string
  constraints: unknown[]
}

interface Subscription {
  q: FakeQuery
  onNext: (snapshot: { docs: { id: string; data: () => object }[] }) => void
  onError: (err: Error) => void
  unsubscribe: ReturnType<typeof vi.fn>
}

const subscriptions: Subscription[] = []

// The fake query keeps its path and constraints. queryEqual compares them by
// value, so two separate objects for the same query are equal and different
// queries are not.
vi.mock('firebase/firestore', () => ({
  query: (ref: { path: string }, ...constraints: unknown[]): FakeQuery => ({
    path: ref.path,
    constraints,
  }),
  queryEqual: (a: FakeQuery, b: FakeQuery) =>
    a.path === b.path && JSON.stringify(a.constraints) === JSON.stringify(b.constraints),
  onSnapshot: (
    q: FakeQuery,
    onNext: Subscription['onNext'],
    onError: Subscription['onError']
  ) => {
    const unsubscribe = vi.fn()
    subscriptions.push({ q, onNext, onError, unsubscribe })
    return unsubscribe
  },
}))

const makeRef = (path = 'tasks') => ({ path }) as unknown as CollectionReference<{ title: string }>
const where = (field: string, value: unknown) =>
  ({ type: 'where', field, value }) as unknown as QueryConstraint

const snapshotOf = (...titles: string[]) => ({
  docs: titles.map((title, i) => ({ id: `id${i}`, data: () => ({ title }) })),
})

const last = () => {
  const sub = subscriptions[subscriptions.length - 1]
  if (!sub) throw new Error('no subscription')
  return sub
}

describe('useCollection', () => {
  beforeEach(() => {
    subscriptions.length = 0
  })

  it('is loading first, then loaded with the documents', () => {
    const { result } = renderHook(() => useCollection(makeRef()))
    expect(result.current).toEqual({ data: [], loading: true, error: null })

    act(() => last().onNext(snapshotOf('a', 'b')))

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual([
      { id: 'id0', title: 'a' },
      { id: 'id1', title: 'b' },
    ])
  })

  it('reports an error and stops loading', () => {
    const { result } = renderHook(() => useCollection(makeRef()))
    const failure = new Error('boom')

    act(() => last().onError(failure))

    expect(result.current.error).toBe(failure)
    expect(result.current.loading).toBe(false)
  })

  it('clears the error after a later successful snapshot', () => {
    const { result } = renderHook(() => useCollection(makeRef()))
    act(() => last().onError(new Error('boom')))
    expect(result.current.error).not.toBeNull()

    act(() => last().onNext(snapshotOf('a')))

    expect(result.current.error).toBeNull()
    expect(result.current.data).toHaveLength(1)
  })

  it('clears a stale error when the query changes, until the new snapshot arrives', () => {
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useCollection(makeRef(), where('page', page)),
      { initialProps: { page: 1 } }
    )
    act(() => last().onError(new Error('boom')))
    expect(result.current.error).not.toBeNull()

    rerender({ page: 2 })

    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(true)

    act(() => last().onNext(snapshotOf('b')))
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('restarts when the constraints change, and loading goes back to true', () => {
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useCollection(makeRef(), where('page', page)),
      { initialProps: { page: 1 } }
    )
    act(() => last().onNext(snapshotOf('a')))
    expect(result.current.loading).toBe(false)
    const first = last()

    rerender({ page: 2 })

    expect(subscriptions).toHaveLength(2)
    expect(first.unsubscribe).toHaveBeenCalledTimes(1)
    expect(result.current.loading).toBe(true)

    act(() => last().onNext(snapshotOf('b')))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual([{ id: 'id0', title: 'b' }])
  })

  it('does not restart on a re-render with an equal query built from new objects', () => {
    const { result, rerender } = renderHook(() =>
      // A new reference and new constraint objects on every render, as NotesList does
      useCollection(makeRef(), where('uid', 'u1'))
    )
    act(() => last().onNext(snapshotOf('a')))
    const first = last()

    rerender()
    rerender()

    expect(subscriptions).toHaveLength(1)
    expect(first.unsubscribe).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toHaveLength(1)
  })

  it('restarts when the collection changes', () => {
    const { rerender } = renderHook(({ path }: { path: string }) => useCollection(makeRef(path)), {
      initialProps: { path: 'tasks' },
    })

    rerender({ path: 'notes' })

    expect(subscriptions).toHaveLength(2)
    expect(last().q.path).toBe('notes')
  })

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useCollection(makeRef()))
    const sub = last()

    unmount()

    expect(sub.unsubscribe).toHaveBeenCalledTimes(1)
  })
})
