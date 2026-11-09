/*
 * Makes the web copies of the photo cloud sprites: each public/clouds/*.png
 * (the 0.5–2 MB originals) becomes <name>-640.webp and <name>-1280.webp with
 * their transparency, about 50–250 KB each. The site loads these directly
 * (cloud-background.jsx), so no cloud waits on the image optimizer.
 *
 *   node scripts/optimize-cloud-sprites.mjs
 *
 * Run it after adding or changing a sprite PNG, then add the sprite to
 * CLOUD_SPRITES in cloud-background.jsx.
 */
import { readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

const cloudsDir = path.join(import.meta.dirname, '..', 'public', 'clouds')
const WIDTHS = [640, 1280]

const files = (await readdir(cloudsDir)).filter((file) => file.endsWith('.png'))
for (const file of files) {
  const source = path.join(cloudsDir, file)
  const { width, height } = await sharp(source).metadata()
  const sizes = []
  for (const target of WIDTHS) {
    const output = path.join(cloudsDir, file.replace(/\.png$/u, `-${target}.webp`))
    const buffer = await sharp(source)
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 78, alphaQuality: 80, effort: 6 })
      .toBuffer()
    await writeFile(output, buffer)
    sizes.push(`${target}w ${Math.round(buffer.length / 1024)} KB`)
  }
  const original = Math.round((await stat(source)).size / 1024)
  console.log(`${file} (${width}×${height}, ${original} KB) -> ${sizes.join(', ')}`)
}
