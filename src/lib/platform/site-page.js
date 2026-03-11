import { headers } from "next/headers";
import { notFound } from "next/navigation";

import App from "@/App";
import PublicSite from "@/components/platform/PublicSite";
import {
  createJsonLd,
  getHomepageForSite,
  getHeroHomepageForSite,
  getNavigationForSite,
  getPageForRequest,
  getPrimaryUrl,
  isPrimarySiteSlug,
  resolveSiteByHost,
} from "@/lib/platform/content";

export async function buildMetadataForCurrentSite(slugParts = []) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const site = await resolveSiteByHost(host);
  const page = await getPageForRequest(site, slugParts);
  const normalizedHost = (host || "").toLowerCase();
  const isIndexableHost =
    normalizedHost === site.primaryDomain ||
    site.aliases?.includes(normalizedHost) ||
    normalizedHost === `www.${site.primaryDomain}`;

  if (!page) {
    return {
      title: `${site.name} | Page not found`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const pathname = slugParts.length ? `/${slugParts.join("/")}` : "/";
  const canonical = getPrimaryUrl(site, pathname);
  const title = page.seo?.title || page.title || site.seo?.title || site.name;
  const description = page.seo?.description || page.description || site.seo?.description;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: "en_US",
      type: page.pageType === "post" ? "article" : "website",
    },
    robots: {
      index: isIndexableHost,
      follow: isIndexableHost,
    },
  };
}

export async function renderCurrentSitePage(slugParts = []) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const site = await resolveSiteByHost(host);

  if (isPrimarySiteSlug(site.slug) && slugParts.length === 0) {
    const homepage = await getHomepageForSite(site.slug);
    const heroHomepage = await getHeroHomepageForSite(site.slug);
    const heroSection =
      homepage?.heroSection ??
      heroHomepage?.heroSection ??
      homepage?.sections?.find((section) => section.type === 'hero') ??
      null;
    const resourcesSection =
      homepage?.sections?.find((section) => section._type === "resourceGridSection") ??
      homepage?.sections?.find((section) => section.type === "resourceGrid") ??
      homepage?.sections?.find((section) => section.type === "resources") ??
      null;
    const jsonLd = createJsonLd(site, homepage || heroHomepage, "/");

    return <App heroSection={heroSection} resourcesSection={resourcesSection} site={site} jsonLd={jsonLd} />;
  }

  const page = await getPageForRequest(site, slugParts);

  if (!page) {
    notFound();
  }

  const pathname = slugParts.length ? `/${slugParts.join("/")}` : "/";

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
