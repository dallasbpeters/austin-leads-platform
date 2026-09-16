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

import { copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROJECT = path.join(ROOT, 'videos/christmas-reels/assets')

/** [from public/, to assets/] */
const FILES = [
  ['christmas-logo-reversed.svg', 'brand/christmas-logo-reversed.svg'],
  ['images/tx-christmas-logo.svg', 'brand/tx-christmas-logo.svg'],
  ['fonts/Switzer-Variable.woff2', 'fonts/Switzer-Variable.woff2'],
  ['fonts/BespokeSerif-Variable.woff2', 'fonts/BespokeSerif-Variable.woff2'],
]

async function copyBulbs() {
  const from = path.join(ROOT, 'public/christmas-mockup')
  const names = (await readdir(from)).filter((name) => name.startsWith('c9-') && name.endsWith('.png'))
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
  console.log(
    `[reel-assets] copied ${FILES.length} brand files and ${bulbs} bulb images into ${path.relative(ROOT, PROJECT)}`,
  )
}

await main()
