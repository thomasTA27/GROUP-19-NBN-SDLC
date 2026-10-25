'use client'

import { useEffect } from 'react'
import { limit, orderBy, where } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirestore'
import { getTasksCollection } from '@/lib/firebase/firestore'
import { TASK_MESSAGES } from '@/features/tasks/schemas'
import type { TaskWithId } from '@/features/tasks/types'

export const TASKS_PAGE_SIZE = 20

interface UseTasksResult {
  tasks: TaskWithId[]
  hasNext: boolean
  loading: boolean
  error: string | null
}

/**
 * The signed-in user's non-deleted tasks, one page at a time, live (ADR-0002, ADR-0004).
 *
 * `uid` must already be known. This hook does not read useAuth or check for a user, because
 * useCollection() can't be called conditionally: the caller renders the part that calls
 * useTasks only once a user exists.
 *
 * One query reads the first 20 x page + 1 tasks. The page is the slice of that result, and
 * the extra task only tells us another page exists (an ADR-0004 deviation of one read).
 * A page that is not a positive integer is page 1.
 *
 * `error` is the fixed load-failure text, never the library's message (rule 5, ADR-0006).
 */
export function useTasks(uid: string, page: number): UseTasksResult {
  const pageNumber = Number.isInteger(page) && page >= 1 ? page : 1

  const { data, loading, error } = useCollection(
    getTasksCollection(),
    where('uid', '==', uid),
    where('deletedAt', '==', null),
    orderBy('status', 'desc'),
    orderBy('dueDate', 'asc'),
    orderBy('createdAt', 'asc'),
    limit(TASKS_PAGE_SIZE * pageNumber + 1)
  )

  useEffect(() => {
    if (error) console.error('Failed to load tasks', error)
  }, [error])

  // While loading, useCollection still holds the previous query's documents (after a page
  // change, until the new snapshot arrives). Slicing them for the new page would show
  // leftover tasks, so return nothing until loading is false.
  // useCollection returns { id, ...doc.data() }, which its Task type doesn't show.
  const read = loading ? [] : (data as TaskWithId[])
  const start = TASKS_PAGE_SIZE * (pageNumber - 1)
  const end = TASKS_PAGE_SIZE * pageNumber

  return {
    tasks: read.slice(start, end),
    hasNext: read.length > end,
    loading,
    error: error ? TASK_MESSAGES.loadFailed : null,
  }
}
