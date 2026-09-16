'use client'

/*
 * "My reels": the saved list, as a bottom sheet. Opening one reloads the page
 * on it, so the address always matches what is on screen.
 */

import { useEffect, useState } from 'react'

import { Film, Loader2, Trash2, X } from 'lucide-react'

const coverOf = (reel) => reel.scenes.find((scene) => scene.photo?.thumb)?.photo.thumb || null

const whenOf = (value) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

export default function ReelLibrary({ currentId, onClose }) {
  const [state, setState] = useState({ loading: true, reels: [], error: '' })
  /* Delete takes two taps: the first arms it, the second deletes. */
  const [armedId, setArmedId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const response = await fetch('/api/reels/saved', { signal: controller.signal })
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error || 'Could not load your reels.')
        }
        setState({ loading: false, reels: payload.reels || [], error: '' })
      } catch (error) {
        if (error.name !== 'AbortError') {
          setState({ loading: false, reels: [], error: error.message })
        }
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const remove = async (id) => {
    if (armedId !== id) {
      setArmedId(id)
      return
    }
    setArmedId(null)
    const response = await fetch(`/api/reels/saved/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setState((current) => ({ ...current, reels: current.reels.filter((reel) => reel.id !== id) }))
    }
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70" role="dialog">
      <button aria-label="Close" className="flex-1" onClick={onClose} type="button" />
      <div className="mx-auto max-h-[86dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0d1524] pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0d1524] px-5 py-4">
          <h2 className="text-base font-semibold">My reels</h2>
          <button
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-white/10 active:scale-95"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-2 px-5 py-5">
          {state.loading ? <Loader2 className="mx-auto size-6 animate-spin text-white/50" /> : null}
          {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
          {!state.loading && !state.error && !state.reels.length ? (
            <p className="text-sm text-white/55">Nothing saved yet. Tap Save on a reel to keep it.</p>
          ) : null}

          {state.reels.map((reel) => {
            const cover = coverOf(reel)
            return (
              <div
                className={`flex items-center gap-3 rounded-2xl border p-2 ${
                  reel.id === currentId ? 'border-[#f0c987]/60 bg-[#f0c987]/10' : 'border-white/10 bg-white/5'
                }`}
                key={reel.id}
              >
                <a
                  className="flex min-w-0 flex-1 items-center gap-3 p-1 no-underline"
                  href={`/reels?id=${reel.id}`}
                >
                  <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/10">
                    {cover ? (
                      // oxlint-disable-next-line next/no-img-element -- Sanity CDN thumbnail, already sized
                      <img alt="" className="size-full object-cover" src={cover} />
                    ) : (
                      <Film className="size-5 text-white/50" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base">{reel.title || 'Untitled reel'}</span>
                    <span className="block text-xs text-white/45">
                      {reel.scenes.length} scenes · {whenOf(reel.updatedAt)}
                      {reel.renderUrl ? ' · rendered' : ''}
                    </span>
                  </span>
                </a>
                <button
                  aria-label={
                    armedId === reel.id ? 'Tap again to delete' : `Delete ${reel.title || 'this reel'}`
                  }
                  className={`flex h-10 shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-sm active:scale-95 ${
                    armedId === reel.id ? 'bg-red-500/20 text-red-200' : 'text-white/40'
                  }`}
                  onClick={() => remove(reel.id)}
                  type="button"
                >
                  <Trash2 className="size-4" />
                  {armedId === reel.id ? 'Delete?' : null}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
