import { ensureChristmasTables, listSlots } from '@/lib/christmas/db'
import ChristmasSlotsClient from '@/components/admin/ChristmasSlotsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Christmas Lights — Slots' }

export default async function ChristmasSlotsPage() {
  let slots = []

  try {
    await ensureChristmasTables()
  } catch (err) {
    console.error('[christmas/slots] ensureChristmasTables error:', err)
  }

  try {
    slots = await listSlots(2026)
  } catch (err) {
    console.error('[christmas/slots] listSlots error:', err)
  }

  return <ChristmasSlotsClient slots={slots} />
}
