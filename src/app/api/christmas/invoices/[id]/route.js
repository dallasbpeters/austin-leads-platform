import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { computeChristmasInvoice } from '@/lib/christmas/invoice-calc'
import {
  deleteInvoice,
  ensureChristmasInvoiceTables,
  getInvoice,
  updateInvoice,
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

export async function GET(_request, { params }) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await ensureChristmasInvoiceTables()
    const invoice = await getInvoice(id)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('[christmas/invoices] get failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const inputs = body?.inputs || {}
  if (!inputs.customerFirstName?.trim()) {
    return NextResponse.json({ error: 'Customer first name is required' }, { status: 400 })
  }
  const items = Array.isArray(inputs.lineItems)
    ? inputs.lineItems.filter((item) => item.description?.trim())
    : []
  if (!items.length) {
    return NextResponse.json({ error: 'Add at least one line item' }, { status: 400 })
  }

  try {
    await ensureChristmasInvoiceTables()
    const existing = await getInvoice(id)
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const settings = await getChristmasInvoiceSettings()
    const templateKey =
      body?.templateKey || inputs.templateKey || existing.templateKey || settings.templateKey
    const payloadInputs = {
      ...inputs,
      templateKey,
      salesTaxRatePercent: settings.salesTaxRatePercent,
      earlyPaymentDiscountPercent: settings.earlyPaymentDiscountPercent,
      payInFullDiscountPercent: settings.payInFullDiscountPercent,
    }
    const computed = computeChristmasInvoice(payloadInputs)
    const invoice = await updateInvoice(id, { inputs: payloadInputs, computed, templateKey })
    const results = await syncChristmasInvoiceIntegrations(invoice, settings)
    return NextResponse.json({ invoice, results })
  } catch (error) {
    console.error('[christmas/invoices] update failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await ensureChristmasInvoiceTables()
    await deleteInvoice(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[christmas/invoices] delete failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
