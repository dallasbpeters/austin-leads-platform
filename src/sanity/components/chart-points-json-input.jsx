'use client'

import { useCallback, useMemo, useState } from 'react'
import { PatchEvent, set, useClient, useFormCallbacks, useGetFormValue } from 'sanity'

const ACCEPTED_FILE_TYPES = '.json,application/json'

function coerceNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

function generateKey(index) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `chart-point-${Date.now()}-${index}`
}

function ensureListKeys(items, prefix = 'item') {
  if (!Array.isArray(items)) {
    return items
  }
  return items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      return item
    }
    const existing = item._key != null && String(item._key).trim()
    const key = existing ? String(item._key) : `${prefix}-${index}-${Date.now().toString(36)}`
    return { ...item, _key: key }
  })
}

function normalizeAreaValuesArray(raw) {
  if (!Array.isArray(raw)) {
    return null
  }
  const out = raw.map((v) => coerceNumber(v)).filter((n) => n !== null && n >= 0)
  return out.length ? out : null
}

function normalizeArrayPoint(value, index) {
  const label = String(value[0] ?? `Point ${index + 1}`)
  const barValue = coerceNumber(value[1]) ?? 0
  const lineValue = coerceNumber(value[2]) ?? 0
  const areaValues = normalizeAreaValuesArray(value[3])
  const point = {
    _type: 'energyChartPoint',
    _key: generateKey(index),
    label,
    barValue,
    lineValue,
  }
  if (areaValues) {
    point.areaValues = areaValues
  }
  return point
}

function normalizeNumberPoint(value, index) {
  return {
    _type: 'energyChartPoint',
    _key: generateKey(index),
    label: `Point ${index + 1}`,
    barValue: value,
    lineValue: 0,
  }
}

function normalizeObjectPoint(value, index) {
  const labelCandidate = value.label ?? value.name ?? value.month ?? value.category ?? value.x ?? value.key
  const barCandidate = value.barValue ?? value.primary ?? value.value ?? value.bar ?? value.y
  const lineCandidate = value.lineValue ?? value.secondary ?? value.line ?? value.target ?? value.y2
  const areaValues = normalizeAreaValuesArray(value.areaValues) ?? normalizeAreaValuesArray(value.areas)

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

function normalizePoint(value, index) {
  if (Array.isArray(value)) {
    return normalizeArrayPoint(value, index)
  }
  if (typeof value === 'number') {
    return normalizeNumberPoint(value, index)
  }
  if (value && typeof value === 'object') {
    return normalizeObjectPoint(value, index)
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

  const source =
    parsed.section && typeof parsed.section === 'object' ? parsed.section : sectionFromSections || parsed

  const configKeys = [
    'type',
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

function inferAreaSeriesConfig(points, config, parsed) {
  const maxAreaValuesLen = points.reduce(
    (max, point) => Math.max(max, Array.isArray(point?.areaValues) ? point.areaValues.length : 0),
    0,
  )
  const hasAreaSeries = Array.isArray(config.chartAreaSeries) && config.chartAreaSeries.length > 0
  const isAreaChartImport =
    config.chartType === 'area' || parsed.chartType === 'area' || parsed._type === 'energyChartSection'
  if (maxAreaValuesLen < 2 || hasAreaSeries || !isAreaChartImport) {
    return config
  }

  return {
    ...config,
    chartAreaSeries: Array.from({ length: maxAreaValuesLen }, (_, i) => ({
      title:
        i === 0
          ? config.chartPrimaryLabel || 'Primary'
          : i === 1
            ? config.chartSecondaryLabel || 'Secondary'
            : `Series ${i + 1}`,
      ...(i === 0 && config.chartBarColor ? { color: config.chartBarColor } : {}),
      ...(i === 1 && config.chartLineColor ? { color: config.chartLineColor } : {}),
    })),
  }
}

function parseChartPointsJson(input) {
  const parsed = JSON.parse(input)
  const collection = extractPointsCollection(parsed)
  if (!Array.isArray(collection)) {
    throw new TypeError('JSON must be an array, or an object containing chartPoints/points/data.')
  }

  const points = collection.map((entry, index) => normalizePoint(entry, index)).filter(Boolean)
  if (!points.length) {
    throw new Error('No valid points found in JSON.')
  }

  const config = inferAreaSeriesConfig(points, extractChartConfig(parsed), parsed)

  return { points, config }
}

function patchValueForChartConfig(key, fieldValue) {
  if (key !== 'chartAreaSeries' || !Array.isArray(fieldValue)) {
    return fieldValue
  }
  return fieldValue.map((row, index) => ({
    _type: 'energyChartAreaSeriesItem',
    _key: typeof row?._key === 'string' && row._key ? row._key : generateKey(index),
    title: row?.title != null && String(row.title).trim() ? String(row.title).trim() : `Series ${index + 1}`,
    ...(row?.color != null && String(row.color).trim() !== '' ? { color: row.color } : {}),
  }))
}

function escapeKeyForJsonMatch(key) {
  return String(key || '')
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
}

function resolveChartSectionKey(path, getFormValue) {
  if (!Array.isArray(path) || path.length < 2) {
    return null
  }

  const parent = typeof getFormValue === 'function' ? getFormValue(path.slice(0, -1)) : null
  if (parent?._key) {
    return String(parent._key)
  }

  for (let i = path.length - 1; i >= 2; i -= 1) {
    if (path[i] !== 'chartPoints' || path[i - 2] !== 'sections') {
      continue
    }
    const seg = path[i - 1]
    if (seg && typeof seg === 'object' && seg._key) {
      return String(seg._key)
    }
    if (typeof seg === 'number' && typeof getFormValue === 'function') {
      const sections = getFormValue(['sections'])
      const item = Array.isArray(sections) ? sections[seg] : null
      if (item?._key) {
        return String(item._key)
      }
    }
  }
  return null
}

function ensurePortableTextKeys(value) {
  if (!Array.isArray(value)) {
    return value
  }
  return value.map((block, bi) => {
    if (!block || typeof block !== 'object' || block._type !== 'block') {
      return block
    }
    const blockKey = block._key || `pt-${bi}-${Date.now().toString(36)}`
    const children = Array.isArray(block.children)
      ? block.children.map((span, si) => {
          if (!span || typeof span !== 'object') {
            return span
          }
          return {
            ...span,
            _key: span._key || `sp-${bi}-${si}-${Math.random().toString(36).slice(2, 9)}`,
          }
        })
      : block.children
    return {
      ...block,
      _key: blockKey,
      markDefs: Array.isArray(block.markDefs) ? block.markDefs : [],
      children,
    }
  })
}

async function persistChartImportToSanity({ client, docId, sectionKey, points, siblingNoBody, config }) {
  const keyedPoints = ensureListKeys(points, 'chart-point')
  const base = `sections[_key=="${escapeKeyForJsonMatch(sectionKey)}"]`
  const payload = { [`${base}.chartPoints`]: keyedPoints }
  for (const [key, fieldValue] of siblingNoBody) {
    payload[`${base}.${key}`] = patchValueForChartConfig(key, fieldValue)
  }

  try {
    await client.patch(docId).set(payload).commit()
  } catch {
    const nextSections = await buildNextSectionsForChartImport({
      client,
      docId,
      sectionKey,
      points: keyedPoints,
      siblingNoBody,
      config: {},
      includeBody: false,
    })
    await client.patch(docId).set({ sections: nextSections }).commit()
  }

  let bodySkipped = false
  if (config?.body !== undefined) {
    try {
      await client
        .patch(docId)
        .set({ [`${base}.body`]: ensurePortableTextKeys(config.body) })
        .commit()
    } catch {
      bodySkipped = true
    }
  }
  return { bodySkipped }
}

const buildNextSectionsForChartImport = async ({
  client,
  docId,
  sectionKey,
  points,
  siblingNoBody,
  config,
  includeBody,
}) => {
  const doc = await client.getDocument(docId)
  const sections = Array.isArray(doc?.sections) ? [...doc.sections] : null
  if (!sections?.length) {
    throw new Error('Could not read sections for this document.')
  }
  const idx = sections.findIndex((s) => s && s._key === sectionKey)
  if (idx === -1) {
    throw new Error(`Chart section (_key "${sectionKey}") not found in sections.`)
  }
  const prev = sections[idx]
  const nextSection = { ...prev, chartPoints: ensureListKeys(points, 'chart-point') }
  for (const [key, fieldValue] of siblingNoBody) {
    nextSection[key] = patchValueForChartConfig(key, fieldValue)
  }
  if (includeBody && config?.body !== undefined) {
    nextSection.body = config.body
  }
  nextSection.chartPoints = ensureListKeys(nextSection.chartPoints, 'chart-point')
  nextSection.chartAreaSeries = ensureListKeys(nextSection.chartAreaSeries, 'area-series')
  return sections.map((s, i) => (i === idx ? nextSection : s))
}

export default function ChartPointsJsonInput(props) {
  const { value, renderDefault, path = [] } = props
  const { onChange: patchDocument } = useFormCallbacks()
  const getFormValue = useGetFormValue()
  const client = useClient({ apiVersion: '2024-08-01' })
  const [jsonText, setJsonText] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)

  const currentCount = useMemo(() => (Array.isArray(value) ? value.length : 0), [value])
  const parentPath = useMemo(() => path.slice(0, -1), [path])

  function scheduleBodyPatch(config) {
    if (config?.body === undefined) {
      return
    }
    window.setTimeout(() => {
      try {
        patchDocument(PatchEvent.from([set(ensurePortableTextKeys(config.body), [...parentPath, 'body'])]))
      } catch {
        setStatus((s) => `${s} Body not updated — fix portable text in Studio.`)
      }
    }, 80)
  }

  async function saveToSanityApi(points, siblingNoBody, config) {
    const docId = getFormValue([])?._id
    const sectionKey = resolveChartSectionKey(path, getFormValue)
    if (!docId || !sectionKey || typeof client?.patch !== 'function') {
      return { saved: false, docId, sectionKey }
    }
    try {
      const { bodySkipped } = await persistChartImportToSanity({
        client,
        docId,
        sectionKey,
        points,
        siblingNoBody,
        config,
      })
      return { saved: true, bodySkipped }
    } catch (error) {
      const msg = error?.message || String(error)
      setError(
        `Sanity save failed: ${msg} Open the page from Structure (desk) if you are only in Preview, then try again.`,
      )
      setStatus('')
      return { saved: false, error: true }
    }
  }

  function reportApiError(docId, sectionKey) {
    if (!docId) {
      setError(
        'Cannot save import: no document id in this view. Open the page from the Structure list, then import again.',
      )
      setStatus('Chart fields may have updated locally only — use Structure → open document → import.')
    } else if (!sectionKey) {
      setError('Cannot save import: chart must be inside page sections[].')
      setStatus('')
    }
  }

  const applyParsedJson = useCallback(
    async ({ points, config }, sourceLabel = 'JSON') => {
      const cfg = config || {}
      const configCount = Object.keys(cfg).length
      setImporting(true)
      setError('')

      const siblingEntries = Object.entries(cfg).filter(([key]) => key !== 'chartPoints')
      const siblingNoBody = siblingEntries.filter(([key]) => key !== 'body')

      try {
        const patches = [set(points, path)]
        for (const [key, fieldValue] of siblingNoBody) {
          patches.push(set(patchValueForChartConfig(key, fieldValue), [...parentPath, key]))
        }
        patchDocument(PatchEvent.from(patches))
        scheduleBodyPatch(cfg)

        const { saved, bodySkipped, docId, sectionKey } = await saveToSanityApi(points, siblingNoBody, cfg)
        if (!saved && docId != null) {
          reportApiError(docId, sectionKey)
        } else if (saved) {
          const bodySkippedNote = bodySkipped
            ? ' Body not saved — edit body in Studio or fix portable text.'
            : ''
          setStatus(
            `${
              configCount > 0
                ? `Imported ${points.length} points + ${configCount} section fields (${sourceLabel}).`
                : `Imported ${points.length} points (${sourceLabel}).`
            } Saved to Sanity.${bodySkippedNote}`,
          )
        }
      } catch (error) {
        const message = error?.message || 'Import failed.'
        setError(message)
        setStatus('')
      } finally {
        setImporting(false)
      }
    },
    [client, getFormValue, parentPath, patchDocument, path],
  )

  const handleApplyJson = () => {
    setError('')
    setStatus('')
    try {
      const parsed = parseChartPointsJson(jsonText)
      void applyParsedJson(parsed)
    } catch (parseError) {
      setError(parseError?.message || 'Invalid JSON input.')
    }
  }

  const handleJsonFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setError('')
    setStatus('')
    try {
      const text = await file.text()
      setJsonText(text)
      const parsed = parseChartPointsJson(text)
      await applyParsedJson(parsed, file.name)
    } catch (parseError) {
      setError(parseError?.message || 'Could not parse JSON file.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div>
      <div
        style={{
          marginBottom: '0.75rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '0.75rem',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>Import chart points from JSON</p>
        <p style={{ margin: '0.35rem 0 0.65rem 0', fontSize: '0.85rem', opacity: 0.8 }}>
          Writes points + section fields via Sanity API (full sections array), same as other Studio tools.
          Open the page from <strong>Structure</strong> so the document id is available.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <input type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleJsonFileChange} />
          <button type="button" onClick={handleApplyJson} disabled={importing}>
            {importing ? 'Applying…' : 'Apply JSON'}
          </button>
          <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>Current points: {currentCount}</span>
        </div>
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          placeholder="Paste JSON array or object with chartPoints"
          rows={6}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem' }}
        />
        {status ? (
          <p style={{ margin: '0.5rem 0 0 0', color: '#166534', fontSize: '0.85rem' }}>{status}</p>
        ) : null}
        {error ? (
          <p style={{ margin: '0.5rem 0 0 0', color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p>
        ) : null}
      </div>
      {renderDefault(props)}
    </div>
  )
}
