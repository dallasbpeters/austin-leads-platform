import { deleteSlot, upsertSlot } from '@/lib/christmas/db'

export async function DELETE(req) {
  try {
    const { installDate } = await req.json()
    if (!installDate) return Response.json({ error: 'installDate required' }, { status: 400 })
    await deleteSlot(installDate)
    return Response.json({ deleted: installDate })
  } catch (err) {
    console.error('[api/christmas/slots DELETE]', err)
    return Response.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}

export async function POST(req) {
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
  } catch (err) {
    console.error('[api/christmas/slots]', err)
    return Response.json({ error: 'Failed to save slot' }, { status: 500 })
  }
}
