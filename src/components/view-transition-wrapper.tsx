'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Drives the route-change fade defined in `src/styles/view-transitions.css`.
 *
 * The CSS `@view-transition { navigation: auto }` rule only covers cross-document
 * navigation, so App Router `<Link>` clicks need this to animate at all.
 *
 * Every promise a ViewTransition hands back has to be caught. `ready` and `finished`
 * reject — with `InvalidStateError` when the document is not fully active, and with
 * `AbortError` when a newer transition skips this one, which happens routinely on
 * fast successive navigations. Leaving either unhandled surfaces as a runtime
 * "Transition was aborted because of invalid state" overlay in dev.
 */
export default function ViewTransitionWrapper() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (typeof document.startViewTransition !== 'function') {
      return
    }

    // A hidden or not-yet-active document rejects immediately with InvalidStateError.
    if (document.visibilityState === 'hidden') {
      return
    }

    const ignore = () => {}

    try {
      const transition = document.startViewTransition()

      transition.ready.catch(ignore)
      transition.finished.catch(ignore)
      transition.updateCallbackDone?.catch(ignore)
    } catch {
      // startViewTransition throws synchronously if the document became inactive
      // between the checks above and the call. Nothing to animate; carry on.
    }
  }, [pathname])

  return null
}
