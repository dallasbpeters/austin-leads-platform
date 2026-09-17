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

import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PROJECT_DIR = path.join(ROOT, 'videos/christmas-reels')
const PROJECT = path.join(PROJECT_DIR, 'assets')
/* The builder's live preview plays the real composition in an iframe, so the browser needs to reach it. */
const PUBLIC_COPY = path.join(ROOT, 'public/reels/christmas-reels')

/** [from public/, to assets/] */
const FILES = [
  ['christmas-logo.svg', 'brand/christmas-logo.svg'],
  ['images/tx-christmas-logo.svg', 'brand/tx-christmas-logo.svg'],
  ['fonts/Switzer-Variable.woff2', 'fonts/Switzer-Variable.woff2'],
  ['fonts/BespokeSerif-Variable.woff2', 'fonts/BespokeSerif-Variable.woff2'],
  // A stand-in job photo, so a photo scene previews before anyone uploads one.
  ['images/tx-christmas-hero-collage.png', 'brand/sample-photo.png'],
]

/* A chosen soundtrack, if the team has dropped one in: public/reel-music/christmas.mp3. */
async function copyMusic() {
  const from = path.join(ROOT, 'public/reel-music/christmas.mp3')
  try {
    await mkdir(path.join(PROJECT, 'music'), { recursive: true })
    await copyFile(from, path.join(PROJECT, 'music', 'christmas.mp3'))
    return true
  } catch {
    return false
  }
}

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

/*
 * The studio's live preview plays the composition in an iframe. It has to be a
 * real page on this origin — a srcdoc frame has no address, so relative asset
 * paths and the GSAP script tag both fail there. So we write a sibling
 * `preview.html`: the same composition, plus a shim that stands in for the
 * HyperFrames runtime, reads the scenes out of the URL hash, and answers seek
 * messages from the studio.
 */
const PREVIEW_SHIM = `
<script>
  (() => {
    const read = () => {
      try {
        return JSON.parse(decodeURIComponent(location.hash.slice(1)))
      } catch {
        return {}
      }
    }
    window.__hyperframes = { getVariables: read }

    // New scenes arrive as a new hash; the composition builds itself at load.
    window.addEventListener('hashchange', () => location.reload())

    window.addEventListener('message', (event) => {
      const timeline = window.__timelines && window.__timelines.main
      if (timeline && event.data && event.data.kind === 'reel:seek') {
        // \`false\` keeps callbacks firing: the price count-up and the sparks are onUpdate-driven.
        timeline.seek(Math.max(0, event.data.seconds), false)
      }
    })

    const announce = () => {
      if (window.__timelines && window.__timelines.main) {
        window.__timelines.main.seek(0)
        parent.postMessage({ kind: 'reel:ready' }, '*')
      } else {
        requestAnimationFrame(announce)
      }
    }
    requestAnimationFrame(announce)
  })()
</script>
`

async function writePreview(from, to) {
  const html = await readFile(from, 'utf8')
  await writeFile(to, html.replace('<head>', `<head>${PREVIEW_SHIM}`))
}

async function main() {
  for (const [from, to] of FILES) {
    const target = path.join(PROJECT, to)
    await mkdir(path.dirname(target), { recursive: true })
    await copyFile(path.join(ROOT, 'public', from), target)
  }
  const bulbs = await copyBulbs()
  const music = await copyMusic()

  await rm(PUBLIC_COPY, { recursive: true, force: true })
  await mkdir(PUBLIC_COPY, { recursive: true })
  await copyFile(path.join(PROJECT_DIR, 'index.html'), path.join(PUBLIC_COPY, 'index.html'))
  await cp(PROJECT, path.join(PUBLIC_COPY, 'assets'), { recursive: true })
  await writePreview(path.join(PUBLIC_COPY, 'index.html'), path.join(PUBLIC_COPY, 'preview.html'))

  console.log(
    `[reel-assets] ${FILES.length} brand files + ${bulbs} bulbs${music ? ' + chosen music' : ''} into ${path.relative(ROOT, PROJECT)}; ` +
      `composition + preview staged in ${path.relative(ROOT, PUBLIC_COPY)}`,
  )
}

await main()
