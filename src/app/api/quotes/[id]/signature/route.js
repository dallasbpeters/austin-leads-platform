import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import {
  ensureDocumentTables,
  hasDocumentDatabase,
  listDocumentClients,
  upsertDocumentClient,
} from '@/lib/documents/db'
import { getQuote, hasQuoteDatabase, markQuoteSignatureRequested } from '@/lib/quotes/db'
import { quotePdfFileName, renderQuotePdf } from '@/lib/quotes/pdf'

export const runtime = 'nodejs'
export const maxDuration = 60

async function findOrCreateDocumentClient(quote) {
  await ensureDocumentTables()
  const email = String(quote.customerEmail || '')
    .trim()
    .toLowerCase()
  const name = quote.customerName || 'Unknown Client'

  if (email) {
    const matches = await listDocumentClients({ limit: 50, search: email })
    const existing = matches.find((client) => client.email?.toLowerCase() === email)
    if (existing) {
      return existing
    }
  }

  return upsertDocumentClient({
    name,
    email,
    phone: quote.customerPhone || null,
    address:
      [quote.propertyAddress, quote.propertyCity, quote.propertyState, quote.propertyZip]
        .filter(Boolean)
        .join(', ') || null,
    metadata: { source: 'solar_quote', quoteId: quote.id, quoteNumber: quote.quoteNumber },
  })
}

/*
 * Sends the quote for e-signature through the existing DocuSeal integration.
 * The PDF is rendered with embedded signature/date text tags, then submitted
 * via the internal /api/docuseal/submissions route so audit events, signing
 * links, and the signature email all reuse the documents pipeline.
 */
export async function POST(request, { params }) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasQuoteDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }
  if (!hasDocumentDatabase()) {
    return NextResponse.json({ error: 'Document database is not configured' }, { status: 503 })
  }

  const { id } = await params
  const quote = await getQuote(id)
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    // Defaults apply.
  }
  const to = body?.to?.trim() || quote.customerEmail
  if (!to) {
    return NextResponse.json({ error: 'Customer email is required to request a signature.' }, { status: 400 })
  }

  let pdfBuffer
  try {
    pdfBuffer = await renderQuotePdf(quote, { signatureTags: true })
  } catch (error) {
    console.error('[quotes] signature pdf render failed', error)
    return NextResponse.json({ error: `PDF generation failed: ${error.message}` }, { status: 500 })
  }

  let client
  try {
    client = await findOrCreateDocumentClient(quote)
  } catch (error) {
    console.error('[quotes] document client create failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Forward to the existing DocuSeal submissions route (cookies carry the
  // admin session) so the documents pipeline stays the single code path.
  const submissionPayload = {
    clientId: client.id,
    title: `Solar Quote ${quote.quoteNumber}`,
    fileName: quotePdfFileName(quote),
    fileBase64: pdfBuffer.toString('base64'),
    sourceMode: 'solar-quote',
    sendEmail: body?.sendEmail !== false,
    message: body?.message?.trim() || '',
    submitters: [{ name: quote.customerName || '', email: to, role: 'Customer' }],
  }

  const response = await fetch(new URL('/api/docuseal/submissions', request.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify(submissionPayload),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    console.error('[quotes] docuseal submission failed', payload)
    return NextResponse.json(
      { error: payload.error || `Signature request failed (HTTP ${response.status})` },
      { status: response.status },
    )
  }

  const requestId = payload?.request?.id || payload?.requestId || payload?.id || null
  await markQuoteSignatureRequested(id, { requestId })

  const updated = await getQuote(id)
  return NextResponse.json({ quote: updated, signature: payload })
}
