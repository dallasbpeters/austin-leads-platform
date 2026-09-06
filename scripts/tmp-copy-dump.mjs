import { createClient } from 'next-sanity'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-10-21',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
})
const r = await client.fetch(
  `{"home": *[_id=="EIUGL2ggZiTenNpjp4Ai8z"][0].sections[_type=="ctaSection"][0]{title, ctaLabel}, "hail": *[_id=="page-hail-damage"][0].sections[_type=="ctaBannerSection"][0].title, "svc": *[_id=="page-service-metal-roofing"][0].sections[_type=="ctaSection"][0].title}`,
)
console.log(JSON.stringify(r))
