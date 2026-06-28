import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { getDomainRecordDb, hasDomainDatabase, updateDomainRecordDb } from '@/lib/platform/domain-db'
import { getDomainRecord, upsertDomainRecord } from '@/lib/platform/store'
import { verifyDomainOnVercel } from '@/lib/platform/vercel'

export const runtime = 'nodejs'

export async function POST(_request, { params }) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  const { domain } = await params
  const existing = hasDomainDatabase() ? await getDomainRecordDb(domain) : getDomainRecord(domain)

  if (!existing) {
    return NextResponse.json({ error: 'Domain not found.' }, { status: 404 })
  }

  const result = await verifyDomainOnVercel(domain)

  const patch = {
    verified: result.verified,
    verificationStatus: result.verificationStatus,
    dnsInstructions: result.dnsInstructions,
  }
  const record = hasDomainDatabase()
    ? await updateDomainRecordDb(domain, patch)
    : upsertDomainRecord({
        ...existing,
        ...patch,
      })

  return NextResponse.json({ domain: record })
}
