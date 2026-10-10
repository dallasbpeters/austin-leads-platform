import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock(import('@/sanity/client'), () => ({ getSanityServerClient: () => null }))
vi.mock(import('@/lib/platform/content'), () => ({ getAllSites: () => [] }))

const db = vi.hoisted(() => ({
  listQuotesAwaitingDelivery: vi.fn(),
  applyEmailEvent: vi.fn(),
}))
vi.mock(import('@/lib/quotes/db.js'), () => db)

const resendStatus = vi.hoisted(() => ({
  hasResendApiKey: vi.fn(() => true),
  fetchResendEmailStatus: vi.fn(),
}))
vi.mock(import('@/lib/christmas/invoice-email-status.js'), () => resendStatus)
vi.mock(import('node:timers/promises'), () => ({ setTimeout: vi.fn(async () => {}) }))

const { proxy } = await import('@/proxy')
const { syncQuoteEmailStatuses } = await import('@/lib/quotes/email-status')

const post = (path) => new NextRequest(`https://example.com${path}`, { method: 'POST' })

describe('proxy: quote email webhook', () => {
  it('lets the signed Resend webhook reach its route without a session', async () => {
    const response = await proxy(post('/api/quotes/email-events'))
    expect(response.status).not.toBe(401)
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('still requires a session for the other quote routes', async () => {
    for (const path of ['/api/quotes', '/api/quotes/email-status', '/api/quotes/email-events/x']) {
      const response = await proxy(post(path))
      expect(response.status).toBe(401)
    }
  })
})

describe('syncQuoteEmailStatuses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resendStatus.hasResendApiKey.mockReturnValue(true)
  })

  it('applies the Resend status to quotes that still read sent', async () => {
    db.listQuotesAwaitingDelivery.mockResolvedValue([
      { id: 'qt_a', status: 'sent', resendEmailId: 're_a' },
      { id: 'qt_b', status: 'sent', resendEmailId: 're_b' },
      { id: 'qt_c', status: 'sent', resendEmailId: 're_c' },
    ])
    resendStatus.fetchResendEmailStatus
      .mockResolvedValueOnce({ ok: true, status: 'delivered', sentAt: '2026-09-11T03:50:50Z' })
      .mockResolvedValueOnce({ ok: true, status: 'sent', sentAt: '2026-09-12T00:00:00Z' })
      .mockResolvedValueOnce({ ok: false, reason: 'not found' })
    db.applyEmailEvent.mockResolvedValue('qt_a')

    const result = await syncQuoteEmailStatuses()

    expect(db.applyEmailEvent).toHaveBeenCalledExactlyOnceWith({
      resendEmailId: 're_a',
      type: 'email.delivered',
      occurredAt: '2026-09-11T03:50:50Z',
    })
    expect(result).toStrictEqual({ checked: 3, updated: 1, skipped: 1 })
  })

  it('does nothing when no Resend key is set', async () => {
    resendStatus.hasResendApiKey.mockReturnValue(false)

    const result = await syncQuoteEmailStatuses()

    expect(db.listQuotesAwaitingDelivery).not.toHaveBeenCalled()
    expect(result.updated).toBe(0)
  })
})
