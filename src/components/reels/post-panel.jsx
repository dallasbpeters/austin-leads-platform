'use client'

/*
 * Review, then one tap: the caption is editable, and Post sends the finished
 * video to Instagram. Instagram processes the video before it can publish, so
 * the button walks through sending → processing → publishing on its own.
 */

import { useEffect, useRef, useState } from 'react'

import { AlertTriangle, CheckCircle2, ExternalLink, Instagram, Loader2 } from 'lucide-react'

const POLL_MS = 4000
/* Instagram usually finishes in under a minute; give up after five. */
const MAX_POLLS = 75

const STEP_TEXT = {
  sending: 'Sending to Instagram…',
  processing: 'Instagram is processing the video…',
  publishing: 'Publishing…',
}

async function call(url, options) {
  const response = await fetch(url, options)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || `Status ${response.status}`)
  }
  return payload
}

// The browser has no promise-based timer; this is the smallest one.
const wait = (ms) =>
  // oxlint-disable-next-line promise/avoid-new
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export default function PostPanel({ videoUrl, initialCaption }) {
  const [platforms, setPlatforms] = useState(null)
  const [caption, setCaption] = useState(initialCaption)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [posted, setPosted] = useState(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    call('/api/reels/post')
      .then((payload) => alive.current && setPlatforms(payload.platforms))
      .catch(() => alive.current && setPlatforms([]))
    return () => {
      alive.current = false
    }
  }, [])

  /* A new render is a new post. */
  useEffect(() => {
    setPosted(null)
    setError('')
  }, [videoUrl])

  const instagram = platforms?.find((platform) => platform.id === 'instagram')

  const post = async () => {
    setError('')
    try {
      setStep('sending')
      const { containerId } = await call('/api/reels/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'instagram', videoUrl, caption }),
      })
      setStep('processing')
      for (let poll = 0; ; poll += 1) {
        if (poll >= MAX_POLLS) {
          throw new Error('Instagram is taking too long to process the video. Try again in a few minutes.')
        }
        await wait(POLL_MS)
        const { status, detail } = await call(`/api/reels/post/${containerId}`)
        if (status === 'FINISHED') {
          break
        }
        if (status === 'ERROR' || status === 'EXPIRED') {
          throw new Error(`Instagram could not use this video. ${detail}`.trim())
        }
        if (!alive.current) {
          return
        }
      }
      setStep('publishing')
      setPosted(await call(`/api/reels/post/${containerId}`, { method: 'POST' }))
    } catch (postError) {
      setError(postError.message)
    } finally {
      setStep('')
    }
  }

  if (!platforms) {
    return null
  }

  return (
    <div className="grid gap-2 border-t border-white/10 pt-3">
      <label className="grid gap-1.5 text-sm" htmlFor="reel-caption">
        <span className="text-white/60">Caption</span>
        <textarea
          className="min-h-28 rounded-xl border border-white/15 bg-black/20 p-3 text-sm text-white outline-none focus:border-[#f0c987]"
          disabled={Boolean(step)}
          id="reel-caption"
          maxLength={2200}
          onChange={(event) => setCaption(event.target.value)}
          value={caption}
        />
      </label>

      {instagram ? (
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] py-3 text-sm font-semibold text-white active:scale-[0.99] disabled:opacity-60"
          disabled={Boolean(step) || Boolean(posted)}
          onClick={post}
          type="button"
        >
          {step ? <Loader2 className="size-4 animate-spin" /> : <Instagram className="size-4" />}
          {step
            ? STEP_TEXT[step]
            : posted
              ? 'Posted'
              : `Post to Instagram${instagram.username ? ` (@${instagram.username})` : ''}`}
        </button>
      ) : (
        <p className="rounded-xl border border-white/10 p-3 text-xs text-white/60">
          Instagram isn't connected yet. An admin can connect it on{' '}
          <a className="underline" href="/social">
            Social accounts
          </a>
          .
        </p>
      )}

      {posted ? (
        <p className="flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="size-4" />
          Posted.
          {posted.permalink ? (
            <a
              className="inline-flex items-center gap-1 underline"
              href={posted.permalink}
              rel="noreferrer"
              target="_blank"
            >
              View on Instagram <ExternalLink className="size-3" />
            </a>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  )
}
