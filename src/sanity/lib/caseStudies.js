import { groq } from 'next-sanity'

import { fetchWithPublishedFallback, getSanityReadContext, sectionProjection } from '@/lib/platform/content'
import { withSectionKeys } from '@/lib/sanity/keys'

/** Everything the projects index needs for one card. Deliberately small. */
const caseStudyCardProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  location,
  dek,
  heroImage,
  "keyStat": keyStats[0]
}`

/** The full article. Arrays keep _key so Visual Editing overlays can target rows. */
const caseStudyProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  location,
  dek,
  heroImage,
  site->{ name, "slug": slug.current, "domain": primaryDomain },
  crew[]{ _key, name, initials, role },
  keyStats[]{ _key, value, label },
  drivewayNotes[]{ _key, seenFromGround, foundOnRoof },
  fieldNotes[]{
    _key,
    day,
    time,
    note,
    outcome,
    author{ name, initials, role }
  },
  specGroups[]{
    _key,
    group,
    summary,
    rows[]{ _key, component, specification, codeRef, rationale }
  },
  codeEditions,
  timeline[]{ _key, date, title, detail },
  billing[]{ _key, month, kWhUsed, kWhProduced, costWithout, costPaid },
  billingNote,
  limits[]{ _key, claim, reality },
  relatedProjects[]->${caseStudyCardProjection},
  sections[]{
    ${sectionProjection}
  }
}`

/**
 * One case study, scoped to a site so a slug collision across tenants can never
 * serve the wrong job. Returns null when missing or when Sanity is unconfigured.
 */
export async function getCaseStudyBySlug(siteSlug, slug) {
  const { client, fetchOptions, isDraft } = await getSanityReadContext({ stega: true })

  if (!client || !siteSlug || !slug) {
    return null
  }

  const caseStudy = await fetchWithPublishedFallback({
    client,
    isDraft,
    query: groq`*[_type == "caseStudy" && slug.current == $slug && site->slug.current == $siteSlug][0]${caseStudyProjection}`,
    params: { siteSlug, slug },
    fetchOptions,
  })

  if (!caseStudy) {
    return null
  }

  // Same normalisation pages get: maps each `_type` to the short `type` the
  // renderer map is keyed by, and backfills `_key` where one is missing.
  return {
    ...caseStudy,
    sections: withSectionKeys(caseStudy.sections),
  }
}

/** Newest first. The first result is the featured lead on the projects index. */
export async function getCaseStudiesForSite(siteSlug, { limit = 12 } = {}) {
  const { client, fetchOptions, isDraft } = await getSanityReadContext({ stega: true })

  if (!client || !siteSlug) {
    return []
  }

  const results = await fetchWithPublishedFallback({
    client,
    isDraft,
    query: groq`*[_type == "caseStudy" && site->slug.current == $siteSlug && defined(slug.current)]
      | order(publishedAt desc)[0...$limit]${caseStudyCardProjection}`,
    params: { siteSlug, limit },
    fetchOptions,
  })

  return Array.isArray(results) ? results : []
}

/** Slugs for static params and sitemap entries. Published only, by design. */
export async function getCaseStudySlugsForSite(siteSlug) {
  const { client } = await getSanityReadContext({ stega: false })

  if (!client || !siteSlug) {
    return []
  }

  const slugs = await client.fetch(
    groq`*[_type == "caseStudy" && site->slug.current == $siteSlug && defined(slug.current)].slug.current`,
    { siteSlug },
    { next: { revalidate: 60 } },
  )

  return Array.isArray(slugs) ? slugs : []
}

/**
 * Averages for the bill table footer. Computed here rather than stored, so an
 * editor can never type a total that disagrees with its own rows.
 */
export function summarizeBilling(billing = []) {
  const rows = billing.filter(Boolean)
  if (!rows.length) {
    return null
  }
  const mean = (key) => {
    const values = rows.map((row) => row[key]).filter((value) => typeof value === 'number')
    if (!values.length) {
      return null
    }
    return Math.round(values.reduce((total, value) => total + value, 0) / values.length)
  }
  return {
    months: rows.length,
    kWhUsed: mean('kWhUsed'),
    kWhProduced: mean('kWhProduced'),
    costWithout: mean('costWithout'),
    costPaid: mean('costPaid'),
  }
}
