import { createClient } from 'next-sanity'
import { randomBytes } from 'node:crypto'
const { PLAN } = await import(process.env.PLAN_PATH || new URL('./copy-plan.mjs', import.meta.url).href)
const DRY = process.argv.includes('--dry')
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-10-21',
  token: DRY ? process.env.SANITY_API_READ_TOKEN : process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
})
const key = () => randomBytes(6).toString('hex')
const PT_FIELDS = new Set(['body', 'subtitle'])
const toPT = (text) => [
  {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), marks: [], text }],
  },
]
const baseIds = [...new Set(PLAN.map((p) => p.doc))]
/* Drafts get the same patch, or publishing a stale draft would undo the change. */
const ids = baseIds.flatMap((id) => [id, `drafts.${id}`])
const docs = Object.fromEntries(
  (await client.fetch('*[_id in $ids]{_id, sections}', { ids })).map((d) => [d._id, d]),
)
const PLAN_WITH_DRAFTS = PLAN.flatMap((entry) =>
  docs[`drafts.${entry.doc}`] ? [entry, { ...entry, doc: `drafts.${entry.doc}` }] : [entry],
)
let problems = 0
const tx = client.transaction()
for (const entry of PLAN_WITH_DRAFTS) {
  const doc = docs[entry.doc]
  if (!doc) {
    console.log('MISSING DOC', entry.doc)
    problems++
    continue
  }
  const matches = (doc.sections || []).filter(
    (s) => s._type === entry.section && (!entry.key || s._key === entry.key),
  )
  if (matches.length !== 1) {
    console.log('SECTION MATCH', matches.length, entry.doc, entry.section, entry.key || '')
    problems++
    continue
  }
  const section = matches[0]
  let base = `sections[_key=="${section._key}"]`
  if (entry.item) {
    const item = (section.items || []).find((i) => i._key === entry.item)
    if (!item) {
      console.log('MISSING ITEM', entry.doc, entry.section, entry.item)
      problems++
      continue
    }
    base += `.items[_key=="${entry.item}"]`
  }
  const set = {}
  for (const [field, value] of Object.entries(entry.set)) {
    if (field === 'actions') {
      value.forEach((a, i) => {
        if (!section.actions?.[i]) {
          console.log('MISSING ACTION', entry.doc, i)
          problems++
          return
        }
        set[`${base}.actions[${i}].label`] = a.label
      })
      continue
    }
    const target = entry.item ? section.items.find((i) => i._key === entry.item) : section
    const existing = target[field]
    const isPT = PT_FIELDS.has(field) && (Array.isArray(existing) || existing === undefined)
    set[`${base}.${field}`] = isPT ? toPT(value) : value
    if (DRY)
      console.log(
        `${entry.doc} ${entry.section}${entry.item ? '/' + entry.item : ''}.${field}\n   was: ${Array.isArray(existing) ? existing.map((b) => (b.children || []).map((c) => c.text).join('')).join(' / ') : existing}\n   now: ${value}`,
      )
  }
  tx.patch(entry.doc, (p) => p.set(set))
}
if (problems) {
  console.log('PROBLEMS', problems)
  process.exit(1)
}
if (DRY) {
  console.log('DRY RUN OK, docs:', ids.length)
  process.exit(0)
}
const result = await tx.commit()
console.log('COMMITTED', result.results.length, 'documents')
