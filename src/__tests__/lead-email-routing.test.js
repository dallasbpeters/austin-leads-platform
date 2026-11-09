import { beforeEach, describe, expect, it, vi } from 'vitest'

import { sendLeadNotificationEmail } from '@/lib/leads/email'
import { ROOFER_INTRODUCTION } from '@/lib/leads/source-types'

/*
 * Roofer introduction requests go to info@, every other lead to the usual
 * recipient. Resend and the routing settings are stubbed so only the choice of
 * inbox is under test.
 */
const sent = vi.hoisted(() => [])

vi.mock(import('resend'), () => ({
  Resend: class {
    emails = {
      send: async (payload) => {
        sent.push(payload)
        return { data: { id: 'email-1' }, error: null }
      },
    }
  },
}))

vi.mock(import('@/lib/leads/settings'), () => ({
  getLeadRoutingSettings: async () => ({
    emailNotificationsEnabled: true,
    fromEmail: 'leads@texassolarandroofingpros.com',
    fromName: 'Texas Solar and Roofing Pros',
    notificationToEmail: 'kathy@texassolarandroofing.com',
    resendTemplateId: '',
    subjectPrefix: 'New lead',
  }),
}))

const lead = (sourceType) => ({
  fullName: 'Pat Homeowner',
  email: 'pat@example.com',
  siteName: 'Texas Solar and Roofing Pros',
  sourceType,
})

describe(sendLeadNotificationEmail, () => {
  beforeEach(() => {
    sent.length = 0
    vi.stubEnv('RESEND_API_KEY', 're_test')
  })

  it('sends a roofer introduction request to info@', async () => {
    await sendLeadNotificationEmail(lead(ROOFER_INTRODUCTION))
    expect(sent[0].to).toStrictEqual(['info@texassolarandroofing.com'])
    expect(sent[0].replyTo).toBe('pat@example.com')
    expect(sent[0].subject).toBe('Roofer introduction request: Pat Homeowner (Texas Solar and Roofing Pros)')
  })

  it('sends other leads to the usual recipient', async () => {
    await sendLeadNotificationEmail(lead('consultation'))
    expect(sent[0].to).toStrictEqual(['kathy@texassolarandroofing.com'])
    expect(sent[0].subject).toBe('New lead: Pat Homeowner (Texas Solar and Roofing Pros)')
  })
})
