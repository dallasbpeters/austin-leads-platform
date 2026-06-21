import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { getAllSites } from '@/lib/platform/content'
import {
  hasDomainDatabase,
  listDomainRecordsDb,
  seedInitialDomainRecords,
  upsertDomainRecordDb,
} from '@/lib/platform/domain-db'
import { listDomainRecords, upsertDomainRecord } from '@/lib/platform/store'
import { addDomainToVercel, isVercelConfigured, listProjectDomainsOnVercel } from '@/lib/platform/vercel'

export const runtime = 'nodejs'

function inferSiteSlug(domain, sites, existing) {
  if (existing?.siteSlug) {
    return existing.siteSlug
  }

  const site = sites.find(
    (candidate) => candidate.primaryDomain === domain || candidate.aliases?.includes(domain),
  )

  return site?.slug || 'unassigned'
}

function inferTier(record, existing) {
  if (existing?.tier) {
    return existing.tier
  }

  return record.redirectTarget ? 'redirect' : 'landing'
}

export async function GET() {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  if (hasDomainDatabase()) {
    await seedInitialDomainRecords()
  }

  const localDomains = hasDomainDatabase() ? await listDomainRecordsDb() : listDomainRecords()

  if (!isVercelConfigured()) {
    return NextResponse.json({ domains: localDomains, source: 'local' })
  }

  try {
    const sites = getAllSites()
    const localByDomain = new Map(localDomains.map((record) => [record.domain, record]))
    const vercelDomains = await listProjectDomainsOnVercel()

    const syncedDomains = vercelDomains.map((record) => {
      const existing = localByDomain.get(record.domain)

      const nextRecord = {
        ...existing,
        domain: record.domain,
        siteSlug: inferSiteSlug(record.domain, sites, existing),
        tier: inferTier(record, existing),
        redirectTarget: record.redirectTarget ?? existing?.redirectTarget ?? null,
        projectId: record.projectId ?? existing?.projectId ?? null,
        verified: record.verified,
        verificationStatus: record.verificationStatus,
        dnsInstructions: record.dnsInstructions,
        apexName: record.apexName ?? existing?.apexName ?? null,
        gitBranch: record.gitBranch ?? existing?.gitBranch ?? null,
        source: existing ? 'merged' : 'vercel',
      }

      return hasDomainDatabase() ? upsertDomainRecordDb(nextRecord) : upsertDomainRecord(nextRecord)
    })

    const resolvedSyncedDomains = hasDomainDatabase() ? await Promise.all(syncedDomains) : syncedDomains

    const localOnly = localDomains
      .filter((record) => !vercelDomains.some((domain) => domain.domain === record.domain))
      .map((record) => ({
        ...record,
        verified: false,
        verificationStatus: record.tier === 'redirect' ? 'redirect-only' : 'not-added',
        source: record.source || 'local',
        dnsInstructions:
          record.tier === 'redirect'
            ? []
            : [
                {
                  type: 'INFO',
                  domain: record.domain,
                  value: 'Not currently attached to the configured Vercel project.',
                  reason: 'Add the domain from this screen to create it in Vercel.',
                },
              ],
      }))

    return NextResponse.json({
      domains: [...resolvedSyncedDomains, ...localOnly].sort((a, b) => a.domain.localeCompare(b.domain)),
      source: 'vercel',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sync domains from Vercel.'

    console.error('Domain sync from Vercel failed.', {
      message,
    })

    return NextResponse.json({
      domains: localDomains,
      source: 'local',
      syncError: message,
    })
  }
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) return unauthorized

  const body = await request.json()
  const result = await addDomainToVercel(body)

  const persisted = hasDomainDatabase()
    ? await upsertDomainRecordDb({
        domain: body.domain,
        siteSlug: body.siteSlug,
        tier: body.redirectTarget ? 'redirect' : 'landing',
        redirectTarget: body.redirectTarget || null,
        projectId: result.projectId,
        verified: result.verified,
        verificationStatus: result.verificationStatus,
        dnsInstructions: result.dnsInstructions,
      })
    : upsertDomainRecord({
        domain: body.domain,
        siteSlug: body.siteSlug,
        tier: body.redirectTarget ? 'redirect' : 'landing',
        redirectTarget: body.redirectTarget || null,
        projectId: result.projectId,
        verified: result.verified,
        verificationStatus: result.verificationStatus,
        dnsInstructions: result.dnsInstructions,
      })

  return NextResponse.json({ domain: persisted }, { status: 201 })
}
