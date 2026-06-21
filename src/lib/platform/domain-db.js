import { getSql, hasDatabaseUrl } from '../db/pool.js'
import { initialDomainRecords } from './fixtures.js'

export function hasDomainDatabase() {
  return hasDatabaseUrl()
}

function normalizeDomainRow(row) {
  if (!row) {
    return row
  }

  return {
    ...row,
    redirectTarget: row.redirect_target,
    siteSlug: row.site_slug,
    projectId: row.project_id,
    verificationStatus: row.verification_status,
    dnsInstructions:
      typeof row.dns_instructions === 'string'
        ? JSON.parse(row.dns_instructions)
        : row.dns_instructions || [],
    apexName: row.apex_name,
    gitBranch: row.git_branch,
    lastCheckedAt: row.last_checked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function ensureDomainRecordsTable() {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS domain_records (
      domain TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      site_slug TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'landing',
      redirect_target TEXT,
      project_id TEXT,
      verified BOOLEAN NOT NULL DEFAULT false,
      verification_status TEXT NOT NULL DEFAULT 'pending',
      dns_instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
      apex_name TEXT,
      git_branch TEXT,
      source TEXT NOT NULL DEFAULT 'local'
    )
  `
}

export async function seedInitialDomainRecords() {
  if (!hasDomainDatabase()) {
    return
  }

  await ensureDomainRecordsTable()

  for (const record of initialDomainRecords) {
    await upsertDomainRecordDb(record)
  }
}

export async function listDomainRecordsDb() {
  const sql = getSql()
  await ensureDomainRecordsTable()

  const rows = await sql`
    SELECT *
    FROM domain_records
    ORDER BY domain ASC
  `

  return rows.map(normalizeDomainRow)
}

export async function getDomainRecordDb(domain) {
  const sql = getSql()
  await ensureDomainRecordsTable()

  const [row] = await sql`
    SELECT *
    FROM domain_records
    WHERE domain = ${domain}
    LIMIT 1
  `

  return normalizeDomainRow(row)
}

export async function upsertDomainRecordDb(domainRecord) {
  const sql = getSql()
  await ensureDomainRecordsTable()

  const [row] = await sql`
    INSERT INTO domain_records (
      domain,
      site_slug,
      tier,
      redirect_target,
      project_id,
      verified,
      verification_status,
      dns_instructions,
      apex_name,
      git_branch,
      source
    )
    VALUES (
      ${domainRecord.domain},
      ${domainRecord.siteSlug || 'unassigned'},
      ${domainRecord.tier || (domainRecord.redirectTarget ? 'redirect' : 'landing')},
      ${domainRecord.redirectTarget || null},
      ${domainRecord.projectId || null},
      ${Boolean(domainRecord.verified)},
      ${domainRecord.verificationStatus || (domainRecord.redirectTarget ? 'redirect-only' : 'pending')},
      ${JSON.stringify(domainRecord.dnsInstructions || [])}::jsonb,
      ${domainRecord.apexName || null},
      ${domainRecord.gitBranch || null},
      ${domainRecord.source || 'local'}
    )
    ON CONFLICT (domain)
    DO UPDATE SET
      updated_at = NOW(),
      last_checked_at = NOW(),
      site_slug = EXCLUDED.site_slug,
      tier = EXCLUDED.tier,
      redirect_target = EXCLUDED.redirect_target,
      project_id = EXCLUDED.project_id,
      verified = EXCLUDED.verified,
      verification_status = EXCLUDED.verification_status,
      dns_instructions = EXCLUDED.dns_instructions,
      apex_name = EXCLUDED.apex_name,
      git_branch = EXCLUDED.git_branch,
      source = EXCLUDED.source
    RETURNING *
  `

  return normalizeDomainRow(row)
}

export async function updateDomainRecordDb(domain, patch) {
  const existing = await getDomainRecordDb(domain)

  if (!existing) {
    return null
  }

  return upsertDomainRecordDb({
    ...existing,
    ...patch,
    domain,
  })
}

export async function deleteDomainRecordDb(domain) {
  const sql = getSql()
  await ensureDomainRecordsTable()

  const [row] = await sql`
    DELETE FROM domain_records
    WHERE domain = ${domain}
    RETURNING *
  `

  return normalizeDomainRow(row)
}
