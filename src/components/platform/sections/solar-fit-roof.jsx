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
export function AddressSearch({ onPick, picked }) {
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

/**
 * The roof photo with the first `count` panels drawn on it. The server sends
 * the photo's size and each panel's spot in metres, so the drawing here is in
 * metres too and lines up with the photo exactly.
 */
export function RoofMap({ roof, photo, count, address }) {
  if (!photo) {
    return null
  }
  const shown = roof.panels.slice(0, count)

  return (
    <figure className="solar-fit__roof">
      <div
        className="solar-fit__roof-frame"
        style={{ aspectRatio: `${photo.metersWide} / ${photo.metersTall}` }}
      >
        {/* oxlint-disable-next-line next/no-img-element -- a data URL or our own proxy route, already sized */}
        <img
          className="solar-fit__roof-photo"
          src={photo.src}
          alt={`Aerial view of ${address || 'the roof'}`}
        />
        <svg
          className="solar-fit__roof-panels"
          viewBox={`0 0 ${photo.metersWide} ${photo.metersTall}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {shown.map((panel, index) => {
            const { x, y } = photo.panels[index]
            const width = panel.landscape ? roof.panelHeight : roof.panelWidth
            const height = panel.landscape ? roof.panelWidth : roof.panelHeight
            return (
              <rect
                // Panels have no id; their order is fixed for a roof.
                // oxlint-disable-next-line react/no-array-index-key
                key={index}
                x={x - width / 2}
                y={y - height / 2}
                width={width}
                height={height}
                transform={`rotate(${panel.azimuth} ${x} ${y})`}
                className="solar-fit__panel"
              />
            )
          })}
        </svg>
      </div>
      <figcaption className="solar-fit__roof-caption">
        {count} panels on {address || 'your roof'}. Imagery © Google.
      </figcaption>
    </figure>
  )
}
