/*
 * Christmas lights photo mockup — the geometry behind the canvas.
 *
 * Shapes live in image pixel space so the mockup looks the same at any
 * screen size and exports at full photo resolution. Kept free of DOM and
 * canvas so the math is unit-testable.
 */

import { CHRISTMAS_LIGHT_COLORS, CHRISTMAS_SERVICE_TYPES } from '@/lib/christmas/invoice-calc'

export const [TREE_LIGHTS, STAKE_LIGHTS, ROOFLINE, GARLAND, WREATH] = CHRISTMAS_SERVICE_TYPES
export const [WARM_WHITE, MULTICOLOR, BRIGHT_WHITE] = CHRISTMAS_LIGHT_COLORS

/** Tree lights fill a traced outline; every other service follows a traced line. */
export const isAreaService = (service) => service === TREE_LIGHTS

/** A wreath is one placed picture: a center point plus a `size` (its width in image pixels). */
export const isPlacedItem = (service) => service === WREATH

/** Minimum points before a shape can be finished. */
export const minPointsFor = (service) =>
  isAreaService(service) ? 3 : service === STAKE_LIGHTS || isPlacedItem(service) ? 1 : 2

/* A front-door wreath is about 2 ft across. Without a scale, a sensible share of the photo. */
const WREATH_FEET = 2

export const defaultWreathSize = (width, height, pxPerFoot = null) =>
  Math.round(pxPerFoot ? WREATH_FEET * pxPerFoot : Math.min(width, height) * 0.14)

export const MIN_WREATH_SIZE = 20

/** Where the resize handle sits: the wreath's lower-right corner. */
export const wreathHandle = (shape) => ({
  x: shape.points[0].x + shape.size / 2,
  y: shape.points[0].y + shape.size / 2,
})

/** New size when the handle is dragged to `point`: the corner stays under the finger. */
export const wreathSizeFromHandle = (shape, point) =>
  Math.max(
    MIN_WREATH_SIZE,
    Math.round(Math.max(Math.abs(point.x - shape.points[0].x), Math.abs(point.y - shape.points[0].y)) * 2),
  )

/*
 * Mini lights woven around the wreath ring, evenly spaced with a little
 * wobble so they don't look stamped on. `size` is the wreath's width.
 */
export function bulbsOnWreath(center, size, seed = 1) {
  const random = seededRandom(seed)
  const ring = size * 0.36
  const count = Math.max(8, Math.round(size / 9))
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + (random() - 0.5) * 0.25
    const reach = ring + (random() - 0.5) * size * 0.14
    return {
      x: center.x + Math.cos(angle) * reach,
      y: center.y + Math.sin(angle) * reach,
      behind: random() < 0.3,
    }
  })
}

/** Bulb spacing along a line or inside an area, as a multiple of bulb radius. */
const SPACING_FACTOR = {
  [ROOFLINE]: 5.5,
  [STAKE_LIGHTS]: 24,
  [GARLAND]: 5,
  [TREE_LIGHTS]: 2.6,
}

/** Real-world spacing once a scale is set: C9s every foot, garland lights every foot, stakes every 3 ft. */
export const REAL_SPACING_FEET = {
  [ROOFLINE]: 1,
  [STAKE_LIGHTS]: 3,
  [GARLAND]: 1,
}

export const bulbSpacing = (service, bulbRadius, pxPerFoot = null) =>
  pxPerFoot && REAL_SPACING_FEET[service]
    ? REAL_SPACING_FEET[service] * pxPerFoot
    : (SPACING_FACTOR[service] || 3.2) * bulbRadius

const MULTICOLOR_BULBS = ['#ff2b2b', '#1fd65f', '#3b82f6', '#ffb000', '#e447ff']

/** Bulb glow color. Multicolor cycles classic C9 colors by bulb index. */
export function bulbHex(color, index = 0) {
  if (color === MULTICOLOR) {
    return MULTICOLOR_BULBS[index % MULTICOLOR_BULBS.length]
  }
  return color === BRIGHT_WHITE ? '#eef6ff' : '#ffc46b'
}

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

/*
 * Clip angle for a bulb on a segment: perpendicular to the run and always
 * pointing up-ish, the way C9 clips hold bulbs on a gutter or rake.
 */
export function uprightAngle(start, end) {
  let angle = Math.atan2(end.y - start.y, end.x - start.x)
  if (angle > Math.PI / 2) {
    angle -= Math.PI
  } else if (angle <= -Math.PI / 2) {
    angle += Math.PI
  }
  return angle
}

/** Evenly spaced points along an open polyline, starting at its first point. Each carries its clip angle. */
export function pointsAlongPolyline(points, spacing) {
  if (!points.length || spacing <= 0) {
    return []
  }
  if (points.length === 1) {
    return [{ ...points[0], angle: 0 }]
  }

  const result = [{ ...points[0], angle: uprightAngle(points[0], points[1]) }]
  let carried = 0
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]
    const end = points[index]
    const length = distance(start, end)
    const angle = uprightAngle(start, end)
    let offset = spacing - carried
    while (offset <= length) {
      const t = offset / length
      result.push({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t, angle })
      offset += spacing
    }
    carried = length - (offset - spacing)
  }
  return result
}

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(point, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i]
    const b = polygon[j]
    const crosses =
      a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    if (crosses) {
      inside = !inside
    }
  }
  return inside
}

/** Small deterministic PRNG so a shape's bulbs don't jump around on every redraw. */
export function seededRandom(seed) {
  let state = Math.floor(seed) % 2_147_483_647 || 1
  return () => {
    state = (state * 16_807) % 2_147_483_647
    return (state - 1) / 2_147_483_646
  }
}

/** Left and right edges of a polygon along a horizontal line, or null if the line misses it. */
export function polygonSpanAt(polygon, y) {
  const xs = []
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i]
    const b = polygon[j]
    if (a.y > y !== b.y > y) {
      xs.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y))
    }
  }
  return xs.length < 2 ? null : { left: Math.min(...xs), right: Math.max(...xs) }
}

/*
 * Mini lights wrapped around a traced tree: the strand spirals down, so each
 * pass runs on a slight slant — front passes bright, back passes (seen
 * through the branches) flagged `behind`.
 */
export function bulbsInPolygon(polygon, spacing, seed = 1) {
  if (polygon.length < 3 || spacing <= 0) {
    return []
  }
  const ys = polygon.map((point) => point.y)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const random = seededRandom(seed)
  const passGap = spacing * 1.6
  const slant = passGap * 0.9
  const jitter = spacing * 0.3
  const bulbs = []

  for (let pass = 0; minY + pass * passGap < maxY; pass += 1) {
    const behind = pass % 2 === 1
    const y0 = minY + (pass + 0.5) * passGap
    const span = polygonSpanAt(polygon, y0 + slant / 2)
    if (!span) {
      continue
    }
    const width = span.right - span.left
    const count = Math.max(1, Math.round(width / spacing))
    for (let step = 0; step <= count; step += 1) {
      const t = count ? step / count : 0.5
      const across = behind ? 1 - t : t
      const candidate = {
        x: span.left + width * across + (random() - 0.5) * jitter,
        y: y0 + slant * t + (random() - 0.5) * jitter,
        behind,
      }
      if (pointInPolygon(candidate, polygon)) {
        bulbs.push(candidate)
      }
    }
  }
  return bulbs
}

/** Where the bulbs for one finished (or in-progress) shape go. */
export function bulbsForShape(shape, bulbRadius, pxPerFoot = null) {
  if (isPlacedItem(shape.service)) {
    return shape.points.length && shape.size ? bulbsOnWreath(shape.points[0], shape.size, shape.seed) : []
  }
  const spacing = bulbSpacing(shape.service, bulbRadius, pxPerFoot)
  if (isAreaService(shape.service)) {
    return bulbsInPolygon(shape.points, spacing, shape.seed)
  }
  if (shape.service === STAKE_LIGHTS && shape.points.length === 1) {
    return [{ ...shape.points[0], angle: 0 }]
  }
  return pointsAlongPolyline(shape.points, spacing)
}

/** Index of the vertex within `radius` of `point`, or -1. */
export function nearestVertex(points, point, radius) {
  let best = -1
  let bestDistance = radius
  points.forEach((vertex, index) => {
    const gap = distance(vertex, point)
    if (gap <= bestDistance) {
      best = index
      bestDistance = gap
    }
  })
  return best
}

// ─── Editing placed strings ──────────────────────────────────────────────────

/** Closest point on segment a→b to p, and how far p is from it. */
export function closestOnSegment(p, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared
    ? Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared))
    : 0
  const point = { x: a.x + dx * t, y: a.y + dy * t }
  return { point, distance: distance(p, point) }
}

/** The shape's segments as index pairs; a tree outline also closes back to its first point. */
function segmentsOf(shape) {
  const { points } = shape
  const segments = []
  for (let index = 1; index < points.length; index += 1) {
    segments.push([index - 1, index])
  }
  if (isAreaService(shape.service) && points.length > 2) {
    segments.push([points.length - 1, 0])
  }
  return segments
}

/**
 * Where a tap lands on one shape: its nearest segment within `tolerance`
 * (with the index to insert a new point at), inside a tree outline, or null.
 */
export function hitTestShape(shape, point, tolerance) {
  let best = null
  for (const [from, to] of segmentsOf(shape)) {
    const hit = closestOnSegment(point, shape.points[from], shape.points[to])
    if (hit.distance <= tolerance && (!best || hit.distance < best.distance)) {
      best = {
        kind: 'segment',
        insertAt: to === 0 ? shape.points.length : to,
        point: hit.point,
        distance: hit.distance,
      }
    }
  }
  if (best) {
    return best
  }
  if (isPlacedItem(shape.service)) {
    const gap = shape.points.length ? distance(shape.points[0], point) : Infinity
    return gap <= Math.max(tolerance, (shape.size || 0) / 2) ? { kind: 'inside', distance: gap } : null
  }
  if (shape.points.length === 1 && distance(shape.points[0], point) <= tolerance) {
    return { kind: 'point', distance: distance(shape.points[0], point) }
  }
  if (isAreaService(shape.service) && shape.points.length > 2 && pointInPolygon(point, shape.points)) {
    return { kind: 'inside', distance: 0 }
  }
  return null
}

/** The top-most (last drawn) shape under a tap, or null. */
export function shapeAt(shapes, point, tolerance) {
  for (let index = shapes.length - 1; index >= 0; index -= 1) {
    if (hitTestShape(shapes[index], point, tolerance)) {
      return shapes[index]
    }
  }
  return null
}

export const insertPoint = (points, index, point) => [
  ...points.slice(0, index),
  point,
  ...points.slice(index),
]

/** Removes one point, unless that would leave fewer than the service needs. */
export const removePoint = (shape, index) =>
  shape.points.length > minPointsFor(shape.service)
    ? { ...shape, points: shape.points.filter((_, pointIndex) => pointIndex !== index) }
    : shape

/*
 * A sensible default bulb radius for a photo of this size. A house front
 * usually spans most of the photo; at that scale a C9 (about 4 in. with its
 * socket) is roughly 1/700 of the long edge per unit of radius.
 */
export const defaultBulbRadius = (width, height) =>
  Math.max(1.5, Math.round((Math.max(width, height) / 700) * 2) / 2)

// ─── Measuring and estimating (INCHR-style) ──────────────────────────────────

/*
 * A scale is two taps on something with a known size (a front door, a garage
 * door) plus its real length. It is only exact for things in the same flat
 * plane as that reference — good enough to estimate, not to order materials.
 */
export const SCALE_PRESETS = [
  { label: 'Front door (tall)', feet: 80 / 12 },
  { label: 'Garage door, 1-car (wide)', feet: 9 },
  { label: 'Garage door, 2-car (wide)', feet: 16 },
]

export function polylineLength(points) {
  let total = 0
  for (let index = 1; index < points.length; index += 1) {
    total += distance(points[index - 1], points[index])
  }
  return total
}

/** Image pixels per real foot, or null when there is no usable scale. */
export function pixelsPerFoot(scale) {
  if (!scale?.a || !scale?.b || !(Number(scale.feet) > 0)) {
    return null
  }
  const pixels = distance(scale.a, scale.b)
  return pixels > 0 ? pixels / Number(scale.feet) : null
}

/* A C9 with its socket is about 4 in. long; the bulb art is 4.2 radii tall. */
export const bulbRadiusForScale = (pxPerFoot) =>
  Math.min(10, Math.max(1, Math.round(((pxPerFoot * (4 / 12)) / 4.2) * 2) / 2))

export const ESTIMATE_UNITS = {
  [ROOFLINE]: 'ft',
  [GARLAND]: 'ft',
  [TREE_LIGHTS]: 'ft tall',
  [STAKE_LIGHTS]: 'stakes',
  [WREATH]: 'wreaths',
}

/** How much of a service one shape is: feet of line, feet of tree height, or a stake count. */
export function measureShape(shape, pxPerFoot, bulbRadius = 3) {
  if (isPlacedItem(shape.service)) {
    return 1
  }
  if (!pxPerFoot) {
    return 0
  }
  if (shape.service === STAKE_LIGHTS) {
    return bulbsForShape(shape, bulbRadius, pxPerFoot).length
  }
  if (isAreaService(shape.service)) {
    const ys = shape.points.map((point) => point.y)
    return (Math.max(...ys) - Math.min(...ys)) / pxPerFoot
  }
  return polylineLength(shape.points) / pxPerFoot
}

export const formatFeet = (feet) => `${Math.ceil(feet)}`

const byMenuOrder = (a, b) =>
  CHRISTMAS_SERVICE_TYPES.indexOf(a.service) - CHRISTMAS_SERVICE_TYPES.indexOf(b.service) ||
  CHRISTMAS_LIGHT_COLORS.indexOf(a.color) - CHRISTMAS_LIGHT_COLORS.indexOf(b.color)

/**
 * Groups shapes into one line per service + color. With a scale, each line
 * carries a quantity (whole feet rounded up, or stakes) priced at that
 * service's rate — `rates` is cents per unit keyed by service.
 */
export function estimateMockup(shapes, { pxPerFoot = null, rates = {}, bulbRadius = 3 } = {}) {
  const groups = new Map()
  for (const shape of shapes) {
    const key = `${shape.service}|${shape.color}`
    const group = groups.get(key) || { service: shape.service, color: shape.color, areas: 0, measured: 0 }
    group.areas += 1
    group.measured += measureShape(shape, pxPerFoot, bulbRadius)
    groups.set(key, group)
  }

  const lines = [...groups.values()].toSorted(byMenuOrder).map((group) => {
    // Wreaths are counted, so they have a quantity with or without a scale.
    const counted = isPlacedItem(group.service)
    const quantity = pxPerFoot || counted ? Math.ceil(group.measured) : 0
    const unitPriceCents = Math.max(0, Math.round(Number(rates[group.service]) || 0))
    return {
      ...group,
      counted,
      quantity,
      unit: ESTIMATE_UNITS[group.service],
      unitPriceCents,
      amountCents: quantity * unitPriceCents,
    }
  })
  return {
    lines,
    totalCents: lines.reduce((sum, line) => sum + line.amountCents, 0),
    measured: Boolean(pxPerFoot),
  }
}

/**
 * One quote line per service + color. Measured mockups carry quantity and
 * price; unmeasured ones start at 1 with a blank price for Kathie to fill in.
 */
export function mockupToLineItems(shapes, options = {}) {
  const { lines, measured } = estimateMockup(shapes, options)
  return lines.map((line) => {
    const priced = measured || line.counted
    const areas = line.areas > 1 && !line.counted ? `, ${line.areas} areas` : ''
    const unit = line.counted && line.quantity === 1 ? line.unit.replace(/s$/, '') : line.unit
    const amount = priced
      ? ` (${line.quantity} ${unit}${areas})`
      : line.areas > 1
        ? ` (${line.areas} areas)`
        : ''
    const lit = line.counted ? ` with ${line.color.toLowerCase()} lights` : ` — ${line.color.toLowerCase()}`
    return {
      category: line.service,
      color: line.color,
      description: `${line.service}${lit}${amount}`,
      location: '',
      nr: '',
      quantity: priced ? line.quantity : 1,
      unitPriceCents: priced ? line.unitPriceCents : 0,
    }
  })
}

/**
 * localStorage hand-off from the mockup page to the invoice builder:
 * `{ items, mockupId }`. `mockupId` is set when a new invoice should be
 * linked to the mockup once it's first saved.
 */
export const MOCKUP_LINE_ITEMS_STORAGE_KEY = 'christmas-mockup-line-items'

/** Reads the hand-off, accepting the older bare-array shape. */
export function parseMockupHandoff(raw) {
  try {
    const value = JSON.parse(raw || 'null')
    if (Array.isArray(value)) {
      return { items: value, mockupId: null }
    }
    return { items: Array.isArray(value?.items) ? value.items : [], mockupId: value?.mockupId || null }
  } catch {
    return { items: [], mockupId: null }
  }
}
