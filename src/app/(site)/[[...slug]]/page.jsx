import {
  buildMetadataForCurrentSite,
  renderCurrentSitePage,
} from "@/lib/platform/site-page";

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  return buildMetadataForCurrentSite(slug);
}

export default async function PublicCatchAllPage({ params }) {
  const { slug = [] } = await params;
  return renderCurrentSitePage(slug);
}
