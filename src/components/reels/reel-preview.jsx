'use client'

/*
 * Live preview of a reel.
 *
 * It plays the SAME composition the renderer uses, so what you see is what
 * comes back as an MP4 — no second implementation to drift.
 *
 * HyperFrames' own runtime hands the composition its variables and drives the
 * timeline during a render. In the browser that job falls to `preview.html`
 * (written by scripts/sync-reel-assets.mjs): it reads the scenes out of the URL
 * hash and answers seek messages from this component.
 *
 * It has to be a real page on this origin. A srcdoc frame has no address, so
 * relative asset paths and the GSAP script tag both fail inside one, and the
 * preview just sits there spinning.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Loader2, Pause, Play, RotateCcw } from 'lucide-react'

const PREVIEW_URL = '/reels/christmas-reels/preview.html'
const FRAME_WIDTH = 1080
const FRAME_HEIGHT = 1920
/* New scenes reload the frame, so wait for a pause in the typing. */
const REBUILD_DELAY_MS = 500

/** Total seconds of a scene list, matching the composition's own floor of 2s. */
export const totalDuration = (scenes) =>
  scenes.reduce((sum, scene) => sum + Math.max(2, Number(scene.duration) || 4), 0)

export default function ReelPreview({ scenes, className = '' }) {
  const frameRef = useRef(null)
  const stageRef = useRef(null)
  const rafRef = useRef(0)
  const startedAtRef = useRef(0)
  const [src, setSrc] = useState('')
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(0)
  const [scale, setScale] = useState(0.2)

  const duration = useMemo(() => totalDuration(scenes), [scenes])

  /* The scenes travel in the hash; preview.html reloads itself when it changes. */
  useEffect(() => {
    const timer = setTimeout(() => {
      const variables = { scenes: JSON.stringify(scenes), totalDuration: duration }
      setSrc(`${PREVIEW_URL}#${encodeURIComponent(JSON.stringify(variables))}`)
    }, REBUILD_DELAY_MS)
    return () => clearTimeout(timer)
  }, [scenes, duration])

  /* The frame renders at 1080x1920 and is scaled down to whatever fits. */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_WIDTH))
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  /* A rebuilt frame is a fresh document: wait for it to announce itself again. */
  useEffect(() => {
    setReady(false)
    setTime(0)
  }, [src])

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source === frameRef.current?.contentWindow && event.data?.kind === 'reel:ready') {
        setReady(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const seek = useCallback((seconds) => {
    frameRef.current?.contentWindow?.postMessage({ kind: 'reel:seek', seconds }, '*')
  }, [])

  /* Playback: drive the composition's timeline off this page's clock. */
  useEffect(() => {
    if (!ready || !playing) {
      return
    }
    startedAtRef.current = performance.now() - time * 1000
    const step = () => {
      const elapsed = (performance.now() - startedAtRef.current) / 1000
      const next = elapsed >= duration ? 0 : elapsed
      if (elapsed >= duration) {
        startedAtRef.current = performance.now()
      }
      setTime(next)
      seek(next)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
    // `time` is only the resume point, read when playback (re)starts.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, playing, duration, seek])

  const scrub = (seconds) => {
    setPlaying(false)
    setTime(seconds)
    seek(seconds)
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="relative w-full max-w-[min(86vw,380px)] overflow-hidden rounded-[26px] border border-white/10 bg-black shadow-2xl"
        ref={stageRef}
        style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
      >
        <iframe
          className="absolute top-0 left-0 origin-top-left border-0"
          height={FRAME_HEIGHT}
          ref={frameRef}
          src={src || undefined}
          style={{ transform: `scale(${scale})` }}
          title="Reel preview"
          width={FRAME_WIDTH}
        />
        {ready ? null : (
          <div className="absolute inset-0 grid place-items-center bg-black">
            <Loader2 className="size-8 animate-spin text-white/50" />
          </div>
        )}
      </div>

      <div className="flex w-full max-w-[min(86vw,380px)] items-center gap-3">
        <button
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 active:scale-95"
          onClick={() => setPlaying((current) => !current)}
          type="button"
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <button
          aria-label="Back to the start"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 active:scale-95"
          onClick={() => scrub(0)}
          type="button"
        >
          <RotateCcw className="size-5" />
        </button>
        <input
          aria-label="Scrub"
          className="h-11 flex-1 accent-[#f0c987]"
          max={duration}
          min={0}
          onChange={(event) => scrub(Number(event.target.value))}
          step={0.05}
          type="range"
          value={time}
        />
        <span className="w-16 text-right font-mono text-xs text-white/60 tabular-nums">
          {time.toFixed(1)}/{duration.toFixed(0)}s
        </span>
      </div>
    </div>
  )
}
