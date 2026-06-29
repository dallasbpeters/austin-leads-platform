import { listSlots } from '@/lib/christmas/db'

export const GET = async () => {
  try {
    const slots = await listSlots(2026)

    const seen = new Set()
    const available = slots
      .filter((s) => s.is_active)
      .map((s) => {
        const raw = s.install_date instanceof Date ? s.install_date.toISOString() : String(s.install_date)
        const dateKey = raw.split('T')[0]
        const booked = s.booked_count ?? 0
        const capacity = s.capacity ?? 0
        const spotsLeft = Math.max(0, capacity - booked)

        return {
          value: dateKey,
          label: new Date(`${dateKey}T00:00:00Z`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          }),
          spotsLeft,
          isFull: spotsLeft === 0,
        }
      })
      .filter((s) => {
        if (seen.has(s.value)) {
          return false
        }
        seen.add(s.value)
        return true
      })
      .toSorted((a, b) => a.value.localeCompare(b.value))

    return Response.json(available)
  } catch (error) {
    console.error('[api/christmas/slots/available]', error)
    return Response.json([], { status: 200 }) // fail open — don't break the booking form
  }
}
