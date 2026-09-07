import { createClient } from 'next-sanity'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-10-21',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
})
const r = await client.fetch(
  `*[_type in ["page","servicePage","locationPage"] && !(_id in path("drafts.**"))]{"slug": slug.current, "site": coalesce(site->slug.current, siteSlug), "types": array::unique(sections[]._type)}[count(types[@ in ["gallerySection","videoSection","serviceGridSection"]]) > 0]{slug, site, "has": types[@ in ["gallerySection","videoSection","serviceGridSection"]]}`,
)
console.log(JSON.stringify(r))
