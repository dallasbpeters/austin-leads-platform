import { notFound } from "next/navigation";

import App from "@/App";
import PublicSite from "@/components/platform/PublicSite";
import {
  createJsonLd,
  getNavigationForSite,
  getPageForRequest,
  resolveSiteBySlug,
} from "@/lib/platform/content";

export default async function PreviewSitePage({ params }) {
  const { siteSlug, slug = [] } = await params;
  const site = await resolveSiteBySlug(siteSlug);

  if (!site) {
    notFound();
  }

  if (site.slug === "austin-solar-pros" && slug.length === 0) {
    return <App />;
  }

  const page = await getPageForRequest(site, slug);

  if (!page) {
    notFound();
  }

  const pathname = slug.length ? `/${slug.join("/")}` : "/";

  return (
    <PublicSite
      site={site}
      page={page}
      pathname={pathname}
      navigation={getNavigationForSite(site.slug)}
      jsonLd={createJsonLd(site, page, pathname)}
    />
  );
}
