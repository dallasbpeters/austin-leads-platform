import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Texas Solar and Roofing Pros'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
let familjenVariableFontPromise
const OG_COLOR_TOKEN_MAP = {
  primary: 'hsl(205 99% 36%)',
  secondary: 'hsl(190 61% 15%)',
  tertiary: 'hsl(34 94% 54%)',
  primaryAlt: 'hsl(221 86% 67%)',
  secondaryAlt: 'hsl(206 56% 67%)',
  tertiaryAlt: 'hsl(50 56% 67%)',
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

function getFamiljenVariableFont(requestUrl) {
  if (!familjenVariableFontPromise) {
    const fontCandidates = [
      '/fonts/FamiljenGrotesk-Variable.woff',
      '/fonts/FamiljenGrotesk-Variable.ttf',
      '/fonts/FamiljenGrotesk-Variable.woff2',
    ]

    familjenVariableFontPromise = (async () => {
      for (const candidate of fontCandidates) {
        try {
          const response = await fetch(new URL(candidate, requestUrl.origin))
          if (!response.ok) continue
          const bytes = await response.arrayBuffer()
          if (bytes?.byteLength) return bytes
        } catch {
          // Try the next candidate.
        }
      }
      return null
    })()
  }

  return familjenVariableFontPromise
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

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const familjenVariableFont = await getFamiljenVariableFont(requestUrl)

  const site = clampText(searchParams.get('site') || 'Texas Solar and Roofing Pros', 80)
  const title = clampText(searchParams.get('title') || site, 120)
  const description = clampText(searchParams.get('description') || '', 180)
  const path = clampText(searchParams.get('path') || '', 80)
  const category = clampText(searchParams.get('category') || '', 80)
  const layout = clampText(searchParams.get('layout') || '', 20)
  const imageParam = searchParams.get('image') || ''
  const image = imageParam ? new URL(imageParam, requestUrl.origin).toString() : ''

  const primary = safeColor(searchParams.get('primary'), '#f97316')
  const secondary = safeColor(searchParams.get('secondary'), '#016bb7')
  const guideBackground = safeColor(searchParams.get('bg'), secondary)
  const secondarySoft = '#172554'
  const copyColor = '#dbe4ee'
  const isGuideLayout = layout === 'guide'

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: secondary,
        color: 'white',
        fontFamily: 'FamiljenGrotesk-Variable, Arial, sans-serif',
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
            padding: '44px 48px',
            background: `linear-gradient(145deg, ${guideBackground} 0%, ${guideBackground} 100%)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '1100px',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 26,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.86)',
                fontWeight: 600,
              }}
            >
              Guide
            </div>
            {category ? (
              <div
                style={{
                  display: 'flex',
                  border: '1px solid rgba(255,255,255,0.26)',
                  borderRadius: 9999,
                  padding: '9px 16px',
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.9)',
                  backgroundColor: 'rgba(255,255,255,0.07)',
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
                  color: '#ffffff',
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
                    color: 'rgba(255,255,255,0.92)',
                    fontWeight: 500,
                  }}
                >
                  {description}
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '-0.02em',
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
                <BrandLogo color="#ffffff" />
              </div>
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
                ? 'linear-gradient(45deg, rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.5))'
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
                  width: '68%',
                  minWidth: 0,
                  borderRadius: 34,
                  border: '1px solid rgba(255,255,255,0.14)',
                  backgroundColor: image ? 'rgba(15, 23, 42, 0.36)' : 'rgba(15, 23, 42, 0.14)',
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
                      <BrandLogo color={primary} />
                      <div
                        style={{
                          display: 'flex',
                          fontSize: 30,
                          fontWeight: 700,
                          letterSpacing: '-0.03em',
                          color: '#ffffff',
                        }}
                      >
                        {site}
                      </div>
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
                        fontSize: 76,
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
                          fontSize: 30,
                          lineHeight: 1.32,
                          color: copyColor,
                          maxWidth: 660,
                        }}
                      >
                        {description}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 18,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: '#94a3b8',
                    }}
                  >
                    Open Graph Preview
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      width: 180,
                      height: 6,
                      borderRadius: 9999,
                      backgroundColor: primary,
                    }}
                  />
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
      ...size,
      fonts: familjenVariableFont
        ? [
            {
              name: 'FamiljenGrotesk-Variable',
              data: familjenVariableFont,
              style: 'normal',
              weight: 400,
            },
          ]
        : undefined,
    },
  )
}
