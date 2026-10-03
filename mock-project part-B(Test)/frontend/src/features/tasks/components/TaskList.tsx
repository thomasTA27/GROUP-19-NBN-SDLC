'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { paginationSchema } from '@/lib/validations/common'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { TaskItem } from '@/features/tasks/components/TaskItem'

const PAGE_LINK_CLASS =
  'inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'

// useTasks reads 20 x page + 1 documents. The spec's capacity is 1,000 tasks (A33), which is 50
// pages, but MAX_PAGE is 1000 pages, not 50: it only keeps a huge ?page= from reaching the hook
// as a huge limit. A page above MAX_PAGE is page 1.
const MAX_PAGE = 1000

// The URL is the page (?page=N). Anything that isn't a positive whole number is page 1.
function parsePage(value: string | null): number {
  const parsed = paginationSchema.shape.page.safeParse(value ?? undefined)
  if (!parsed.success) return 1
  if (parsed.data > MAX_PAGE) return 1
  return parsed.data
}

function pageHref(page: number): string {
  return `/tasks?page=${page}`
}

function TaskPage({ uid, page }: { uid: string; page: number }) {
  const { tasks, hasNext, loading, error } = useTasks(uid, page)

  if (loading) return <LoadingSpinner />

  // An error shows neither the list nor the empty state (AC-4.10b), and only the hook's
  // fixed text, never a library message (rule 5).
  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    )
  }

  if (tasks.length === 0) {
    if (page === 1) return <EmptyState title="No tasks yet" />
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-500">No tasks on this page</p>
        <Link href={pageHref(page - 1)} className={PAGE_LINK_CLASS}>
          Previous
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
      <nav aria-label="Task pages" className="flex items-center gap-3">
        {page > 1 && (
          <Link href={pageHref(page - 1)} className={PAGE_LINK_CLASS}>
            Previous
          </Link>
        )}
        <span className="text-sm text-zinc-500">Page {page}</span>
        {/* Never link past MAX_PAGE: parsePage would turn that page back into page 1. */}
        {hasNext && page < MAX_PAGE && (
          <Link href={pageHref(page + 1)} className={PAGE_LINK_CLASS}>
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

/**
 * The signed-in user's tasks, one page at a time. The outer component gates on auth so
 * useTasks is never called without a known uid.
 */
export function TaskList() {
  const { user, loading } = useAuth()
  const page = parsePage(useSearchParams().get('page'))

  if (loading) return <LoadingSpinner />
  if (!user) return null

  return <TaskPage uid={user.uid} page={page} />
}
