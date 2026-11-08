import { ChromaFlow, Dither, ImageTexture, Shader } from 'shaders/react'

export default function PixelReveal1() {
  return (
    <Shader>
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
        url="https://data.shaders.com/storage/v1/object/public/user-uploaded-images/user_3E93x1BOQFIvRduMb5kBj66tBhe/dlbedLK6w8Ax.jpg"
      />
      <Dither
        colorA="#055ba6"
        colorB="#c3d5e3"
        pattern="bayer8"
        threshold={{
          type: 'map',
          source: 'idmostv5d9xi2rmvn45',
          channel: 'alpha',
          inputMax: 1,
          inputMin: 0,
          outputMax: 1,
          outputMin: 0,
        }}
      />
    </Shader>
  )
}
