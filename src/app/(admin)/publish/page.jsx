import PublishClient from '@/components/admin/publish-client'
import { getAllRenderableSites } from '@/lib/platform/content'
import { ensurePublishJobsTable, hasPublishDatabase, listPublishJobs } from '@/lib/platform/publish-db'
import { hasPublishGenerator } from '@/lib/platform/publish-generate'

export const dynamic = 'force-dynamic'

export default async function PublishPage() {
  const dbConfigured = hasPublishDatabase()
  let initialJobs = []
  let dbError = null

  if (dbConfigured) {
    try {
      await ensurePublishJobsTable()
      initialJobs = await listPublishJobs()
    } catch (error) {
      dbError = { message: error?.message || String(error) }
      console.error('[publish] failed to load jobs', error)
    }
  }

  return (
    <PublishClient
      dbConfigured={dbConfigured}
      dbError={dbError}
      generatorConfigured={hasPublishGenerator()}
      initialJobs={initialJobs}
      sites={getAllRenderableSites()}
    />
  )
}
