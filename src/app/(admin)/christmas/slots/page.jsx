import ChristmasSlotsClient from '@/components/admin/christmas-slots-client'
import { ensureChristmasTables, listSlots } from '@/lib/christmas/db'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Christmas Lights — Slots' }

export default async function ChristmasSlotsPage() {
  let slots = []

  try {
    await ensureChristmasTables()
  } catch (error) {
    console.error('[christmas/slots] ensureChristmasTables error:', error)
  }

  try {
    slots = await listSlots(2026)
  } catch (error) {
    console.error('[christmas/slots] listSlots error:', error)
  }

  return <ChristmasSlotsClient slots={slots} />
}
