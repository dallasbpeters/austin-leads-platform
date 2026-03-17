import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Texas Solar and Roofing Pros'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

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

  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return trimmed
  }

  if (/^rgba?\([^)]+\)$/.test(trimmed)) {
    return trimmed
  }

  if (/^hsla?\([^)]+\)$/.test(trimmed)) {
    return trimmed
  }

  return fallback
}

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl

  const site = clampText(searchParams.get('site') || 'Texas Solar and Roofing Pros', 80)
  const title = clampText(searchParams.get('title') || site, 120)
  const description = clampText(searchParams.get('description') || '', 180)
  const path = clampText(searchParams.get('path') || '', 80)
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
        fontFamily: 'Manrope, Arial, sans-serif',
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
              width: '100%',
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
            {path ? (
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
                {path}
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
    },
  )
}
