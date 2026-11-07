import { NextResponse } from 'next/server'

import { createLeadSubmission, ensureLeadSubmissionsTable, hasLeadDatabase } from '@/lib/leads/db'
import { computeModel, resolveModel } from '@/lib/solar-fit/model'
import { appendSolarFitRow, sendSolarFitEmails } from '@/lib/solar-fit/notify'
import { sanityServerClient } from '@/sanity/client'

/*
 * Receives the "See if solar is right for you" form. The browser sends only the
 * answers and contact details; the formula is loaded from Sanity here and run
 * again, so the saved numbers cannot be edited in the browser and always match
 * the published model.
 */

const SECTION_QUERY = `*[_id == $pageId][0]{
  title,
  "siteName": site->name,
  "siteSlug": site->slug.current,
  "sourceDomain": site->primaryDomain,
  "section": sections[_key == $sectionKey][0]{
    fitInputs[]{ key, label, kind, defaultValue, min, max, step, prefix, suffix, options[]{ label, value } },
    fitConstants[]{ key, label, value },
    fitOutputs[]{ key, label, formula, format, decimals, detail, highlight },
    qualifyFormula,
    qualifiedMessage,
    notQualifiedMessage
  }
}`

const clean = (value, max = 300) =>
  String(value ?? '')
    .trim()
    .slice(0, max)

const fail = (message, status = 400) => NextResponse.json({ error: message }, { status })

export async function POST(request) {
  const payload = await request.json().catch(() => null)
  if (!payload) {
    return fail('Invalid request body.')
  }

  const lead = {
    fullName: clean(payload.fullName, 120),
    email: clean(payload.email, 200).toLowerCase(),
    phone: clean(payload.phone, 40),
    address: clean(payload.address, 200),
  }

  if (!lead.fullName) {
    return fail('Please enter your name.')
  }
  if (!lead.email.includes('@')) {
    return fail('Please enter a valid email address.')
  }
  if (payload.consent !== true) {
    return fail('Please agree to be contacted so we can send your estimate.')
  }
  // Bots fill every field, people never see this one.
  if (clean(payload.company)) {
    return NextResponse.json({ ok: true })
  }

  const pageId = clean(payload.pageId, 120)
  const sectionKey = clean(payload.sectionKey, 120)
  const page =
    pageId && sectionKey && sanityServerClient
      ? await sanityServerClient.fetch(SECTION_QUERY, { pageId, sectionKey }).catch(() => null)
      : null

  const model = resolveModel(page?.section)
  const result = computeModel(model, payload.answers || {})
  const siteName = page?.siteName || 'Texas Solar and Roofing Pros'
  const pagePath = clean(payload.pagePath, 200) || '/solar-costs'

  let leadId = null
  if (hasLeadDatabase()) {
    await ensureLeadSubmissionsTable()
    const submission = await createLeadSubmission({
      ...lead,
      notes: lead.address ? `Address: ${lead.address}` : '',
      sourceType: 'solar-fit',
      sourceSection: 'solar-fit-form',
      serviceInterest: 'solar',
      siteSlug: page?.siteSlug || 'texas-solar-and-roofing-pros',
      siteName,
      sourceDomain: page?.sourceDomain || 'texassolarandroofingpros.com',
      pagePath,
      pageTitle: page?.title || '',
      metadata: {
        answers: result.values,
        results: Object.fromEntries(result.outputs.map((output) => [output.key, output.value])),
        qualifies: result.qualifies,
      },
    })
    leadId = submission.id
  }

  const [email, sheet] = await Promise.all([
    sendSolarFitEmails({ lead, model, result, siteName }).catch((error) => ({
      team: 'failed',
      homeowner: 'failed',
      reason: error instanceof Error ? error.message : String(error),
    })),
    appendSolarFitRow({ lead, model, result, pagePath }),
  ])

  console.info('Solar fit request handled.', { leadId, email, sheet, qualifies: result.qualifies })

  return NextResponse.json({ ok: true, qualifies: result.qualifies })
}
