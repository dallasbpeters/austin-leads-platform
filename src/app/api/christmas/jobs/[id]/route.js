import { deleteJob, updateJob } from '@/lib/christmas/db'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()
    const job = await updateJob(id, body)
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 })
    return Response.json({ job })
  } catch (err) {
    console.error('[api/christmas/jobs PATCH]', err)
    return Response.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    await deleteJob(id)
    return Response.json({ deleted: id })
  } catch (err) {
    console.error('[api/christmas/jobs DELETE]', err)
    return Response.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
