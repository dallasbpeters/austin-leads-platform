import { redirect } from 'next/navigation'

import UsersClient from '@/components/admin/users-client'
import { safeAuth } from '@/lib/auth/session'
import { ensurePlatformUsersTable, listUsers } from '@/lib/auth/users'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Users' }

export default async function UsersPage() {
  const session = await safeAuth()
  if (!session?.user) redirect('/sign-in')

  let users = []
  let loadError = null

  try {
    await ensurePlatformUsersTable()
    users = await listUsers()
  } catch (err) {
    console.error('[admin/users] load error:', err)
    loadError = 'Could not load users from the database.'
  }

  return (
    <UsersClient
      initialUsers={users}
      currentUser={{
        id: session.user.id ?? null,
        email: session.user.email,
        role: session.user.role,
      }}
      loadError={loadError}
    />
  )
}
