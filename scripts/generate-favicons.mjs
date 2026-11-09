import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'

const __dirname = import.meta.dirname
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')

/*
 * The favicon: the brand sun (public/images/sun.svg) on a Deep Sky blue tile,
 * so it reads on light and dark browser tabs alike. Run after changing either:
 *   node scripts/generate-favicons.mjs
 */
const TILE_COLOR = '#082f43'

const sunSvg = await readFile(path.join(publicDir, 'images', 'sun.svg'), 'utf8')
// The sun's drawing, without its XML header and outer <svg>, so it can sit inside the tile.
const sunInner = sunSvg.replace(/^[\s\S]*?<svg[^>]*>/u, '').replace(/<\/svg>\s*$/u, '')
const sunViewBox = /viewBox="([^"]+)"/u.exec(sunSvg)?.[1] || '0 0 1024 1024'

const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">
  <rect width="64" height="64" rx="14" fill="${TILE_COLOR}"/>
  <svg x="7" y="7" width="50" height="50" viewBox="${sunViewBox}">${sunInner}</svg>
</svg>
`

async function renderPng(size, outputPath) {
  const buffer = await sharp(Buffer.from(svgMarkup))
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  await writeFile(outputPath, buffer)
  return buffer
}

async function main() {
  await mkdir(publicDir, { recursive: true })

  const faviconSvgPath = path.join(publicDir, 'favicon.svg')
  const favicon16Path = path.join(publicDir, 'favicon-16x16.png')
  const favicon32Path = path.join(publicDir, 'favicon-32x32.png')
  const appleTouchIconPath = path.join(publicDir, 'apple-touch-icon.png')
  const faviconIcoPath = path.join(publicDir, 'favicon.ico')

  await writeFile(faviconSvgPath, svgMarkup)

  const [png16, png32] = await Promise.all([renderPng(16, favicon16Path), renderPng(32, favicon32Path)])

  await renderPng(180, appleTouchIconPath)

  const icoBuffer = await pngToIco([png16, png32])
  await writeFile(faviconIcoPath, icoBuffer)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
