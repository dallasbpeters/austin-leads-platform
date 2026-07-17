/*
 * Sync saved quotes into the admin CRM (lead_submissions).
 * Upserts by email when possible so re-saving a quote doesn't duplicate leads.
 */

import { getSql } from '../db/pool.js'
import {
  createLeadSubmission,
  ensureLeadSubmissionsTable,
  hasLeadDatabase,
  updateLeadSubmission,
} from '@/lib/leads/db'

async function findLeadByEmail(email) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase()
  if (!normalized) {
    return null
  }
  const sql = getSql()
  const [row] = await sql`
    SELECT *
    FROM lead_submissions
    WHERE LOWER(email) = ${normalized}
    ORDER BY created_at DESC
    LIMIT 1
  `
  if (!row) {
    return null
  }
  return {
    ...row,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
  }
}

function quoteNotes(quote) {
  const inputs = quote.data?.inputs || {}
  const computed = quote.data?.computed || {}
  const address = [
    quote.propertyAddress || inputs.propertyAddress,
    quote.propertyCity || inputs.propertyCity,
    quote.propertyState || inputs.propertyState,
    quote.propertyZip || inputs.propertyZip,
  ]
    .filter(Boolean)
    .join(', ')
  const sizeKw = quote.systemSizeKw ?? computed.systemSizeKw
  const netPrice = quote.netPrice ?? computed.netSystemPrice
  const parts = [
    `Quote ${quote.quoteNumber}`,
    address ? `Property: ${address}` : null,
    sizeKw != null ? `System: ${sizeKw} kW` : null,
    netPrice != null ? `Net price: $${Number(netPrice).toLocaleString('en-US')}` : null,
  ]
  return parts.filter(Boolean).join(' · ')
}

/**
 * Best-effort CRM sync — never throws.
 * @returns {{ ok: true, leadId, created: boolean } | { skipped: true, reason } | { ok: false, error }}
 */
export async function syncQuoteToCrm(quote) {
  if (!hasLeadDatabase()) {
    return { skipped: true, reason: 'CRM database is not configured' }
  }

  const name = String(quote.customerName || quote.data?.inputs?.customerName || '').trim()
  const email = String(quote.customerEmail || quote.data?.inputs?.customerEmail || '')
    .trim()
    .toLowerCase()
  const phone = String(quote.customerPhone || quote.data?.inputs?.customerPhone || '').trim()

  if (!name) {
    return { skipped: true, reason: 'Customer name is required for CRM' }
  }
  if (!email) {
    return { skipped: true, reason: 'Customer email is required for CRM' }
  }

  try {
    await ensureLeadSubmissionsTable()
    const existing = await findLeadByEmail(email)
    const notes = quoteNotes(quote)
    const metadata = {
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      utilityProvider: quote.utilityProvider || quote.data?.inputs?.utilityProvider || null,
      systemSizeKw: quote.systemSizeKw ?? quote.data?.computed?.systemSizeKw ?? null,
      netSystemPrice: quote.netPrice ?? quote.data?.computed?.netSystemPrice ?? null,
    }

    if (existing) {
      const sql = getSql()
      const keepTerminal = existing.pipeline_stage === 'won' || existing.pipeline_stage === 'lost'
      const nextStage = keepTerminal ? existing.pipeline_stage : 'quoted'
      await sql`
        UPDATE lead_submissions
        SET
          updated_at = NOW(),
          full_name = ${name},
          phone = COALESCE(${phone || null}, phone),
          notes = ${notes},
          service_interest = 'solar',
          pipeline_stage = ${nextStage},
          metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(metadata)}::jsonb
        WHERE id = ${existing.id}
      `
      return { ok: true, leadId: existing.id, created: false }
    }

    const lead = await createLeadSubmission({
      sourceType: 'quote',
      sourceSection: 'admin-quotes',
      serviceInterest: 'solar',
      siteSlug: 'texas-solar-and-roofing-pros',
      siteName: 'Texas Solar and Roofing Pros',
      sourceDomain: 'admin',
      pagePath: '/quotes',
      pageTitle: `Quote ${quote.quoteNumber}`,
      fullName: name,
      email,
      phone: phone || null,
      notes,
      metadata,
    })

    await updateLeadSubmission(lead.id, { pipelineStage: 'quoted', status: 'qualified' })
    return { ok: true, leadId: lead.id, created: true }
  } catch (error) {
    console.error('[quotes] crm sync failed', error)
    return { ok: false, error: error.message }
  }
}
