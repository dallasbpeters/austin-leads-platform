import React from 'react'

import { studioPreviewOrigin } from '../env'

function ToolIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.1rem',
        height: '1.1rem',
        fontSize: '0.95rem',
        lineHeight: 1,
      }}
    >
      ⚡
    </span>
  )
}

function scoreColor(score) {
  if (typeof score !== 'number') return '#6b7280'
  if (score >= 90) return '#15803d'
  if (score >= 50) return '#b45309'
  return '#b91c1c'
}

function ScoreCard({ label, score }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '0.9rem',
        display: 'grid',
        gap: '0.35rem',
      }}
    >
      <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '1.5rem', color: scoreColor(score) }}>
        {typeof score === 'number' ? score : '—'}
      </div>
    </div>
  )
}

function AuditRow({ label, audit }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.2rem',
        borderTop: '1px solid #f3f4f6',
        paddingTop: '0.65rem',
      }}
    >
      <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>
        {label}: <span style={{ color: scoreColor(audit?.score) }}>{audit?.score ?? '—'}</span>
      </div>
      {audit?.displayValue ? (
        <div style={{ fontSize: '0.88rem', color: '#4b5563' }}>{audit.displayValue}</div>
      ) : null}
    </div>
  )
}

export function PageSpeedTool() {
  const [url, setUrl] = React.useState('https://texassolarandroofingpros.com')
  const [strategy, setStrategy] = React.useState('mobile')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [result, setResult] = React.useState(null)

  async function handleRun(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${studioPreviewOrigin}/api/pagespeed/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, strategy }),
      })

      const payload = await response.json()
      if (!response.ok) {
        const details = payload?.details ? ` ${payload.details}` : ''
        throw new Error(`${payload?.error || 'Failed to run PageSpeed report.'}${details}`)
      }

      setResult(payload)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to run PageSpeed report.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        display: 'grid',
        gap: '1rem',
        maxWidth: '1024px',
        marginInline: 'auto',
      }}
    >
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#6b7280',
          }}
        >
          Performance
        </div>
        <h1 style={{ fontSize: '2rem', lineHeight: 1.1, margin: 0 }}>Custom PageSpeed Report</h1>
        <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
          Run Google PageSpeed Insights for any URL and review performance + SEO scores directly in Studio.
        </p>
      </div>

      <form
        onSubmit={handleRun}
        style={{
          display: 'grid',
          gap: '0.9rem',
          border: '1px solid #e5e7eb',
          borderRadius: '1rem',
          padding: '1rem',
          background: 'white',
        }}
      >
        <label style={{ display: 'grid', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>URL</span>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/page"
            style={{
              padding: '0.75rem 0.8rem',
              borderRadius: '0.6rem',
              border: '1px solid #d1d5db',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Strategy</span>
          <select
            value={strategy}
            onChange={(event) => setStrategy(event.target.value)}
            style={{
              padding: '0.75rem 0.8rem',
              borderRadius: '0.6rem',
              border: '1px solid #d1d5db',
              width: '220px',
            }}
          >
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          style={{
            width: 'fit-content',
            border: 'none',
            background: '#111827',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.65rem',
            cursor: 'pointer',
            fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Running report…' : 'Run PageSpeed'}
        </button>
      </form>

      {error ? (
        <div
          style={{
            border: '1px solid #fca5a5',
            background: '#fef2f2',
            color: '#991b1b',
            borderRadius: '0.75rem',
            padding: '0.85rem 1rem',
          }}
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gap: '0.6rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            }}
          >
            <ScoreCard label="Performance" score={result.categories?.performance} />
            <ScoreCard label="Accessibility" score={result.categories?.accessibility} />
            <ScoreCard label="Best Practices" score={result.categories?.bestPractices} />
            <ScoreCard label="SEO" score={result.categories?.seo} />
          </div>

          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.9rem',
              padding: '1rem',
              background: 'white',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.7rem' }}>Core Web Vitals Snapshot</div>
            <AuditRow label="Largest Contentful Paint" audit={result.coreWebVitals?.lcp} />
            <AuditRow label="Cumulative Layout Shift" audit={result.coreWebVitals?.cls} />
            <AuditRow label="Total Blocking Time" audit={result.coreWebVitals?.tbt} />
            <AuditRow label="Speed Index" audit={result.coreWebVitals?.speedIndex} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function pageSpeedTool() {
  return {
    name: 'custom-pagespeed',
    title: 'PageSpeed',
    icon: ToolIcon,
    component: PageSpeedTool,
  }
}
