import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { VercelToolbar } from '@vercel/toolbar/next'
import dynamic from 'next/dynamic'
import { Gloock, JetBrains_Mono } from 'next/font/google'
import { draftMode } from 'next/headers'

import '../styles/globals.css'

import { PostHogProvider } from '@/app/providers'
import { CLOUD_TONE_INLINE_SCRIPT } from '@/components/cloud-tone'
import CloudToneSync from '@/components/cloud-tone-sync'
import ViewTransitionWrapper from '@/components/view-transition-wrapper'

const fontSerif = Gloock({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: '400',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

/*
 * Editor and development tooling, split out of the shared bundle.
 *
 * `isDraftMode` is only known at request time, so a static import cannot be
 * eliminated and shipped ~450 KB of visual editing to every public visitor.
 * `Agentation` was ~414 KB of development tooling in the production build --
 * the NODE_ENV guard removed the element but not the module.
 *
 * `ssr: false` is unavailable here (this is a Server Component), but the
 * default still code-splits: the chunk is only fetched when the component
 * actually renders.
 */
const SanityLive = dynamic(() => import('@/sanity/live').then((mod) => mod.SanityLive))
const VisualEditing = dynamic(() => import('next-sanity/visual-editing').then((mod) => mod.VisualEditing))
const Agentation =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('agentation').then((mod) => mod.Agentation))
    : () => null

/**
 * The <html> document shared by the two root layouts.
 *
 * The public site and the operator app each have their own root layout, so the
 * public one can set `data-public-site` from its `[site]` route param. That is
 * what lets public pages cache: nothing here reads request headers or cookies.
 * `draftMode()` is safe — Next renders per request only while draft mode is on.
 *
 * @param {object} props - Layout props.
 * @param {import('react').ReactNode} props.children - The page tree.
 * @param {string | null} [props.publicSite] - Tenant theme key for `data-public-site`.
 * @param {string | null} [props.analyticsSiteSlug] - Which PostHog project to report to.
 */
export default async function RootDocument({ children, publicSite = null, analyticsSiteSlug = null }) {
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
  const facebookAppId = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || '').trim()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      {...(publicSite ? { 'data-public-site': publicSite } : {})}
    >
      <head>
        {/* oxlint-disable-next-line react/no-danger -- sets the sky phase before first paint */}
        <script dangerouslySetInnerHTML={{ __html: CLOUD_TONE_INLINE_SCRIPT }} />
        <link
          rel="preload"
          href="/fonts/Switzer-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {facebookAppId ? <meta property="fb:app_id" content={facebookAppId} /> : null}
      </head>
      <body
        className={`${fontSerif.variable} ${fontMono.variable} text-foreground bg-background has-[admin-theme]:overflow-hidden`}
      >
        <nav aria-label="Skip links">
          <a
            href="#main-content"
            className="bg-primary text-primary-foreground sr-only p-8 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-999 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg"
          >
            Skip to main content
          </a>
        </nav>
        <CloudToneSync />
        <ViewTransitionWrapper />
        <PostHogProvider siteSlug={analyticsSiteSlug}>{children}</PostHogProvider>
        {shouldShowVercelToolbar ? <VercelToolbar /> : null}
        {isDraftMode ? <SanityLive /> : null}
        {isDraftMode ? <VisualEditing /> : null}
        <Analytics />
        <SpeedInsights />
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}
