import { ImageResponse } from 'next/og'

import { SHARE_DESCRIPTION_MAX, SHARE_TITLE_MAX, truncateForShare } from '@/lib/platform/social-share-text'

export const runtime = 'nodejs'

const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
}
let fontFamilyPromise
const OG_COLOR_TOKEN_MAP = {
  primary: 'oklch(51.82% 0.1441 249.42deg)',
  secondary: 'oklch(30.88% 0.0448 213.39deg)',
  tertiary: 'oklch(76.28% 0.1649 65.03deg)',
  primaryAlt: 'oklch(66.76% 0.1555 263.93deg)',
  secondaryAlt: 'oklch(73.88% 0.0818 242.13deg)',
  tertiaryAlt: 'oklch(83.56% 0.1007 98.29deg)',
  sweetcorn: 'oklch(93.57% 0.13 101.75deg)',
  voodoo: 'oklch(32.87% 0.06 332.81deg)',
  tidal: 'oklch(95.49% 0.11 118.86deg)',
  blue400: '#546bf3',
  tasman: 'oklch(87.92% 0.03 140.12deg)',
  chaletGreen: 'oklch(45.52% 0.08 127.48deg)',
  metterhorn: 'oklch(32.6% 0.04 350.45deg)',
  heather: 'oklch(84.9% 0.03 244.95deg)',
  wattle: 'oklch(87.43% 0.16 108.14deg)',
  charade: 'oklch(28.29% 0.03 270.21deg)',
  ceramic: 'oklch(98.39% 0.01 125.5deg)',
  tapaGreen: 'oklch(36.1% 0.03 164.74deg)',
  seaMist: 'oklch(86.57% 0.03 156.49deg)',
  blackCurrent: 'oklch(32.05% 0.04 322.94deg)',
  confetti: 'oklch(84.99% 0.14 104.07deg)',
}
const OG_CSS_VAR_COLOR_MAP = {
  '--color-primary': OG_COLOR_TOKEN_MAP.primary,
  '--color-secondary': OG_COLOR_TOKEN_MAP.secondary,
  '--color-tertiary': OG_COLOR_TOKEN_MAP.tertiary,
  '--color-primary-alt': OG_COLOR_TOKEN_MAP.primaryAlt,
  '--color-secondary-alt': OG_COLOR_TOKEN_MAP.secondaryAlt,
  '--color-tertiary-alt': OG_COLOR_TOKEN_MAP.tertiaryAlt,
  '--color-sweetcorn': OG_COLOR_TOKEN_MAP.sweetcorn,
  '--color-voodoo': OG_COLOR_TOKEN_MAP.voodoo,
  '--color-tidal': OG_COLOR_TOKEN_MAP.tidal,
  '--color-blue-400': OG_COLOR_TOKEN_MAP.blue400,
  '--color-tasman': OG_COLOR_TOKEN_MAP.tasman,
  '--color-chalet-green': OG_COLOR_TOKEN_MAP.chaletGreen,
  '--color-metterhorn': OG_COLOR_TOKEN_MAP.metterhorn,
  '--color-heather': OG_COLOR_TOKEN_MAP.heather,
  '--color-wattle': OG_COLOR_TOKEN_MAP.wattle,
  '--color-charade': OG_COLOR_TOKEN_MAP.charade,
  '--color-ceramic': OG_COLOR_TOKEN_MAP.ceramic,
  '--color-tapa-green': OG_COLOR_TOKEN_MAP.tapaGreen,
  '--color-sea-mist': OG_COLOR_TOKEN_MAP.seaMist,
  '--color-black-current': OG_COLOR_TOKEN_MAP.blackCurrent,
  '--color-confetti': OG_COLOR_TOKEN_MAP.confetti,
}

const OG_CSS_VAR_TO_TOKEN = {
  '--color-primary': 'primary',
  '--color-secondary': 'secondary',
  '--color-tertiary': 'tertiary',
  '--color-primary-alt': 'primaryAlt',
  '--color-secondary-alt': 'secondaryAlt',
  '--color-tertiary-alt': 'tertiaryAlt',
  '--color-sweetcorn': 'sweetcorn',
  '--color-voodoo': 'voodoo',
  '--color-tidal': 'tidal',
  '--color-blue-400': 'blue400',
  '--color-tasman': 'tasman',
  '--color-chalet-green': 'chaletGreen',
  '--color-metterhorn': 'metterhorn',
  '--color-heather': 'heather',
  '--color-wattle': 'wattle',
  '--color-charade': 'charade',
  '--color-ceramic': 'ceramic',
  '--color-tapa-green': 'tapaGreen',
  '--color-sea-mist': 'seaMist',
  '--color-black-current': 'blackCurrent',
  '--color-confetti': 'confetti',
}

function rgbTripleToHex(r, g, b) {
  const clampByte = (n) => Math.round(Math.max(0, Math.min(255, Number.isFinite(n) ? n : 0)))
  const toHex = (n) => clampByte(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function linearSrgbChannelToByte(c) {
  const v = Number(c)
  if (!Number.isFinite(v)) {
    return 0
  }
  const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
  return Math.round(Math.max(0, Math.min(1, s)) * 255)
}

/** OKLab → linear sRGB (Björn Ottosson), extended precision coefficients. */
function oklabToLinearSrgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.341319396 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

function oklchTupleToHex(L, C, hDeg) {
  const hr = (hDeg * Math.PI) / 180
  const a = C * Math.cos(hr)
  const b = C * Math.sin(hr)
  const [lr, lg, lb] = oklabToLinearSrgb(L, a, b)
  return rgbTripleToHex(linearSrgbChannelToByte(lr), linearSrgbChannelToByte(lg), linearSrgbChannelToByte(lb))
}

function parseOklchCss(css) {
  const m = String(css || '')
    .trim()
    .match(/^oklch\(\s*([\d.]+%?|none)\s+([\d.]+|none)\s+([\d.]+(?:deg|rad|turn)?|none)\s*(?:\/\s*[^)]+)?\)/i)
  if (!m) {
    return null
  }
  if (m[1] === 'none' || m[2] === 'none' || m[3] === 'none') {
    return null
  }

  let L = Number.parseFloat(m[1])
  if (m[1].includes('%')) {
    L /= 100
  }

  const C = Number.parseFloat(m[2])

  const hPart = m[3]
  const hm = hPart.match(/^([\d.]+)(deg|rad|turn)?$/i)
  if (!hm) {
    return null
  }
  let H = Number.parseFloat(hm[1])
  const unit = (hm[2] || 'deg').toLowerCase()
  if (unit === 'rad') {
    H = (H * 180) / Math.PI
  } else if (unit === 'turn') {
    H *= 360
  }

  return { L, C, H }
}

function oklchCssToHex(css) {
  const t = parseOklchCss(css)
  if (!t) {
    return null
  }
  return oklchTupleToHex(t.L, t.C, t.H)
}

function parseHslCss(css) {
  const m = String(css || '')
    .trim()
    .match(/^hsla?\(\s*([\d.]+)(deg)?\s+([\d.]+)%\s+([\d.]+)%/i)
  if (!m) {
    return null
  }
  return {
    h: Number.parseFloat(m[1]),
    s: Number.parseFloat(m[3]),
    l: Number.parseFloat(m[4]),
  }
}

function hslTupleToHex(h, s, l) {
  const hh = ((h % 360) + 360) % 360
  const ss = Math.max(0, Math.min(100, s)) / 100
  const ll = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * ll - 1)) * ss
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = ll - c / 2
  let rp = 0
  let gp = 0
  let bp = 0
  if (hh < 60) {
    rp = c
    gp = x
  } else if (hh < 120) {
    rp = x
    gp = c
  } else if (hh < 180) {
    gp = c
    bp = x
  } else if (hh < 240) {
    gp = x
    bp = c
  } else if (hh < 300) {
    rp = x
    bp = c
  } else {
    rp = c
    bp = x
  }
  return rgbTripleToHex(Math.round((rp + m) * 255), Math.round((gp + m) * 255), Math.round((bp + m) * 255))
}

function hslCssToHex(css) {
  const t = parseHslCss(css)
  if (!t) {
    return null
  }
  return hslTupleToHex(t.h, t.s, t.l)
}

/** Normalize CMS / token CSS to hex for Satori (oklch is not painted reliably). */
function hexFromCssColor(css, fallbackHex = null) {
  if (!css || typeof css !== 'string') {
    return fallbackHex
  }

  const c = css.trim()
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)) {
    if (c.length === 4) {
      const [, r, g, b] = c
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
    }
    return c.toLowerCase()
  }

  if (/^oklch\(/i.test(c)) {
    return oklchCssToHex(c) || fallbackHex
  }

  if (/^hsla?\(/i.test(c)) {
    return hslCssToHex(c) || fallbackHex
  }

  const rgbComma = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbComma) {
    return rgbTripleToHex(Number(rgbComma[1]), Number(rgbComma[2]), Number(rgbComma[3]))
  }

  const rgbSpace = c.match(/^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)/i)
  if (rgbSpace) {
    return rgbTripleToHex(Number(rgbSpace[1]), Number(rgbSpace[2]), Number(rgbSpace[3]))
  }

  return fallbackHex
}

const DEFAULT_GUIDE_OG_BACKGROUND_HEX = hexFromCssColor(OG_COLOR_TOKEN_MAP.primary, '#016bb7') || '#016bb7'

function getFontFamily(requestUrl) {
  if (!fontFamilyPromise) {
    const fontCandidates = [
      '/fonts/Switzer-Variable.woff',
      '/fonts/Switzer-Variable.ttf',
      '/fonts/Switzer-Variable.woff2',
    ]

    fontFamilyPromise = (async () => {
      for (const candidate of fontCandidates) {
        try {
          const response = await fetch(new URL(candidate, requestUrl.origin))
          if (!response.ok) {
            continue
          }
          const bytes = await response.arrayBuffer()
          if (bytes?.byteLength) {
            return bytes
          }
        } catch {
          // Try the next candidate.
        }
      }
      return null
    })()
  }

  return fontFamilyPromise
}

function BrandLogo({ color = '#ffffff' }) {
  return (
    <svg width="48" height="48" viewBox="0 0 483 491" aria-hidden="true" style={{ display: 'flex', color }}>
      <g transform="matrix(1,0,0,1,-1117.520132,-20.022941)">
        <g transform="matrix(1,0,0,1,551.679288,0)">
          <g transform="matrix(1.122079,0,-0.363049,1.122079,-617.643357,-79.842122)">
            <path
              d="M1320.761,404.637L1152.178,301.201L1155.057,207.401L1221.488,248.161L1221.488,89L1321,89L1321,157.702L1493.193,158.064L1554.281,252.808L1381.996,252.445L1321,157.845L1321,252.808L1229.062,252.808L1325.627,312.056L1322.846,402.659L1381.781,346.744L1480.789,405.149L1419.879,311.178L1481.587,252.808L1587.731,416.563L1526.022,474.934L1481.017,405.502L1374.555,506.509L1275.177,447.885L1320.761,404.637Z"
              fill="currentColor"
            />
          </g>
        </g>
      </g>
    </svg>
  )
}

const GuideHeroBackground = ({ image, guideBackground }) => (
  <>
    {image ? (
      <img
        alt=""
        src={image}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    ) : null}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(105deg, ${guideBackground} 0%, ${guideBackground} 44%, transparent 100%)`,
      }}
    />
  </>
)

function clampText(value, maxLength) {
  if (!value) {
    return ''
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
}

function safeColor(value, fallback) {
  if (!value || typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  const tokenResolved = OG_COLOR_TOKEN_MAP[trimmed] || trimmed
  const varMatch = tokenResolved.match(/^var\((--[a-z0-9-]+)\)$/i)
  const withResolvedVar = varMatch ? OG_CSS_VAR_COLOR_MAP[varMatch[1]] || tokenResolved : tokenResolved

  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(withResolvedVar)) {
    return withResolvedVar
  }

  if (/^rgba?\([^)]+\)$/.test(withResolvedVar)) {
    return withResolvedVar
  }

  if (/^hsla?\([^)]+\)$/.test(withResolvedVar)) {
    return withResolvedVar
  }

  if (/^oklch\([^)]+\)$/.test(withResolvedVar)) {
    return withResolvedVar
  }

  return fallback
}

function solidHexForOgGuideBackground(rawValue, fallbackHex = DEFAULT_GUIDE_OG_BACKGROUND_HEX) {
  if (!rawValue || typeof rawValue !== 'string') {
    return fallbackHex
  }

  const trimmed = rawValue.trim()
  const namedTokenCss = OG_COLOR_TOKEN_MAP[trimmed]
  if (namedTokenCss) {
    return hexFromCssColor(namedTokenCss, fallbackHex) || fallbackHex
  }

  const varMatch = trimmed.match(/^var\((--[a-z0-9-]+)\)$/i)
  if (varMatch) {
    const tokenKey = OG_CSS_VAR_TO_TOKEN[varMatch[1]]
    const cssFromVar = tokenKey ? OG_COLOR_TOKEN_MAP[tokenKey] : ''
    if (cssFromVar) {
      return hexFromCssColor(cssFromVar, fallbackHex) || fallbackHex
    }
  }

  const resolved = safeColor(trimmed, '')
  if (!resolved) {
    return fallbackHex
  }

  const asHex = hexFromCssColor(resolved, fallbackHex)
  return asHex || fallbackHex
}

function relLuminanceFromSrgbChannel(value) {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function relLuminanceFromRgb(r, g, b) {
  const rs = relLuminanceFromSrgbChannel(r)
  const gs = relLuminanceFromSrgbChannel(g)
  const bs = relLuminanceFromSrgbChannel(b)
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function parseHexToRgb(hex) {
  let h = String(hex || '')
    .replace('#', '')
    .trim()
  if (h.length === 3) {
    h = [...h].map((ch) => ch + ch).join('')
  }
  if (h.length !== 6) {
    return null
  }
  const n = Number.parseInt(h, 16)
  if (Number.isNaN(n)) {
    return null
  }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** True when body text should be dark (WCAG-style luminance on sRGB). */
function isLightBackgroundOgColor(color) {
  if (!color || typeof color !== 'string') {
    return false
  }

  const c = color.trim()
  const rgbFromHex = parseHexToRgb(c)
  if (rgbFromHex) {
    return relLuminanceFromRgb(rgbFromHex.r, rgbFromHex.g, rgbFromHex.b) > 0.55
  }

  const hslMatch = c.match(/^hsla?\(\s*[\d.]+(?:deg)?\s+[\d.]+%\s+([\d.]+)%/i)
  if (hslMatch) {
    const l = Number.parseFloat(hslMatch[1], 10) / 100
    return l > 0.58
  }

  const rgbComma = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbComma) {
    return relLuminanceFromRgb(Number(rgbComma[1]), Number(rgbComma[2]), Number(rgbComma[3])) > 0.55
  }

  const rgbSpace = c.match(/^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)/i)
  if (rgbSpace) {
    return relLuminanceFromRgb(Number(rgbSpace[1]), Number(rgbSpace[2]), Number(rgbSpace[3])) > 0.55
  }

  return false
}

function getQueryParam(searchParams, name) {
  const direct = searchParams.get(name)
  if (direct) {
    return direct
  }

  const ampPrefixed = searchParams.get(`amp;${name}`)
  if (ampPrefixed) {
    return ampPrefixed
  }

  return ''
}

function titleFromGuidePath(pathname) {
  const path = String(pathname || '')
  const segment = path.split('/').filter(Boolean).at(-1)
  if (!segment) {
    return ''
  }

  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getParam(searchParams, shortKey, fullKey, fallback = '') {
  return getQueryParam(searchParams, shortKey) || getQueryParam(searchParams, fullKey) || fallback
}

function extractOgParams(searchParams, requestUrl) {
  const isGuideParam = getParam(searchParams, 'g', 'guide', '') === '1'
  const isChristmasOg = getQueryParam(searchParams, 'theme') === 'txchristmaslights'
  const site = clampText(getParam(searchParams, 's', 'site', 'Texas Solar and Roofing Pros'), 80)
  const path = clampText(getParam(searchParams, 'p', 'path'), 80)
  const titleBase = getParam(searchParams, 't', 'title') || titleFromGuidePath(path) || site
  const title =
    clampText(
      isChristmasOg ? truncateForShare(titleBase, SHARE_TITLE_MAX) : titleBase,
      isChristmasOg ? SHARE_TITLE_MAX + 4 : 120,
    ) || site
  const descriptionRaw = getParam(searchParams, 'd', 'description')
  const description = clampText(
    isChristmasOg && descriptionRaw
      ? truncateForShare(descriptionRaw, SHARE_DESCRIPTION_MAX)
      : descriptionRaw,
    isChristmasOg ? SHARE_DESCRIPTION_MAX + 4 : 180,
  )
  const ctaRaw = clampText(getParam(searchParams, 'cta', 'cta'), 44)
  const cta = isChristmasOg && !ctaRaw ? 'Book your install' : ctaRaw
  const category = clampText(getParam(searchParams, 'c', 'category'), 80)
  const layout = clampText(getParam(searchParams, 'l', 'layout'), 20)
  const imageParam = getParam(searchParams, 'i', 'image')
  const image = imageParam ? new URL(imageParam, requestUrl.origin).toString() : ''
  const primary = safeColor(getParam(searchParams, 'pr', 'primary'), '#f97316')
  const secondary = safeColor(getParam(searchParams, 'sc', 'secondary'), '#016bb7')
  const guideBackground = solidHexForOgGuideBackground(
    getParam(searchParams, 'b', 'bg'),
    DEFAULT_GUIDE_OG_BACKGROUND_HEX,
  )
  const isGuideLayout = isGuideParam || layout === 'guide' || path.startsWith('/guides/')
  const christmasLogoSrc = isChristmasOg
    ? new URL('/images/tx-christmas-logo-full.png', requestUrl.origin).toString()
    : ''
  const logoSrc = new URL('/logo.png', requestUrl.origin).toString()

  return {
    isChristmasOg,
    isGuideLayout,
    site,
    path,
    title,
    description,
    cta,
    category,
    image,
    primary,
    secondary,
    guideBackground,
    christmasLogoSrc,
    logoSrc,
  }
}

async function buildChristmasPrecomposedOgResponse(image) {
  const bareImageResponse = new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        position: 'relative',
        backgroundColor: '#000000',
      }}
    >
      <img
        alt=""
        src={image}
        width={OG_IMAGE_SIZE.width}
        height={OG_IMAGE_SIZE.height}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </div>,
    { ...OG_IMAGE_SIZE },
  )
  const pngBuffer = await bareImageResponse.arrayBuffer()
  return new Response(pngBuffer, {
    status: 200,
    headers: {
      'content-type': 'image/png',
      'content-length': String(pngBuffer.byteLength),
      'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

async function tryPrecomposedChristmasOg(isChristmasOg, image, isGuideLayout) {
  if (!isChristmasOg || !image || isGuideLayout) {
    return null
  }
  return buildChristmasPrecomposedOgResponse(image)
}

function pickCopyColor(isChristmasOg) {
  return isChristmasOg ? '#fde68a' : '#dbe4ee'
}

function buildGuideLayoutTheme(guideBackground) {
  const guideUseLightInk = isLightBackgroundOgColor(guideBackground)
  return {
    guideInk: guideUseLightInk ? '#020617' : '#ffffff',
    guideLabelMuted: guideUseLightInk ? '#0f172a' : 'rgba(255,255,255,0.9)',
    guideBodyMuted: guideUseLightInk ? '#0f172a' : 'rgba(255,255,255,0.94)',
    guideFooterMuted: guideUseLightInk ? '#020617' : 'rgba(255,255,255,0.94)',
    guideCategoryBorder: guideUseLightInk ? 'rgba(15,23,42,0.38)' : 'rgba(255,255,255,0.32)',
    guideCategoryBg: guideUseLightInk ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.12)',
    guideCategoryText: guideUseLightInk ? '#020617' : '#ffffff',
  }
}

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl

  const og = extractOgParams(searchParams, requestUrl)
  const {
    isChristmasOg,
    isGuideLayout,
    image,
    secondary,
    guideBackground,
    site,
    title,
    description,
    cta,
    category,
    path,
    primary,
    christmasLogoSrc,
    logoSrc,
  } = og

  const precomposed = await tryPrecomposedChristmasOg(isChristmasOg, image, isGuideLayout)
  if (precomposed) {
    return precomposed
  }

  const guideTheme = buildGuideLayoutTheme(guideBackground)
  const {
    guideInk,
    guideLabelMuted,
    guideBodyMuted,
    guideFooterMuted,
    guideCategoryBorder,
    guideCategoryBg,
    guideCategoryText,
  } = guideTheme
  const secondarySoft = '#FFFFFF'
  const copyColor = pickCopyColor(isChristmasOg)
  const fontFamily = await getFontFamily(requestUrl)

  const imageResponse = new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: isGuideLayout ? guideBackground : secondary,
        color: isGuideLayout ? guideInk : 'white',
        fontFamily: 'Switzer-Variable, Arial, sans-serif',
        position: 'relative',
      }}
    >
      {isGuideLayout ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '44px 48px 130px 48px',
            backgroundColor: guideBackground,
          }}
        >
          <GuideHeroBackground image={image} guideBackground={guideBackground} />
          <div
            style={{
              display: 'flex',
              width: '1100px',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginBottom: 26,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: guideLabelMuted,
                fontWeight: 600,
              }}
            >
              Guide
            </div>
            {category ? (
              <div
                style={{
                  display: 'flex',
                  border: `1px solid ${guideCategoryBorder}`,
                  borderRadius: 9999,
                  padding: '9px 16px',
                  fontSize: 18,
                  color: guideCategoryText,
                  backgroundColor: guideCategoryBg,
                }}
              >
                {category}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: 'flex',
              width: '100%',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: 760,
                gap: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 82,
                  lineHeight: 0.95,
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  color: guideInk,
                }}
              >
                {title}
              </div>
              {description ? (
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    fontSize: 34,
                    lineHeight: 1.28,
                    color: guideBodyMuted,
                    fontWeight: 500,
                  }}
                >
                  {description}
                </div>
              ) : null}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 48,
              right: 48,
              bottom: 44,
              display: 'flex',
              width: 'auto',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                fontWeight: 700,
                color: guideFooterMuted,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {site}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {isChristmasOg && christmasLogoSrc ? (
                <img
                  alt=""
                  src={christmasLogoSrc}
                  height={52}
                  width={220}
                  style={{
                    height: 52,
                    width: 'auto',
                    maxWidth: 240,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <img
                  alt=""
                  src={logoSrc}
                  height={56}
                  width={68}
                  style={{
                    height: 56,
                    width: 'auto',
                    maxWidth: 200,
                    objectFit: 'contain',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {image ? (
            <img
              alt=""
              src={image}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          ) : null}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: image
                ? isChristmasOg
                  ? 'linear-gradient(105deg, rgba(28, 25, 23, 0.92) 0%, rgba(28, 25, 23, 0.55) 42%, rgba(41, 37, 36, 0.25) 100%)'
                  : 'linear-gradient(45deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.5))'
                : `linear-gradient(135deg, ${secondarySoft} 0%, ${secondary} 74%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              padding: '48px',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                gap: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                  minWidth: 0,
                  padding: '34px 36px 30px 36px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 28,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 24,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      {isChristmasOg && christmasLogoSrc ? (
                        <img
                          alt=""
                          src={christmasLogoSrc}
                          height={56}
                          width={260}
                          style={{
                            height: 56,
                            width: 'auto',
                            maxWidth: 300,
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <>
                          <BrandLogo color={primary} />
                          <div
                            style={{
                              display: 'flex',
                              fontSize: 30,
                              fontWeight: 700,
                              letterSpacing: '-0.03em',
                              whiteSpace: 'nowrap',
                              color: '#ffffff',
                            }}
                          >
                            {site}
                          </div>
                        </>
                      )}
                    </div>
                    {path ? (
                      <div
                        style={{
                          display: 'flex',
                          border: '1px solid rgba(255,255,255,0.18)',
                          borderRadius: 9999,
                          padding: '10px 18px',
                          fontSize: 20,
                          color: copyColor,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                        }}
                      >
                        {path}
                      </div>
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 20,
                      maxWidth: 700,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        fontSize: isChristmasOg ? 62 : 76,
                        lineHeight: 0.96,
                        fontWeight: 800,
                        letterSpacing: '-0.06em',
                        color: '#ffffff',
                      }}
                    >
                      {title}
                    </div>
                    {description ? (
                      <div
                        style={{
                          display: 'flex',
                          fontSize: isChristmasOg ? 26 : 30,
                          lineHeight: 1.32,
                          color: copyColor,
                          maxWidth: 660,
                        }}
                      >
                        {description}
                      </div>
                    ) : null}
                    {cta ? (
                      <div
                        style={{
                          display: 'flex',
                          alignSelf: 'flex-start',
                          marginTop: 14,
                          border: '2px solid rgba(255,255,255,0.92)',
                          borderRadius: 9999,
                          padding: '12px 28px',
                          fontSize: 24,
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                          color: '#ffffff',
                          backgroundColor: 'rgba(234, 88, 12, 0.42)',
                        }}
                      >
                        {cta}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  width: '32%',
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts: fontFamily
        ? [
            {
              name: 'Switzer-Variable',
              data: fontFamily,
              style: 'normal',
              weight: 400,
            },
          ]
        : undefined,
    },
  )

  const pngBuffer = await imageResponse.arrayBuffer()

  return new Response(pngBuffer, {
    status: 200,
    headers: {
      'content-type': 'image/png',
      'content-length': String(pngBuffer.byteLength),
      'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

export async function HEAD(request) {
  const response = await GET(request)
  const headers = new Headers(response.headers)

  if (!headers.get('content-length')) {
    try {
      const pngBuffer = await response.arrayBuffer()
      headers.set('content-length', String(pngBuffer.byteLength))
    } catch {
      // Leave content-length unset if buffering fails unexpectedly.
    }
  }

  return new Response(null, {
    status: response.status,
    headers,
  })
}
