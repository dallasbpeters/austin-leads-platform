/* Retypes items inside snapshotSection arrays from pageItem to snapshotItem. Pass --apply to write. */
import { createClient } from 'next-sanity'
const APPLY = process.argv.includes('--apply')
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-10-21',
  token: APPLY ? process.env.SANITY_API_WRITE_TOKEN : process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: 'raw',
})
const docs = await client.fetch(
  `*[_type in ["page","servicePage","locationPage"] && count(sections[_type=="snapshotSection"]) > 0]{_id, "sections": sections[_type=="snapshotSection"]{_key, items[]{_key, _type}}}`,
)
const tx = client.transaction()
let patches = 0
for (const d of docs)
  for (const s of d.sections)
    for (const it of s.items || [])
      if (it._type !== 'snapshotItem') {
        console.log(`${d._id}  sections[${s._key}].items[${it._key}]  ${it._type} -> snapshotItem`)
        patches += 1
        tx.patch(d._id, (p) =>
          p.set({ [`sections[_key=="${s._key}"].items[_key=="${it._key}"]._type`]: 'snapshotItem' }),
        )
      }
console.log(`${patches} items across ${docs.length} documents (drafts included)`)
if (APPLY && patches) {
  const r = await tx.commit()
  console.log('COMMITTED', r.results.length, 'documents')
} else if (!APPLY) console.log('dry run, nothing written')
