/*
 * Whether a background colour needs dark or light text on top of it, by the
 * WCAG contrast of black and white text against it. Handles #rgb, #rrggbb,
 * #rrggbbaa and rgb()/rgba(); anything else (a named colour, oklch()) returns
 * null and the section keeps its own text colours.
 */

const channel = (value) => {
  const c = value / 255
  return c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function parseColor(input) {
  const value = String(input || '')
    .trim()
    .toLowerCase()
  const hex = /^#([0-9a-f]{3,8})$/u.exec(value)?.[1]
  if (hex) {
    const full =
      hex.length <= 4 ? [...hex.slice(0, 3)].map((digit) => digit + digit).join('') : hex.slice(0, 6)
    return [0, 2, 4].map((start) => Number.parseInt(full.slice(start, start + 2), 16))
  }
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/u.exec(value)
  return rgb ? rgb.slice(1, 4).map(Number) : null
}

/** 'dark' when white text reads better on this colour, 'light' when black does, else null. */
export function surfaceTone(color) {
  const rgb = parseColor(color)
  if (!rgb) {
    return null
  }
  const [r, g, b] = rgb.map(channel)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const onWhite = 1.05 / (luminance + 0.05)
  const onBlack = (luminance + 0.05) / 0.05
  return onWhite >= onBlack ? 'dark' : 'light'
}
