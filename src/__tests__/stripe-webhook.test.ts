/**
 * Stripe webhook handler tests
 *
 * Run:  pnpm test
 * Watch: pnpm test:watch
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Mock stripe so constructEvent is controllable
vi.mock('@/lib/stripe/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

// Mock DB so tests don't need a real Neon connection
vi.mock('@/lib/christmas/db', () => ({
  ensureChristmasTables: vi.fn().mockResolvedValue(undefined),
  createJob: vi.fn().mockResolvedValue({ id: 'job-123' }),
  getJobByStripeSessionId: vi.fn().mockResolvedValue(null), // no duplicate by default
}))

// Mock next/headers — use vi.fn() so tests can swap implementations without re-mocking the module
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { headers } from 'next/headers'

import { createJob, getJobByStripeSessionId } from '@/lib/christmas/db'
import { stripe } from '@/lib/stripe/stripe'

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeCheckoutEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_abc123',
        customer_email: 'jane@example.com',
        customer_details: { name: 'Jane Smith', email: 'jane@example.com' },
        amount_total: 15000,
        payment_intent: 'pi_test_xyz',
        metadata: {
          payment_type: 'deposit',
          site_slug: 'txchristmaslights',
          customerName: 'Jane Smith',
          propertyAddress: '123 Oak St, Austin TX',
          installDate: '2025-10-13',
          packageSlug: 'xmas-roofline',
        },
        ...overrides,
      },
    },
  }
}

async function callWebhook(event: unknown) {
  // Import the handler fresh for each test (vi.resetModules in beforeEach)
  const { POST } = await import('@/app/api/stripe/webhook/route')
  const req = new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    body: JSON.stringify(event),
    headers: { 'stripe-signature': 'sig_test' },
  })
  return POST(req)
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_stub'

    vi.mocked(headers).mockResolvedValue(new Headers({ 'stripe-signature': 'sig_test' }))

    // Default: constructEvent returns the event as-is
    ;(stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockImplementation((_body, _sig, _secret) =>
      JSON.parse(_body as string),
    )
    ;(getJobByStripeSessionId as ReturnType<typeof vi.fn>).mockResolvedValue(null)
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    vi.mocked(headers).mockResolvedValueOnce(new Headers())

    const { POST } = await import('@/app/api/stripe/webhook/route')
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when signature verification fails', async () => {
    ;(stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Signature mismatch')
    })
    const res = await callWebhook(makeCheckoutEvent())
    expect(res.status).toBe(400)
  })

  it('creates a job when a valid checkout.session.completed arrives', async () => {
    const res = await callWebhook(makeCheckoutEvent())
    expect(res.status).toBe(200)
    expect(createJob).toHaveBeenCalledOnce()
    expect(createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane@example.com',
        installDate: '2025-10-13',
        packageSlug: 'xmas-roofline',
        siteSlug: 'txchristmaslights',
        stripeSessionId: 'cs_test_abc123',
        depositAmountCents: 15000,
      }),
    )
  })

  it('does NOT create a duplicate job if session already exists', async () => {
    ;(getJobByStripeSessionId as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'existing-job',
    })
    const res = await callWebhook(makeCheckoutEvent())
    expect(res.status).toBe(200)
    expect(createJob).not.toHaveBeenCalled()
  })

  it('ignores events that are not for txchristmaslights', async () => {
    const event = makeCheckoutEvent({
      metadata: { payment_type: 'deposit', site_slug: 'other-site' },
    })
    const res = await callWebhook(event)
    expect(res.status).toBe(200)
    expect(createJob).not.toHaveBeenCalled()
  })

  it('ignores non-deposit payment_type events', async () => {
    const event = makeCheckoutEvent({
      metadata: { payment_type: 'balance', site_slug: 'txchristmaslights' },
    })
    const res = await callWebhook(event)
    expect(res.status).toBe(200)
    expect(createJob).not.toHaveBeenCalled()
  })

  it('ignores unrelated event types', async () => {
    const event = { type: 'customer.created', data: { object: {} } }
    const res = await callWebhook(event)
    expect(res.status).toBe(200)
    expect(createJob).not.toHaveBeenCalled()
  })
})
