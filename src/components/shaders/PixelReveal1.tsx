'use client'
import { useState } from 'react'
import { ChromaFlow, Dither, ImageTexture, Shader } from 'shaders/react'

interface PixelRevealProps {
  imageURL?: string
  /** Sizes the canvas: <Shader> has no size of its own. */
  className?: string
  /** The dither's dark and light colors (Studio: the hero image's shader colors). */
  colorA?: string | null
  colorB?: string | null
}

const DEFAULT_COLOR_B = '#c3d5e3'
const DEFAULT_COLOR_A = '#055ba6'

/*
 * The wrapper says how far the shader got (data-shader: loading, ready or
 * unavailable). While it loads, the dark dither color fills the space; the
 * canvas fades in when ready; if this browser can't run it, the wrapper steps
 * aside and the hero's photo shows instead (solar-hero.css).
 */
const PixelReveal = ({ imageURL, className, colorA, colorB }: PixelRevealProps) => {
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const dark = colorA || DEFAULT_COLOR_A

  return (
    <div className={`pixel-reveal ${className || ''}`} data-shader={state} style={{ backgroundColor: dark }}>
      <Shader
        className="pixel-reveal__canvas"
        onReady={() => setState('ready')}
        onUnavailable={() => setState('unavailable')}
      >
        <ChromaFlow
          id="idmostv5d9xi2rmvn45"
          baseColor="#ffffff"
          downColor="#ffffff"
          intensity={0.6}
          leftColor="#ffffff"
          momentum={37}
          radius={2.9}
          rightColor="#ffffff"
          upColor="#ffffff"
          visible={false}
        />
        <ImageTexture
          objectFit="cover"
          url={
            imageURL ||
            'https://data.shaders.com/storage/v1/object/public/user-uploaded-images/user_3E93x1BOQFIvRduMb5kBj66tBhe/dlbedLK6w8Ax.jpg'
          }
        />
        <Dither
          colorA={dark}
          colorB={colorB || DEFAULT_COLOR_B}
          pattern="bayer4"
          threshold={{
            type: 'map',
            source: 'idmostv5d9xi2rmvn45',
            channel: 'alpha',
            inputMax: 1,
            inputMin: 0.4,
            outputMax: 1,
            outputMin: 0,
          }}
        />
      </Shader>
    </div>
  )
}

export default PixelReveal
