import { ensureChristmasTables, listSlots } from '@/lib/christmas/db'
import ChristmasSlotsClient from '@/components/admin/ChristmasSlotsClient'

export const metadata = { title: 'Christmas Lights — Slots' }

// Default 2025 season dates — Oct 13 through Nov 24, weekly
const DEFAULT_DATES = [
  '2025-10-13', '2025-10-20', '2025-10-27',
  '2025-11-03', '2025-11-10', '2025-11-17', '2025-11-24',
]

export default async function ChristmasSlotsPage() {
  let slots = []

  try {
    await ensureChristmasTables()
    slots = await listSlots(2025)
  } catch (err) {
    console.error('[christmas/slots] db error:', err)
  }

  return <ChristmasSlotsClient slots={slots} defaultDates={DEFAULT_DATES} />
}
