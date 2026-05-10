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

const BANNED_TERMS = [
  /federal tax credit/i,
  /residential clean energy credit/i,
  /investment tax credit/i,
  /\bITC\b/i,
  /30 percent federal/i,
  /30% federal/i,
]

const STRING_REPLACEMENTS = [
  ['Tax-credit assumptions in the loan structure', 'Re-amortization assumptions in the loan structure'],
  [
    'Ask what happens if the tax credit is not applied to the loan',
    'Ask what happens without the projected early paydown',
  ],
  [
    'Watch for quotes still referencing the federal tax credit',
    'Watch for quotes using outdated incentive math',
  ],
  ['The federal solar tax credit has expired', 'Outdated incentive claims still show up in quotes'],
  ['Is the federal solar tax credit still available?', 'How do I know if an incentive claim is current?'],
  ['Federal tax credit', 'Current incentives'],
  ['The federal residential solar tax credit expired at the end of 2025. ', ''],
  ['The 30 percent federal residential clean energy credit expired at the end of 2025. ', ''],
  ['The 30 percent federal credit expired at the end of 2025. ', ''],
  ['With the federal tax credit no longer available, ', ''],
  ['The federal tax credit gets the headlines, but ', ''],
  ['less the 30 percent federal tax credit bringing the effective cost to $16,800', ''],
  [
    'Some solar loans were originally structured around a lump-sum payment from the federal tax credit within 12 to 18 months. That credit expired at the end of 2025, but some lenders and loan products still carry re-amortization terms.',
    'Some solar loans were originally structured around a large early paydown within 12 to 18 months, and some lenders and loan products still carry re-amortization terms.',
  ],
  [
    'Some solar loans assume the homeowner applies the federal tax credit as a lump-sum payment to the loan within 12 to 18 months.',
    'Some solar loans assume the homeowner makes a large early lump-sum payment to the loan within 12 to 18 months.',
  ],
  [
    'If the loan assumes a re-amortization event — where the federal tax credit is applied as a lump sum to reduce the balance — ',
    'If the loan assumes a re-amortization event — where a projected lump sum is applied to reduce the balance — ',
  ],
  [
    'Panels cost 70% less than a decade ago, the federal tax credit covers 30%, and Texas’s deregulated market means you actually benefit from what you produce.',
    'Panels cost far less than they did a decade ago, and Texas’s deregulated market means you actually benefit from what you produce.',
  ],
  [
    "Panels cost 70% less than a decade ago, the federal tax credit covers 30%, and Texas's deregulated market means you actually benefit from what you produce.",
    "Panels cost far less than they did a decade ago, and Texas's deregulated market means you actually benefit from what you produce.",
  ],
  ['The 30% federal tax credit covers nearly a third of the installed cost.', ''],
  [
    'A typical residential system runs $15,000–$30,000 before the 30% tax credit. After the credit, most systems cost $10,500–$21,000.',
    'A typical residential system runs $15,000–$30,000 depending on size, equipment, and roof complexity.',
  ],
  [
    'The ITC covers 30% of everything — panels, batteries, inverter, wiring, labor, and permitting. Dollar-for-dollar credit on your federal taxes.',
    'Installed cost, utility structure, and any incentives you can verify today should drive the decision.',
  ],
  [
    'Your proposal includes panel count, inverter type, battery sizing (if applicable), projected savings, and payback timeline with and without the 30% federal tax credit.',
    'Your proposal includes panel count, inverter type, battery sizing (if applicable), projected savings, and payback timeline under current incentive assumptions.',
  ],
  [
    'Because term length, dealer fees, interest rate, and tax-credit assumptions can all differ while producing a similar monthly number.',
    'Because term length, dealer fees, interest rate, and early-paydown assumptions can all differ while producing a similar monthly number.',
  ],
  [
    'The federal tax credit is the big one, but local utility programs and property-tax exemptions matter too.',
    'Local utility programs and property-tax exemptions matter, but they need to be verified against current rules.',
  ],
]

function containsBannedTerm(value) {
  const text = toPlainText(value)
  return BANNED_TERMS.some((term) => term.test(text))
}

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

function cleanupWhitespace(value) {
  return value
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim()
}

function stripBannedSentences(text) {
  let next = text

  for (const term of BANNED_TERMS) {
    next = next.replace(new RegExp(`[^.!?\\n]*${term.source}[^.!?\\n]*[.!?]?`, 'gi'), ' ')
  }

  return cleanupWhitespace(next)
}

function transformString(value) {
  let next = value

  for (const [from, to] of STRING_REPLACEMENTS) {
    next = next.split(from).join(to)
  }

  if (containsBannedTerm(next)) {
    next = stripBannedSentences(next)
  }

  return cleanupWhitespace(next)
}

function isEmptyPortableText(value) {
  return Array.isArray(value) && value.length === 0
}

function isRemovableContentObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const textFields = ['title', 'question', 'label', 'value', 'body', 'answer']
  return textFields.some((field) => field in value)
}

function isEffectivelyEmptyObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const meaningfulKeys = Object.entries(value).filter(
    ([key]) => !['_key', '_type', 'icon', 'href', 'image', 'imageAsset'].includes(key),
  )
  if (!meaningfulKeys.length) return false

  return meaningfulKeys.every(([, fieldValue]) => {
    if (typeof fieldValue === 'string') return !fieldValue.trim()
    if (Array.isArray(fieldValue)) return fieldValue.length === 0
    return fieldValue == null
  })
}

function transformValue(value) {
  if (typeof value === 'string') {
    return transformString(value)
  }

  if (Array.isArray(value)) {
    const nextItems = value
      .map((item) => transformValue(item))
      .filter((item) => item !== null && item !== undefined)

    return nextItems
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  if (value._type === 'block' && Array.isArray(value.children)) {
    const nextChildren = value.children
      .map((child) => transformValue(child))
      .filter((child) => child && typeof child.text === 'string' && child.text.trim())

    return nextChildren.length ? { ...value, children: nextChildren } : null
  }

  if (value._type === 'span' && typeof value.text === 'string') {
    const nextText = transformString(value.text)
    return nextText ? { ...value, text: nextText } : null
  }

  const next = {}

  for (const [key, child] of Object.entries(value)) {
    const transformed = transformValue(child)
    if (transformed === null || transformed === undefined) continue
    if (typeof transformed === 'string' && !transformed.trim()) continue
    if (Array.isArray(transformed) && transformed.length === 0 && key !== 'markDefs') continue
    next[key] = transformed
  }

  if ('value' in next && typeof next.value === 'string' && containsBannedTerm(next.value)) {
    next.value = 'Current incentives'
  }

  if (isRemovableContentObject(next) && containsBannedTerm(next)) {
    return null
  }

  if ('body' in next && isEmptyPortableText(next.body) && !next.title && !next.question && !next.label) {
    return null
  }

  if ('answer' in next && isEmptyPortableText(next.answer) && !next.question) {
    return null
  }

  if (isEffectivelyEmptyObject(next)) {
    return null
  }

  return next
}

async function main() {
  const docs = await client.fetch(
    `*[_type in ["page", "post", "servicePage", "locationPage"]]{_id,title,sections}`,
  )

  let updated = 0

  for (const doc of docs) {
    if (!containsBannedTerm(doc.sections)) {
      continue
    }

    const nextSections = transformValue(doc.sections)
    if (JSON.stringify(nextSections) === JSON.stringify(doc.sections)) {
      continue
    }

    await client.patch(doc._id).set({ sections: nextSections }).commit({ autoGenerateArrayKeys: false })
    updated += 1
    console.log(`Updated ${doc._id}: ${doc.title || 'Untitled'}`)
  }

  console.log(`Removed tax credit language from ${updated} documents.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
