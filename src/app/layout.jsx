import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { VercelToolbar } from '@vercel/toolbar/next'
import dynamic from 'next/dynamic'
import { Gloock, JetBrains_Mono } from 'next/font/google'
import { draftMode, headers } from 'next/headers'

import '../styles/globals.css'

import { PostHogProvider } from '@/app/providers'
import { cloudToneBootstrapScript } from '@/components/cloud-tone'
import CloudToneSync from '@/components/cloud-tone-sync'
import { getPublicDataSiteAttribute } from '@/components/platform/public-site-utils'
import ViewTransitionWrapper from '@/components/view-transition-wrapper'
import { resolveCurrentSite, resolveSiteBySlug } from '@/lib/platform/content'

const fontSerif = Gloock({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: '400',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata = {
  apple: [
    {
      sizes: '180x180',
      type: 'image/png',
      url: '/apple-touch-icon.png',
    },
  ],
  description: 'Multi-tenant Next.js platform for Austin and Texas local service domains.',
  icons: {
    icon: [
      { sizes: 'any', url: '/favicon.ico' },
      { type: 'image/svg+xml', url: '/favicon.svg' },
      { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
      { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  title: 'Texas Solar & Roofing Pros.',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      'facebook-domain-verification':
        process.env.FACEBOOK_SITE_VERIFICATION || process.env.FACEBOOK_DOMAIN_VERIFICATION,
    },
  },
}

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

export default async function RootLayout({ children }) {
  // oxlint-disable-next-line unicorn/no-await-expression-member
  const isDraftMode = (await draftMode()).isEnabled
  const headerList = await headers()
  const isOperatorShell = headerList.get('x-alp-operator-shell') === '1'
  const previewSiteSlug = headerList.get('x-alp-preview-site-slug')
  const currentSite = await resolveCurrentSite().catch(() => null)

  let publicSiteAttr = null
  let analyticsSiteSlug = currentSite?.slug ?? null
  if (!isOperatorShell) {
    if (previewSiteSlug) {
      const previewSite = await resolveSiteBySlug(previewSiteSlug).catch(() => null)
      publicSiteAttr = getPublicDataSiteAttribute(previewSite)
      // PostHog dual-project routing — when previewing via `/_site/:slug`,
      // `/preview/:slug`, or `?__site=`, the visible site is the preview slug,
      // not the host-derived one. Send analytics to the matching project.
      if (previewSite?.slug) {
        analyticsSiteSlug = previewSite.slug
      }
    } else {
      publicSiteAttr = getPublicDataSiteAttribute(currentSite)
    }
  }

  /*
   * Public marketing: `data-public-site` on `<html>` activates the matching
   * `[data-public-site="…"]` block in *-theme.css (all imported in globals).
   * `proxy.js` sets `x-alp-operator-shell` for admin/API and
   * `x-alp-preview-site-slug` for `/preview/…`, `/_site/:slug`, or `?__site=`
   * (when override is allowed) so the operator shell never inherits tenant oranges.
   */
  const shouldShowVercelToolbar = !isDraftMode && process.env.VERCEL_ENV !== 'production'
  const facebookAppId = (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || '').trim()

  /* `suppressHydrationWarning` covers `data-cloud-tone`, which the tone
   * bootstrap stamps onto `<html>` before React hydrates. */
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      {...(publicSiteAttr ? { 'data-public-site': publicSiteAttr } : {})}
    >
      <head>
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
        {/*
         * First child of `<body>`, not `<head>`, on purpose. React 19 hoists
         * `<link>` and `<meta>`, so an inline `<script>` is the only child of
         * `<head>` it matches by position -- and dev proxies and browser
         * extensions inject their own scripts at the top of `<head>`, which
         * shifts that position and trips a hydration mismatch. Here it still
         * runs synchronously before any body content paints, so the tone is
         * stamped on `<html>` in time and there is no flash.
         */}
        <script dangerouslySetInnerHTML={{ __html: cloudToneBootstrapScript }} />
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
