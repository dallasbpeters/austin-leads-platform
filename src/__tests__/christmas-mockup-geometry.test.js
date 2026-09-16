import { describe, expect, it } from 'vitest'

import {
  bulbHex,
  bulbRadiusForScale,
  bulbsForShape,
  bulbsInPolygon,
  estimateMockup,
  hitTestShape,
  insertPoint,
  measureShape,
  mockupToLineItems,
  nearestVertex,
  parseMockupHandoff,
  pixelsPerFoot,
  pointInPolygon,
  pointsAlongPolyline,
  removePoint,
  shapeAt,
  uprightAngle,
  wreathHandle,
  wreathSizeFromHandle,
} from '@/lib/christmas/mockup-geometry'

describe('bulbs along a line', () => {
  it('spaces points evenly across corners', () => {
    const points = pointsAlongPolyline(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      5,
    )
    expect(points.map(({ x, y }) => [x, y])).toStrictEqual([
      [0, 0],
      [5, 0],
      [10, 0],
      [10, 5],
      [10, 10],
    ])
  })

  it('angles bulbs perpendicular to the run and never upside down', () => {
    expect(uprightAngle({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(0)
    expect(uprightAngle({ x: 10, y: 0 }, { x: 0, y: 0 })).toBeCloseTo(0)
    expect(Math.abs(uprightAngle({ x: 0, y: 10 }, { x: 10, y: 0 }))).toBeLessThanOrEqual(Math.PI / 2)
  })

  it('returns nothing for an empty line', () => {
    expect(pointsAlongPolyline([], 5)).toStrictEqual([])
  })
})

describe('area bulbs', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ]

  it('tests points inside a polygon', () => {
    expect(pointInPolygon({ x: 50, y: 50 }, square)).toBeTruthy()
    expect(pointInPolygon({ x: 150, y: 50 }, square)).toBeFalsy()
  })

  it('fills only inside the outline and is stable for a seed', () => {
    const bulbs = bulbsInPolygon(square, 10, 42)
    expect(bulbs.length).toBeGreaterThan(50)
    expect(bulbs.some((bulb) => bulb.behind)).toBeTruthy()
    expect(bulbs.every((bulb) => pointInPolygon(bulb, square))).toBeTruthy()
    expect(bulbsInPolygon(square, 10, 42)).toStrictEqual(bulbs)
  })

  it('places a single stake light on one tap', () => {
    expect(bulbsForShape({ service: 'Stake lights', points: [{ x: 3, y: 4 }] }, 5)).toStrictEqual([
      { x: 3, y: 4, angle: 0 },
    ])
  })
})

describe('bulb colors', () => {
  it('cycles multicolor and keeps whites steady', () => {
    expect(bulbHex('Multicolor', 0)).not.toBe(bulbHex('Multicolor', 1))
    expect(bulbHex('Warm white', 0)).toBe(bulbHex('Warm white', 7))
    expect(bulbHex('Bright white', 0)).not.toBe(bulbHex('Warm white', 0))
  })
})

describe('grabbing a dot', () => {
  it('finds the closest vertex within reach', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
    ]
    expect(nearestVertex(points, { x: 18, y: 1 }, 5)).toBe(1)
    expect(nearestVertex(points, { x: 50, y: 50 }, 5)).toBe(-1)
  })
})

describe('mockup to quote lines', () => {
  it('groups shapes by service and color in menu order', () => {
    const items = mockupToLineItems([
      { service: 'Garland', color: 'Warm white' },
      { service: 'Tree lights', color: 'Multicolor' },
      { service: 'Tree lights', color: 'Multicolor' },
    ])
    expect(items.map((item) => [item.category, item.color, item.description])).toStrictEqual([
      ['Tree lights', 'Multicolor', 'Tree lights — multicolor (2 areas)'],
      ['Garland', 'Warm white', 'Garland — warm white'],
    ])
  })
})

describe('measuring from a scale', () => {
  // 16 ft garage door spans 320 px, so 20 px per foot.
  const scale = { a: { x: 0, y: 0 }, b: { x: 320, y: 0 }, feet: 16 }

  it('turns a known length into pixels per foot', () => {
    expect(pixelsPerFoot(scale)).toBe(20)
    expect(pixelsPerFoot({ ...scale, feet: 0 })).toBeNull()
    expect(pixelsPerFoot(null)).toBeNull()
  })

  it('measures lines in feet, trees by height, and stakes by count', () => {
    const roof = {
      service: 'Roofline / ridge',
      points: [
        { x: 0, y: 0 },
        { x: 600, y: 0 },
        { x: 600, y: 200 },
      ],
    }
    const tree = {
      service: 'Tree lights',
      points: [
        { x: 0, y: 200 },
        { x: 40, y: 20 },
        { x: 80, y: 200 },
      ],
    }
    const stakes = {
      service: 'Stake lights',
      points: [
        { x: 0, y: 0 },
        { x: 360, y: 0 },
      ],
    }
    expect(measureShape(roof, 20)).toBe(40)
    expect(measureShape(tree, 20)).toBe(9)
    // Every 3 ft (60 px) along 18 ft, including both ends.
    expect(measureShape(stakes, 20)).toBe(7)
  })

  it('sizes C9 bulbs from the scale', () => {
    expect(bulbRadiusForScale(20)).toBe(1.5)
    expect(bulbRadiusForScale(1000)).toBe(10)
  })

  it('prices each service + color line from per-unit rates', () => {
    const shapes = [
      {
        service: 'Roofline / ridge',
        color: 'Warm white',
        points: [
          { x: 0, y: 0 },
          { x: 610, y: 0 },
        ],
      },
      {
        service: 'Roofline / ridge',
        color: 'Warm white',
        points: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
        ],
      },
      {
        service: 'Garland',
        color: 'Bright white',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
      },
    ]
    const { lines, totalCents } = estimateMockup(shapes, {
      pxPerFoot: 20,
      rates: { 'Roofline / ridge': 450, Garland: 1200 },
    })
    expect(lines.map((line) => [line.service, line.quantity, line.unit, line.amountCents])).toStrictEqual([
      ['Roofline / ridge', 41, 'ft', 18_450],
      ['Garland', 5, 'ft', 6000],
    ])
    expect(totalCents).toBe(24_450)
  })

  it('hands measured lines to the quote with quantity and price', () => {
    const shapes = [
      {
        service: 'Garland',
        color: 'Warm white',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
      },
    ]
    const [item] = mockupToLineItems(shapes, { pxPerFoot: 20, rates: { Garland: 1200 } })
    expect(item).toMatchObject({
      quantity: 5,
      unitPriceCents: 1200,
      description: 'Garland — warm white (5 ft)',
    })
  })
})

describe('mockup to invoice hand-off', () => {
  it('reads the current shape and the older bare array', () => {
    expect(
      parseMockupHandoff(JSON.stringify({ items: [{ description: 'a' }], mockupId: 'mck_1' })),
    ).toStrictEqual({
      items: [{ description: 'a' }],
      mockupId: 'mck_1',
    })
    expect(parseMockupHandoff(JSON.stringify([{ description: 'b' }]))).toStrictEqual({
      items: [{ description: 'b' }],
      mockupId: null,
    })
    expect(parseMockupHandoff('not json')).toStrictEqual({ items: [], mockupId: null })
    expect(parseMockupHandoff(null)).toStrictEqual({ items: [], mockupId: null })
  })
})

describe('editing placed strings', () => {
  const roof = {
    id: 'roof',
    service: 'Roofline / ridge',
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ],
  }
  const tree = {
    id: 'tree',
    service: 'Tree lights',
    points: [
      { x: 200, y: 100 },
      { x: 250, y: 0 },
      { x: 300, y: 100 },
    ],
  }

  it('hits a line near a segment and says where a new point goes', () => {
    expect(hitTestShape(roof, { x: 50, y: 4 }, 6)).toMatchObject({
      kind: 'segment',
      insertAt: 1,
      point: { x: 50, y: 0 },
    })
    expect(hitTestShape(roof, { x: 97, y: 60 }, 6)).toMatchObject({ kind: 'segment', insertAt: 2 })
    expect(hitTestShape(roof, { x: 50, y: 40 }, 6)).toBeNull()
  })

  it('hits a tree on its closing edge or anywhere inside', () => {
    expect(hitTestShape(tree, { x: 250, y: 103 }, 6)).toMatchObject({ kind: 'segment', insertAt: 3 })
    expect(hitTestShape(tree, { x: 250, y: 70 }, 6)).toMatchObject({ kind: 'inside' })
  })

  it('picks the top-most shape under a tap', () => {
    expect(shapeAt([roof, tree], { x: 250, y: 70 }, 6)?.id).toBe('tree')
    expect(shapeAt([roof, tree], { x: 500, y: 500 }, 6)).toBeNull()
  })

  it('inserts and removes points, keeping the minimum a service needs', () => {
    expect(insertPoint([{ x: 0 }, { x: 2 }], 1, { x: 1 })).toStrictEqual([{ x: 0 }, { x: 1 }, { x: 2 }])
    expect(removePoint(roof, 1).points).toHaveLength(2)
    expect(removePoint(tree, 0).points).toHaveLength(3)
  })
})

describe('wreaths', () => {
  const wreath = {
    id: 'w',
    service: 'Wreath',
    color: 'Warm white',
    seed: 3,
    points: [{ x: 100, y: 100 }],
    size: 80,
  }

  it('rings the wreath with lights', () => {
    const bulbs = bulbsForShape(wreath, 3)
    expect(bulbs.length).toBeGreaterThanOrEqual(8)
    for (const bulb of bulbs) {
      expect(Math.hypot(bulb.x - 100, bulb.y - 100)).toBeLessThan(40)
    }
  })

  it('is hit anywhere inside it, and resizes from its corner handle', () => {
    expect(hitTestShape(wreath, { x: 130, y: 100 }, 5)?.kind).toBe('inside')
    expect(hitTestShape(wreath, { x: 150, y: 100 }, 5)).toBeNull()
    expect(wreathHandle(wreath)).toStrictEqual({ x: 140, y: 140 })
    expect(wreathSizeFromHandle(wreath, { x: 160, y: 120 })).toBe(120)
    expect(wreathSizeFromHandle(wreath, { x: 101, y: 101 })).toBe(20)
  })

  it('is counted and priced without a scale', () => {
    const estimate = estimateMockup([wreath, { ...wreath, id: 'w2' }], { rates: { Wreath: 8500 } })
    expect(estimate.lines).toMatchObject([
      { service: 'Wreath', quantity: 2, unit: 'wreaths', amountCents: 17_000 },
    ])
    expect(measureShape(wreath, null)).toBe(1)
    expect(mockupToLineItems([wreath], { rates: { Wreath: 8500 } })).toMatchObject([
      {
        category: 'Wreath',
        description: 'Wreath with warm white lights (1 wreath)',
        quantity: 1,
        unitPriceCents: 8500,
      },
    ])
  })
})
