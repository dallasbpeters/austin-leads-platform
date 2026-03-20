import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-21'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error(
    'Missing Sanity env vars. Expected NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_WRITE_TOKEN.',
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: 'raw',
})

const TERMS = [
  /federal tax credit/i,
  /residential clean energy credit/i,
  /investment tax credit/i,
  /\bITC\b/i,
  /30 percent federal/i,
  /30% federal/i,
]

function toPlainText(value) {
  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    return value.map(toPlainText).filter(Boolean).join(' ')
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  if (value._type === 'block' && Array.isArray(value.children)) {
    return value.children.map((child) => child?.text || '').join('')
  }

  return Object.values(value).map(toPlainText).filter(Boolean).join(' ')
}

function hasMatch(value) {
  const text = toPlainText(value).replace(/\s+/g, ' ').trim()
  if (!text) return false
  return TERMS.some((term) => term.test(text))
}

function walk(value, path, hits) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, hits))
    return
  }

  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && hasMatch(value)) {
      hits.push({ path, value })
    }
    return
  }

  if (hasMatch(value)) {
    hits.push({
      path,
      value: toPlainText(value).replace(/\s+/g, ' ').trim(),
    })
  }

  for (const [key, child] of Object.entries(value)) {
    walk(child, path ? `${path}.${key}` : key, hits)
  }
}

async function main() {
  const docs = await client.fetch(
    `*[_type in ["page", "post", "servicePage", "locationPage"]]{_id,_type,title,slug,sections}`,
  )

  const matches = []

  for (const doc of docs) {
    const hits = []
    walk(doc.sections, 'sections', hits)
    if (hits.length) {
      matches.push({
        id: doc._id,
        type: doc._type,
        title: doc.title,
        slug: doc.slug?.current || doc.slug || '',
        hits,
      })
    }
  }

  console.log(JSON.stringify(matches, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
