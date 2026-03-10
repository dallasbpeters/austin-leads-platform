import { headers } from "next/headers";
import { notFound } from "next/navigation";

import App from "@/App";
import PublicSite from "@/components/platform/PublicSite";
import {
  createJsonLd,
  getNavigationForSite,
  getHeroHomepageForSite,
  getPageForRequest,
  getPrimaryUrl,
  resolveSiteByHost,
} from "@/lib/platform/content";

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const site = await resolveSiteByHost(host);
  const page = await getPageForRequest(site, slug);

  if (!page) {
    return {
      title: `${site.name} | Page not found`,
    };
  }

  const pathname = slug.length ? `/${slug.join("/")}` : "/";
  const canonical = getPrimaryUrl(site, pathname);

  return {
    title: page.title || site.seo?.title || site.name,
    description: page.description || site.seo?.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.title || site.name,
      description: page.description || site.seo?.description,
      url: canonical,
      siteName: site.name,
      locale: "en_US",
      type: page.pageType === "post" ? "article" : "website",
    },
  };
}

export default async function PublicCatchAllPage({ params }) {
  const { slug = [] } = await params;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const site = await resolveSiteByHost(host);

  if (site.slug === "austin-solar-pros" && slug.length === 0) {
    const heroHomepage = await getHeroHomepageForSite(site.slug);
    const heroSection = heroHomepage?.heroSection ?? null;

    return <App heroSection={heroSection} />;
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
