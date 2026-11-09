import { safeAuth } from '@/lib/auth/session'
import { deleteJob, updateJob } from '@/lib/christmas/db'

// Staff only: a job holds the customer's contact details and deposit status.
const unauthorized = async () =>
  (await safeAuth())?.user ? null : Response.json({ error: 'Unauthorized' }, { status: 401 })

export const PATCH = async (req, { params }) => {
  const denied = await unauthorized()
  if (denied) {
    return denied
  }
  try {
    const { id } = await params
    const body = await req.json()
    const job = await updateJob(id, body)
    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 })
    }
    return Response.json({ job })
  } catch (error) {
    console.error('[api/christmas/jobs PATCH]', error)
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export const DELETE = async (req, { params }) => {
  const denied = await unauthorized()
  if (denied) {
    return denied
  }
  try {
    const { id } = await params
    await deleteJob(id)
    return Response.json({ deleted: id })
  } catch (error) {
    console.error('[api/christmas/jobs DELETE]', error)
    return Response.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
