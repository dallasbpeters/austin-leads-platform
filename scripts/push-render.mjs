#!/usr/bin/env node
/*
 * Push a rendered film to Sanity and point the project at it.
 *
 *   node --env-file=.env.local scripts/push-render.mjs <slug> [--file path.mp4]
 *
 * This is the step that makes the admin page work anywhere. The page plays
 * `videoProject.renderUrl`, and the Vercel deployment cannot see your local
 * `videos/<slug>/renders/` folder — so the file has to live somewhere with a
 * URL. Sanity's asset store already has the credentials and handles the size.
 *
 * Rendering stays local (or on a HyperFrames cloud target): it needs headless
 * Chrome and ffmpeg for minutes, which is not what a web function is for.
 */
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@sanity/client'

const slug = process.argv[2]
const fileFlag = process.argv.indexOf('--file')
if (!slug) {
  console.error('Usage: node --env-file=.env.local scripts/push-render.mjs <slug> [--file path.mp4]')
  process.exit(1)
}

let file = fileFlag === -1 ? null : process.argv[fileFlag + 1]
if (!file) {
  const dir = path.join('videos', slug, 'renders')
  const found = existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => name.endsWith('.mp4'))
        .map((name) => path.join(dir, name))
    : []
  if (found.length === 0) {
    console.error(`No .mp4 in ${dir}. Run "npx hyperframes render" there first, or pass --file.`)
    process.exit(1)
  }
  file = found.toSorted((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
}
if (!existsSync(file)) {
  console.error(`${file} does not exist.`)
  process.exit(1)
}

const token = process.env.SANITY_API_WRITE_TOKEN
if (!token) {
  console.error('SANITY_API_WRITE_TOKEN is not set.')
  process.exit(1)
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  token,
  useCdn: false,
})

const doc = await sanity.fetch(`*[_type == "videoProject" && slug.current == $slug][0]{ _id, title }`, {
  slug,
})
if (!doc) {
  console.error(`No videoProject with slug "${slug}".`)
  process.exit(1)
}

const size = statSync(file).size
console.log(`uploading ${file} (${(size / 1e6).toFixed(1)} MB) …`)

const asset = await sanity.assets.upload('file', createReadStream(file), {
  filename: `${slug}.mp4`,
  contentType: 'video/mp4',
})

await sanity.patch(doc._id).set({ renderUrl: asset.url }).commit()

console.log(`\ndone  ${asset.url}`)
console.log('Set on videoProject.renderUrl — the Videos page can play it now, locally and on Vercel.')
