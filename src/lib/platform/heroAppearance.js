export const HERO_OVERLAY_DIRECTIONS = [
  { value: "to bottom", label: "Top to bottom" },
  { value: "to top", label: "Bottom to top" },
  { value: "to right", label: "Left to right" },
  { value: "to left", label: "Right to left" },
  { value: "to bottom right", label: "Top left to bottom right" },
  { value: "to bottom left", label: "Top right to bottom left" },
]

export function hexToRgba(color, alpha) {
  if (!color || !color.startsWith("#")) {
    return undefined
  }

  const normalized = color.slice(1)
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : normalized

  if (full.length !== 6) {
    return undefined
  }

  const value = Number.parseInt(full, 16)

  if (Number.isNaN(value)) {
    return undefined
  }

  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function normalizeHeroOverlayDirection(direction) {
  if (typeof direction === "string" && /^-?\d+(\.\d+)?deg$/.test(direction.trim())) {
    return direction.trim()
  }

  return HERO_OVERLAY_DIRECTIONS.some((option) => option.value === direction)
    ? direction
    : "to bottom"
}

export function heroOverlayDirectionToDegrees(direction) {
  const normalized = normalizeHeroOverlayDirection(direction)

  if (normalized.endsWith("deg")) {
    return normalized
  }

  const degreesByDirection = {
    "to top": "0deg",
    "to top right": "45deg",
    "to right": "90deg",
    "to bottom right": "135deg",
    "to bottom": "180deg",
    "to bottom left": "225deg",
    "to left": "270deg",
    "to top left": "315deg",
  }

  return degreesByDirection[normalized] || "180deg"
}

export function clampHeroOverlayOpacity(value, fallback = 0.42) {
  if (Number.isNaN(value)) {
    return fallback
  }

  return Math.min(1, Math.max(0, value))
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => Math.round(value).toString(16).padStart(2, "0"))
    .join("")}`
}

export function parseRgbString(value) {
  if (typeof value !== "string") {
    return null
  }

  const match = value.match(/rgba?\(([^)]+)\)/i)

  if (!match) {
    return null
  }

  const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()))

  if (parts.length < 3 || parts.slice(0, 3).some((part) => Number.isNaN(part))) {
    return null
  }

  const [r, g, b, a] = parts

  return {
    hex: rgbToHex(r, g, b),
    alpha: clampHeroOverlayOpacity(Number.isNaN(a) ? 1 : a, 1),
  }
}

export function getHeroOverlayAppearance(section) {
  const overlayOpacity =
    typeof section?.heroOverlayOpacity === "number" ? section.heroOverlayOpacity : 0.42
  const overlayStartColor =
    section?.heroOverlayStartColor || section?.heroOverlayColor || "#0f172a"
  const overlayEndColor = section?.heroOverlayEndColor || overlayStartColor
  const overlayDirection = normalizeHeroOverlayDirection(section?.heroOverlayDirection)
  const overlayStartOpacity =
    typeof section?.heroOverlayStartOpacity === "number"
      ? section.heroOverlayStartOpacity
      : overlayOpacity
  const overlayEndOpacity =
    typeof section?.heroOverlayEndOpacity === "number"
      ? section.heroOverlayEndOpacity
      : overlayOpacity
  const overlayStart = hexToRgba(overlayStartColor, overlayStartOpacity)
  const overlayEnd = hexToRgba(overlayEndColor, overlayEndOpacity)

  return {
    overlayOpacity,
    overlayStartColor,
    overlayEndColor,
    overlayDirection,
    overlayStartOpacity,
    overlayEndOpacity,
    overlayStyle:
      overlayStart && overlayEnd
        ? {
            backgroundImage: `linear-gradient(${overlayDirection}, ${overlayStart}, ${overlayEnd})`,
          }
        : undefined,
  }
}

export function buildHeroOverlayGradientValue(section) {
  const { overlayDirection, overlayStartColor, overlayEndColor, overlayStartOpacity, overlayEndOpacity } =
    getHeroOverlayAppearance(section)

  const start = hexToRgba(overlayStartColor, overlayStartOpacity) || "rgba(15, 23, 42, 0.6)"
  const end = hexToRgba(overlayEndColor, overlayEndOpacity) || "rgba(15, 23, 42, 0.15)"
  const degrees = heroOverlayDirectionToDegrees(overlayDirection)

  return `linear-gradient(${degrees}, ${start} 0%, ${end} 100%)`
}
