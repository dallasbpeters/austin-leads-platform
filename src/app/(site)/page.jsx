import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

export async function generateMetadata() {
  return buildMetadataForCurrentSite([])
}

export default async function HomePage() {
  return renderCurrentSitePage([])
}
