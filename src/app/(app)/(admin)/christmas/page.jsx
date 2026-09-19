import ChristmasJobsClient from '@/components/admin/christmas-jobs-client'
import { ensureChristmasTables, listJobs } from '@/lib/christmas/db'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Christmas Lights — Jobs' }

export default async function ChristmasJobsPage() {
  let jobs = []

  try {
    await ensureChristmasTables()
    jobs = await listJobs({ limit: 500 })
  } catch (error) {
    console.error('[christmas/page] db error:', error)
  }

  return <ChristmasJobsClient jobs={jobs} />
}
