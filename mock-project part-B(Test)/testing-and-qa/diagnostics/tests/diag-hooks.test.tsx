// DIAGNOSTIC ONLY (disposable copy). useTasks, useCollection and getTasksCollection.
import { appendFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { initializeApp } from 'firebase/app'
import { collection, getFirestore, query, queryEqual } from 'firebase/firestore'

const { useCollection } = vi.hoisted(() => ({ useCollection: vi.fn() }))
vi.mock('@/hooks/useFirestore', () => ({ useCollection }))
const db = getFirestore(initializeApp({ projectId: 'diag-project' }, 'diag'))
vi.mock('@/lib/firebase/firestore', () => ({ getTasksCollection: () => collection(db, 'tasks') }))
import { useTasks } from '@/features/tasks/hooks/useTasks'

const docs = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `t${i}` }))
beforeEach(() => {
  useCollection.mockReset()
  useCollection.mockReturnValue({ data: [], loading: false, error: null })
})
afterEach(() => vi.restoreAllMocks())

describe('intended behaviour (assertions)', () => {
  it('593 nothing is logged when there is no error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderHook(() => useTasks('u1', 1))
    expect(spy).not.toHaveBeenCalled()
  })
  it('596 a load error is logged with its label', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('boom')
    useCollection.mockReturnValue({ data: [], loading: false, error: err })
    renderHook(() => useTasks('u1', 1))
    expect(spy).toHaveBeenCalledWith('Failed to load tasks', err)
  })
  it('597 an error that arrives after the first render is also logged', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('later')
    const { rerender } = renderHook(() => useTasks('u1', 1))
    useCollection.mockReturnValue({ data: [], loading: false, error: err })
    rerender()
    expect(spy).toHaveBeenCalledWith('Failed to load tasks', err)
  })
})

describe('trace', () => {
  it('577 page 1, 0, -1, 1.5, NaN, 2 give the same slice, hasNext and limit', () => {
    const out: Record<string, unknown> = {}
    useCollection.mockReturnValue({ data: docs(45), loading: false, error: null })
    for (const page of [1, 0, -1, 1.5, Number.NaN, 2]) {
      const { result } = renderHook(() => useTasks('u1', page))
      const args = useCollection.mock.lastCall as unknown[]
      out[String(page)] = { ids: result.current.tasks.map((t) => (t as { id: string }).id).join(','), next: result.current.hasNext, constraints: args.length }
    }
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'pages', v: out }) + '\n')
  })
  it('960/962 query(ref) equals query(ref, ...[]) in the real SDK', () => {
    const ref = collection(db, 'tasks')
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'real-sdk-empty-constraints', v: queryEqual(query(ref), query(ref, ...[])) }) + '\n')
    expect(queryEqual(query(ref), query(ref, ...[]))).toBe(true)
  })
})
