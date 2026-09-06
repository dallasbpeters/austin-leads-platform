import { createClient } from 'next-sanity'
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-10-21',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
})
const pt = (b) => (b || []).map((x) => (x.children || []).map((c) => c.text).join('')).join(' // ')
const r = await client.fetch(`{
 "aboutLogos": *[_id=="page-about"][0].sections[_type=="logosSection"][0]{_key,title,body},
 "aboutHero": *[_id=="page-about"][0].sections[_type=="heroSection"][0]{_key,title,body},
 "roofGrid": *[_type=="servicePage" && slug.current=="roofing"][0].sections[_type=="serviceGridSection"][0]{_key,title,body},
 "hailSteps": *[_type=="servicePage" && slug.current=="hail-damage"][0].sections[_type=="stepsSection"][0]{_key,title,items[]{_key,title,body}},
 "thanks": *[_type=="locationPage" && slug.current=="thank-you"][0]{_id, "s": sections[_type=="storySection"][0]{_key,title,subtitle}},
 "ids": *[_type in ["page","servicePage"] && !(_id in path("drafts.**"))]{_id,"slug":slug.current}
}`)
for (const k of ['aboutLogos', 'aboutHero', 'roofGrid'])
  console.log(k, r[k]._key, '|', r[k].title, '|', pt(r[k].body))
console.log('hailSteps', r.hailSteps._key, r.hailSteps.title)
for (const i of r.hailSteps.items) console.log('  ', i._key, i.title, '|', pt(i.body))
console.log(
  'thanks',
  r.thanks._id,
  r.thanks.s._key,
  r.thanks.s.title,
  '|',
  typeof r.thanks.s.subtitle,
  JSON.stringify(r.thanks.s.subtitle).slice(0, 80),
)
console.log('IDS', JSON.stringify(r.ids))
