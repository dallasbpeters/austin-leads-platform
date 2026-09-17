/*
 * Watches the reel compositions and re-stages them on every save.
 *
 * The studio preview at /reels loads a COPY of the composition from
 * public/reels/<theme>/, not the file you edit. Without this, a CSS change in
 * videos/<theme>/index.html never reaches the browser. Run this next to
 * `pnpm dev` and the copy follows your edits.
 *
 *   node scripts/watch-reel-assets.mjs         # both themes
 *   node scripts/watch-reel-assets.mjs brand   # brand only
 *
 * Uses node's own file watcher, so there is no extra package to install.
 */

import { execFile } from 'node:child_process'
import { watch } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

const ROOT = path.resolve(import.meta.dirname, '..')
const SYNC = path.join(ROOT, 'scripts/sync-reel-assets.mjs')
const THEMES = { christmas: 'videos/christmas-reels', brand: 'videos/brand-reels' }

const only = process.argv[2]
if (only && !THEMES[only]) {
  console.error(`Unknown theme: ${only}. Available: ${Object.keys(THEMES).join(', ')}`)
  process.exit(1)
}
const watched = only ? { [only]: THEMES[only] } : THEMES

/* One sync at a time, and one more queued at most: a save storm is still one run. */
let running = false
let queued = null

async function sync(theme) {
  if (running) {
    queued = theme
    return
  }
  running = true
  try {
    const { stdout } = await run('node', [SYNC, theme])
    process.stdout.write(stdout)
  } catch (error) {
    console.error(`[reel-watch] sync failed: ${error.message}`)
  } finally {
    running = false
    const next = queued
    queued = null
    if (next) {
      await sync(next)
    }
  }
}

/* Editors save in bursts (write, rename, truncate). Wait for the dust. */
const timers = new Map()
const schedule = (theme) => {
  clearTimeout(timers.get(theme))
  timers.set(
    theme,
    setTimeout(() => sync(theme), 120),
  )
}

for (const [theme, dir] of Object.entries(watched)) {
  const full = path.join(ROOT, dir)
  watch(full, { recursive: true }, (_event, filename) => {
    /* assets/ is what the sync WRITES. Reacting to it would loop forever. */
    if (!filename || filename.startsWith('assets') || filename.startsWith('snapshots')) {
      return
    }
    schedule(theme)
  })
  console.log(`[reel-watch] watching ${dir}`)
}

/* Stage once up front, so the preview is correct the moment you open it. */
for (const theme of Object.keys(watched)) {
  await sync(theme)
}
console.log('[reel-watch] ready — hard-refresh the browser after a change (Cmd+Shift+R)')
