import { auth } from '@/auth'
import { createUser, ensurePlatformUsersTable, listUsers } from '@/lib/auth/users'

async function requireAdmin() {
  const session = await auth().catch(() => null)
  if (!session?.user || session.user.role !== 'admin') {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    await ensurePlatformUsersTable()
    const users = await listUsers()
    return Response.json({ users })
  } catch (err) {
    console.error('[api/users GET]', err)
    return Response.json({ error: 'Failed to load users.' }, { status: 500 })
  }
}

export async function POST(req) {
  const { error } = await requireAdmin()
  if (error) return error

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
  } catch (err) {
    console.error('[api/users POST]', err)
    return Response.json({ error: err?.message || 'Failed to create user.' }, { status: 400 })
  }
}
