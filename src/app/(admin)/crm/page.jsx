import CrmClient from '@/components/admin/crm-client'
import {
  ensureLeadSubmissionsTable,
  getLeadPipelineSummary,
  getLeadSubmissionOverview,
  hasLeadDatabase,
  listLeadSubmissions,
} from '@/lib/leads/db'

export const metadata = {
  title: 'CRM | Austin Leads Platform',
}

export default async function CrmPage() {
  let leadDbReady = false
  let initialOverview = {
    total: 0,
    last_30_days: 0,
    open: 0,
    qualified: 0,
    inspections: 0,
    quoted: 0,
    won: 0,
  }
  let initialPipeline = []
  let initialLeads = []
  const dbConfigured = hasLeadDatabase()
  let dbError = null

  if (dbConfigured) {
    try {
      await ensureLeadSubmissionsTable()
      const [overview, pipeline, leads] = await Promise.all([
        getLeadSubmissionOverview(),
        getLeadPipelineSummary(),
        listLeadSubmissions({ limit: 100 }),
      ])

      initialOverview = overview
      initialPipeline = pipeline
      initialLeads = leads
      leadDbReady = true
    } catch (error) {
      leadDbReady = false
      dbError = serializeCrmError(error)
      console.error('[crm] failed to load lead database', error)
    }
  }

  return (
    <CrmClient
      initialOverview={initialOverview}
      initialPipeline={initialPipeline}
      initialLeads={initialLeads}
      leadDbReady={leadDbReady}
      dbConfigured={dbConfigured}
      dbError={dbError}
    />
  )
}

function serializeCrmError(error) {
  if (!error) return null
  const message = error?.message || String(error)
  const code = error?.code || error?.name || null
  const cause = error?.cause?.message || error?.cause?.code || null
  return { message, code, cause }
}
