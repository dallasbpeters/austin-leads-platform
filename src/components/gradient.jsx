'use client'

import { useEffect, useState } from 'react'

import {
  Blob,
  ChromaticAberration,
  FilmGrain,
  ProgressiveBlur,
  Shader,
  Swirl,
  WaveDistortion,
} from 'shaders/react'

const baseStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
}

/*
 * The shader takes colours as props, not CSS, so the sky tone cannot simply
 * cascade into it. These are the day values, which double as the server-render
 * palette: matching what `[data-cloud-tone='day']` declares keeps the first
 * paint stable and avoids a hydration mismatch, and the effect below swaps in
 * the visitor's actual tone.
 */
const dayPalette = {
  skyA: '#4e7fd9',
  skyB: '#121bc9',
  skyFrom: '#2e60c7',
  skyTo: '#bac0ff',
  sunA: '#fad041',
  sunB: '#fa722a',
  sunHighlight: '#ffe01a',
}

const paletteTokens = {
  skyA: '--gradient-sky-a',
  skyB: '--gradient-sky-b',
  skyFrom: '--gradient-sky-from',
  skyTo: '--gradient-sky-to',
  sunA: '--gradient-sun-a',
  sunB: '--gradient-sun-b',
  sunHighlight: '--gradient-sun-highlight',
}

/**
 * Reads the gradient palette for the tone currently stamped on `<html>`.
 *
 * @returns {typeof dayPalette} The resolved palette, falling back per token.
 */
const readPalette = () => {
  const styles = window.getComputedStyle(document.documentElement)

  return Object.fromEntries(
    Object.entries(paletteTokens).map(([name, token]) => [
      name,
      styles.getPropertyValue(token).trim() || dayPalette[name],
    ]),
  )
}

/**
 * An ambient shader wash that follows the same local-clock sky tone as the
 * cloud sections, so a page carrying both reads as one time of day.
 *
 * @returns {JSX.Element} The decorative gradient layer.
 */
export default function ShaderEffect() {
  /* `null` until the palette has been read from the DOM. `Shader` samples its
   * children's props when it initialises its WebGL context and ignores later
   * prop changes, so it must not mount before the colours are known -- a
   * post-mount state update arrives too late and the day palette sticks. */
  const [resolved, setResolved] = useState(null)

  useEffect(() => {
    const syncPalette = () =>
      setResolved({ palette: readPalette(), tone: document.documentElement.dataset.cloudTone || 'day' })

    syncPalette()

    /* The tone lives on `<html>` and flips at hour boundaries, so the palette
     * has to be pulled back in rather than read once. */
    const toneObserver = new MutationObserver(syncPalette)

    toneObserver.observe(document.documentElement, { attributeFilter: ['data-cloud-tone'] })

    return () => toneObserver.disconnect()
  }, [])

  if (!resolved) {
    return null
  }

  const { palette, tone } = resolved

  return (
    /* Keyed on the tone so an hour boundary remounts the shader rather than
     * handing it props it will not read. */
    <Shader key={tone} style={baseStyle}>
      <FilmGrain strength={0}>
        <ProgressiveBlur angle={111} center={{ x: 0.5, y: 0.5 }} falloff={0.47} intensity={100}>
          <Swirl
            blend={5}
            colorA={palette.skyA}
            colorB={palette.skyB}
            colorSpace="oklch"
            detail={0.5}
            speed={0.3}
            stops={[
              { color: palette.skyFrom, position: 0 },
              { color: palette.skyTo, position: 1 },
            ]}
          />
          <Blob
            blendMode="normal-oklch"
            center={{ x: 0.94, y: 1.24 }}
            colorA={palette.sunA}
            colorB={palette.sunB}
            colorSpace="oklab"
            deformation={0}
            highlightColor={palette.sunHighlight}
            highlightIntensity={0.6}
            highlightX={-0.1}
            highlightY={0.1}
            highlightZ={0.13}
            size={1.63}
            softness={2}
            stops={[
              { color: palette.sunA, position: 0 },
              { color: palette.sunB, position: 1 },
            ]}
          />
          <WaveDistortion
            angle={360}
            blendMode="normal-oklch"
            boundingBox={{ origin: 'top-right' }}
            edges="mirror"
            frequency={0.4}
            speed={0.2}
            strength={0}
          />
        </ProgressiveBlur>
      </FilmGrain>
      <ChromaticAberration blendMode="screen" blueOffset={-1.4} greenOffset={-2} redOffset={0.3} />
    </Shader>
  )
}
