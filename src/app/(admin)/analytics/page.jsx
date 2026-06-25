import AnalyticsClient from '@/components/admin/analytics-client'
import { getGoogleAnalyticsSnapshot } from '@/lib/analytics/google'
import { getAllRenderableSites } from '@/lib/platform/content'
import { getAnalyticsOverview, getAnalyticsProviders, listAnalyticsGoals } from '@/lib/platform/store'

export default async function AnalyticsPage() {
  return (
    <AnalyticsClient
      overview={getAnalyticsOverview()}
      providers={getAnalyticsProviders()}
      gaSnapshot={await getGoogleAnalyticsSnapshot()}
      goals={listAnalyticsGoals()}
      sites={getAllRenderableSites()}
    />
  )
}
