'use client'

/*
 * Live preview of a reel.
 *
 * It plays the SAME composition file the renderer uses (staged into
 * public/reels by scripts/sync-reel-assets.mjs), so what Kathie sees is what
 * comes back as an MP4 — no second implementation to drift.
 *
 * HyperFrames' own runtime provides `window.__hyperframes` and drives the
 * timeline during a render. In the browser we stand in for it: the composition
 * HTML is fetched, a tiny shim is injected ahead of its script, and the page
 * seeks `window.__timelines.main` frame by frame.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Loader2, Pause, Play, RotateCcw } from 'lucide-react'

const COMPOSITION_URL = '/reels/christmas-reels/index.html'
const BASE_HREF = '/reels/christmas-reels/'

const shimScript = (variables) => `
<base href="${BASE_HREF}">
<script>
  // Stands in for the HyperFrames runtime while the composition plays in a browser.
  window.__hyperframes = {
    getVariables: () => (${JSON.stringify(variables)}),
  }
</script>
`

/** Total seconds of a scene list, matching the composition's own floor of 1.5s. */
export const totalDuration = (scenes) =>
  scenes.reduce((sum, scene) => sum + Math.max(1.5, Number(scene.duration) || 4), 0)

export default function ReelPreview({ scenes, className = '' }) {
  const frameRef = useRef(null)
  const rafRef = useRef(0)
  const startedAtRef = useRef(0)
  const [template, setTemplate] = useState('')
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(0)

  const duration = useMemo(() => totalDuration(scenes), [scenes])

  /* The composition HTML never changes; only the variables do. Fetch it once. */
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(COMPOSITION_URL)
        const html = await response.text()
        if (!cancelled) {
          setTemplate(html)
        }
      } catch (error) {
        console.error('[reels] could not load the composition', error)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const srcDoc = useMemo(() => {
    if (!template) {
      return ''
    }
    const variables = { scenes: JSON.stringify(scenes), totalDuration: duration }
    return template.replace('<head>', `<head>${shimScript(variables)}`)
  }, [template, scenes, duration])

  /* A new srcDoc means a fresh document: wait for its timeline again. */
  useEffect(() => {
    setReady(false)
    setTime(0)
  }, [srcDoc])

  const seek = useCallback((seconds) => {
    const timeline = frameRef.current?.contentWindow?.__timelines?.main
    if (timeline) {
      timeline.seek(Math.max(0, seconds))
    }
  }, [])

  const onLoad = useCallback(() => {
    // The composition registers its timeline at the end of its own script.
    const check = () => {
      if (frameRef.current?.contentWindow?.__timelines?.main) {
        setReady(true)
        startedAtRef.current = performance.now()
        seek(0)
      } else {
        rafRef.current = requestAnimationFrame(check)
      }
    }
    check()
  }, [seek])

  /* Playback: drive the composition's timeline off the page's own clock. */
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
    // `time` is the resume point, read once when playback (re)starts.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, playing, duration, seek])

  const scrub = (seconds) => {
    setPlaying(false)
    setTime(seconds)
    seek(seconds)
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative aspect-[9/16] w-full max-w-[min(88vw,420px)] overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl">
        {/* The composition is 1080x1920; scale it to whatever the phone frame is. */}
        <iframe
          className="absolute top-0 left-0 origin-top-left border-0"
          onLoad={onLoad}
          ref={frameRef}
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          style={{ width: 1080, height: 1920, transform: 'scale(var(--reel-scale))' }}
          title="Reel preview"
        />
        {ready ? null : (
          <div className="absolute inset-0 grid place-items-center bg-black">
            <Loader2 className="size-8 animate-spin text-white/60" />
          </div>
        )}
      </div>

      <div className="flex w-full max-w-[min(88vw,420px)] items-center gap-3">
        <button
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white active:scale-95"
          onClick={() => setPlaying((current) => !current)}
          type="button"
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <button
          aria-label="Back to the start"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white active:scale-95"
          onClick={() => scrub(0)}
          type="button"
        >
          <RotateCcw className="size-5" />
        </button>
        <input
          aria-label="Scrub"
          className="h-11 flex-1 accent-[#ffd06b]"
          max={duration}
          min={0}
          onChange={(event) => scrub(Number(event.target.value))}
          step={0.05}
          type="range"
          value={time}
        />
        <span className="w-16 text-right font-mono text-xs text-white/70 tabular-nums">
          {time.toFixed(1)}/{duration.toFixed(0)}s
        </span>
      </div>
    </div>
  )
}
