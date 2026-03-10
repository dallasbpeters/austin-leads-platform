import { headers } from "next/headers";
import { groq } from "next-sanity";

import { sanityServerClient, sanityWriteClient } from "@/sanity/client";
import { pages, sites } from "./fixtures";
import { defaultLaunchChecklist } from "./launchChecklist";
import { withSectionKeys } from "@/lib/sanity/keys";

function normalizeHost(host) {
  return (host || "").replace(/^https?:\/\//, "").replace(/:\d+$/, "").toLowerCase();
}

export function getAllSites() {
  return sites;
}

export function getAllRenderableSites() {
  return sites.filter((site) => site.tier !== "redirect");
}

export function getHeroSites() {
  return sites.filter((site) => site.tier === "hero");
}

export function getSiteById(siteId) {
  return sites.find((site) => site.id === siteId) ?? null;
}

export function getSiteBySlug(siteSlug) {
  return sites.find((site) => site.slug === siteSlug) ?? null;
}

export async function resolveSiteBySlug(siteSlug) {
  const localSite = getSiteBySlug(siteSlug);

  if (!sanityServerClient) {
    return localSite;
  }

  try {
    const site = await sanityServerClient.fetch(
      groq`*[_type == "site" && slug.current == $siteSlug][0]{
        _id,
        "id": _id,
        "slug": slug.current,
        name,
        shortName,
        category,
        categoryLabel,
        tier,
        primaryDomain,
        aliases,
        redirectTarget,
        leadForm,
        seo,
        brand,
        organization
      }`,
      { siteSlug },
      { cache: "no-store" },
    );

    return site ?? localSite ?? null;
  } catch {
    return localSite ?? null;
  }
}

export function getPageKey(slugParts = []) {
  if (!slugParts.length) {
    return "";
  }

  return slugParts.join("/");
}

export function getPagesForSite(siteSlug) {
  return pages.filter((page) => page.siteSlug === siteSlug);
}

export function getPageForSite(siteSlug, slugParts = []) {
  return (
    pages.find((page) => page.siteSlug === siteSlug && page.slug === getPageKey(slugParts)) ?? null
  );
}

function toHeroPageRecord(page, site) {
  if (!page || !site || site.tier !== "hero" || page.templateLevel !== "hero") {
    return null;
  }

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    pageType: page.pageType,
    templateLevel: page.templateLevel,
    site: {
      id: site.id,
      slug: site.slug,
      name: site.name,
      primaryDomain: site.primaryDomain,
      tier: site.tier,
    },
    heroSection: page.sections?.find((section) => section.type === "hero") ?? null,
  };
}

export function getNavigationForSite(siteSlug) {
  return getPagesForSite(siteSlug)
    .filter((page) => page.slug !== "")
    .map((page) => ({
      label: page.title.replace(/^Austin Solar /, "").replace(/^Austin /, ""),
      href: page.slug.startsWith("blog/") ? `/${page.slug}` : `/${page.slug}`,
    }));
}

export async function resolveSiteByHost(host) {
  const normalizedHost = normalizeHost(host);

  const localSite =
    sites.find(
      (site) =>
        site.primaryDomain === normalizedHost ||
        site.aliases?.includes(normalizedHost) ||
        (normalizedHost.endsWith(".vercel.app") && site.slug === "austin-solar-pros"),
    ) ?? null;

  if (!sanityServerClient) {
    return localSite ?? getSiteBySlug("austin-solar-pros");
  }

  try {
    const site = await sanityServerClient.fetch(
      groq`*[_type == "site" && ($host == primaryDomain || $host in aliases)][0]{
        _id,
        "id": _id,
        "slug": slug.current,
        name,
        shortName,
        category,
        categoryLabel,
        tier,
        primaryDomain,
        aliases,
        redirectTarget,
        leadForm,
        seo,
        brand,
        organization
      }`,
      { host: normalizedHost },
      { next: { revalidate: 60 } },
    );

    return site ?? localSite ?? getSiteBySlug("austin-solar-pros");
  } catch {
    return localSite ?? getSiteBySlug("austin-solar-pros");
  }
}

export async function resolveCurrentSite() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  return resolveSiteByHost(host);
}

export async function getPageForRequest(site, slugParts = []) {
  const localPage = getPageForSite(site.slug, slugParts);

  if (!sanityServerClient) {
    return localPage;
  }

  try {
    const page = await sanityServerClient.fetch(
      groq`*[_type in ["page", "servicePage", "locationPage", "post"] && site->slug.current == $siteSlug && slug.current == $slug][0]{
        _id,
        "id": _id,
        title,
        description,
        pageType,
        templateLevel,
        "slug": slug.current,
        sections
      }`,
      { siteSlug: site.slug, slug: getPageKey(slugParts) || "/" },
      { next: { revalidate: 60 } },
    );

    if (page) {
      return {
        ...page,
        slug: page.slug === "/" ? "" : page.slug,
      };
    }
  } catch {}

  return localPage;
}

export async function getHeroPages() {
  const localHeroPages = pages
    .map((page) => toHeroPageRecord(page, getSiteBySlug(page.siteSlug)))
    .filter(Boolean);

  if (!sanityServerClient) {
    return localHeroPages;
  }

  try {
    const heroPages = await sanityServerClient.fetch(
      groq`*[
        _type in ["page", "servicePage", "locationPage"] &&
        templateLevel == "hero" &&
        defined(site) &&
        site->tier == "hero"
      ] | order(site->name asc, title asc) {
        _id,
        "id": _id,
        title,
        pageType,
        templateLevel,
        "slug": select(slug.current == "/" => "", slug.current),
        site->{
          _id,
          "id": _id,
          "slug": slug.current,
          name,
          primaryDomain,
          tier
        },
        "heroSection": sections[type == "hero"][0]{
          _key,
          type,
          eyebrow,
          title,
          body,
          heroTextColor,
          heroOverlayColor,
          heroOverlayStartColor,
          heroOverlayEndColor,
          heroOverlayDirection,
          heroOverlayStartOpacity,
          heroOverlayEndOpacity,
          heroOverlayOpacity,
          metrics,
          items,
          ctaLabel,
          ctaHref,
          heroImage
        }
      }`,
      {},
      { cache: "no-store" },
    );

    return Array.isArray(heroPages) ? heroPages : localHeroPages;
  } catch {
    return localHeroPages;
  }
}

export async function getLaunchChecklist() {
  if (!sanityServerClient) {
    return defaultLaunchChecklist;
  }

  try {
    const checklist = await sanityServerClient.fetch(
      groq`*[_type == "launchChecklist"] | order(_updatedAt desc)[0]{
        _id,
        title,
        summary,
        sections[]{
          _key,
          title,
          description,
          tasks[]{
            _key,
            title,
            notes,
            status,
            owner,
            priority
          }
        }
      }`,
      {},
      { cache: "no-store" },
    );

    return checklist ?? defaultLaunchChecklist;
  } catch {
    return defaultLaunchChecklist;
  }
}

export async function getHeroHomepageForSite(siteSlug) {
  const heroPages = await getHeroPages();
  const sitePages = heroPages.filter((page) => page.site?.slug === siteSlug);

  const isHomepage = (page) => page.pageType === "home" || page.slug === "" || page.slug === "/";
  const hasHeroImage = (page) => Boolean(page?.heroSection?.heroImage?.urls?.regular || page?.heroSection?.heroImage?.urls?.small);

  return (
    sitePages.find((page) => isHomepage(page) && hasHeroImage(page)) ||
    sitePages.find((page) => hasHeroImage(page)) ||
    sitePages.find((page) => isHomepage(page)) ||
    sitePages[0] ||
    null
  );
}

export async function getHeroSitesForAdmin() {
  const localHeroSites = getHeroSites().map((site) => ({
    id: site.id,
    slug: site.slug,
    name: site.name,
    primaryDomain: site.primaryDomain,
    tier: site.tier,
    source: "fixture",
  }));

  if (!sanityServerClient) {
    return localHeroSites;
  }

  try {
    const heroSites = await sanityServerClient.fetch(
      groq`*[_type == "site" && tier == "hero"] | order(name asc) {
        _id,
        "id": _id,
        "slug": slug.current,
        name,
        primaryDomain,
        tier
      }`,
      {},
      { cache: "no-store" },
    );

    if (Array.isArray(heroSites) && heroSites.length) {
      return heroSites.map((site) => ({
        ...site,
        source: "sanity",
      }));
    }
  } catch {}

  return localHeroSites;
}

export function getPrimaryUrl(site, pathname = "/") {
  const safePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `https://${site.primaryDomain}${safePath}`;
}

export function createJsonLd(site, page, pathname = "/") {
  const base = {
    "@context": "https://schema.org",
    "@type": site.organization?.type || "LocalBusiness",
    name: site.organization?.name || site.name,
    url: getPrimaryUrl(site, pathname),
    telephone: site.organization?.phone,
    email: site.organization?.email,
    areaServed: site.organization?.serviceArea,
  };

  if (page?.pageType === "post") {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.description,
      about: site.categoryLabel,
      publisher: {
        "@type": "Organization",
        name: site.name,
      },
      mainEntityOfPage: getPrimaryUrl(site, pathname),
    };
  }

  const faqSection = page?.sections?.find((section) => section.type === "faq");

  if (faqSection) {
    return [
      base,
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqSection.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ];
  }

  return base;
}

export async function publishPageToSanity(job) {
  if (!sanityWriteClient) {
    return {
      ok: false,
      mode: "placeholder",
      message:
        "Sanity write credentials are not configured yet. The job was marked as published locally only.",
    };
  }

  const slug = job.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const document = {
    _type: job.contentType === "post" ? "post" : "page",
    title: job.title,
    description: job.prompt,
    pageType: job.contentType,
    templateLevel: job.siteSlug === "austin-solar-pros" ? "hero" : "landing",
    slug: {
      _type: "slug",
      current: job.contentType === "post" ? `blog/${slug}` : slug,
    },
    sections: withSectionKeys([
      {
        _type: "object",
        type: "hero",
        eyebrow: "Published from queue",
        title: job.title,
        body: job.output || job.prompt,
      },
    ]),
  };

  const result = await sanityWriteClient.create(document);

  return {
    ok: true,
    mode: "sanity",
    message: "Draft published to Sanity.",
    documentId: result._id,
  };
}
