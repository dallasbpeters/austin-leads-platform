import { deleteSlot, upsertSlot } from '@/lib/christmas/db'

export const DELETE = async (req) => {
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
