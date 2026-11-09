'use client'

import { useEffect, useRef } from 'react'
import { InstagramEmbed } from 'sanity-plugin-sgntech-instagram-embed/render'

/*
 * Instagram posts from rich text (sanity-plugin-sgntech-instagram-embed). Its
 * embed uses effects but ships without "use client", so it is wrapped here to
 * work inside server components too. Instagram's script swaps the post for an
 * <iframe> with no title, so the wrapper names each frame as it appears
 * (screen readers announce frames by title). What is inside that frame is
 * Instagram's, so it is marked as a third-party embed.
 */

/** One post (a portable text `instagramPost` block). */
export const InstagramPost = ({ value }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    const nameFrames = () => {
      for (const frame of container.querySelectorAll('iframe:not([title])')) {
        frame.setAttribute('title', 'Instagram post')
      }
    }
    nameFrames()
    const observer = new MutationObserver(nameFrames)
    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return value?.url ? (
    <div ref={containerRef} className="instagram-post" data-third-party-embed="instagram">
      <InstagramEmbed url={value.url} captioned={value.captioned} />
    </div>
  ) : null
}
