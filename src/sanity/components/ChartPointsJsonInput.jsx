'use client'

import { useMemo, useState } from 'react'
import { set } from 'sanity'

const ACCEPTED_FILE_TYPES = '.json,application/json'

function coerceNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function generateKey(index) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `chart-point-${Date.now()}-${index}`
}

function normalizePoint(value, index) {
  if (Array.isArray(value)) {
    const label = String(value[0] ?? `Point ${index + 1}`)
    const barValue = coerceNumber(value[1]) ?? 0
    const lineValue = coerceNumber(value[2]) ?? 0
    return { _type: 'energyChartPoint', _key: generateKey(index), label, barValue, lineValue }
  }

  if (typeof value === 'number') {
    return {
      _type: 'energyChartPoint',
      _key: generateKey(index),
      label: `Point ${index + 1}`,
      barValue: value,
      lineValue: 0,
    }
  }

  if (value && typeof value === 'object') {
    const labelCandidate = value.label ?? value.name ?? value.month ?? value.category ?? value.x ?? value.key
    const barCandidate = value.barValue ?? value.primary ?? value.value ?? value.bar ?? value.y
    const lineCandidate = value.lineValue ?? value.secondary ?? value.line ?? value.target ?? value.y2

    return {
      _type: 'energyChartPoint',
      _key: value._key || generateKey(index),
      label: String(labelCandidate ?? `Point ${index + 1}`),
      barValue: coerceNumber(barCandidate) ?? 0,
      lineValue: coerceNumber(lineCandidate) ?? 0,
    }
  }

  return null
}

function parseChartPointsJson(input) {
  const parsed = JSON.parse(input)
  if (!Array.isArray(parsed)) {
    throw new Error('JSON must be an array of points.')
  }

  const points = parsed
    .map((entry, index) => normalizePoint(entry, index))
    .filter(Boolean)

  if (!points.length) {
    throw new Error('No valid points found in JSON.')
  }

  return points
}

export default function ChartPointsJsonInput(props) {
  const { value, onChange, renderDefault } = props
  const [jsonText, setJsonText] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const currentCount = useMemo(() => (Array.isArray(value) ? value.length : 0), [value])

  const handleApplyJson = () => {
    setError('')
    setStatus('')
    try {
      const points = parseChartPointsJson(jsonText)
      onChange(set(points))
      setStatus(`Imported ${points.length} chart points.`)
    } catch (parseError) {
      setError(parseError?.message || 'Invalid JSON input.')
    }
  }

  const handleJsonFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setStatus('')

    try {
      const text = await file.text()
      setJsonText(text)
      const points = parseChartPointsJson(text)
      onChange(set(points))
      setStatus(`Imported ${points.length} chart points from ${file.name}.`)
    } catch (parseError) {
      setError(parseError?.message || 'Could not parse JSON file.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Import chart points from JSON</p>
        <p style={{ margin: '0.35rem 0 0.65rem 0', fontSize: '0.85rem', opacity: 0.8 }}>
          Accepts an array of objects like {`[{ "label": "Jan", "barValue": 450, "lineValue": 60 }]`} or arrays like
          {` [["Jan", 450, 60], ["Feb", 470, 68]]`}.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <input type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleJsonFileChange} />
          <button type="button" onClick={handleApplyJson}>
            Apply JSON
          </button>
          <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>Current points: {currentCount}</span>
        </div>
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          placeholder='Paste JSON array here'
          rows={6}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem' }}
        />
        {status ? <p style={{ margin: '0.5rem 0 0 0', color: '#166534', fontSize: '0.85rem' }}>{status}</p> : null}
        {error ? <p style={{ margin: '0.5rem 0 0 0', color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p> : null}
      </div>
      {renderDefault(props)}
    </div>
  )
}
