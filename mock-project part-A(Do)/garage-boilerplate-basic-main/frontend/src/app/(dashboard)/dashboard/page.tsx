import type { Metadata } from 'next'
import { TaskList } from '@/features/tasks/components/TaskList'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <section
        aria-labelledby="tasks-heading"
        className="rounded-lg border border-zinc-200 bg-white shadow-sm"
      >
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 id="tasks-heading" className="text-base font-semibold">
            Tasks
          </h2>
        </div>
        <TaskList />
      </section>
    </div>
  )
}
