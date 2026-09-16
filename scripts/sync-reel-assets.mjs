/*
 * Copies the brand pieces a reel template needs out of public/ and into the
 * HyperFrames project.
 *
 * `videos/*_/assets/` is git-ignored on purpose (media is reproducible, and the
 * repo stays small), but a render still needs the files on disk. They all
 * already live in public/, so this is a copy rather than a second source of
 * truth. Run it after a fresh clone, and the Docker build runs it too.
 *
 *   node scripts/sync-reel-assets.mjs
 */

import { copyFile, cp, mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PROJECT_DIR = path.join(ROOT, 'videos/christmas-reels')
const PROJECT = path.join(PROJECT_DIR, 'assets')
/* The builder's live preview plays the real composition in an iframe, so the browser needs to reach it. */
const PUBLIC_COPY = path.join(ROOT, 'public/reels/christmas-reels')

/** [from public/, to assets/] */
const FILES = [
  ['christmas-logo-reversed.svg', 'brand/christmas-logo-reversed.svg'],
  ['images/tx-christmas-logo.svg', 'brand/tx-christmas-logo.svg'],
  ['fonts/Switzer-Variable.woff2', 'fonts/Switzer-Variable.woff2'],
  ['fonts/BespokeSerif-Variable.woff2', 'fonts/BespokeSerif-Variable.woff2'],
  // A stand-in job photo, so a photo scene previews before anyone uploads one.
  ['images/tx-christmas-hero-collage.png', 'brand/sample-photo.png'],
]

async function copyBulbs() {
  const from = path.join(ROOT, 'public/christmas-mockup')
  const entries = await readdir(from)
  const names = entries.filter((name) => name.startsWith('c9-') && name.endsWith('.png'))
  await mkdir(path.join(PROJECT, 'brand'), { recursive: true })
  for (const name of names) {
    await copyFile(path.join(from, name), path.join(PROJECT, 'brand', name))
  }
  return names.length
}

async function main() {
  for (const [from, to] of FILES) {
    const target = path.join(PROJECT, to)
    await mkdir(path.dirname(target), { recursive: true })
    await copyFile(path.join(ROOT, 'public', from), target)
  }
  const bulbs = await copyBulbs()

  await rm(PUBLIC_COPY, { recursive: true, force: true })
  await mkdir(PUBLIC_COPY, { recursive: true })
  await copyFile(path.join(PROJECT_DIR, 'index.html'), path.join(PUBLIC_COPY, 'index.html'))
  await cp(PROJECT, path.join(PUBLIC_COPY, 'assets'), { recursive: true })

  console.log(
    `[reel-assets] ${FILES.length} brand files + ${bulbs} bulbs into ${path.relative(ROOT, PROJECT)}; ` +
      `composition staged in ${path.relative(ROOT, PUBLIC_COPY)}`,
  )
}

await main()
