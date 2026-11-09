'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/*
 * The roof step of the "See if solar is right for you" form: an address search
 * (Google Places, through /api/solar-fit/address) and the roof photo with the
 * best panel layout drawn on it (Google Solar API, through /api/solar-fit/roof).
 * The Google key stays on the server; the browser only calls our routes.
 */

const newSession = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())

/** Address box with suggestions as you type. Calls onPick({ placeId, text, session }). */
export function AddressSearch({ id, onPick, picked }) {
  const [query, setQuery] = useState(picked || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const session = useRef(newSession())
  // The text of the last pick: no new search until the visitor types something else.
  const pickedText = useRef(picked || '')
  const listId = useId()

  useEffect(() => {
    const text = query.trim()
    if (text.length < 4 || text === pickedText.current) {
      setSuggestions([])
      return undefined
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/solar-fit/address?q=${encodeURIComponent(text)}&session=${session.current}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((body) => {
          setSuggestions(body.suggestions || [])
          setOpen(true)
          setActive(-1)
        })
        .catch(() => {})
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const pick = (suggestion) => {
    pickedText.current = suggestion.text
    setQuery(suggestion.text)
    setSuggestions([])
    setOpen(false)
    onPick({ ...suggestion, session: session.current })
    // A finished lookup closes the billing session; the next search starts a new one.
    session.current = newSession()
  }

  const onKeyDown = (event) => {
    if (!open || !suggestions.length) {
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (current + step + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter' && active >= 0) {
      event.preventDefault()
      pick(suggestions[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="solar-fit__address">
      <input
        id={id}
        type="text"
        className="solar-calculator__input"
        placeholder="Start typing your street address"
        autoComplete="street-address"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {open && suggestions.length ? (
        <ul id={listId} role="listbox" className="solar-fit__suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.placeId}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={cn('solar-fit__suggestion', index === active && 'solar-fit__suggestion--active')}
              onMouseDown={(event) => {
                event.preventDefault()
                pick(suggestion)
              }}
            >
              {suggestion.text}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/*
 * A 60-cell panel: 6 cells across its short side, 10 along its long side. The
 * cells are drawn as lines in metres, inside a thin aluminium frame.
 */
const CELLS_SHORT = 6
const CELLS_LONG = 10

function SolarPanel({ x, y, width, height, landscape, glass, transform }) {
  const columns = landscape ? CELLS_LONG : CELLS_SHORT
  const rows = landscape ? CELLS_SHORT : CELLS_LONG
  const lines = [
    ...Array.from({ length: columns - 1 }, (_, i) => {
      const lineX = x + ((i + 1) * width) / columns
      return `M${lineX} ${y}V${y + height}`
    }),
    ...Array.from({ length: rows - 1 }, (_, i) => {
      const lineY = y + ((i + 1) * height) / rows
      return `M${x} ${lineY}H${x + width}`
    }),
  ].join('')
  return (
    <g className="solar-fit__panel" transform={transform}>
      <rect x={x} y={y} width={width} height={height} fill={glass} />
      <path d={lines} className="solar-fit__panel-cells" />
      <rect x={x} y={y} width={width} height={height} className="solar-fit__panel-frame" />
    </g>
  )
}

/** Margin around the roof, in metres, so the panels never touch the frame edge. */
const ROOF_MARGIN = 3

/**
 * A square view in photo metres around every panel spot on the roof (not only
 * the ones shown), so the view stays put as the panel count changes. The photo
 * comes wider than the roof; this zooms in on the house.
 */
export function roofView(photo, panelSize) {
  if (!photo.panels.length) {
    return { x: 0, y: 0, size: Math.min(photo.metersWide, photo.metersTall) }
  }
  const xs = photo.panels.map((panel) => panel.x)
  const ys = photo.panels.map((panel) => panel.y)
  const reach = panelSize + ROOF_MARGIN
  const left = Math.min(...xs) - reach
  const top = Math.min(...ys) - reach
  const size = Math.min(
    Math.max(Math.max(...xs) + reach - left, Math.max(...ys) + reach - top),
    photo.metersWide,
    photo.metersTall,
  )
  const centerX = (left + Math.max(...xs) + reach) / 2
  const centerY = (top + Math.max(...ys) + reach) / 2
  const clamp = (value, max) => Math.min(Math.max(value, 0), max - size)
  return {
    x: clamp(centerX - size / 2, photo.metersWide),
    y: clamp(centerY - size / 2, photo.metersTall),
    size,
  }
}

/**
 * The roof photo with the first `count` panels drawn on it. The server sends
 * the photo's size and each panel's spot in metres, so the photo and panels are
 * one SVG in metres, cropped to the roof (roofView).
 */
export function RoofMap({ roof, photo, count, address, onCountChange }) {
  const glassId = `${useId().replaceAll(':', '')}-glass`
  if (!photo) {
    return null
  }
  const shown = roof.panels.slice(0, count)
  const view = roofView(photo, roof.panelHeight)
  const label = `Aerial view of ${address || 'the roof'}${count ? ` with ${count} solar panels drawn on it` : ''}`

  return (
    <figure className="solar-fit__roof">
      <svg
        className="solar-fit__roof-frame"
        viewBox={`${view.x} ${view.y} ${view.size} ${view.size}`}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an <img> cannot hold the drawn panels; role="img" names the whole picture
        role="img"
        aria-label={label}
      >
        <image
          href={photo.src}
          width={photo.metersWide}
          height={photo.metersTall}
          preserveAspectRatio="none"
        />
        <defs>
          {/* Dark glass with a soft sheen from the top corner, like a real panel in sun. */}
          <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(38% 0.07 255)" />
            <stop offset="0.45" stopColor="oklch(22% 0.05 260)" />
            <stop offset="1" stopColor="oklch(16% 0.04 262)" />
          </linearGradient>
        </defs>
        {shown.map((panel, index) => {
          const { x, y } = photo.panels[index]
          const width = panel.landscape ? roof.panelHeight : roof.panelWidth
          const height = panel.landscape ? roof.panelWidth : roof.panelHeight
          return (
            <SolarPanel
              // Panels have no id; their order is fixed for a roof.
              // oxlint-disable-next-line react/no-array-index-key
              key={index}
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              landscape={panel.landscape}
              glass={`url(#${glassId})`}
              transform={`rotate(${panel.azimuth} ${x} ${y})`}
            />
          )
        })}
      </svg>
      <figcaption className="solar-fit__roof-caption">
        {count ? `${count} panels on ` : 'Your roof at '}
        {address || 'your address'}. Imagery © Google.
      </figcaption>
      {onCountChange && count ? (
        <div className="solar-fit__panel-count" role="group" aria-label="Number of panels">
          <button
            type="button"
            className="solar-fit__panel-step"
            onClick={() => onCountChange(Math.max(1, count - 1))}
            disabled={count <= 1}
            aria-label="Remove a panel"
          >
            −
          </button>
          <output className="solar-fit__panel-total" aria-live="polite">
            {count} panels
          </output>
          <button
            type="button"
            className="solar-fit__panel-step"
            onClick={() => onCountChange(Math.min(roof.panels.length, count + 1))}
            disabled={count >= roof.panels.length}
            aria-label="Add a panel"
          >
            +
          </button>
        </div>
      ) : null}
    </figure>
  )
}
