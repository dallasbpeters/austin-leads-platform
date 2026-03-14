'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const baseStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
}

const UnicornScene = dynamic(() => import('unicornstudio-react'), { ssr: false })

export default function Gradient({ className, style, zIndex = -1 }) {
  return (
    <div
      className={cn(className)}
      style={{
        ...baseStyle,
        zIndex,
        ...style,
      }}
    >
      <UnicornScene
        jsonFilePath="/unicorn/strand_remix.json"
        width="100%"
        height="100%"
        scale={1}
        dpi={1.5}
      />
    </div>
  )
}
