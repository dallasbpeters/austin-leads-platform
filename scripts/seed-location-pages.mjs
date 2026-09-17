/*
 * Seeds the six city pages as DRAFTS in Sanity, one `locationPage` per city:
 * Austin, Georgetown, Round Rock, Leander, Kyle, Pflugerville.
 *
 * Drafts only. The team reads them in Studio and presses Publish there; this
 * script never publishes and never touches another document. Re-running it
 * rewrites the same six drafts (same _ids), so edits here land in Studio.
 *
 *   node scripts/seed-location-pages.mjs --dry-run   # print what would be written
 *   node scripts/seed-location-pages.mjs             # write the drafts
 *   node scripts/seed-location-pages.mjs --check     # read the drafts back and sanity-check them
 *
 * Voice: voice-and-tone-guide.md. Real numbers with the caveat that they vary
 * by roof, usage, utility, and carrier. No federal tax credit — it ended
 * December 31, 2025. Facts marked "confirm" in the spec should be checked by
 * the team before publishing.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@sanity/client'

const ROOT = path.resolve(import.meta.dirname, '..')

/** Reads .env.local the way the other seed scripts do, without a dependency. */
function loadEnv() {
  try {
    for (const line of readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
      }
    }
  } catch {
    /* no .env.local: rely on the environment */
  }
}
loadEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
const SITE_SLUG = 'texas-solar-and-roofing-pros'
const SITE_URL = 'https://www.texassolarandroofingpros.com'

const dryRun = process.argv.includes('--dry-run')
const check = process.argv.includes('--check')

// ─── Portable Text helpers ───────────────────────────────────────────────────

let keyCounter = 0
const key = (prefix) => `${prefix}-${(keyCounter += 1)}`

/** One paragraph → one block. Plain spans only; these pages need no marks. */
const block = (text, prefix) => ({
  _key: key(`${prefix}-p`),
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _key: key(`${prefix}-s`), _type: 'span', marks: [], text }],
})

const pt = (prefix, ...paragraphs) => paragraphs.map((text) => block(text, prefix))

const metric = (prefix, label, value) => ({ _key: key(`${prefix}-m`), _type: 'pageMetric', label, value })
const action = (prefix, label, href, variant) => ({
  _key: key(`${prefix}-a`),
  _type: 'pageAction',
  label,
  href,
  ...(variant ? { variant } : {}),
})
const item = (prefix, { eyebrow, title, body, icon, href }) => ({
  _key: key(`${prefix}-i`),
  _type: 'sectionContentItem',
  ...(eyebrow ? { eyebrow } : {}),
  title,
  body: pt(prefix, ...(Array.isArray(body) ? body : [body])),
  ...(icon ? { icon } : {}),
  ...(href ? { href } : {}),
})
const faq = (prefix, question, ...answer) => ({
  _key: key(`${prefix}-q`),
  _type: 'pageFaqItem',
  question,
  answer: pt(prefix, ...answer),
})

// ─── The six cities ──────────────────────────────────────────────────────────
//
// Each entry is the local truth the page is built from. Copy below reads these
// so the six pages stay parallel and a fact is fixed in one place.

const CITIES = [
  {
    slug: 'austin',
    name: 'Austin',
    county: 'Travis County',
    utility: 'Austin Energy',
    utilityShort: 'Austin Energy',
    permits: 'the City of Austin Development Services Department',
    payback: '9 to 12 years',
    buyback:
      'Austin Energy pays a one-time $2,500 rebate on a qualifying system and credits every kilowatt-hour your panels make at the Value of Solar rate, 9.91 cents. You still buy all the power you use at the normal rate; the credit shows up as a line on the same bill.',
    buybackShort: 'Austin Energy: $2,500 rebate, then a 9.91¢ credit for every kWh your panels make.',
    roofNote:
      'Central Austin has a lot of roofs from the 1960s through the 1980s on their second or third layer of shingles. The newer subdivisions to the north and south mostly have builder-grade three-tab shingles from the 2000s that are now at the end of their life.',
    hailNote:
      'Hail reached most of Travis County in the spring of 2021 and again in 2024. If your roof went through either storm and nobody has been up on it since, the damage may still be there.',
    hoaNote:
      'HOAs in Austin cannot ban solar outright under Texas Property Code 202.010, but they can ask for panels to sit on a less visible slope if it costs you less than 10 percent of your production. We handle that paperwork with you.',
    neighborhoods: 'Circle C, Mueller, Steiner Ranch, Great Hills, Travis Heights, Allandale',
    caseStudy: true,
    bill: 'a $220 summer bill',
  },
  {
    slug: 'georgetown',
    name: 'Georgetown',
    county: 'Williamson County',
    utility: 'Georgetown Utility Systems',
    utilityShort: 'Georgetown Utility Systems',
    permits: 'the City of Georgetown Inspection Services division',
    payback: '10 to 14 years',
    buyback:
      'Georgetown runs its own electric utility, Georgetown Utility Systems. Rooftop solar connects under the city’s own interconnection rules, and the credit you get for power you send back is set by the city, not by a retail plan. Ask us for the current rate before you size a system; it changes how big the system should be.',
    buybackShort:
      'City-owned utility. The credit for power you send back is set by Georgetown, not a retail plan.',
    roofNote:
      'Sun City and the neighborhoods along Williams Drive were built fast in the late 1990s and 2000s, so a lot of Georgetown roofs are hitting 20 to 25 years at the same time. Older homes downtown often have steeper pitches and metal accents that change how a roofer prices the job.',
    hailNote:
      'Williamson County took hail in 2021, 2023 and 2024. Georgetown was in the path more than once. A roof that has been through two storms can pass from the street and still fail an inspection.',
    hoaNote:
      'Sun City and most newer Georgetown HOAs have an architectural review step for solar. Texas law limits what they can refuse, but the application still has to be filed. We file it.',
    neighborhoods: 'Sun City, Berry Creek, Wolf Ranch, Teravista, Old Town',
    caseStudy: false,
    bill: 'a $260 summer bill',
  },
  {
    slug: 'round-rock',
    name: 'Round Rock',
    county: 'Williamson County',
    utility: 'Oncor delivery, with retail choice',
    utilityShort: 'Oncor + retail plan',
    permits: 'the City of Round Rock Building Inspections division',
    payback: '10 to 14 years',
    buyback:
      'Most Round Rock homes get power delivered by Oncor and buy it from a retail provider you choose. That matters for solar: the credit for power you send back depends on your retail plan, not on Oncor. Some plans pay full retail, some pay a few cents, some pay nothing. We check your plan before we size anything.',
    buybackShort: 'Oncor delivers. Your retail plan decides what you get for power you send back.',
    roofNote:
      'Round Rock grew fastest from 1995 to 2010, so whole streets in Forest Creek, Teravista and Stone Canyon are replacing roofs within a few years of each other. Most were built with 20-year three-tab shingles.',
    hailNote:
      'Round Rock sat under the 2021 and 2024 hail storms that ran across Williamson County. Insurance carriers know those dates; so do we.',
    hoaNote:
      'Round Rock HOAs can review where panels go but cannot refuse a system that meets the Texas Property Code rules. Most approvals here take two to four weeks.',
    neighborhoods: 'Forest Creek, Teravista, Stone Canyon, Behrens Ranch, Paloma Lake',
    caseStudy: false,
    bill: 'a $250 summer bill',
  },
  {
    slug: 'leander',
    name: 'Leander',
    county: 'Williamson County',
    utility: 'Pedernales Electric Cooperative',
    utilityShort: 'PEC',
    permits: 'the City of Leander Building Department',
    payback: '11 to 15 years',
    buyback:
      'Most Leander homes are on Pedernales Electric Cooperative. PEC is a co-op, so there is no retail plan to shop; the co-op sets the interconnection rules and credits power you send back at its own rate, which is lower than the retail rate you pay. A battery, or a system sized close to what you use in daylight, usually pencils out better here than an oversized array.',
    buybackShort: 'PEC co-op. Power you send back earns less than power you buy, so sizing matters.',
    roofNote:
      'Leander has added more new homes than almost any city in Texas since 2015. New does not mean storm-proof: builder-grade shingles and fast framing schedules show up in our inspections as lifted tabs, exposed nails and missing starter strips.',
    hailNote:
      'Hail crossed Leander and Cedar Park in 2021 and again in 2024. Newer roofs took real damage in both.',
    hoaNote:
      'Crystal Falls, Travisso and the newer Leander HOAs all have design review. Texas law keeps them from refusing solar outright; we handle the application and the site plan.',
    neighborhoods: 'Crystal Falls, Travisso, Bryson, Mason Hills, Old Town Leander',
    caseStudy: false,
    bill: 'a $240 summer bill',
  },
  {
    slug: 'kyle',
    name: 'Kyle',
    county: 'Hays County',
    utility: 'Pedernales Electric Cooperative',
    utilityShort: 'PEC',
    permits: 'the City of Kyle Building Division',
    payback: '11 to 15 years',
    buyback:
      'Most of Kyle is served by Pedernales Electric Cooperative. As a co-op member you do not pick a retail plan; PEC sets the rules and pays a set credit for power your panels send back. That credit is lower than what you pay for power, so we size Kyle systems to what the house uses in daylight, or add a battery to keep the rest.',
    buybackShort: 'PEC co-op. Size to daytime use, or add a battery, to make solar pencil out.',
    roofNote:
      'Plum Creek, Waterleaf and the subdivisions along FM 1626 went up between 2005 and 2020. Many of those roofs are one-layer three-tab shingle, which is the simplest kind for a roofer to replace and to upgrade to an impact-rated shingle when the time comes.',
    hailNote:
      'Hays County was hit in 2021 and in the spring storms of 2024. Kyle roofs from the mid-2000s were the ones we saw fail most often.',
    hoaNote:
      'Plum Creek and most Kyle HOAs review solar placement. They cannot refuse a system that follows Texas Property Code 202.010. Plan on two to four weeks for the approval.',
    neighborhoods: 'Plum Creek, Waterleaf, Amberwood, Hometown Kyle, Steeplechase',
    caseStudy: false,
    bill: 'a $230 summer bill',
  },
  {
    slug: 'pflugerville',
    name: 'Pflugerville',
    county: 'Travis County',
    utility: 'Oncor delivery, with retail choice',
    utilityShort: 'Oncor + retail plan',
    permits: 'the City of Pflugerville Building Department',
    payback: '10 to 14 years',
    buyback:
      'Most Pflugerville homes have power delivered by Oncor and bought from a retail provider, and a few streets on the Austin side are on Austin Energy. Which one you have changes the math. With Oncor, your retail plan decides what you get for power you send back. With Austin Energy, you get the $2,500 rebate and the 9.91 cent Value of Solar credit. We check the meter before we quote.',
    buybackShort: 'Oncor for most homes; a few streets on Austin Energy. We check the meter first.',
    roofNote:
      'Falcon Pointe, Blackhawk and Avalon were built between 2000 and 2015, so Pflugerville has a large group of roofs at 15 to 25 years. Pflugerville enforces the 2021 International Residential Code, which sets the rules for how a new roof deck and underlayment go on.',
    hailNote:
      'Pflugerville was in the middle of the 2021 hail and again in 2024. Our Falcon Pointe re-roof and solar job came out of that first storm.',
    hoaNote:
      'Falcon Pointe, Blackhawk and the newer Pflugerville HOAs have an architectural committee. They review placement; they cannot refuse solar that meets the Texas Property Code rules. We file the packet.',
    neighborhoods: 'Falcon Pointe, Blackhawk, Avalon, Highland Park, Springbrook',
    caseStudy: false,
    bill: 'a $240 summer bill',
  },
]

// ─── The page ────────────────────────────────────────────────────────────────

function buildPage(city, siteId) {
  const p = city.slug
  const sections = []

  sections.push({
    _key: key(`${p}-hero`),
    _type: 'heroSection',
    type: 'hero',
    eyebrow: `Solar and roofing in ${city.name}`,
    title: `What solar, a hail claim, and a reroof with panels cost in ${city.name}`,
    body: pt(
      `${p}-hero`,
      `Something brought you here: ${city.bill}, an insurance letter after the last hail storm, a roof that is older than you would like with panels already on it, or a neighbor who just went solar. Here is what those jobs cost in ${city.name}, what drives the price, and what happens when you call. We do the solar and the electrical. For the roof itself we bring in licensed roofers we trust. No pressure. The estimate is free.`,
    ),
    metrics: [
      metric(`${p}-hero`, 'Your utility', city.utilityShort),
      metric(`${p}-hero`, 'County', city.county),
      metric(`${p}-hero`, 'Typical solar payback', city.payback),
    ],
    actions: [
      action(`${p}-hero`, 'Get a free estimate', '#consultation'),
      action(`${p}-hero`, 'See what we do', '/services', 'secondary'),
    ],
  })

  sections.push({
    _key: key(`${p}-story`),
    _type: 'storySection',
    type: 'story',
    eyebrow: `Why ${city.name} is different`,
    title: `Roofs and bills in ${city.name} follow local rules, not Texas averages`,
    body: pt(
      `${p}-story`,
      city.buyback,
      city.roofNote,
      city.hailNote,
      `We work ${city.name} every week, in ${city.neighborhoods} and the streets around them. We pull permits with ${city.permits}, and we know which inspectors want what.`,
    ),
  })

  sections.push({
    _key: key(`${p}-hl`),
    _type: 'highlightsSection',
    type: 'highlights',
    title: `The three jobs we do most in ${city.name}`,
    subtitle: pt(
      `${p}-hl`,
      'Prices below are real ranges from recent Central Texas jobs. Yours depends on the roof, your usage, your utility, and your insurance carrier.',
    ),
    items: [
      item(`${p}-hl`, {
        eyebrow: 'Reroofs with panels',
        title: 'Working with roofers',
        icon: 'Home',
        body: `Roofing is its own trade, so we do not replace roofs. We introduce you to a licensed ${city.name} roofer we know and stand behind, and we run the solar side: panels off, labeled and stored, reset on the new roof with fresh flashings and verified production. Their asphalt reroofs on a typical ${city.name} home run $12,000 to $25,000; ask them about Class 4 impact-rated shingles and the insurance discount those can earn. One introduction, two crews who talk to each other.`,
        href: '/roofing-partners',
      }),
      item(`${p}-hl`, {
        eyebrow: 'Solar',
        title: 'Solar and battery installations',
        icon: 'SunLight',
        body: `A home solar system in ${city.name} runs $15,000 to $30,000 installed, before any utility rebate. ${city.buybackShort} With a battery you keep power when the grid drops, which mattered here in February 2021. We size the system from twelve months of your real usage, not a guess.`,
        href: '/services/solar-and-battery-installations',
      }),
      item(`${p}-hl`, {
        eyebrow: 'Storm and insurance',
        title: 'Hail inspection and claim help',
        icon: 'Rain',
        body: `You cannot see hail damage from the driveway. We get on the roof, photograph every slope, and write it up the way adjusters expect. If it is fine, we tell you it is fine. If it needs a claim, you will know before you call your carrier, and we meet the adjuster at the house. If the roof has to be replaced, we bring in a roofing partner and handle the panels ourselves.`,
        href: '/hail-damage',
      }),
    ],
  })

  sections.push({
    _key: key(`${p}-steps`),
    _type: 'stepsSection',
    type: 'steps',
    title: `What happens when you call from ${city.name}`,
    items: [
      item(`${p}-steps`, {
        title: 'We come look, for free',
        body: `A crew lead gets on the roof, checks the attic and the electrical panel, and measures for shade. You get photos of what we found, whether or not you hire us.`,
      }),
      item(`${p}-steps`, {
        title: 'You see the numbers side by side',
        body: `Solar only, solar with a battery, or solar plus a reroof with one of our roofing partners. Each option shows the installed price, what ${city.utilityShort} does to the payback, and what your bill should look like after. You decide.`,
      }),
      item(`${p}-steps`, {
        title: `We pull the permit with ${city.permits.replace(/^the /, 'the ')}`,
        body: `${city.hoaNote} Permits and HOA approval usually take two to four weeks in ${city.name}. We tell you where it stands every week.`,
      }),
      item(`${p}-steps`, {
        title: 'Install, inspect, switch on',
        body: `If the roof comes first, we take the panels off, the roofer works, and we reset the array on the new roof. A solar install takes one to two days, then a city inspection and a utility meter swap, which is the step that waits the longest. We stay on it until the system is live and the bill shows the change.`,
      }),
    ],
  })

  sections.push({
    _key: key(`${p}-faq`),
    _type: 'faqSection',
    type: 'faq',
    title: `${city.name} questions we hear most`,
    items: [
      faq(`${p}-faq`, `What does ${city.utilityShort} pay me for solar power I do not use?`, city.buyback),
      faq(
        `${p}-faq`,
        `Do I need a permit for solar in ${city.name}?`,
        `Yes. We pull the solar and electrical permits with ${city.permits} as part of the job, and the system needs an interconnection agreement with your utility before it can be switched on. You sign; we file and follow up. If a roofer is replacing the roof, they pull the roofing permit, and we line up the schedules so the panels come off and go back on at the right time.`,
      ),
      faq(
        `${p}-faq`,
        'Can my HOA say no to solar?',
        city.hoaNote,
        'The one common exception is a home the HOA still owns as part of a development phase, and a roof slope where panels would cut production by more than 10 percent. Both are rare.',
      ),
      faq(
        `${p}-faq`,
        `When is hail season in ${city.name}, and how long do I have to file a claim?`,
        `Most Central Texas hail falls between March and June, with a second smaller run in the fall. ${city.hailNote} Texas policies usually give you one to two years from the storm date to file, but carriers ask hard questions after the first few months. Get the roof inspected soon after a storm and keep the report.`,
      ),
      faq(
        `${p}-faq`,
        `Do you actually work in my part of ${city.name}?`,
        `Yes. We serve all of ${city.name} and the rest of ${city.county}, including ${city.neighborhoods}. If you are outside the city limits on a county road, call anyway; we most likely cover you.`,
      ),
    ],
  })

  if (city.caseStudy) {
    sections.push({
      _key: key(`${p}-cs`),
      _type: 'caseStudyGridSection',
      type: 'caseStudyGrid',
      title: `Recent ${city.name} jobs, written up honestly`,
      body: pt(
        `${p}-cs`,
        'What we saw from the driveway, what the crew found on the roof, what went on it, and what the bill did afterward.',
      ),
      layout: 'featured',
      maxItems: 3,
    })
  }

  sections.push({
    _key: key(`${p}-cta`),
    _type: 'ctaSection',
    type: 'cta',
    title: `Tell us what is going on with your ${city.name} house`,
    body: pt(
      `${p}-cta`,
      `Call 512-400-3763, or send a recent electric bill, a photo of the roof, or just the street. We will come out, look, and give you straight numbers for ${city.name}. Free estimate. No pressure. No commitment.`,
    ),
    ctaLabel: 'Get a free estimate',
    theme: 'light',
  })

  const description = `Solar, hail claim help, and reroofs with trusted roofers in ${city.name}, TX. Real prices, what ${city.utilityShort} pays for solar, permits with ${city.permits.replace(/^the /, '')}, and what happens when you call. Free estimate, no pressure.`

  return {
    _id: `drafts.locationPage-${city.slug}`,
    _type: 'locationPage',
    pageType: 'locationPage',
    templateLevel: 'hero',
    title: `Solar and Roofing in ${city.name}, TX`,
    description,
    slug: { _type: 'slug', current: `locations/${city.slug}` },
    site: { _type: 'reference', _ref: siteId },
    seo: {
      title: `${city.name} Solar and Roofing | Texas Solar and Roofing Pros`,
      description: description.slice(0, 160),
      canonicalUrl: `${SITE_URL}/locations/${city.slug}`,
      ogImage: 'https://texassolarandroofingpros.com/api/og',
      noIndex: false,
    },
    sections,
  }
}

// ─── Checks the copy against the house rules ─────────────────────────────────

const BANNED = [
  /tax credit/i,
  /\bITC\b/,
  /revolutionary|unbeatable|limited[- ]time|act now|game-?changer|no-?brainer|best-in-class|seamless|turnkey|don't miss out|one-of-a-kind|passionate about/i,
]

function textOf(value) {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(textOf).join(' ')
  }
  if (value && typeof value === 'object') {
    return Object.values(value).map(textOf).join(' ')
  }
  return ''
}

function lint(page) {
  const problems = []
  const text = textOf(page)
  for (const pattern of BANNED) {
    const hit = text.match(pattern)
    if (hit) {
      problems.push(`banned phrase "${hit[0]}"`)
    }
  }
  for (const section of page.sections) {
    if (section.title?.includes('—')) {
      problems.push(`em dash in headline "${section.title}"`)
    }
    if (/!\s*$/.test(section.title || '')) {
      problems.push(`exclamation in headline "${section.title}"`)
    }
  }
  if (!text.includes(page.title.split(' in ')[1].split(',')[0])) {
    problems.push('city name missing')
  }
  return problems
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!projectId || (!dryRun && !token)) {
    console.error('Need NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local')
    process.exit(1)
  }
  /* `raw` so the check can see drafts; newer clients hide them by default. */
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-10-21',
    token,
    useCdn: false,
    perspective: 'raw',
  })

  if (check) {
    const drafts = await client.fetch(
      `*[_id in path("drafts.**") && _type == "locationPage" && string::startsWith(slug.current, "locations/")]
        | order(slug.current) { _id, title, "slug": slug.current, "sections": sections[].type, "site": site->slug.current, _updatedAt }`,
    )
    for (const draft of drafts) {
      console.log(`${draft._id}  /${draft.slug}  [${draft.sections.join(' → ')}]  site=${draft.site}`)
    }
    console.log(`${drafts.length} drafts`)
    process.exit(drafts.length === CITIES.length ? 0 : 1)
  }

  const siteId = dryRun
    ? 'dry-run-site'
    : await client.fetch(`*[_type == "site" && slug.current == $slug][0]._id`, { slug: SITE_SLUG })
  if (!siteId) {
    console.error(`No site with slug ${SITE_SLUG}`)
    process.exit(1)
  }

  const pages = CITIES.map((city) => buildPage(city, siteId))
  let failed = false
  for (const page of pages) {
    const problems = lint(page)
    const words = textOf(page.sections).split(/\s+/).length
    console.log(`${page._id}  ${words} words  ${problems.length ? `PROBLEMS: ${problems.join('; ')}` : 'ok'}`)
    failed ||= problems.length > 0
  }
  if (failed) {
    process.exit(1)
  }
  if (dryRun) {
    console.log('\nDry run: nothing written.')
    return
  }

  const transaction = client.transaction()
  for (const page of pages) {
    transaction.createOrReplace(page)
  }
  await transaction.commit()
  console.log(`\nWrote ${pages.length} drafts. Review and publish them in Studio → Location Pages.`)
}

await main()
