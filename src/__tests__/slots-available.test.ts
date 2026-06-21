/**
 * /api/christmas/slots/available — deduplication and filtering tests
 */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/christmas/db', () => ({
  listSlots: vi.fn(),
}))

import { GET } from '@/app/api/christmas/slots/available/route'
import { listSlots } from '@/lib/christmas/db'

function makeSlot(date: string, overrides = {}) {
  return {
    install_date: date,
    capacity: 6,
    booked_count: 0,
    is_active: true,
    ...overrides,
  }
}

describe('GET /api/christmas/slots/available', () => {
  it('returns only active slots', async () => {
    ;(listSlots as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeSlot('2025-10-13'),
      makeSlot('2025-10-20', { is_active: false }),
    ])
    const res = await GET()
    const data = await res.json()
    expect(data).toHaveLength(1)
    expect(data[0].value).toBe('2025-10-13')
  })

  it('deduplicates slots with the same date', async () => {
    ;(listSlots as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeSlot('2025-10-13'),
      makeSlot('2025-10-13'), // duplicate
    ])
    const res = await GET()
    const data = await res.json()
    expect(data).toHaveLength(1)
  })

  it('marks slots as full when booked_count >= capacity', async () => {
    ;(listSlots as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeSlot('2025-10-13', { capacity: 3, booked_count: 3 }),
    ])
    const res = await GET()
    const data = await res.json()
    expect(data[0].isFull).toBe(true)
    expect(data[0].spotsLeft).toBe(0)
  })

  it('returns correct spotsLeft', async () => {
    ;(listSlots as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeSlot('2025-10-13', { capacity: 6, booked_count: 2 }),
    ])
    const res = await GET()
    const data = await res.json()
    expect(data[0].spotsLeft).toBe(4)
    expect(data[0].isFull).toBe(false)
  })

  it('returns empty array and 200 when DB throws', async () => {
    ;(listSlots as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB down'))
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual([])
  })

  it('sorts slots by date ascending', async () => {
    ;(listSlots as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeSlot('2025-11-10'),
      makeSlot('2025-10-13'),
      makeSlot('2025-10-27'),
    ])
    const res = await GET()
    const data = await res.json()
    const dates = data.map((s: { value: string }) => s.value)
    expect(dates).toEqual(['2025-10-13', '2025-10-27', '2025-11-10'])
  })
})
