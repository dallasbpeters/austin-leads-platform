import { describe, expect, it } from 'vitest'

import migration, {
  alphaOf,
  isOldColor,
  toHsla,
  toOklch,
  toRgba,
} from '../../migrations/normalize-color-values'

const migrate = (node) => migration.migrate.object(node, [], {})

describe(toOklch, () => {
  it('writes white, black and red the way the picker does', () => {
    expect(toOklch('#ffffff')).toBe('oklch(100% 0 0)')
    expect(toOklch('#000000')).toBe('oklch(0% 0 0)')
    expect(toOklch('#ff0000')).toBe('oklch(62.8% 0.258 29.2)')
  })

  it('adds the opacity when the color is see-through', () => {
    expect(toOklch('#ffffff', 0.63)).toBe('oklch(100% 0 0 / 0.63)')
  })
})

describe(toHsla, () => {
  it('writes hue, saturation, lightness and opacity', () => {
    expect(toHsla('#ff0000')).toBe('hsla(0, 100%, 50%, 1)')
    expect(toHsla('#082f43', 0.5)).toBe('hsla(200, 79%, 15%, 0.5)')
  })
})

describe(alphaOf, () => {
  it('reads the old alpha, then rgb.a, then the hex digits', () => {
    expect(alphaOf({ hex: '#fcfcf7', alpha: 0.63 })).toBe(0.63)
    expect(alphaOf({ hex: '#fcfcf7', rgb: { a: 0.4 } })).toBe(0.4)
    expect(alphaOf({ hex: '#fcfcf780' })).toBe(0.5)
    expect(alphaOf({ hex: '#fcfcf7' })).toBe(1)
  })
})

describe(isOldColor, () => {
  it('is true only for colors still holding the old object fields', () => {
    expect(isOldColor({ _type: 'color', hex: '#fff', hsl: { h: 0 } })).toBeTruthy()
    expect(isOldColor({ _type: 'color', hex: '#fff', hsl: 'hsla(0, 0%, 100%, 1)' })).toBeFalsy()
    expect(isOldColor({ _type: 'image', alpha: 1 })).toBeFalsy()
  })
})

describe('normalize-color-values migration', () => {
  it('keeps the hex and the opacity of a see-through color', () => {
    const patches = migrate({
      _type: 'color',
      hex: '#fcfcf7',
      alpha: 0.63,
      rgb: { r: 252, g: 252, b: 247, a: 0.63 },
    })
    const set = Object.fromEntries(
      patches.filter((patch) => patch.op.type === 'set').map((patch) => [patch.path[0], patch.op.value]),
    )
    expect(set.rgba).toBe(toRgba('#fcfcf7', 0.63))
    expect(set.hsl).toMatch(/, 0\.63\)$/u)
    expect(set.oklch).toMatch(/ \/ 0\.63\)$/u)
    expect(patches.some((patch) => patch.path[0] === 'hex')).toBeFalsy()
  })

  it('leaves new colors, other objects and colors without a valid hex alone', () => {
    expect(migrate({ _type: 'color', hex: '#ffffff', hsl: 'hsla(0, 0%, 100%, 1)' })).toBeUndefined()
    expect(migrate({ _type: 'image' })).toBeUndefined()
    expect(migrate({ _type: 'color', hex: 'red', hsl: { h: 0 } })).toBeUndefined()
  })
})
