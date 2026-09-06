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
      <div className="section-shell__empty">
        <p>Could not load video</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="video-player"
      style={{ aspectRatio: aspectRatio ? undefined : '16 / 9' }}
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <video
        ref={videoRef}
        className="video-player__video"
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
        <button type="button" className="video-player__cover" onClick={togglePlay} aria-label="Play video">
          <span className="video-player__play">
            <PlayIcon size={32} />
          </span>
        </button>
      )}

      <div className="video-player__controls">
        <div className="video-player__controls-inner">
          <div className="video-player__row">
            <div
              ref={scrubberRef}
              className="video-player__scrubber"
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
              <div className="video-player__track">
                <div className="video-player__progress" style={{ width: `${progress}%` }} />
              </div>
              <div className="video-player__thumb" style={{ left: `calc(${progress}% - 6px)` }} />
            </div>
          </div>

          <div className="video-player__row video-player__row--meta">
            <button
              type="button"
              className="video-player__button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>

            <span className="video-player__time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="video-player__cluster video-player__cluster--end">
              <div className="video-player__cluster">
                <button
                  type="button"
                  className="video-player__button"
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
                    className="video-player__volume"
                    aria-label="Volume"
                  />
                )}
              </div>

              <button
                type="button"
                className="video-player__button"
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
      <section id={sectionId} className="video-section section-shell">
        <div className="section-shell__inner">
          {eyebrow && <p className="section-shell__eyebrow">{eyebrow}</p>}
          {title && <h2 className="section-shell__title video-section__title">{title}</h2>}
          <div className="section-shell__empty">
            <p>No video source set</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id={sectionId} className="video-section section-shell section-shell--accent-top">
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
      <div className="section-shell__inner section-shell__inner--narrow">
        {(eyebrow || title) && (
          <div className="section-shell__intro">
            {eyebrow && <p className="section-shell__eyebrow">{eyebrow}</p>}
            {title && <h2 className="section-shell__title video-section__title">{title}</h2>}
          </div>
        )}

        <div className="video-section__player">
          <CustomVideoPlayer
            videoSrc={videoSrc}
            posterSrc={posterSrc}
            autoplay={autoplay}
            loop={loop}
            muted={muted}
            aspectRatio={aspectRatio}
          />
        </div>

        {body && <PortableTextContent value={body} className="video-section__body" />}

        {caption && <p className="video-section__caption">{caption}</p>}
      </div>
    </section>
  )
}
