import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { computeChristmasInvoice } from '@/lib/christmas/invoice-calc'
import {
  ensureChristmasInvoiceTables,
  hasInvoiceDatabase,
  insertInvoice,
  listInvoices,
} from '@/lib/christmas/invoice-db'
import { syncChristmasInvoiceIntegrations } from '@/lib/christmas/invoice-integrations'
import { getChristmasInvoiceSettings } from '@/lib/christmas/invoice-settings'

export const runtime = 'nodejs'
export const maxDuration = 60

async function requireSession() {
  const session = await safeAuth()
  if (!session?.user) {
    return null
  }
  return session
}

function validateInputs(inputs) {
  if (!inputs.customerName?.trim()) {
    return 'Customer name is required'
  }
  const items = Array.isArray(inputs.lineItems)
    ? inputs.lineItems.filter((item) => item.description?.trim())
    : []
  if (!items.length) {
    return 'Add at least one line item'
  }
  return null
}

export async function GET() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasInvoiceDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    await ensureChristmasInvoiceTables()
    const invoices = await listInvoices({ limit: 200 })
    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('[christmas/invoices] list failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!hasInvoiceDatabase()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const inputs = body?.inputs || {}
  const invalid = validateInputs(inputs)
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 })
  }

  try {
    await ensureChristmasInvoiceTables()
    const settings = await getChristmasInvoiceSettings()
    const templateKey = body?.templateKey || inputs.templateKey || settings.templateKey
    const payloadInputs = {
      ...inputs,
      templateKey,
      invoiceNumberPrefix: inputs.invoiceNumberPrefix || settings.invoiceNumberPrefix,
    }
    // Always compute server-side so stored math is authoritative.
    const computed = computeChristmasInvoice(payloadInputs)
    const invoice = await insertInvoice({ inputs: payloadInputs, computed, templateKey })
    const results = await syncChristmasInvoiceIntegrations(invoice, settings)
    return NextResponse.json({ invoice, results }, { status: 201 })
  } catch (error) {
    console.error('[christmas/invoices] create failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
