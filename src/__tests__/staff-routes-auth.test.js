import { describe, expect, it, vi } from 'vitest'

import { DELETE as deleteJob, PATCH as patchJob } from '@/app/api/christmas/jobs/[id]/route'
import { DELETE as deleteSlot, POST as postSlot } from '@/app/api/christmas/slots/route'
import { GET as getAnalytics } from '@/app/api/ga-data/route'

/*
 * Staff-only routes outside the proxy's protected prefixes check the session
 * themselves. Nobody is signed in here, and the data layer fails the test if a
 * route reaches it anyway.
 */
vi.mock(import('@/lib/auth/session'), () => ({ safeAuth: async () => null }))
// The analytics config module is server-only; the route is refused before it is used.
vi.mock(import('@/lib/analytics/google'), () => ({ getGoogleAnalyticsConfig: () => ({}) }))

const reached = vi.hoisted(() => () => {
  throw new Error('reached the database without a session')
})
vi.mock(import('@/lib/christmas/db'), () => ({
  deleteJob: reached,
  updateJob: reached,
  deleteSlot: reached,
  upsertSlot: reached,
}))

const json = (method, body) =>
  new Request('http://localhost/api/test', {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
const params = { params: Promise.resolve({ id: 'job-1' }) }

describe('staff-only routes without a session', () => {
  it('refuses to change or delete a Christmas job', async () => {
    expect((await patchJob(json('PATCH', { email: 'x@example.com' }), params)).status).toBe(401)
    expect((await deleteJob(json('DELETE', {}), params)).status).toBe(401)
  })

  it('refuses to change the Christmas install calendar', async () => {
    expect((await postSlot(json('POST', { installDate: '2026-12-01' }))).status).toBe(401)
    expect((await deleteSlot(json('DELETE', { installDate: '2026-12-01' }))).status).toBe(401)
  })

  it('refuses to share the analytics reports', async () => {
    expect((await getAnalytics(new Request('http://localhost/api/ga-data'))).status).toBe(401)
  })
})
