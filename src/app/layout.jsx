import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { VercelToolbar } from '@vercel/toolbar/next'
import { Agentation } from 'agentation'
import { VisualEditing } from 'next-sanity/visual-editing'
import { Gloock, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { draftMode, headers } from 'next/headers'

import '../styles/globals.css'

import { PostHogProvider } from '@/app/providers'
import ViewTransitionWrapper from '@/components/view-transition-wrapper'
import CloudToneSync from '@/components/cloud-tone-sync'
import { cloudToneBootstrapScript } from '@/components/cloud-tone'
import { getPublicDataSiteAttribute } from '@/components/platform/public-site-utils'
import { getGoogleAnalyticsConfig } from '@/lib/analytics/google'
import { resolveCurrentSite, resolveSiteBySlug } from '@/lib/platform/content'
import { SanityLive } from '@/sanity/live'

const googleSansFlex = localFont({
  adjustFontFallback: false,
  display: 'swap',
  src: [
    {
      path: '../../public/fonts/GoogleSansFlex.ttf',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
})

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

export default async function RootLayout({ children }) {
  // oxlint-disable-next-line unicorn/no-await-expression-member
  const isDraftMode = (await draftMode()).isEnabled
  const headerList = await headers()
  const isOperatorShell = headerList.get('x-alp-operator-shell') === '1'
  const previewSiteSlug = headerList.get('x-alp-preview-site-slug')
  const currentSite = await resolveCurrentSite().catch(() => null)
  const { measurementId: gaMeasurementId, gtmId } = getGoogleAnalyticsConfig(currentSite?.slug)

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
        <script dangerouslySetInnerHTML={{ __html: cloudToneBootstrapScript }} />
      </head>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {!gtmId && gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      <body
        className={`${googleSansFlex.variable} ${fontSerif.variable} ${fontMono.variable} text-foreground bg-background has-[admin-theme]:overflow-hidden`}
      >
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground sr-only p-8 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-999 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg"
        >
          Skip to main content
        </a>
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
