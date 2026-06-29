import { createClient } from 'next-sanity'
import { createReadStream, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Load .env.local without requiring dotenv
try {
  const envPath = resolve(import.meta.dirname, '..', '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) {
      continue
    }
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replaceAll(/^["']|["']$/g, '')
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
} catch {
  // .env.local not found — rely on existing env vars
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing Sanity env. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.',
  )
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// First card: Kathie Millen, ported from the original static /kathie microsite.
const kathie = {
  _id: 'card.kathie',
  _type: 'card',
  fullName: 'Kathie Millen',
  slug: { _type: 'slug', current: 'kathie' },
  jobTitle: 'Owner',
  business: 'Texas Solar & Roofing Pros',
  bio: 'Texas Solar and Roofing Pros is a leading provider of roofing and solar solutions in Texas. With a commitment to quality craftsmanship and customer satisfaction, the company specializes in both traditional roofing services and innovative solar panel installations.',
  phone: '+15127750561',
  website: 'https://texassolarandroofingpros.com',
  address: {
    street: '1700 Pagedale Cove',
    city: 'Cedar Park',
    state: 'Texas',
    postal: '78613',
    country: 'USA',
  },
  colors: {
    logoBg: '#01064A',
    mainBg: '#F9FAFB',
    buttonBg: '#000033',
    cardBg: '#E5E7EB',
  },
}

async function main() {
  const existing = await client.getDocument(kathie._id).catch(() => null)

  let photoAssetId = existing?.photo?.asset?._ref ?? null
  if (!photoAssetId) {
    const photoPath = resolve(import.meta.dirname, '..', 'public', 'kathie', 'photo.png')
    console.log('Uploading profile photo…')
    const asset = await client.assets.upload('image', createReadStream(photoPath), {
      filename: 'kathie-millen.png',
    })
    photoAssetId = asset._id
  }

  const doc = {
    ...kathie,
    photo: { _type: 'image', asset: { _type: 'reference', _ref: photoAssetId } },
  }

  await client.createOrReplace(doc)
  console.log(`✓ Seeded card "${kathie.fullName}" → /cards/${kathie.slug.current}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
