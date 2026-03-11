import {
  buildMetadataForCurrentSite,
  renderCurrentSitePage,
} from '@/lib/platform/site-page'

export async function generateMetadata({ params }) {
  const { serviceSlug } = await params

  return buildMetadataForCurrentSite(['services', serviceSlug])
}

export default async function ServiceDetailPage({ params }) {
  const { serviceSlug } = await params

  return renderCurrentSitePage(['services', serviceSlug])
}
