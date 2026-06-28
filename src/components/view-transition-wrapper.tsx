'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function ViewTransitionWrapper() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (!document.startViewTransition) {
      return
    }

    document.startViewTransition()
  }, [pathname])

  return null
}
