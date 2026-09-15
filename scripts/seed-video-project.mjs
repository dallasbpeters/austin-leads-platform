#!/usr/bin/env node
/*
 * Seed the detach-and-reset videoProject from what is already on disk.
 *
 *   node --env-file=.env.local scripts/seed-video-project.mjs [--dry-run]
 *
 * Reads BRIEF.md and the narration that was actually recorded, so the document
 * starts out matching the film rather than describing a different one.
 */
import { createClient } from '@sanity/client'

const dryRun = process.argv.includes('--dry-run')

const doc = {
  /* Dashes, never dots. Sanity reserves dotted ID prefixes for system documents
     (drafts., versions.), and a document with an unrecognised dotted prefix is
     readable with a token but invisible to unauthenticated reads — so it exists,
     the Studio shows it, and the live site renders nothing. */
  _id: 'videoProject-detach-and-reset',
  _type: 'videoProject',
  title: 'What a detach and reset really costs',
  slug: { _type: 'slug', current: 'detach-and-reset' },
  message: 'Your Texas roof lasts 20 years and your panels last 25 — getting the order wrong costs $5,400.',
  voice: { provider: 'elevenlabs', voiceId: 'FpctH3pqgHOSrmaRotxS', voiceName: 'Dallas Salesman', speed: 1 },
  status: 'review',
  beats: [
    {
      _type: 'videoBeat',
      _key: 'b1',
      label: 'The number nobody mentions',
      narration:
        'Before you put solar on a Texas roof, there is a number nobody mentions. Taking those panels back off later runs eighteen hundred to fifty two hundred dollars, depending on system size.',
      onScreen: 'Aerial over the crew, then the detach-and-reset cost bars by system size.',
      why: 'Opens on a figure the homeowner has never been quoted.',
    },
    {
      _type: 'videoBeat',
      _key: 'b2',
      label: 'Warranty vs Texas',
      narration:
        'Here is why that matters. Your shingle warranty says thirty years. In Texas heat and hail, we typically see twenty. Your panels are warranted for twenty five.',
      onScreen: 'Three bars on one scale: 30 warranty, 20 real, 25 panels.',
      why: 'The mechanism. Explains why the cost in beat one is not optional.',
    },
    {
      _type: 'videoBeat',
      _key: 'b3',
      label: 'The collision',
      narration:
        'So the panels outlive the roof. That is not bad luck. That is arithmetic. Somewhere around year twenty, something has to come off.',
      onScreen: 'One 30-year timeline, two lanes, the overlap highlighted.',
      why: 'The lesson, stated as arithmetic rather than opinion.',
    },
    {
      _type: 'videoBeat',
      _key: 'b4',
      label: 'The money beat',
      narration:
        'Do them separately, and you are looking at about thirty eight thousand four hundred. Do them together, thirty three thousand. Getting the order wrong costs you five thousand four hundred dollars.',
      onScreen: 'Four project totals, then $5,400 counts up.',
      why: 'The money. The reason to act.',
    },
    {
      _type: 'videoBeat',
      _key: 'b5',
      label: 'The warranty trap',
      narration:
        'One more thing. Some solar warranties end if a different company moves your panels. Check your paperwork before anyone touches them.',
      onScreen: 'The one dark band. Deep Sky with a gold scan line.',
      why: 'The trap that costs more than the detach itself.',
    },
    {
      _type: 'videoBeat',
      _key: 'b6',
      label: 'The rule and the ask',
      narration:
        'So here is the rule. Under ten years of roof left? Do the roof first. And get the detach cost in writing, before the roofing bid. Not sure which way to go for your home? Send us your roof age and a year of electric bills, and we will map out your best next step. Free estimate. No commitment.',
      onScreen: 'The rule in a card, the ask, then the phone number holding to the last frame.',
      why: 'Turns the arithmetic into one decision and one request.',
    },
  ],
  cta: {
    lead: "Not sure which way to go? Send us your roof age and a year of electric bills — we'll map out your best next step.",
    phone: '512-400-3763',
    site: 'texassolarandroofingpros.com',
    reassurance: 'Free estimate · no commitment',
  },
  figureNotes: [
    'Frame 01 — $1,800/$2,500/$3,500/$4,200/$5,200 from solar-panel-detach-and-reset-bar.json.',
    'Frames 02-03 — 20 yrs real vs 30 yrs warranty from when-to-replace-your-roof-texas-composed.json;',
    '  25-yr mid-tier panel warranty from solar-warranties-texas-composed.json.',
    'Frame 04 — $12,000/$22,400/$38,400/$33,000 from planning-roof-and-solar-together-bar.json.',
    '  The $5,400 delta is derived, not a separate source.',
    '',
    'Nothing on screen is invented. If any of these change, the film has to change.',
  ].join('\n'),
  youtube: {
    privacy: 'unlisted',
    description: [
      'A detach and reset — taking your solar panels off so the roof underneath can be replaced — runs $1,800 to $5,200 in the Austin area.',
      '',
      'Here is why it happens, what the order costs you, and the one thing to check before anyone touches your panels.',
      '',
      'Texas Solar & Roofing Pros · Central Texas',
      '512-400-3763 · texassolarandroofingpros.com',
      '',
      'Figures are typical Austin-area 2026 pricing and vary by roof, system size, pitch and permitting.',
    ].join('\n'),
    tags: ['solar', 'roofing', 'detach and reset', 'texas', 'austin', 'roof replacement'],
  },
}

if (dryRun) {
  console.log(JSON.stringify(doc, null, 2))
  process.exit(0)
}

const token = process.env.SANITY_API_WRITE_TOKEN
if (!token) {
  console.error('SANITY_API_WRITE_TOKEN is not set. Run with --dry-run to see the document.')
  process.exit(1)
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token,
  useCdn: false,
})

await sanity.createOrReplace(doc)
console.log(`Seeded ${doc._id} — ${doc.beats.length} beats, status "${doc.status}".`)
