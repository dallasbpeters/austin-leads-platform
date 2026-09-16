import { NextResponse } from 'next/server'

import { getInvoice } from '@/lib/christmas/invoice-db'
import { getMockup, linkMockupToInvoice } from '@/lib/christmas/mockup-db'
import { ensureMockupSchema, hasSession, jsonError } from '@/lib/christmas/mockup-request'

export const runtime = 'nodejs'

/** POST { mockupId } — tie a saved mockup to this invoice. */
export async function POST(request, { params }) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }
  const mockupId = typeof body?.mockupId === 'string' ? body.mockupId : ''
  if (!mockupId) {
    return jsonError('mockupId is required', 400)
  }

  try {
    await ensureMockupSchema()
    const [invoice, mockup] = await Promise.all([getInvoice(id), getMockup(mockupId)])
    if (!invoice || !mockup) {
      return jsonError(invoice ? 'Mockup not found' : 'Invoice not found', 404)
    }
    const linked = await linkMockupToInvoice(mockupId, { invoiceId: id, customerName: invoice.customerName })
    return NextResponse.json({ mockup: linked })
  } catch (error) {
    console.error('[christmas/mockup] link failed', error)
    return jsonError(error.message, 500)
  }
}
