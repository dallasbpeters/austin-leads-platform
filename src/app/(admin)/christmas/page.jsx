import { ensureChristmasTables, getJobsOverview, listJobs } from '@/lib/christmas/db'
import ChristmasJobsClient from '@/components/admin/ChristmasJobsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Christmas Lights — Jobs' }

const STATUS_COLORS = {
  booked:    'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  installed: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

export default async function ChristmasJobsPage() {
  let jobs = []
  let overview = {
    total: 0, booked: 0, confirmed: 0, installed: 0, completed: 0, cancelled: 0,
    deposits_collected_cents: 0, balances_outstanding: 0,
  }

  try {
    await ensureChristmasTables()
    const [jobsResult, overviewResult] = await Promise.all([
      listJobs({ limit: 200 }),
      getJobsOverview(),
    ])
    jobs = jobsResult
    overview = overviewResult
  } catch (err) {
    console.error('[christmas/page] db error:', err)
  }

  return (
    <ChristmasJobsClient
      jobs={jobs}
      overview={overview}
      statusColors={STATUS_COLORS}
    />
  )
}
