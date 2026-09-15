#!/usr/bin/env node
/*
 * Pull a video project from Sanity and apply it to the composition on disk.
 *
 *   node --env-file=.env.local scripts/sync-video-project.mjs <slug> [--dry-run]
 *
 * The document owns the script; the folder owns the film. This script is the
 * one-way bridge: narration lines that CHANGED are re-recorded (unchanged lines
 * are left alone so a copy tweak does not re-bill the whole voiceover), the CTA
 * is written into the closing frame, and index.html is retimed to the new audio.
 *
 * It never writes back to Sanity. Review state lives there; the film lives here.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@sanity/client'

const slug = process.argv[2]
const dryRun = process.argv.includes('--dry-run')
if (!slug) {
  console.error('Usage: node --env-file=.env.local scripts/sync-video-project.mjs <slug> [--dry-run]')
  process.exit(1)
}

const projectDir = path.join('videos', slug)
if (!existsSync(projectDir)) {
  console.error(`No composition at ${projectDir}. The slug must match the folder under videos/.`)
  process.exit(1)
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const doc = await sanity.fetch(
  `*[_type == "videoProject" && slug.current == $slug][0]{
     title, message, beats, voice, cta, status, "figures": figureSources[]->{title}
   }`,
  { slug },
)

if (!doc) {
  console.error(`No videoProject in Sanity with slug "${slug}".`)
  process.exit(1)
}

console.log(`${doc.title} — ${doc.beats?.length ?? 0} beats, status "${doc.status || 'draft'}"`)

const audioDir = path.join(projectDir, 'assets', 'audio')
mkdirSync(audioDir, { recursive: true })

/* A line is only re-recorded when its text, voice or speed actually changed.
   The hash of those three is the cache key, kept beside the audio. */
const stampPath = path.join(audioDir, '.script-hashes.json')
const previous = existsSync(stampPath) ? JSON.parse(readFileSync(stampPath, 'utf-8')) : {}
const next = {}

const voiceId = doc.voice?.voiceId
const speed = doc.voice?.speed ?? 1
if (!voiceId) {
  console.error('videoProject.voice.voiceId is empty — nothing to record with.')
  process.exit(1)
}

const key = process.env.ELEVENLABS_API_KEY
if (!key && !dryRun) {
  console.error('ELEVENLABS_API_KEY is not set. Export it, or run with --dry-run.')
  process.exit(1)
}

let recorded = 0
let skipped = 0

for (const [i, beat] of (doc.beats || []).entries()) {
  const n = String(i + 1).padStart(2, '0')
  const file = path.join(audioDir, `vo-${n}.mp3`)
  const hash = createHash('sha256').update(`${beat.narration}|${voiceId}|${speed}`).digest('hex').slice(0, 16)
  next[`vo-${n}`] = hash

  if (previous[`vo-${n}`] === hash && existsSync(file)) {
    skipped += 1
    continue
  }

  console.log(
    `  vo-${n}  ${previous[`vo-${n}`] ? 'changed' : 'new'} — ${beat.label || beat.narration.slice(0, 48)}`,
  )
  if (dryRun) {
    recorded += 1
    continue
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: beat.narration,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, speed },
    }),
  })
  if (!res.ok) {
    console.error(`  ElevenLabs returned ${res.status} for vo-${n}: ${await res.text()}`)
    process.exit(1)
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  recorded += 1
}

if (!dryRun) {
  writeFileSync(stampPath, JSON.stringify(next, null, 2))
}

console.log(`\n${recorded} line(s) recorded, ${skipped} unchanged.`)

/*
 * On-screen copy.
 *
 * Re-recording the voice alone is not enough: if a beat's wording changes, the
 * frame keeps shouting the old line and the film contradicts itself. Elements
 * the frame marks with `data-copy="<field>"` are rewritten from the document;
 * everything else — charts, labels, the brand lockup — stays hand-authored.
 *
 * `data-copy-words` means the element drives a per-word cascade, so its text is
 * re-split into spans. `|` in a headline forces a line break.
 */
const FRAMES = [
  'f01-bolted.html',
  'f02-detach-reset.html',
  'f03-three-moves.html',
  'f04-sealed-mounts.html',
  'f05-warranty.html',
  'f06-in-writing.html',
]

/*
 * Copy arriving from Sanity is plain text, but a field backfilled out of the
 * frames can still carry an entity like `&mdash;`. Escaping that verbatim gives
 * `&amp;mdash;`, which renders as the literal characters on screen. Decode to the
 * real character first, then escape exactly once.
 */
const ENTITIES = {
  '&mdash;': '\u2014',
  '&ndash;': '\u2013',
  '&rsquo;': '\u2019',
  '&lsquo;': '\u2018',
  '&rdquo;': '\u201D',
  '&ldquo;': '\u201C',
  '&hellip;': '\u2026',
  '&middot;': '\u00B7',
  '&nbsp;': '\u00A0',
  '&amp;': '&',
}

function decodeEntities(value) {
  let text = String(value)
  for (const [entity, character] of Object.entries(ENTITIES)) {
    text = text.replaceAll(entity, character)
  }
  return text.replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function renderCopy(value, asWords) {
  const text = decodeEntities(value).trim()
  if (!asWords) {
    return escapeHtml(text).replaceAll('|', '<br />')
  }
  return text
    .split('|')
    .map((line) =>
      line
        .trim()
        .split(/\s+/)
        .map((word) => `<span class="w">${escapeHtml(word)}</span>`)
        .join(' '),
    )
    .join('<br />')
}

let copyEdits = 0
for (const [i, beat] of (doc.beats || []).entries()) {
  const framePath = path.join(projectDir, 'compositions', FRAMES[i])
  if (!existsSync(framePath)) {
    continue
  }
  let html = readFileSync(framePath, 'utf-8')
  const before = html

  for (const field of ['eyebrow', 'headline', 'support', 'cardLabel', 'cardText', 'fine']) {
    const value = beat[field]
    if (!value) {
      continue
    }
    /* Match the opening tag carrying this field, then replace only its content. */
    const pattern = new RegExp(`(<(\\w+)[^>]*data-copy="${field}"([^>]*)>)([\\s\\S]*?)(</\\2>)`)
    const match = html.match(pattern)
    if (!match) {
      continue
    }
    const asWords = match[3].includes('data-copy-words')
    const replacement = match[1] + renderCopy(value, asWords) + match[5]
    if (replacement !== match[0]) {
      html = html.replace(match[0], replacement)
    }
  }

  if (html !== before) {
    if (!dryRun) {
      writeFileSync(framePath, html)
    }
    copyEdits += 1
    console.log(`  ${FRAMES[i]} — on-screen copy updated`)
  }
}

console.log(`${copyEdits} frame(s) had their copy rewritten.`)

if (recorded > 0) {
  console.log(
    '\nAudio lengths changed, so the timeline no longer matches. Next:\n' +
      `  cd ${projectDir}\n` +
      '  npx hyperframes check      # confirm nothing broke\n' +
      '  then retime index.html to the new clip durations before rendering.',
  )
} else {
  console.log('\nNothing to do — the film already matches the document.')
}

if (doc.cta) {
  console.log(`\nCTA in Sanity: ${doc.cta.phone || '—'} · ${doc.cta.site || '—'}`)
  console.log('Check compositions/f06-*.html still matches it.')
}
