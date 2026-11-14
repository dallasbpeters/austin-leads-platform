/*
 * The roof picture from the "See if solar is right for you" form, drawn on the
 * server: the roof photo cropped like the page crops it (roof-view.js), with
 * the visitor's panels drawn on top the way solar-fit-roof.jsx draws them.
 * Saved as the system layout image on the draft quote an estimate creates.
 */

import sharp from 'sharp'

import { mapPhotoWebp } from './google'
import { roofView } from './roof-view'

const OUTPUT_WIDTH = 1200

// The page's panel colours (solar-fit.css), as sRGB: the SVG renderer has no oklch().
const GLASS_STOPS = ['#2b3d57', '#152237', '#0c1626']
const CELL_STROKE = 'rgba(158, 170, 186, 0.45)'
const FRAME_STROKE = '#d6dbe2'
const CELLS_SHORT = 6
const CELLS_LONG = 10

/** The photo's bytes: the aerial comes as a data URL, the Maps photo is fetched. */
async function photoBytes(photo, roof) {
  if (photo.src.startsWith('data:')) {
    return Buffer.from(photo.src.slice(photo.src.indexOf(',') + 1), 'base64')
  }
  return mapPhotoWebp(roof.center.lat, roof.center.lng, photo.zoom)
}

function panelSvg({ x, y, width, height, landscape, azimuth }) {
  const columns = landscape ? CELLS_LONG : CELLS_SHORT
  const rows = landscape ? CELLS_SHORT : CELLS_LONG
  const left = x - width / 2
  const top = y - height / 2
  const cells = [
    ...Array.from(
      { length: columns - 1 },
      (_, i) => `M${left + ((i + 1) * width) / columns} ${top}v${height}`,
    ),
    ...Array.from({ length: rows - 1 }, (_, i) => `M${left} ${top + ((i + 1) * height) / rows}h${width}`),
  ].join('')
  return `<g transform="rotate(${azimuth} ${x} ${y})">
    <rect x="${left}" y="${top}" width="${width}" height="${height}" fill="url(#glass)"/>
    <path d="${cells}" fill="none" stroke="${CELL_STROKE}" stroke-width="0.02"/>
    <rect x="${left}" y="${top}" width="${width}" height="${height}" fill="none" stroke="${FRAME_STROKE}" stroke-width="0.04"/>
  </g>`
}

/**
 * The first `count` panels on the roof photo, as a JPEG data URL.
 *
 * @param {object} roof  roofAt() result
 * @param {object} photo roofPhoto() result (photo size and panel spots in metres)
 * @param {number} count panels to draw
 */
export async function renderRoofLayout({ roof, photo, count }) {
  const view = roofView(photo, roof.panelHeight)
  const source = sharp(await photoBytes(photo, roof))
  const { width: photoWidth, height: photoHeight } = await source.metadata()
  const pxPerMeterX = photoWidth / photo.metersWide
  const pxPerMeterY = photoHeight / photo.metersTall

  const left = Math.max(0, Math.round(view.x * pxPerMeterX))
  const top = Math.max(0, Math.round(view.y * pxPerMeterY))
  const crop = {
    left,
    top,
    width: Math.min(photoWidth - left, Math.round(view.width * pxPerMeterX)),
    height: Math.min(photoHeight - top, Math.round(view.height * pxPerMeterY)),
  }
  const outputHeight = Math.round(OUTPUT_WIDTH * (view.height / view.width))

  const panels = roof.panels.slice(0, count).map((panel, index) => {
    const spot = photo.panels[index]
    return panelSvg({
      x: spot.x,
      y: spot.y,
      width: panel.landscape ? roof.panelHeight : roof.panelWidth,
      height: panel.landscape ? roof.panelWidth : roof.panelHeight,
      landscape: panel.landscape,
      azimuth: panel.azimuth,
    })
  })
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUTPUT_WIDTH}" height="${outputHeight}"
    viewBox="${view.x} ${view.y} ${view.width} ${view.height}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${GLASS_STOPS[0]}"/>
        <stop offset="0.45" stop-color="${GLASS_STOPS[1]}"/>
        <stop offset="1" stop-color="${GLASS_STOPS[2]}"/>
      </linearGradient>
    </defs>
    ${panels.join('')}
  </svg>`

  const jpeg = await source
    .extract(crop)
    .resize(OUTPUT_WIDTH, outputHeight, { fit: 'fill' })
    .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer()

  return `data:image/jpeg;base64,${jpeg.toString('base64')}`
}
