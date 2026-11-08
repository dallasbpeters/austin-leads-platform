'use client'
import { ChromaFlow, Dither, ImageTexture, Shader } from 'shaders/react'

interface PixelRevealProps {
  imageURL?: string
  /** Sizes the canvas: <Shader> has no size of its own. */
  className?: string
  /** The dither's light color; the hero passes its section background color. */
  colorB?: string | null
  colorA?: string | null
}

const DEFAULT_COLOR_B = '#c3d5e3'
const DEFAULT_COLOR_A = '#055ba6'

const PixelReveal = ({ imageURL, className, colorA, colorB }: PixelRevealProps) => {
  return (
    <Shader className={className}>
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
        colorA={colorA || DEFAULT_COLOR_A}
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
  )
}

export default PixelReveal
