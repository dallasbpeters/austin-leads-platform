import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import {
  deleteDomainRecordDb,
  getDomainRecordDb,
  hasDomainDatabase,
  updateDomainRecordDb,
} from '@/lib/platform/domain-db'
import { deleteDomainRecord, getDomainRecord, updateDomainRecord } from '@/lib/platform/store'
import { isVercelConfigured, removeDomainFromVercel, updateDomainOnVercel } from '@/lib/platform/vercel'

export const runtime = 'nodejs'

function normalizeRedirectTarget(value) {
  const trimmed = String(value || '').trim()
  return trimmed || null
}

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  const { domain } = await params
  const existing = hasDomainDatabase() ? await getDomainRecordDb(domain) : getDomainRecord(domain)

  if (!existing) {
    return NextResponse.json({ error: 'Domain not found.' }, { status: 404 })
  }

  const body = await request.json()
  const redirectTarget = normalizeRedirectTarget(body.redirectTarget)
  let nextPatch = {
    siteSlug: body.siteSlug || existing.siteSlug,
    tier: body.tier || (redirectTarget ? 'redirect' : 'landing'),
    redirectTarget,
  }

  if (isVercelConfigured() && existing.source !== 'local') {
    const result = await updateDomainOnVercel(domain, { redirectTarget })

    nextPatch = {
      ...nextPatch,
      redirectTarget: result.redirectTarget ?? redirectTarget,
      verified: result.verified,
      verificationStatus: result.verificationStatus,
      dnsInstructions: result.dnsInstructions,
      apexName: result.apexName ?? existing.apexName ?? null,
      gitBranch: result.gitBranch ?? existing.gitBranch ?? null,
      source: existing.source === 'merged' ? 'merged' : 'vercel',
    }
  }

  const record = hasDomainDatabase()
    ? await updateDomainRecordDb(domain, nextPatch)
    : updateDomainRecord(domain, nextPatch)
  return NextResponse.json({ domain: record })
}

export async function DELETE(_request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  const { domain } = await params
  const existing = hasDomainDatabase() ? await getDomainRecordDb(domain) : getDomainRecord(domain)

  if (!existing) {
    return NextResponse.json({ error: 'Domain not found.' }, { status: 404 })
  }

  if (isVercelConfigured() && existing.source !== 'local') {
    try {
      await removeDomainFromVercel(domain)
    } catch (error) {
      if (error?.status !== 404) {
        throw error
      }
    }
  }

  if (hasDomainDatabase()) {
    await deleteDomainRecordDb(domain)
  } else {
    deleteDomainRecord(domain)
  }
  return NextResponse.json({ ok: true })
}
