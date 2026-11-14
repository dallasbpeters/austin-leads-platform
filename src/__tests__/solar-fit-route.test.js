import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createLeadSubmission: vi.fn(async () => ({ id: 'lead-1' })),
  sendSolarFitEmails: vi.fn(async () => ({ team: 'sent', homeowner: 'sent' })),
  appendSolarFitRow: vi.fn(async () => ({ status: 'added' })),
  createDraftQuoteFromEstimate: vi.fn(async () => ({ status: 'created' })),
  afterCallbacks: [],
}))

vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal()),
  after: (callback) => mocks.afterCallbacks.push(callback),
}))
vi.mock('@/lib/leads/db', () => ({
  hasLeadDatabase: () => true,
  ensureLeadSubmissionsTable: async () => {},
  createLeadSubmission: mocks.createLeadSubmission,
}))
vi.mock('@/lib/solar-fit/notify', () => ({
  sendSolarFitEmails: mocks.sendSolarFitEmails,
  appendSolarFitRow: mocks.appendSolarFitRow,
}))
vi.mock('@/lib/quotes/from-estimate', () => ({
  createDraftQuoteFromEstimate: mocks.createDraftQuoteFromEstimate,
}))
vi.mock('@/lib/solar-fit/google', () => ({}))
vi.mock('@/sanity/client', () => ({ sanityServerClient: null }))

const { POST } = await import('@/app/api/solar-fit/route')

const send = (extra = {}) =>
  POST(
    new Request('http://localhost/api/solar-fit', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Pat Example',
        email: 'pat@example.com',
        consent: true,
        answers: {},
        pagePath: '/solar-costs',
        ...extra,
      }),
    }),
  )

describe('POST /api/solar-fit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.afterCallbacks.length = 0
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  it('saves the lead, sends the emails and makes a draft quote', async () => {
    const response = await send()
    expect(response.status).toBe(200)
    expect(mocks.createLeadSubmission).toHaveBeenCalledOnce()
    expect(mocks.sendSolarFitEmails).toHaveBeenCalledOnce()
    expect(mocks.appendSolarFitRow).toHaveBeenCalledOnce()
    await Promise.all(mocks.afterCallbacks.map((callback) => callback()))
    expect(mocks.createDraftQuoteFromEstimate).toHaveBeenCalledOnce()
  })

  it('still saves the lead when the bot trap is filled, marked as a possible bot', async () => {
    const response = await send({ trap: 'autofilled value' })
    expect(response.status).toBe(200)
    expect(mocks.createLeadSubmission).toHaveBeenCalledOnce()
    expect(mocks.createLeadSubmission.mock.calls[0][0].metadata.possibleBot).toBe(true)
  })

  it('skips the emails, sheet row and draft quote for a possible bot', async () => {
    await send({ trap: 'x' })
    await Promise.all(mocks.afterCallbacks.map((callback) => callback()))
    expect(mocks.sendSolarFitEmails).not.toHaveBeenCalled()
    expect(mocks.appendSolarFitRow).not.toHaveBeenCalled()
    expect(mocks.createDraftQuoteFromEstimate).not.toHaveBeenCalled()
  })
})
