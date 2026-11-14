/*
 * The crop of the roof photo that the form shows, in photo metres. Shared by the
 * page (solar-fit-roof.jsx) and the server picture saved on draft quotes
 * (roof-render.js), so both show the same view of the roof.
 */

/** Margin around the roof, in metres, so the panels never touch the frame edge. */
const ROOF_MARGIN = 3

/** The map's width over its height; it matches .solar-fit__roof-frame's aspect-ratio. */
export const ROOF_VIEW_ASPECT = 6 / 5

/**
 * A view in photo metres, ROOF_VIEW_ASPECT wide, around every panel spot on the
 * roof (not only the ones shown), so the view stays put as the panel count
 * changes. The photo comes wider than the roof; this zooms in on the house.
 */
export function roofView(photo, panelSize, aspect = ROOF_VIEW_ASPECT) {
  if (!photo.panels.length) {
    const height = Math.min(photo.metersTall, photo.metersWide / aspect)
    return {
      x: (photo.metersWide - height * aspect) / 2,
      y: (photo.metersTall - height) / 2,
      width: height * aspect,
      height,
    }
  }
  const xs = photo.panels.map((panel) => panel.x)
  const ys = photo.panels.map((panel) => panel.y)
  const reach = panelSize + ROOF_MARGIN
  const left = Math.min(...xs) - reach
  const right = Math.max(...xs) + reach
  const top = Math.min(...ys) - reach
  const bottom = Math.max(...ys) + reach
  // Wide enough for the panels across and down, then cut to the photo.
  const height = Math.min(
    Math.max(bottom - top, (right - left) / aspect),
    photo.metersTall,
    photo.metersWide / aspect,
  )
  const width = height * aspect
  const clamp = (value, size, max) => Math.min(Math.max(value, 0), max - size)
  return {
    x: clamp((left + right) / 2 - width / 2, width, photo.metersWide),
    y: clamp((top + bottom) / 2 - height / 2, height, photo.metersTall),
    width,
    height,
  }
}
