import type { Metadata } from 'next'
import { getServerSession } from '@/actions/auth.actions'

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const session = await getServerSession()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account details.</p>
      </div>

      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Email</p>
          <p className="mt-1 text-sm">{session?.email ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
