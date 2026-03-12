import { buildMetadataForCurrentSite, renderCurrentSitePage } from '@/lib/platform/site-page'

export async function generateMetadata() {
  return buildMetadataForCurrentSite(['roofing'])
}

export default async function RoofingPage() {
  return renderCurrentSitePage(['roofing'])
}
