import { redirect } from 'next/navigation'

import AdminBodyScrollLock from '@/components/admin/AdminBodyScrollLock'
import AdminShell from '@/components/admin/AdminShell'
import { safeAuth } from '@/lib/auth/session'

export default async function AdminLayout({ children }) {
  const session = await safeAuth()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <>
      <AdminBodyScrollLock />
      <AdminShell user={session.user}>{children}</AdminShell>
    </>
  )
}
