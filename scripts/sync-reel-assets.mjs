/*
 * Copies the brand pieces a reel template needs out of public/ and into the
 * HyperFrames project.
 *
 * `videos/*_/assets/` is git-ignored on purpose (media is reproducible, and the
 * repo stays small), but a render still needs the files on disk. They all
 * already live in public/, so this is a copy rather than a second source of
 * truth. Run it after a fresh clone, and the Docker build runs it too.
 *
 *   node scripts/sync-reel-assets.mjs           # both themes
 *   node scripts/sync-reel-assets.mjs christmas # christmas only
 *   node scripts/sync-reel-assets.mjs brand     # brand only
 */

import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

/** Theme configuration: what to copy and where to stage it. */
const THEMES = {
  christmas: {
    projectDir: path.join(ROOT, 'videos/christmas-reels'),
    publicCopy: path.join(ROOT, 'public/reels/christmas-reels'),
    files: [
      ['christmas-logo.svg', 'brand/christmas-logo.svg'],
      ['images/tx-christmas-logo.svg', 'brand/tx-christmas-logo.svg'],
      ['fonts/Switzer-Variable.woff2', 'fonts/Switzer-Variable.woff2'],
      ['fonts/BespokeSerif-Variable.woff2', 'fonts/BespokeSerif-Variable.woff2'],
      ['images/tx-christmas-hero-collage.png', 'brand/sample-photo.png'],
    ],
    musicFile: 'christmas.mp3',
    bulbDir: 'christmas-mockup',
    bulbPrefix: 'c9-',
  },
  brand: {
    projectDir: path.join(ROOT, 'videos/brand-reels'),
    publicCopy: path.join(ROOT, 'public/reels/brand-reels'),
    files: [
      ['tx-solar-logo.svg', 'brand/tx-solar-logo.svg'],
      ['fonts/Switzer-Variable.woff2', 'fonts/Switzer-Variable.woff2'],
      ['fonts/BespokeSerif-Variable.woff2', 'fonts/BespokeSerif-Variable.woff2'],
      // A stand-in job photo, so a photo scene previews before anyone uploads one.
      ['images/tx-christmas-hero-collage.png', 'brand/sample-photo.png'],
      // Cloud sprite for daylight sky animation.
      ['clouds/cloud-sprite.png', 'cloud-sprite.png'],
    ],
    musicFile: 'brand.mp3',
    bulbDir: null,
    bulbPrefix: null,
  },
}

/* A chosen soundtrack, if the team has dropped one in: public/reel-music/<file>. */
async function copyMusic(root, projectAssets, musicFile) {
  const from = path.join(root, 'public/reel-music', musicFile)
  try {
    await mkdir(path.join(projectAssets, 'music'), { recursive: true })
    await copyFile(from, path.join(projectAssets, 'music', musicFile))
    return true
  } catch {
    return false
  }
}

async function copyBulbs(root, projectAssets, bulbDir, bulbPrefix) {
  if (!bulbDir || !bulbPrefix) {
    return 0
  }
  const from = path.join(root, 'public', bulbDir)
  try {
    const entries = await readdir(from)
    const names = entries.filter((name) => name.startsWith(bulbPrefix) && name.endsWith('.png'))
    await mkdir(path.join(projectAssets, 'brand'), { recursive: true })
    for (const name of names) {
      await copyFile(path.join(from, name), path.join(projectAssets, 'brand', name))
    }
    return names.length
  } catch {
    return 0
  }
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

async function syncTheme(root, themeName, theme) {
  const projectDir = theme.projectDir
  const projectAssets = path.join(projectDir, 'assets')
  const publicCopy = theme.publicCopy

  // Copy brand files
  for (const [from, to] of theme.files) {
    const target = path.join(projectAssets, to)
    await mkdir(path.dirname(target), { recursive: true })
    await copyFile(path.join(root, 'public', from), target)
  }

  // Copy bulbs (Christmas only)
  const bulbs = await copyBulbs(root, projectAssets, theme.bulbDir, theme.bulbPrefix)

  // Copy music (optional)
  const music = await copyMusic(root, projectAssets, theme.musicFile)

  // Stage preview for the studio iframe
  await rm(publicCopy, { recursive: true, force: true })
  await mkdir(publicCopy, { recursive: true })
  await copyFile(path.join(projectDir, 'index.html'), path.join(publicCopy, 'index.html'))
  await cp(projectAssets, path.join(publicCopy, 'assets'), { recursive: true })
  await writePreview(path.join(publicCopy, 'index.html'), path.join(publicCopy, 'preview.html'))

  console.log(
    `[reel-assets] ${themeName}: ${theme.files.length} brand files + ${bulbs} bulbs${music ? ' + chosen music' : ''} into ${path.relative(root, projectAssets)}; ` +
      `composition + preview staged in ${path.relative(root, publicCopy)}`,
  )
}

async function main() {
  const arg = process.argv[2]
  const themesToSync = arg ? [arg] : Object.keys(THEMES)

  for (const themeName of themesToSync) {
    const theme = THEMES[themeName]
    if (!theme) {
      console.error(`Unknown theme: ${themeName}. Available: ${Object.keys(THEMES).join(', ')}`)
      process.exit(1)
    }
    await syncTheme(ROOT, themeName, theme)
  }
}

await main()