import { safeAuth } from '@/lib/auth/session'
import { deleteSlot, upsertSlot } from '@/lib/christmas/db'

// Staff only: these change the install calendar. Visitors read open dates from slots/available.
const unauthorized = async () =>
  (await safeAuth())?.user ? null : Response.json({ error: 'Unauthorized' }, { status: 401 })

export const DELETE = async (req) => {
  const denied = await unauthorized()
  if (denied) {
    return denied
  }
  try {
    const { installDate } = await req.json()
    if (!installDate) {
      return Response.json({ error: 'installDate required' }, { status: 400 })
    }
    await deleteSlot(installDate)
    return Response.json({ deleted: installDate })
  } catch (error) {
    console.error('[api/christmas/slots DELETE]', error)
    return Response.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}

export const POST = async (req) => {
  const denied = await unauthorized()
  if (denied) {
    return denied
  }
  try {
    const { installDate, originalDate, capacity, isActive, notes } = await req.json()

    if (!installDate) {
      return Response.json({ error: 'installDate required' }, { status: 400 })
    }

    // If the date changed, delete the old record first
    if (originalDate && originalDate !== installDate) {
      await deleteSlot(originalDate)
    }

    const slot = await upsertSlot({
      installDate,
      capacity: Number(capacity) || 6,
      isActive: Boolean(isActive),
      notes: notes || null,
    })

    return Response.json({ slot, originalDate: originalDate || null })
  } catch (error) {
    console.error('[api/christmas/slots]', error)
    return Response.json({ error: 'Failed to save slot' }, { status: 500 })
  }
}
