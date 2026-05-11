import { auth } from '@/auth'
import {
  deleteUser,
  ensurePlatformUsersTable,
  getUserById,
  setUserPassword,
  updateUserFields,
} from '@/lib/auth/users'

async function requireAdmin() {
  const session = await auth().catch(() => null)
  if (!session?.user || session.user.role !== 'admin') {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}

export async function GET(_req, { params }) {
  const { error } = await requireAdmin()
  if (error) return error
  const { id } = await params

  try {
    await ensurePlatformUsersTable()
    const user = await getUserById(id)
    if (!user) return Response.json({ error: 'User not found.' }, { status: 404 })
    return Response.json({ user })
  } catch (err) {
    console.error('[api/users/:id GET]', err)
    return Response.json({ error: 'Failed to load user.' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  const { session, error } = await requireAdmin()
  if (error) return error
  const { id } = await params

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const isSelf = session.user.id === id

  if (isSelf && body?.isActive === false) {
    return Response.json({ error: 'You cannot deactivate your own account.' }, { status: 400 })
  }
  if (isSelf && body?.role && body.role !== session.user.role) {
    return Response.json({ error: 'You cannot change your own role.' }, { status: 400 })
  }

  try {
    await ensurePlatformUsersTable()

    let user = await updateUserFields(id, {
      email: body?.email,
      name: body?.name,
      role: body?.role,
      isActive: body?.isActive,
    })

    if (body?.password) {
      await setUserPassword(id, body.password)
      user = await getUserById(id)
    }

    return Response.json({ user })
  } catch (err) {
    console.error('[api/users/:id PATCH]', err)
    return Response.json({ error: err?.message || 'Failed to update user.' }, { status: 400 })
  }
}

export async function DELETE(_req, { params }) {
  const { session, error } = await requireAdmin()
  if (error) return error
  const { id } = await params

  if (session.user.id === id) {
    return Response.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  }

  try {
    await ensurePlatformUsersTable()
    await deleteUser(id)
    return Response.json({ deleted: id })
  } catch (err) {
    console.error('[api/users/:id DELETE]', err)
    return Response.json({ error: err?.message || 'Failed to delete user.' }, { status: 400 })
  }
}
