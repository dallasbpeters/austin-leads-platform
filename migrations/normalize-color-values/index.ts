import { at, defineMigration, set, setIfMissing, unset } from 'sanity/migrate'

/*
 * One-time backfill after switching color pickers (@sanity/color-input ->
 * sanity-plugin-color-input). Old colors keep `hsl`, `hsv` and `rgb` as objects
 * (plus `alpha`); the new picker's schema expects `hsl`, `rgba` and `oklch` as
 * text, so Studio flagged every old color as the wrong type.
 *
 * `hex` is kept exactly as it is: it is what the site reads, so nothing changes
 * on the site. The text values are worked out from it with the same formulas
 * the picker uses, so editing a migrated color afterwards behaves as normal.
 *
 * Run:  npx sanity migration run normalize-color-values            (dry run)
 *       npx sanity migration run normalize-color-values --no-dry-run
 */

const HEX = /^#([0-9a-f]{6}|[0-9a-f]{8})$/iu

const channels = (hex: string) => [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16))

const toRgba = (hex: string) => {
  const [r, g, b] = channels(hex)
  return `rgba(${r}, ${g}, ${b}, 1)`
}

const toHsla = (hex: string) => {
  const [r, g, b] = channels(hex).map((value) => value / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  let hue = 0
  let saturation = 0
  if (max !== min) {
    const delta = max - min
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    if (max === r) {
      hue = (g - b) / delta + (g < b ? 6 : 0)
    } else if (max === g) {
      hue = (b - r) / delta + 2
    } else {
      hue = (r - g) / delta + 4
    }
    hue /= 6
  }
  return `hsla(${Math.round(hue * 360)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%, 1)`
}

const toOklch = (hex: string) => {
  const linear = (value: number) => (value > 0.040_45 ? ((value + 0.055) / 1.055) ** 2.4 : value / 12.92)
  const [r, g, b] = channels(hex).map((value) => linear(value / 255))
  const l = Math.cbrt(0.412_221_470_8 * r + 0.536_332_536_3 * g + 0.051_445_852_9 * b)
  const m = Math.cbrt(0.211_903_498_2 * r + 0.680_699_545_1 * g + 0.107_396_956_6 * b)
  const s = Math.cbrt(0.088_302_461_9 * r + 0.281_718_837_6 * g + 0.629_978_700_5 * b)
  let lightness = 0.210_454_255_3 * l + 0.793_617_785 * m - 0.004_072_046_8 * s
  const a = 1.977_998_495_1 * l - 2.428_592_205 * m + 0.450_593_709_9 * s
  const bb = 0.025_904_037_1 * l + 0.782_771_766_2 * m - 0.808_675_766 * s
  let chroma = Math.hypot(a, bb)
  let hue = (Math.atan2(bb, a) * 180) / Math.PI
  if (hue < 0) {
    hue += 360
  }
  if (chroma < 1e-4 || lightness <= 1e-4) {
    chroma = 0
    hue = 0
  }
  lightness = Math.min(Math.max(lightness, 0), 1)
  return `oklch(${Number.parseFloat((lightness * 100).toFixed(1))}% ${Number.parseFloat(chroma.toFixed(3))} ${Number.parseFloat(hue.toFixed(1))})`
}

/** An old-format color: hsl/hsv/rgb stored as objects. */
const isOldColor = (node: Record<string, unknown>) =>
  node?._type === 'color' &&
  (typeof node.hsl === 'object' ||
    node.hsv !== undefined ||
    node.rgb !== undefined ||
    node.alpha !== undefined)

export default defineMigration({
  title: 'Normalize color values to the sanity-plugin-color-input format',
  migrate: {
    object(node) {
      const value = node as Record<string, unknown>
      if (!isOldColor(value) || typeof value.hex !== 'string' || !HEX.test(value.hex)) {
        return undefined
      }
      const hex = value.hex.slice(0, 7)
      return [
        at('hsv', unset()),
        at('rgb', unset()),
        at('alpha', unset()),
        at('hsl', set(toHsla(hex))),
        at('rgba', set(toRgba(hex))),
        at('oklch', set(toOklch(hex))),
        at('isGradient', setIfMissing(false)),
      ]
    },
  },
})
