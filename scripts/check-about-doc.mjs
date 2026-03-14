import { createClient } from 'next-sanity'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const query = `*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  sections[]{
    ...,
    _key,
    _type,
    profileImageAsset{..., asset->},
    badgeImageAsset{..., asset->},
    secondaryProfileImageAsset{..., asset->}
  }
}`

const doc = await client.fetch(query, { slug: 'about' })
console.log(JSON.stringify(doc, null, 2))
