/*
 * Christmas lights photo mockup — canvas rendering.
 *
 * What makes it read as real lights rather than dots:
 * - physical parts first (wire with a slight sag between clips, garland
 *   needles, stakes), then the photo + parts are graded to night together
 * - C9 bulbs use the recolored bulb art (upright on the clip), garland uses
 *   the garland photo tiled along the line, mini lights are small hot points;
 *   each bulb gets its own brightness and size
 * - three light passes: a wide low-res spill that washes the roof, walls, and
 *   ground; a halo around each bulb; then the bright bulb core on top
 */

import {
  bulbHex,
  bulbsForShape,
  GARLAND,
  isAreaService,
  pixelsPerFoot,
  pointsAlongPolyline,
  ROOFLINE,
  seededRandom,
  STAKE_LIGHTS,
} from '@/lib/christmas/mockup-geometry'

const SPILL_SCALE = 6
const MULTICOLOR_COUNT = 5

const hexToRgb = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const rgba = (hex, alpha, shade = 1) => {
  const [r, g, b] = hexToRgb(hex).map((channel) => Math.round(channel * shade))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const cached = (cache, key, build) => {
  if (!cache.has(key)) {
    cache.set(key, build())
  }
  return cache.get(key)
}

const makeCanvas = (width, height) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(width))
  canvas.height = Math.max(1, Math.ceil(height))
  return canvas
}

// ─── Photo-real art (public/christmas-mockup, built by scripts/prepare-mockup-assets.py) ─

const ASSET_BASE = '/christmas-mockup'

/** Bulb glow color → recolored C9 art. */
const C9_ART = {
  '#ffc46b': 'warm-white',
  '#eef6ff': 'bright-white',
  '#ff2b2b': 'red',
  '#1fd65f': 'green',
  '#3b82f6': 'blue',
  '#ffb000': 'amber',
  '#e447ff': 'purple',
}

const loadImage = async (src) => {
  const img = new Image()
  img.src = src
  await img.decode()
  return img
}

/**
 * Loads the C9 and garland art. Drawing falls back to the vector bulbs and
 * needles if this hasn't finished (or failed), so the page never blocks on it.
 */
export async function loadMockupAssets() {
  const names = [...new Set(Object.values(C9_ART))]
  const [garland, ...bulbs] = await Promise.all([
    loadImage(`${ASSET_BASE}/garland.webp`),
    ...names.map((name) => loadImage(`${ASSET_BASE}/c9-${name}.png`)),
  ])
  return { garland, c9: Object.fromEntries(names.map((name, index) => [name, bulbs[index]])) }
}

// ─── Sprites ─────────────────────────────────────────────────────────────────

const sprites = new Map()

/** Soft radial glow, used for halos and (at low res) for light spill. */
function glowSprite(hex, radius) {
  return cached(sprites, `glow|${hex}|${radius}`, () => {
    const size = radius * 2
    const canvas = makeCanvas(size, size)
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius)
    gradient.addColorStop(0, rgba(hex, 0.9))
    gradient.addColorStop(0.12, rgba(hex, 0.45))
    gradient.addColorStop(0.35, rgba(hex, 0.14))
    gradient.addColorStop(1, rgba(hex, 0))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return canvas
  })
}

/** Upright C9 bulb with socket. Anchor is bottom-center (where it clips to the wire). */
function c9Sprite(hex, radius) {
  return cached(sprites, `c9|${hex}|${radius}`, () => {
    const bodyHeight = radius * 2.3
    const halfWidth = radius * 0.62
    const socketHeight = radius * 0.55
    const canvas = makeCanvas(halfWidth * 2.6, bodyHeight + socketHeight + 2)
    const ctx = canvas.getContext('2d')
    const cx = canvas.width / 2
    const baseY = canvas.height - socketHeight
    const top = baseY - bodyHeight

    ctx.beginPath()
    ctx.moveTo(cx - halfWidth * 0.7, baseY)
    ctx.bezierCurveTo(
      cx - halfWidth * 1.2,
      baseY - bodyHeight * 0.45,
      cx - halfWidth * 0.4,
      top + bodyHeight * 0.18,
      cx,
      top,
    )
    ctx.bezierCurveTo(
      cx + halfWidth * 0.4,
      top + bodyHeight * 0.18,
      cx + halfWidth * 1.2,
      baseY - bodyHeight * 0.45,
      cx + halfWidth * 0.7,
      baseY,
    )
    ctx.closePath()
    const glass = ctx.createRadialGradient(
      cx,
      baseY - bodyHeight * 0.38,
      0,
      cx,
      baseY - bodyHeight * 0.38,
      bodyHeight * 0.72,
    )
    glass.addColorStop(0, '#ffffff')
    glass.addColorStop(0.22, rgba(hex, 1, 1.08))
    glass.addColorStop(0.6, rgba(hex, 1))
    glass.addColorStop(1, rgba(hex, 1, 0.55))
    ctx.fillStyle = glass
    ctx.fill()

    // Faceted glass: a couple of faint vertical ridges and a highlight.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
    ctx.lineWidth = Math.max(0.5, radius * 0.08)
    for (const offset of [-0.35, 0.3]) {
      ctx.beginPath()
      ctx.moveTo(cx + halfWidth * offset, baseY - bodyHeight * 0.1)
      ctx.lineTo(cx + halfWidth * offset * 0.4, top + bodyHeight * 0.25)
      ctx.stroke()
    }

    ctx.fillStyle = '#1b1e1b'
    ctx.fillRect(cx - halfWidth * 0.55, baseY - 0.5, halfWidth * 1.1, socketHeight + 0.5)
    return canvas
  })
}

/** Mini (5mm / M5) light: a small hot point. Anchor is center. */
function miniSprite(hex, radius) {
  return cached(sprites, `mini|${hex}|${radius}`, () => {
    const size = radius * 1.4
    const canvas = makeCanvas(size, size)
    const ctx = canvas.getContext('2d')
    const c = canvas.width / 2
    const gradient = ctx.createRadialGradient(c, c, 0, c, c, c)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(0.3, rgba(hex, 1, 1.1))
    gradient.addColorStop(0.7, rgba(hex, 0.85))
    gradient.addColorStop(1, rgba(hex, 0))
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(c, c, c * 0.75, c, 0, 0, Math.PI * 2)
    ctx.fill()
    return canvas
  })
}

// ─── Bulb layout per service ─────────────────────────────────────────────────

const quantize = (value) => Math.max(1, Math.round(value * 2) / 2)

/*
 * Every bulb gets a stable intensity and size wobble from the shape's seed.
 * Tree and garland bulbs sometimes sit "behind" branches — dimmer and smaller.
 */
function layoutBulbs(shape, radius, pxPerFoot) {
  const random = seededRandom(shape.seed || 1)
  const mini = isAreaService(shape.service) || shape.service === GARLAND
  let points = bulbsForShape(shape, radius, pxPerFoot)

  if (shape.service === GARLAND) {
    points = points.map((point) => ({
      ...point,
      x: point.x + (random() - 0.5) * radius * 2.4,
      y: point.y + (random() - 0.5) * radius * 2.4,
    }))
  }

  return points.map((point, index) => {
    const behind = point.behind ?? (mini && random() < 0.3)
    const colorIndex = mini ? Math.floor(random() * MULTICOLOR_COUNT) : index
    return {
      ...point,
      hex: bulbHex(shape.color, colorIndex),
      kind: mini ? 'mini' : 'c9',
      angle: shape.service === STAKE_LIGHTS ? 0 : point.angle,
      // Roofline C9s hang from the clip; stake bulbs stand up on the stake.
      hang: shape.service === ROOFLINE,
      intensity: (behind ? 0.45 : 0.82) + random() * 0.18,
      size: radius * (behind ? 0.6 : 0.85 + random() * 0.2) * (shape.service === STAKE_LIGHTS ? 1.35 : 1),
    }
  })
}

// ─── Physical parts (graded to night along with the photo) ───────────────────

function drawWire(ctx, bulbs, radius, sagFactor) {
  if (bulbs.length < 2) {
    return
  }
  ctx.save()
  ctx.strokeStyle = '#0c120d'
  ctx.lineWidth = Math.max(1, radius * 0.26)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(bulbs[0].x, bulbs[0].y)
  for (let index = 1; index < bulbs.length; index += 1) {
    const a = bulbs[index - 1]
    const b = bulbs[index]
    const span = Math.hypot(b.x - a.x, b.y - a.y)
    const flatness = Math.abs(b.x - a.x) / (span || 1)
    ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + span * sagFactor * flatness, b.x, b.y)
  }
  ctx.stroke()
  ctx.restore()
}

const GARLAND_GREENS = ['#1c3a20', '#28502c', '#356638', '#4a7d45', '#16301a']

/*
 * Tiles the garland photo along each segment. Tiles overlap and alternate
 * mirror images so the repeat and the seams don't show.
 */
function drawGarlandArt(ctx, shape, radius, art) {
  const thickness = radius * 8
  const tileWidth = thickness * (art.width / art.height)
  ctx.save()
  for (let index = 1; index < shape.points.length; index += 1) {
    const start = shape.points[index - 1]
    const end = shape.points[index]
    const length = Math.hypot(end.x - start.x, end.y - start.y)
    const count = Math.max(1, Math.ceil(length / (tileWidth * 0.8)))
    const step = length / count
    for (let tile = 0; tile < count; tile += 1) {
      const t = (tile + 0.5) / count
      ctx.save()
      ctx.translate(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t)
      ctx.rotate(Math.atan2(end.y - start.y, end.x - start.x))
      ctx.scale((index + tile) % 2 ? -1 : 1, 1)
      const width = Math.min(tileWidth, step / 0.8)
      ctx.drawImage(art, -width / 2, -thickness / 2, width, thickness)
      ctx.restore()
    }
  }
  ctx.restore()
}

function drawGarland(ctx, shape, radius, assets) {
  if (shape.points.length < 2) {
    return
  }
  if (assets?.garland) {
    drawGarlandArt(ctx, shape, radius, assets.garland)
    return
  }
  const random = seededRandom((shape.seed || 1) + 7)
  ctx.save()
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#0e1f10'
  ctx.lineWidth = radius * 3
  ctx.beginPath()
  shape.points.forEach((point, index) =>
    index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
  )
  ctx.stroke()

  ctx.lineWidth = Math.max(1, radius * 0.22)
  for (const point of pointsAlongPolyline(shape.points, radius * 0.3)) {
    for (let needle = 0; needle < 9; needle += 1) {
      const angle = random() * Math.PI * 2
      const length = radius * (0.8 + random() * 1.6)
      ctx.strokeStyle = GARLAND_GREENS[Math.floor(random() * GARLAND_GREENS.length)]
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
      ctx.lineTo(point.x + Math.cos(angle) * length, point.y + Math.sin(angle) * length)
      ctx.stroke()
    }
  }
  ctx.restore()
}

const stakeLength = (bulb) => bulb.size * 5

function drawStakes(ctx, bulbs) {
  ctx.save()
  ctx.strokeStyle = '#161916'
  ctx.lineCap = 'round'
  for (const bulb of bulbs) {
    ctx.lineWidth = Math.max(1, bulb.size * 0.3)
    ctx.beginPath()
    ctx.moveTo(bulb.x, bulb.y)
    ctx.lineTo(bulb.x, bulb.y + stakeLength(bulb))
    ctx.stroke()
  }
  ctx.restore()
}

function drawPhysical(ctx, shape, bulbs, radius, assets) {
  if (shape.service === GARLAND) {
    drawGarland(ctx, shape, radius, assets)
  } else if (shape.service === STAKE_LIGHTS) {
    drawStakes(ctx, bulbs)
    drawWire(
      ctx,
      bulbs.map((bulb) => ({ x: bulb.x, y: bulb.y + stakeLength(bulb) })),
      radius,
      0.04,
    )
  } else if (shape.service === ROOFLINE) {
    drawWire(ctx, bulbs, radius, 0.12)
  }
}

function gradeToNight(ctx, width, height, nightT) {
  if (nightT <= 0) {
    return
  }
  const mix = (day, dusk) => Math.round(day + (dusk - day) * nightT)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = `rgb(${mix(255, 46)}, ${mix(255, 58)}, ${mix(255, 96)})`
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = `rgba(2, 4, 12, ${nightT * 0.3})`
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

// ─── Light passes ────────────────────────────────────────────────────────────

let spillCanvas = null

function drawSpill(ctx, allBulbs, width, height, nightT) {
  const spillWidth = Math.ceil(width / SPILL_SCALE)
  const spillHeight = Math.ceil(height / SPILL_SCALE)
  if (!spillCanvas || spillCanvas.width !== spillWidth || spillCanvas.height !== spillHeight) {
    spillCanvas = makeCanvas(spillWidth, spillHeight)
  }
  const spill = spillCanvas.getContext('2d')
  spill.clearRect(0, 0, spillWidth, spillHeight)
  spill.globalCompositeOperation = 'lighter'

  for (const bulb of allBulbs) {
    const radius = quantize((bulb.size * (bulb.kind === 'mini' ? 8 : 14)) / SPILL_SCALE)
    const sprite = glowSprite(bulb.hex, radius)
    const x = bulb.x / SPILL_SCALE
    const y = bulb.y / SPILL_SCALE
    spill.globalAlpha = bulb.intensity * (bulb.kind === 'mini' ? 0.1 : 0.32)
    spill.drawImage(sprite, x - radius, y - radius)

    if (bulb.stake) {
      // Pool of light on the ground at the base of each stake.
      const groundY = (bulb.y + stakeLength(bulb)) / SPILL_SCALE
      spill.globalAlpha = bulb.intensity * 0.35
      spill.drawImage(sprite, x - radius * 1.4, groundY - radius * 0.4, radius * 2.8, radius * 0.8)
    }
  }

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = 0.25 + nightT * 0.75
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(spillCanvas, 0, 0, width, height)
  ctx.restore()
}

/* A C9 glows from the middle of its glass, not from the clip point. */
const glowCenter = (bulb) => {
  if (bulb.kind !== 'c9') {
    return bulb
  }
  const reach = bulb.size * 2.4 * (bulb.hang ? -1 : 1)
  return {
    x: bulb.x + Math.sin(bulb.angle || 0) * reach,
    y: bulb.y - Math.cos(bulb.angle || 0) * reach,
  }
}

function drawHalos(ctx, allBulbs, nightT) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const bulb of allBulbs) {
    const radius = quantize(bulb.size * (bulb.kind === 'mini' ? 3.2 : 4.2))
    const sprite = glowSprite(bulb.hex, radius)
    const center = glowCenter(bulb)
    ctx.globalAlpha = Math.min(1, bulb.intensity * (0.35 + nightT * 0.9))
    ctx.drawImage(sprite, center.x - radius, center.y - radius)
  }
  ctx.restore()
}

/* C9 art height as a multiple of bulb radius — the socket is about a third of it. */
const C9_ART_HEIGHT = 4.2

function drawCores(ctx, allBulbs, assets) {
  ctx.save()
  for (const bulb of allBulbs) {
    ctx.globalAlpha = Math.min(1, bulb.intensity + 0.15)
    if (bulb.kind === 'mini') {
      const sprite = miniSprite(bulb.hex, quantize(bulb.size))
      ctx.drawImage(sprite, bulb.x - sprite.width / 2, bulb.y - sprite.height / 2)
      continue
    }
    ctx.save()
    ctx.translate(bulb.x, bulb.y)
    ctx.rotate(bulb.angle || 0)
    const art = assets?.c9[C9_ART[bulb.hex]]
    if (!bulb.hang) {
      // Flip so the socket sits at the bottom and the bulb points up.
      ctx.scale(1, -1)
    }
    if (art) {
      // The art is socket-up with the bulb pointing down, anchored at the socket.
      const artHeight = bulb.size * C9_ART_HEIGHT
      const artWidth = artHeight * (art.width / art.height)
      ctx.drawImage(art, -artWidth / 2, -artHeight * 0.04, artWidth, artHeight)
    } else {
      // The drawn fallback points up from its anchor, so mirror it back.
      const sprite = c9Sprite(bulb.hex, quantize(bulb.size))
      ctx.scale(1, -1)
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height)
    }
    ctx.restore()
  }
  ctx.restore()
}

// ─── Editing guides ──────────────────────────────────────────────────────────

/* Guide sizes are in screen pixels (times guideScale) so dots stay finger-sized at any zoom. */
function drawGuides(ctx, shape, guideScale, closed, activeIndex = -1) {
  if (!shape.points.length) {
    return
  }
  const dot = 7 * guideScale
  ctx.save()
  ctx.lineWidth = 2 * guideScale
  ctx.setLineDash([8 * guideScale, 6 * guideScale])
  ctx.strokeStyle = 'rgba(255, 208, 107, 0.95)'
  ctx.beginPath()
  shape.points.forEach((point, index) =>
    index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y),
  )
  if (closed) {
    ctx.closePath()
  }
  ctx.stroke()
  ctx.setLineDash([])
  shape.points.forEach((point, index) => {
    const active = index === activeIndex
    ctx.beginPath()
    ctx.arc(point.x, point.y, active ? dot * 1.35 : dot, 0, Math.PI * 2)
    ctx.fillStyle = active ? '#fb2c36' : '#ffd06b'
    ctx.strokeStyle = '#040a17'
    ctx.lineWidth = 1.5 * guideScale
    ctx.fill()
    ctx.stroke()
  })
  ctx.restore()
}

/* The measuring line: cyan so it never reads as lights, with end ticks and its length. */
function drawScaleGuide(ctx, points, feet, guideScale) {
  const [a, b] = points
  ctx.save()
  ctx.strokeStyle = '#22d3ee'
  ctx.fillStyle = '#22d3ee'
  ctx.lineWidth = 2.5 * guideScale
  if (b) {
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  for (const point of points) {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 6 * guideScale, 0, Math.PI * 2)
    ctx.fill()
  }
  if (b && feet) {
    const label = `${Math.round(feet * 10) / 10} ft`
    ctx.font = `600 ${13 * guideScale}px system-ui, sans-serif`
    const width = ctx.measureText(label).width + 12 * guideScale
    const x = (a.x + b.x) / 2 - width / 2
    const y = (a.y + b.y) / 2 - 26 * guideScale
    ctx.fillStyle = 'rgba(4, 10, 23, 0.85)'
    ctx.fillRect(x, y, width, 20 * guideScale)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, x + 6 * guideScale, y + 15 * guideScale)
  }
  ctx.restore()
}

/** Paints the whole mockup. `showGuides` is false for the exported picture. */
export function paintMockup(
  canvas,
  {
    image,
    assets,
    shapes,
    draft,
    selectedId,
    activeDot = null,
    night,
    bulbRadius,
    showGuides,
    guideScale = 1,
    scale = null,
    scaleDraft = null,
  },
) {
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  const nightT = night / 100
  const pxPerFoot = pixelsPerFoot(scale)
  const all = draft ? [...shapes, draft] : shapes
  const laidOut = all.map((shape) => {
    const bulbs = layoutBulbs(shape, bulbRadius, pxPerFoot)
    return {
      shape,
      bulbs: shape.service === STAKE_LIGHTS ? bulbs.map((bulb) => ({ ...bulb, stake: true })) : bulbs,
    }
  })
  const allBulbs = laidOut.flatMap(({ bulbs }) => bulbs)

  ctx.save()
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)
  for (const { shape, bulbs } of laidOut) {
    drawPhysical(ctx, shape, bulbs, bulbRadius, assets)
  }
  gradeToNight(ctx, width, height, nightT)
  ctx.restore()

  drawSpill(ctx, allBulbs, width, height, nightT)
  drawHalos(ctx, allBulbs, nightT)
  drawCores(ctx, allBulbs, assets)

  if (!showGuides) {
    return
  }
  const selected = shapes.find((shape) => shape.id === selectedId)
  if (selected) {
    drawGuides(ctx, selected, guideScale, isAreaService(selected.service), activeDot?.index ?? -1)
  }
  if (draft) {
    drawGuides(ctx, draft, guideScale, false)
  }
  if (scaleDraft?.length) {
    drawScaleGuide(ctx, scaleDraft, null, guideScale)
  } else if (scale) {
    drawScaleGuide(ctx, [scale.a, scale.b], scale.feet, guideScale)
  }
}
