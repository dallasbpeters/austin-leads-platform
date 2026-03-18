'use client'

import { useMemo, useState } from 'react'
import { PatchEvent, set, useFormCallbacks } from 'sanity'

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

function normalizeAreaValuesArray(raw) {
  if (!Array.isArray(raw)) {
    return null
  }
  const out = raw.map((v) => coerceNumber(v)).filter((n) => n !== null && n >= 0)
  return out.length ? out : null
}

function normalizePoint(value, index) {
  if (Array.isArray(value)) {
    const label = String(value[0] ?? `Point ${index + 1}`)
    const barValue = coerceNumber(value[1]) ?? 0
    const lineValue = coerceNumber(value[2]) ?? 0
    const areaValues = normalizeAreaValuesArray(value[3])
    const point = { _type: 'energyChartPoint', _key: generateKey(index), label, barValue, lineValue }
    if (areaValues) {
      point.areaValues = areaValues
    }
    return point
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
    const areaValues =
      normalizeAreaValuesArray(value.areaValues) ?? normalizeAreaValuesArray(value.areas)

    const point = {
      _type: 'energyChartPoint',
      _key: value._key || generateKey(index),
      label: String(labelCandidate ?? `Point ${index + 1}`),
      barValue: coerceNumber(barCandidate) ?? 0,
      lineValue: coerceNumber(lineCandidate) ?? 0,
    }
    if (areaValues) {
      point.areaValues = areaValues
    }
    return point
  }

  return null
}

function extractPointsCollection(parsed) {
  if (Array.isArray(parsed)) {
    return parsed
  }

  if (!parsed || typeof parsed !== 'object') {
    return null
  }

  if (Array.isArray(parsed.chartPoints)) {
    return parsed.chartPoints
  }

  if (Array.isArray(parsed.points)) {
    return parsed.points
  }

  if (Array.isArray(parsed.data)) {
    return parsed.data
  }

  if (parsed.section && Array.isArray(parsed.section.chartPoints)) {
    return parsed.section.chartPoints
  }

  if (Array.isArray(parsed.sections)) {
    const chartSection = parsed.sections.find((section) => Array.isArray(section?.chartPoints))
    if (chartSection) {
      return chartSection.chartPoints
    }
  }

  return null
}

function extractChartConfig(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {}
  }

  const sectionFromSections = Array.isArray(parsed.sections)
    ? parsed.sections.find((section) => section && typeof section === 'object')
    : null

  const source = parsed.section && typeof parsed.section === 'object'
    ? parsed.section
    : sectionFromSections || parsed

  const configKeys = [
    'eyebrow',
    'title',
    'body',
    'chartType',
    'showGrid',
    'showLegend',
    'showAxisLines',
    'chartAreaFillOpacity',
    'chartPeriodLabel',
    'chartPrimaryLabel',
    'chartSecondaryLabel',
    'chartUnitLabel',
    'chartLineUnitLabel',
    'chartYAxisMax',
    'chartBarColor',
    'chartLineColor',
    'chartAreaStacked',
    'chartAreaSeries',
  ]

  return configKeys.reduce((accumulator, key) => {
    if (source[key] !== undefined) {
      accumulator[key] = source[key]
    }
    return accumulator
  }, {})
}

function parseChartPointsJson(input) {
  const parsed = JSON.parse(input)
  const collection = extractPointsCollection(parsed)

  if (!Array.isArray(collection)) {
    throw new Error('JSON must be an array, or an object containing chartPoints/points/data.')
  }

  const points = collection
    .map((entry, index) => normalizePoint(entry, index))
    .filter(Boolean)

  if (!points.length) {
    throw new Error('No valid points found in JSON.')
  }

  return {
    points,
    config: extractChartConfig(parsed),
  }
}

function patchValueForChartConfig(key, fieldValue) {
  if (key !== 'chartAreaSeries' || !Array.isArray(fieldValue)) {
    return fieldValue
  }
  return fieldValue.map((row, index) => ({
    _type: 'energyChartAreaSeriesItem',
    _key: typeof row?._key === 'string' && row._key ? row._key : generateKey(index),
    title:
      row?.title != null && String(row.title).trim()
        ? String(row.title).trim()
        : `Series ${index + 1}`,
    ...(row?.color != null && String(row.color).trim() !== '' ? { color: row.color } : {}),
  }))
}

export default function ChartPointsJsonInput(props) {
  const { value, renderDefault, path = [] } = props
  const { onChange: patchDocument } = useFormCallbacks()
  const [jsonText, setJsonText] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const currentCount = useMemo(() => (Array.isArray(value) ? value.length : 0), [value])
  const parentPath = useMemo(() => path.slice(0, -1), [path])

  const applyParsedJson = ({ points, config }, sourceLabel = 'JSON') => {
    const patches = [set(points, path)]
    Object.entries(config || {}).forEach(([key, fieldValue]) => {
      patches.push(set(patchValueForChartConfig(key, fieldValue), [...parentPath, key]))
    })
    patchDocument(PatchEvent.from(patches))
    const configCount = Object.keys(config || {}).length
    setStatus(
      configCount > 0
        ? `Imported ${points.length} points and updated ${configCount} chart settings from ${sourceLabel}.`
        : `Imported ${points.length} chart points from ${sourceLabel}.`,
    )
  }

  const handleApplyJson = () => {
    setError('')
    setStatus('')
    try {
      const parsed = parseChartPointsJson(jsonText)
      applyParsedJson(parsed)
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
      const parsed = parseChartPointsJson(text)
      applyParsedJson(parsed, file.name)
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
          Accepts objects like {`{ "label": "Jan", "barValue": 450, "lineValue": 60, "areaValues": [400, 50] }`} or arrays
          {` ["Jan", 450, 60, [400, 50]]`} (optional 4th element = area values per series). Full section JSON can include
          {` "chartAreaSeries": [{ "title": "Solar", "color": "primary" }], "chartAreaStacked": true`}.
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
          placeholder='Paste JSON array or object with chartPoints'
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
