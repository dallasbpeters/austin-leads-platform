import { groq } from 'next-sanity'

import { sanityServerClient } from '@/sanity/client'

const cardProjection = groq`{
  _id,
  fullName,
  pronouns,
  jobTitle,
  business,
  bio,
  "slug": slug.current,
  photo,
  logo,
  cover,
  site->{ name, "slug": slug.current, "logo": brand.logo, "domain": primaryDomain },
  phone,
  email,
  website,
  address,
  links[]{ label, url },
  colors
}`

/** Fetch a single digital business card by its slug. Returns null when missing. */
export async function getCardBySlug(slug) {
  if (!sanityServerClient || !slug) {
    return null
  }
  return sanityServerClient.fetch(groq`*[_type == "card" && slug.current == $slug][0]${cardProjection}`, {
    slug,
  })
}

/** Slugs for every published card — used for static params / sitemaps. */
export async function getAllCardSlugs() {
  if (!sanityServerClient) {
    return []
  }
  return sanityServerClient.fetch(groq`*[_type == "card" && defined(slug.current)].slug.current`)
}
