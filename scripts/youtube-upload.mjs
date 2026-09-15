#!/usr/bin/env node
/*
 * Upload a rendered video to YouTube and record the result in Sanity.
 *
 *   node --env-file=.env.local scripts/youtube-upload.mjs <slug> [--file path.mp4] [--dry-run]
 *
 * Title, description, tags and privacy come from the videoProject document, so
 * the listing is edited in Sanity like everything else. Defaults to UNLISTED:
 * publishing to the world is a decision, not a side effect of running a script.
 *
 * Auth is the refresh token from scripts/youtube-auth.mjs. A service account
 * cannot do this — see the comment in that file.
 */
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@sanity/client'

const slug = process.argv[2]
const dryRun = process.argv.includes('--dry-run')
const fileFlag = process.argv.indexOf('--file')
if (!slug) {
  console.error(
    'Usage: node --env-file=.env.local scripts/youtube-upload.mjs <slug> [--file path.mp4] [--dry-run]',
  )
  process.exit(1)
}

/* Find the render: an explicit --file, else the newest mp4 in the project. */
let file = fileFlag !== -1 ? process.argv[fileFlag + 1] : null
if (!file) {
  const dir = path.join('videos', slug)
  const candidates = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.mp4'))
        .map((f) => path.join(dir, f))
    : []
  if (candidates.length === 0) {
    console.error(`No .mp4 found in videos/${slug}. Render first, or pass --file.`)
    process.exit(1)
  }
  file = candidates.toSorted((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
}
if (!existsSync(file)) {
  console.error(`${file} does not exist.`)
  process.exit(1)
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const doc = await sanity.fetch(
  `*[_type == "videoProject" && slug.current == $slug][0]{ _id, title, status, youtube }`,
  { slug },
)
if (!doc) {
  console.error(`No videoProject with slug "${slug}".`)
  process.exit(1)
}

/* Approval is a gate, not a suggestion. */
if (doc.status !== 'approved' && !dryRun) {
  console.error(`Status is "${doc.status || 'draft'}". Set it to "approved" in Sanity before uploading.`)
  process.exit(1)
}

const privacy = doc.youtube?.privacy || 'unlisted'
const meta = {
  snippet: {
    title: doc.title,
    description: doc.youtube?.description || '',
    tags: doc.youtube?.tags || [],
    categoryId: '26', // Howto & Style
  },
  status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
}

console.log(`file     ${file} (${(statSync(file).size / 1e6).toFixed(1)} MB)`)
console.log(`title    ${meta.snippet.title}`)
console.log(`privacy  ${privacy}`)
if (dryRun) {
  console.log('\n--dry-run: nothing uploaded.')
  process.exit(0)
}

const refresh = process.env.YOUTUBE_REFRESH_TOKEN?.trim()
if (!refresh) {
  console.error('YOUTUBE_REFRESH_TOKEN is not set. Run scripts/youtube-auth.mjs first.')
  process.exit(1)
}

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_BUSINESS_CLIENT_ID,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
    refresh_token: refresh,
    grant_type: 'refresh_token',
  }).toString(),
})
const { access_token: accessToken } = await tokenRes.json()
if (!accessToken) {
  console.error('Could not refresh the access token. Re-run scripts/youtube-auth.mjs.')
  process.exit(1)
}

/* Resumable upload: start a session, then send the file in one PUT. */
const size = statSync(file).size
const startRes = await fetch(
  'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Length': String(size),
      'X-Upload-Content-Type': 'video/mp4',
    },
    body: JSON.stringify(meta),
  },
)
const session = startRes.headers.get('location')
if (!session) {
  console.error(`Could not open an upload session: ${startRes.status} ${await startRes.text()}`)
  process.exit(1)
}

console.log('\nuploading…')
const putRes = await fetch(session, {
  method: 'PUT',
  headers: { 'Content-Length': String(size), 'Content-Type': 'video/mp4' },
  body: createReadStream(file),
  duplex: 'half',
})
const result = await putRes.json().catch(() => ({}))
if (!result.id) {
  console.error(`Upload failed: ${putRes.status} ${JSON.stringify(result)}`)
  process.exit(1)
}

const url = `https://www.youtube.com/watch?v=${result.id}`
console.log(`\ndone  ${url}  (${privacy})`)

await sanity
  .patch(doc._id)
  .set({ 'youtube.videoId': result.id, 'youtube.url': url, status: 'published' })
  .commit()
console.log('Recorded on the videoProject and set status to "published".')
