'use client'

import { Loader2, Search, Unplug } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DEBOUNCE_MS = 300
const MIN_QUERY = 2

/**
 * Live Zoho CRM contact search using the signed-in user's Zoho OAuth session.
 * Selecting a result calls onSelect — contacts are never stored locally.
 */
export default function ZohoContactTypeahead({
  value,
  onChange,
  onSelect,
  zohoConnected = false,
  zohoAuthEnabled = false,
  placeholder = 'Search Zoho contacts…',
}) {
  const listId = useId()
  const wrapRef = useRef(null)
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [needsAuth, setNeedsAuth] = useState(!zohoConnected)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    setNeedsAuth(!zohoConnected)
  }, [zohoConnected])

  useEffect(() => {
    const q = query.trim()
    if (q.length < MIN_QUERY) {
      setResults([])
      setLoading(false)
      setError(null)
      return undefined
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/quotes/zoho-contacts?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        const payload = await response.json().catch(() => ({}))
        if (payload.needsZohoAuth || response.status === 401) {
          setNeedsAuth(true)
          setResults([])
          setError(payload.error || 'Connect Zoho to search contacts.')
          return
        }
        if (!response.ok) {
          setResults([])
          setError(payload.error || 'Search failed')
          return
        }
        setNeedsAuth(false)
        setResults(Array.isArray(payload.contacts) ? payload.contacts : [])
        setOpen(true)
        setActiveIndex(-1)
      } catch (err) {
        if (err?.name === 'AbortError') {
          return
        }
        setError(err.message || 'Search failed')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleSelect = (contact) => {
    onSelect?.(contact)
    setQuery(contact.name || '')
    onChange?.(contact.name || '')
    setOpen(false)
    setResults([])
  }

  const handleConnectZoho = async () => {
    setConnecting(true)
    await signIn('zoho', { callbackUrl: '/quotes' })
  }

  const handleKeyDown = (event) => {
    if (!open || results.length === 0) {
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      handleSelect(results[activeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="space-y-1.5" ref={wrapRef}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={listId}>Customer name *</Label>
        {needsAuth && zohoAuthEnabled ? (
          <Button
            className="h-7 px-2 text-xs"
            disabled={connecting}
            onClick={handleConnectZoho}
            size="sm"
            type="button"
            variant="outline"
          >
            {connecting ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <Unplug className="mr-1 size-3.5" />
            )}
            Connect Zoho
          </Button>
        ) : null}
      </div>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
        />
        <Input
          aria-autocomplete="list"
          aria-controls={`${listId}-listbox`}
          aria-expanded={open}
          autoComplete="off"
          className="pl-8"
          id={listId}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            onChange?.(next)
            setOpen(true)
          }}
          onFocus={() => {
            if (results.length > 0) {
              setOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            needsAuth ? placeholder.replace('Search Zoho', 'Type name or Connect Zoho') : placeholder
          }
          role="combobox"
          value={query}
        />
        {loading ? (
          <Loader2
            aria-hidden="true"
            className="text-muted-foreground absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 animate-spin"
          />
        ) : null}
        {open && query.trim().length >= MIN_QUERY && (results.length > 0 || error) ? (
          <ul
            className="bg-popover border-border absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border py-1 shadow-md"
            id={`${listId}-listbox`}
            role="listbox"
          >
            {error ? (
              <li className="text-muted-foreground px-3 py-2 text-xs">{error}</li>
            ) : (
              results.map((contact, index) => {
                const subtitle = [contact.email, contact.propertyCity, contact.propertyState]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <li key={contact.id || `${contact.email}-${contact.name}`}>
                    <button
                      aria-selected={index === activeIndex}
                      className={`hover:bg-muted flex w-full flex-col items-start px-3 py-2 text-left text-sm ${
                        index === activeIndex ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleSelect(contact)}
                      role="option"
                      type="button"
                    >
                      <span className="font-medium">{contact.name || 'Unnamed contact'}</span>
                      {subtitle ? <span className="text-muted-foreground text-xs">{subtitle}</span> : null}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        ) : null}
      </div>
      {!needsAuth ? (
        <p className="text-muted-foreground text-xs">
          Type to search your Zoho CRM contacts — nothing is stored here.
        </p>
      ) : zohoAuthEnabled ? (
        <p className="text-muted-foreground text-xs">
          Sign in with Zoho (or Connect Zoho) to search contacts with your account.
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">Zoho sign-in is not configured on this environment.</p>
      )}
    </div>
  )
}
