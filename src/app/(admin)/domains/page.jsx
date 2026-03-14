import DomainsClient from '@/components/admin/DomainsClient'
import { hasDomainDatabase, listDomainRecordsDb, seedInitialDomainRecords } from '@/lib/platform/domain-db'
import { getAllRenderableSites } from '@/lib/platform/content'
import { listDomainRecords } from '@/lib/platform/store'
import { isVercelConfigured } from '@/lib/platform/vercel'

export default async function DomainsPage() {
  let initialDomains = listDomainRecords()

  if (hasDomainDatabase()) {
    try {
      await seedInitialDomainRecords()
      initialDomains = await listDomainRecordsDb()
    } catch {
      initialDomains = listDomainRecords()
    }
  }

  return (
    <DomainsClient
      initialDomains={initialDomains}
      sites={getAllRenderableSites()}
      vercelEnabled={isVercelConfigured()}
    />
  )
}
