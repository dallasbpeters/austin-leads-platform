import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

export async function generateMetadata() {
  return buildMetadataForCurrentSite(['solar'])
}

export default async function SolarPage() {
  return renderCurrentSitePage(['solar'])
}
