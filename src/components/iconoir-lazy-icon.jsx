'use client'

import { Suspense, use } from 'react'

/*
 * Renders an Iconoir icon that is not in the static registry. The full icon
 * set is one large chunk, so it loads only on a page that shows such an icon.
 * Server rendering includes the icon, so it does not pop in.
 */
let iconSet = null

function loadIconSet() {
  iconSet ??= import('iconoir-react/regular')
  return iconSet
}

function LoadedIcon({ name, ...props }) {
  const Icon = use(loadIconSet())[name]
  return <Icon {...props} />
}

export default function IconoirLazyIcon(props) {
  return (
    <Suspense fallback={null}>
      <LoadedIcon {...props} />
    </Suspense>
  )
}
