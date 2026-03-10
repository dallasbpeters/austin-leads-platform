'use client'

import dynamic from 'next/dynamic'

const style = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: -1,
}

const UnicornScene = dynamic(() => import('unicornstudio-react'), { ssr: false })

export default function Gradient() {
  return (
    <div style={style}>
      <UnicornScene jsonFilePath="/unicorn/strand_remix.json" width="100%" height="100%" scale={1} dpi={1.5} />
    </div>
  )
}
