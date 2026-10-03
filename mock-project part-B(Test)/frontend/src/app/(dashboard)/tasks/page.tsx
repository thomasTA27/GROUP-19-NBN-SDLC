import { Suspense } from 'react'
import type { Metadata } from 'next'
import { requireAuth } from '@/actions/auth.actions'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { TaskList } from '@/features/tasks/components/TaskList'

export const metadata: Metadata = { title: 'Tasks' }

// No date work and no data reading here (.claude/rules/tasks.md rule 4): TaskList reads the
// tasks and formats their dates in the browser. TaskList calls useSearchParams, so it sits in
// a Suspense boundary (Next docs: required for a prerendered page).
export default async function TasksPage() {
  await requireAuth()
  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" />
      <Suspense fallback={<LoadingSpinner />}>
        <TaskList />
      </Suspense>
    </div>
  )
}
