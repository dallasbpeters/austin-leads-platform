import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { VercelToolbar } from '@vercel/toolbar/next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'

import { CLOUD_TONE_INLINE_SCRIPT } from '@/components/cloud-tone'
import CloudToneSync from '@/components/cloud-tone-sync'
import ViewTransitionWrapper from '@/components/view-transition-wrapper'

/*
 * Pieces every root layout puts inside its own <html>: the shared <head> tags,
 * the skip link, and the tools at the end of <body>. Each layout still writes
 * <html>, <head> and <body> itself, the way Next expects.
 */

/*
 * Editor and development tooling, split out of the shared bundle.
 *
 * `isDraftMode` is only known at request time, so a static import cannot be
 * eliminated and shipped ~450 KB of visual editing to every public visitor.
 * `Agentation` was ~414 KB of development tooling in the production build --
 * the NODE_ENV guard removed the element but not the module.
 *
 * `ssr: false` is unavailable here (these are Server Components), but the
 * default still code-splits: the chunk is only fetched when the component
 * actually renders.
 */
const SanityLive = dynamic(() => import('@/sanity/live').then((mod) => mod.SanityLive))
const VisualEditing = dynamic(() => import('next-sanity/visual-editing').then((mod) => mod.VisualEditing))
const Agentation =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('agentation').then((mod) => mod.Agentation))
    : () => null

/** Tags for <head> that every root layout needs. */
export function RootHead() {
  const facebookAppId = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || '').trim()
  return (
    <>
      {/* oxlint-disable-next-line react/no-danger -- sets the sky phase before first paint */}
      <script dangerouslySetInnerHTML={{ __html: CLOUD_TONE_INLINE_SCRIPT }} />
      {/*
       * Inline, not in globals.css. Chrome reads this opt-in when the new page first
       * paints. If the stylesheet is not there yet, or fails to load, Chrome rejects a
       * transition promise no page code can catch: "ViewTransition opt-in disabled".
       */}
      {/* oxlint-disable-next-line shadcn/no-inline-styles -- must be in place before first paint */}
      <style>{'@view-transition{navigation:auto}'}</style>
      <link
        rel="preload"
        href="/fonts/Switzer-Variable.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      {facebookAppId ? <meta property="fb:app_id" content={facebookAppId} /> : null}
    </>
  )
}

/** The first thing in <body>: a link keyboard users can use to jump past the navigation. */
export function SkipLink() {
  return (
    <nav aria-label="Skip links">
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground sr-only p-8 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-999 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg"
      >
        Skip to main content
      </a>
    </nav>
  )
}

/** The last things in <body>: sky and transition sync, Vercel, Sanity draft mode and dev tools. */
export async function RootTools() {
  // oxlint-disable-next-line unicorn/no-await-expression-member
  const isDraftMode = (await draftMode()).isEnabled

  /*
   * Vercel's visual editing needs the toolbar AND Sanity's content source maps
   * (stega) in the same render. Stega only turns on in draft mode, so excluding
   * draft mode here meant the two halves could never appear together: draft
   * mode gave source maps with no toolbar, normal browsing gave a toolbar with
   * nothing to edit. Hence "it never worked".
   */
  const shouldShowVercelToolbar = process.env.VERCEL_ENV !== 'production'

  return (
    <>
      <CloudToneSync />
      <ViewTransitionWrapper />
      {shouldShowVercelToolbar ? <VercelToolbar /> : null}
      {isDraftMode ? <SanityLive /> : null}
      {isDraftMode ? <VisualEditing /> : null}
      <Analytics />
      <SpeedInsights />
      {process.env.NODE_ENV === 'development' && <Agentation />}
    </>
  )
}
