import { groq } from 'next-sanity'

import { sanityClient } from '@/sanity/client'

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
  phone,
  email,
  website,
  address,
  links[]{ label, url },
  colors
}`

/** Fetch a single digital business card by its slug. Returns null when missing. */
export async function getCardBySlug(slug) {
  if (!sanityClient || !slug) {
    return null
  }
  return sanityClient.fetch(groq`*[_type == "card" && slug.current == $slug][0]${cardProjection}`, { slug })
}

/** Slugs for every published card — used for static params / sitemaps. */
export async function getAllCardSlugs() {
  if (!sanityClient) {
    return []
  }
  return sanityClient.fetch(groq`*[_type == "card" && defined(slug.current)].slug.current`)
}
