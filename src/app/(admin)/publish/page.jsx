import PublishClient from '@/components/admin/PublishClient'
import { getAllRenderableSites } from '@/lib/platform/content'
import { listPublishJobs } from '@/lib/platform/store'

export default function PublishPage() {
  return <PublishClient initialJobs={listPublishJobs()} sites={getAllRenderableSites()} />
}
