'use client'

/*
 * The Render button and everything that follows it.
 *
 * A render takes a minute or two on the worker, so the button hands the job
 * over and then polls. When it lands, the finished MP4 plays right here with
 * Share and Download beside it — on a phone, Share opens Messages, Mail or
 * AirDrop, which is how a reel actually reaches TikTok or Instagram until the
 * direct posting is connected.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { AlertTriangle, Download, Film, Loader2, Share2 } from 'lucide-react'

const POLL_MS = 2500

const STATUS_TEXT = {
  queued: 'Waiting for the renderer…',
  rendering: 'Drawing the frames…',
  uploading: 'Almost there…',
}

export default function RenderBar({ scenes, seconds, initialUrl = null, onRendered }) {
  /* A reopened reel shows its last finished video straight away. */
  const [job, setJob] = useState(initialUrl ? { status: 'done', url: initialUrl } : null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [shareSupported, setShareSupported] = useState(false)
  const timerRef = useRef(0)

  useEffect(() => {
    setShareSupported(typeof navigator !== 'undefined' && typeof navigator.canShare === 'function')
    return () => clearTimeout(timerRef.current)
  }, [])

  const poll = useCallback(
    async (id) => {
      try {
        const response = await fetch(`/api/reels/render/${id}`)
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error || 'The renderer stopped answering.')
        }
        setJob(payload.job)
        if (payload.job.status === 'failed') {
          setError(payload.job.error || 'The render failed.')
          setBusy(false)
          return
        }
        if (payload.job.status === 'done') {
          setBusy(false)
          onRendered?.(payload.job)
          return
        }
        timerRef.current = setTimeout(() => poll(id), POLL_MS)
      } catch (pollError) {
        setError(pollError.message)
        setBusy(false)
      }
    },
    [onRendered],
  )

  const render = async () => {
    setBusy(true)
    setError('')
    setJob(null)
    try {
      const response = await fetch('/api/reels/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Could not start the render.')
      }
      setJob(payload.job)
      poll(payload.job.id)
    } catch (startError) {
      setError(startError.message)
      setBusy(false)
    }
  }

  const share = async () => {
    if (!job?.url) {
      return
    }
    try {
      const blob = await fetch(job.url).then((response) => response.blob())
      const file = new File([blob], 'christmas-reel.mp4', { type: 'video/mp4' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Texas Christmas Lights' })
      } else {
        window.open(job.url, '_blank', 'noopener')
      }
    } catch {
      // Closing the share sheet throws AbortError — nothing to do.
    }
  }

  return (
    <section className="grid gap-3">
      <button
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#f0c987] py-4 text-base font-semibold text-[#10192a] active:scale-[0.99] disabled:opacity-60"
        disabled={busy}
        onClick={render}
        type="button"
      >
        {busy ? <Loader2 className="size-5 animate-spin" /> : <Film className="size-5" />}
        {busy ? STATUS_TEXT[job?.status] || 'Rendering…' : `Render ${seconds.toFixed(0)}s reel`}
      </button>

      {error ? (
        <p className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}

      {job?.status === 'done' && job.url ? (
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- a silent reel with no speech */}
          <video className="w-full rounded-xl" controls playsInline src={job.url} />
          <div className="grid grid-cols-2 gap-2">
            {shareSupported ? (
              <button
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-sm active:scale-[0.99]"
                onClick={share}
                type="button"
              >
                <Share2 className="size-4" />
                Share
              </button>
            ) : null}
            <a
              className={`flex items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-sm ${
                shareSupported ? '' : 'col-span-2'
              }`}
              download="christmas-reel.mp4"
              href={job.url}
            >
              <Download className="size-4" />
              Download
            </a>
          </div>
        </div>
      ) : null}
    </section>
  )
}
