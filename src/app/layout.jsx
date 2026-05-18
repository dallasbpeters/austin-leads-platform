import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { Analytics } from '@vercel/analytics/react'
import { VercelToolbar } from '@vercel/toolbar/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Gloock, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { Agentation } from 'agentation'
import '../styles/globals.css'
import { headers } from 'next/headers'
import { SanityLive } from '@/sanity/live'
import { getGoogleAnalyticsConfig } from '@/lib/analytics/google'
import { PostHogProvider } from '@/app/providers'
import { resolveCurrentSite, resolveSiteBySlug } from '@/lib/platform/content'
import { getPublicDataSiteAttribute } from '@/components/platform/PublicSiteUtils'

const googleSansFlex = localFont({
  src: [
    {
      path: '../../public/fonts/GoogleSansFlex.ttf',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: false,
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
  title: 'Austin Leads Platform',
  description: 'Multi-tenant Next.js platform for Austin and Texas local service domains.',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      'facebook-domain-verification':
        process.env.FACEBOOK_SITE_VERIFICATION || process.env.FACEBOOK_DOMAIN_VERIFICATION,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
}

export default async function RootLayout({ children }) {
  const isDraftMode = (await draftMode()).isEnabled
  const { measurementId: gaMeasurementId, gtmId } = getGoogleAnalyticsConfig()
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
      if (previewSite?.slug) analyticsSiteSlug = previewSite.slug
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

  return (
    <html
      lang="en"
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
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {!gtmId && gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      <body
        className={`${googleSansFlex.variable} ${fontSerif.variable} ${fontMono.variable} text-foreground bg-background has-[admin-theme]:overflow-hidden`}
      >
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
