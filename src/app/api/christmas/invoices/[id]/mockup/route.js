import { NextResponse } from 'next/server'

import { getInvoice } from '@/lib/christmas/invoice-db'
import { getMockupForInvoice, saveMockupForInvoice } from '@/lib/christmas/mockup-db'
import { ensureMockupSchema, hasSession, jsonError, readMockupForm } from '@/lib/christmas/mockup-request'

export const runtime = 'nodejs'

/** GET — the invoice's mockup (metadata + state), or `{ mockup: null }`. */
export async function GET(_request, { params }) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  const { id } = await params
  try {
    await ensureMockupSchema()
    return NextResponse.json({ mockup: await getMockupForInvoice(id) })
  } catch (error) {
    console.error('[christmas/mockup] load failed', error)
    return jsonError(error.message, 500)
  }
}

/** PUT — create or replace the invoice's mockup. */
export async function PUT(request, { params }) {
  if (!(await hasSession())) {
    return jsonError('Unauthorized', 401)
  }
  const { id } = await params
  const body = await readMockupForm(request)
  if (body.error) {
    return jsonError(body.error, 400)
  }
  try {
    await ensureMockupSchema()
    const invoice = await getInvoice(id)
    if (!invoice) {
      return jsonError('Invoice not found', 404)
    }
    const mockup = await saveMockupForInvoice(id, { ...body, title: body.title || invoice.customerName })
    return NextResponse.json({ mockup })
  } catch (error) {
    console.error('[christmas/mockup] save failed', error)
    return jsonError(error.message, 500)
  }
}
