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
 *
 * Sound is optional and off until asked for: browsers refuse to play audio
 * before a tap. When it is on, the render worker hands back one URL per voice
 * line, a music bed and the effects (`/api/reels/audio`), and this component
 * plays them off the same clock that seeks the frame. The worker also stretches
 * scenes that are too short for their line, so the frame gets those durations
 * and the picture matches what the render will do.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Loader2, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'

const PREVIEW_URL = '/reels/christmas-reels/preview.html'
const FRAME_WIDTH = 1080
const FRAME_HEIGHT = 1920
/* New scenes reload the frame, so wait for a pause in the typing. */
const REBUILD_DELAY_MS = 500
/* Voice costs money per line: wait longer before asking for it. */
const AUDIO_DELAY_MS = 1500

/* The same levels the render uses (services/reel-renderer/audio.mjs). */
const MUSIC_LEVEL = 0.32
const MUSIC_UNDER_VOICE = 0.1
const MUSIC_FADE_SECONDS = 1.4
/* How far a clip may drift from the clock before it is nudged back. */
const DRIFT_SECONDS = 0.25

/** Total seconds of a scene list, matching the composition's own floor of 2s. */
export const totalDuration = (scenes) =>
  scenes.reduce((sum, scene) => sum + Math.max(2, Number(scene.duration) || 4), 0)

/** Turns a worker plan into clips this page can play: { el, start, seconds, volume, kind }. */
const clipsFromPlan = (plan) => {
  const clips = []
  const add = (url, start, seconds, volume, kind) => {
    if (!url || seconds <= 0) {
      return
    }
    const el = new Audio(url)
    el.preload = 'auto'
    el.volume = volume
    clips.push({ el, start, seconds, volume, kind })
  }
  for (const voice of plan.voices || []) {
    add(voice.url, voice.start, voice.seconds, 1, 'voice')
  }
  if (plan.music) {
    add(plan.music.url, 0, Math.min(plan.music.seconds, plan.total), MUSIC_LEVEL, 'music')
  }
  for (const effect of plan.sfx || []) {
    add(effect.url, effect.at, Math.min(effect.seconds, plan.total - effect.at), effect.volume, 'sfx')
  }
  return clips
}

/** Music level at `time`: dipped under a voice, fading out at the end. */
const musicLevelAt = (time, total, voiceActive) => {
  const base = voiceActive ? MUSIC_UNDER_VOICE : MUSIC_LEVEL
  const left = total - time
  return left < MUSIC_FADE_SECONDS ? base * Math.max(0, left / MUSIC_FADE_SECONDS) : base
}

export default function ReelPreview({ scenes, className = '' }) {
  const frameRef = useRef(null)
  const stageRef = useRef(null)
  const rafRef = useRef(0)
  const startedAtRef = useRef(0)
  const clipsRef = useRef([])
  const planRequestRef = useRef(0)
  const [src, setSrc] = useState('')
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(0)
  const [scale, setScale] = useState(0.2)
  const [soundOn, setSoundOn] = useState(false)
  const [plan, setPlan] = useState(null)
  const [planState, setPlanState] = useState('idle')
  const [planError, setPlanError] = useState('')

  /* The scenes as a string: the key that says whether a plan still matches them. */
  const scenesKey = useMemo(() => JSON.stringify(scenes), [scenes])
  const planFits = Boolean(soundOn && plan && plan.key === scenesKey)
  /* With sound on, the frame gets the worker's fitted scenes, so the picture matches the render. */
  const frameScenes = planFits ? plan.scenes : scenes
  const duration = useMemo(() => (planFits ? plan.total : totalDuration(scenes)), [planFits, plan, scenes])

  /* The scenes travel in the hash; preview.html reloads itself when it changes. */
  useEffect(() => {
    const timer = setTimeout(() => {
      const variables = { scenes: JSON.stringify(frameScenes), totalDuration: duration }
      setSrc(`${PREVIEW_URL}#${encodeURIComponent(JSON.stringify(variables))}`)
    }, REBUILD_DELAY_MS)
    return () => clearTimeout(timer)
    // frameScenes is derived from scenesKey + planFits; the string key is the cheaper dependency.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [scenesKey, planFits, duration])

  /* Sound on: ask the worker for the clips once the scenes have settled. */
  useEffect(() => {
    if (!soundOn) {
      return
    }
    if (plan && plan.key === scenesKey) {
      return
    }
    setPlanState('loading')
    setPlanError('')
    const request = (planRequestRef.current += 1)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/reels/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenes }),
        })
        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload.error || 'The renderer could not make the sound.')
        }
        if (request !== planRequestRef.current) {
          return
        }
        setPlan({ ...payload.plan, key: scenesKey })
        setPlanState('ready')
      } catch (error) {
        if (request !== planRequestRef.current) {
          return
        }
        setPlanState('error')
        setPlanError(error.message)
        setSoundOn(false)
      }
    }, AUDIO_DELAY_MS)
    return () => clearTimeout(timer)
    // `scenes` is what `scenesKey` stringifies; the key is the dependency that matters.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn, scenesKey, plan])

  /* Build the audio elements for the plan in use, and silence the old ones. */
  useEffect(() => {
    for (const clip of clipsRef.current) {
      clip.el.pause()
      clip.el.src = ''
    }
    clipsRef.current = planFits ? clipsFromPlan(plan) : []
    return () => {
      for (const clip of clipsRef.current) {
        clip.el.pause()
      }
    }
  }, [planFits, plan])

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

  /**
   * Lines every clip up with the clock. A clip inside its window plays from the
   * right spot; one outside it is paused. Music dips under the voice.
   */
  const syncAudio = useCallback((seconds, running) => {
    const clips = clipsRef.current
    if (!clips.length) {
      return
    }
    const total = clips.reduce((max, clip) => Math.max(max, clip.start + clip.seconds), 0)
    const voiceActive = clips.some(
      (clip) => clip.kind === 'voice' && seconds >= clip.start && seconds < clip.start + clip.seconds,
    )
    for (const clip of clips) {
      const local = seconds - clip.start
      const active = running && local >= 0 && local < clip.seconds
      if (clip.kind === 'music') {
        clip.el.volume = musicLevelAt(seconds, total, voiceActive)
      }
      if (active) {
        if (clip.el.paused) {
          clip.el.currentTime = local
          clip.el.play().catch(() => {})
        } else if (Math.abs(clip.el.currentTime - local) > DRIFT_SECONDS) {
          clip.el.currentTime = local
        }
      } else if (!clip.el.paused) {
        clip.el.pause()
      }
    }
  }, [])

  /* Playback: drive the composition's timeline off this page's clock. */
  useEffect(() => {
    if (!ready || !playing) {
      syncAudio(time, false)
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
      syncAudio(next, true)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(rafRef.current)
      syncAudio(time, false)
    }
    // `time` is only the resume point, read when playback (re)starts.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, playing, duration, seek, syncAudio])

  /* Sound off: everything stops at once. */
  useEffect(() => {
    if (!soundOn) {
      for (const clip of clipsRef.current) {
        clip.el.pause()
      }
    }
  }, [soundOn])

  const scrub = (seconds) => {
    setPlaying(false)
    setTime(seconds)
    seek(seconds)
    syncAudio(seconds, false)
  }

  const soundLabel =
    planState === 'loading' && soundOn
      ? 'Recording the voice…'
      : planState === 'error'
        ? planError
        : planFits
          ? plan.audio
          : ''

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
        <button
          aria-label={soundOn ? 'Sound off' : 'Sound on'}
          aria-pressed={soundOn}
          className={`grid size-11 shrink-0 place-items-center rounded-full active:scale-95 ${
            soundOn ? 'bg-[#f0c987] text-black' : 'bg-white/10'
          }`}
          onClick={() => setSoundOn((current) => !current)}
          type="button"
        >
          {soundOn && planState === 'loading' ? (
            <Loader2 className="size-5 animate-spin" />
          ) : soundOn ? (
            <Volume2 className="size-5" />
          ) : (
            <VolumeX className="size-5" />
          )}
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
      {soundLabel ? (
        <p className={`text-xs ${planState === 'error' ? 'text-[#fb2c36]' : 'text-white/50'}`}>
          {soundLabel}
        </p>
      ) : null}
    </div>
  )
}
