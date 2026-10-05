import { auth } from '@/auth'
import { createUser, ensurePlatformUsersTable, listUsers } from '@/lib/auth/users'

const requireAdmin = async () => {
  const session = await auth().catch(() => null)
  if (!session?.user || session.user.role !== 'admin') {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}

export const GET = async () => {
  const { error: authError } = await requireAdmin()
  if (authError) {
    return authError
  }

  try {
    await ensurePlatformUsersTable()
    const users = await listUsers()
    return Response.json({ users })
  } catch (error) {
    console.error('[api/users GET]', error)
    return Response.json({ error: 'Failed to load users.' }, { status: 500 })
  }
}

export const POST = async (req) => {
  const { error: authError } = await requireAdmin()
  if (authError) {
    return authError
  }

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  try {
    await ensurePlatformUsersTable()
    const user = await createUser({
      email: body?.email,
      password: body?.password,
      name: body?.name,
      role: body?.role,
      isActive: body?.isActive ?? true,
    })
    return Response.json({ user }, { status: 201 })
  } catch (error) {
    console.error('[api/users POST]', error)
    return Response.json({ error: error?.message || 'Failed to create user.' }, { status: 400 })
  }
}
