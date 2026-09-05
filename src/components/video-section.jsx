'use client'

import { ChristmasLights } from '@/components/christmas-lights'
import { useCallback, useEffect, useRef, useState } from 'react'

import PortableTextContent from '@/components/portable-text-content'
import { getImageUrl } from '@/lib/platform/imageSource'

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function PlayIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  )
}

function VolumeIcon({ size = 20, muted }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {muted ? (
        <>
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </>
      ) : (
        <>
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
        </>
      )}
    </svg>
  )
}

function FullscreenIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
    </svg>
  )
}

function CustomVideoPlayer({ videoSrc, posterSrc, autoplay: _autoplay, loop, muted, aspectRatio }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const scrubberRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(muted)
  const [volume, setVolume] = useState(muted ? 0 : 1)
  const [showVolume, setShowVolume] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [hasError, setHasError] = useState(false)

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (!isScrubbing && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [isScrubbing])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setHasError(false)
    }
  }, [])

  const handleScrubStart = useCallback(() => {
    setIsScrubbing(true)
  }, [])

  const handleScrub = useCallback(
    (e) => {
      const video = videoRef.current
      if (!video || !duration) {
        return
      }
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const seekTime = (x / rect.width) * duration
      setCurrentTime(seekTime)
    },
    [duration],
  )

  const handleScrubEnd = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.currentTime = currentTime
    setIsScrubbing(false)
  }, [currentTime])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.muted = !video.muted
    setIsMuted(video.muted)
    if (video.muted) {
      setVolume(0)
    } else {
      setVolume(video.volume)
    }
  }, [])

  const handleVolumeChange = useCallback((e) => {
    const val = Number.parseFloat(e.target.value)
    const video = videoRef.current
    if (!video) {
      return
    }
    video.volume = val
    video.muted = val === 0
    setIsMuted(val === 0)
    setVolume(val)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) {
      return
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      el.requestFullscreen().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onError = () => setHasError(true)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onError)
    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
    }
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (hasError) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-video items-center justify-center rounded-lg">
        <p className="text-sm">Could not load video</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="group relative isolate overflow-hidden rounded-lg bg-black"
      style={{ aspectRatio: aspectRatio ? undefined : '16 / 9' }}
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        style={aspectRatio ? { aspectRatio } : undefined}
        src={videoSrc}
        poster={posterSrc}
        preload="metadata"
        playsInline
        loop={loop}
        muted={muted}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {!isPlaying && !hasError && (
        <button
          type="button"
          className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
          onClick={togglePlay}
          aria-label="Play video"
        >
          <span className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105">
            <PlayIcon size={32} />
          </span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition-transform group-focus-within:translate-y-0 group-hover:translate-y-0">
        <div className="bg-linear-to-t from-black/80 to-transparent px-2 pt-8 pb-2">
          <div className="flex items-center gap-2 px-1">
            <div
              ref={scrubberRef}
              className="relative h-6 flex-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              tabIndex={0}
              onMouseDown={handleScrubStart}
              onMouseMove={(e) => {
                if (isScrubbing) {
                  handleScrub(e)
                }
              }}
              onMouseUp={handleScrubEnd}
              onMouseLeave={handleScrubEnd}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              onKeyDown={(e) => {
                const video = videoRef.current
                if (!video || !duration) {
                  return
                }
                const step = duration * 0.05
                if (e.key === 'ArrowRight') {
                  video.currentTime = Math.min(video.currentTime + step, duration)
                }
                if (e.key === 'ArrowLeft') {
                  video.currentTime = Math.max(video.currentTime - step, 0)
                }
              }}
            >
              <div className="absolute inset-y-1/2 left-0 h-1 w-full -translate-y-1/2 rounded-full bg-white/30">
                <div
                  className="bg-primary h-full rounded-full transition-[width] duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div
                className="bg-primary absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full shadow transition-[left] duration-75"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-1 pb-0.5">
            <button
              type="button"
              className="flex items-center justify-center p-1 text-white/80 transition-colors hover:text-white"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>

            <span className="min-w-20 text-xs text-white/70 tabular-nums select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex items-center justify-center p-1 text-white/80 transition-colors hover:text-white"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  <VolumeIcon size={16} muted={isMuted} />
                </button>
                {showVolume && (
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/30 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    aria-label="Volume"
                  />
                )}
              </div>

              <button
                type="button"
                className="flex items-center justify-center p-1 text-white/80 transition-colors hover:text-white"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                <FullscreenIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VideoSection({ section, sectionId }) {
  if (!section) {
    return null
  }

  const { eyebrow, title, body, videoUrl, posterImage, caption, autoplay, loop, muted, aspectRatio } = section

  const videoSrc = videoUrl || ''
  const posterSrc = getImageUrl(posterImage, null, { width: 1280 })
  const hasVideo = Boolean(videoSrc)

  if (!hasVideo) {
    return (
      <section id={sectionId} className="border-border/60 bg-background border-b">
        <div className="mx-auto max-w-7xl px-3 py-20 md:px-6 lg:px-10">
          {eyebrow && (
            <p className="text-primary mb-4 text-sm font-semibold tracking-wider uppercase">{eyebrow}</p>
          )}
          {title && (
            <h2 className="font-display text-foreground mb-4 text-3xl tracking-normal md:text-4xl">
              {title}
            </h2>
          )}
          <div className="bg-muted text-muted-foreground flex aspect-video items-center justify-center rounded-lg">
            <p className="text-sm">No video source set</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id={sectionId} className="border-primary bg-background relative border-t-4">
      <ChristmasLights
        lightCount={23}
        strandCount={9}
        strandSpacing={0.75}
        bulbColors={['#FFB200', '#D4000A', '#00BE64']}
        bulbSize={0.019}
        bulbSpacing={0.18}
        dropLength={6.2}
        windStrength={0.44}
        gravitySag={1.1}
        cordTension={0.18}
        glowIntensity={0.02}
        glowRadius={3.2}
        swaySpeed={1.15}
        cordColor="#252d25"
        enableGlowMesh={true}
      />
      <div className="mx-auto max-w-5xl px-3 py-20 md:px-6 lg:px-10">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && (
              <p className="text-primary mb-4 text-sm font-semibold tracking-wider uppercase">{eyebrow}</p>
            )}
            {title && (
              <h2 className="font-display text-foreground text-3xl tracking-normal md:text-4xl">{title}</h2>
            )}
          </div>
        )}

        <div className={'relative w-full'}>
          <CustomVideoPlayer
            videoSrc={videoSrc}
            posterSrc={posterSrc}
            autoplay={autoplay}
            loop={loop}
            muted={muted}
            aspectRatio={aspectRatio}
          />
        </div>

        {body && <PortableTextContent value={body} className="text-muted-foreground mt-6 leading-7" />}

        {caption && <p className="text-muted-foreground mt-3 text-center text-sm">{caption}</p>}
      </div>
    </section>
  )
}
