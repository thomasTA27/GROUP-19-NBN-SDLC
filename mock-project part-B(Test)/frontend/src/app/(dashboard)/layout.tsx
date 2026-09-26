import { redirect } from 'next/navigation'
import { getServerSession } from '@/actions/auth.actions'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/auth/signin')

  return <DashboardShell>{children}</DashboardShell>
}
