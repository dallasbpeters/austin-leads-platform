import { draftMode } from 'next/headers'
import Script from 'next/script'
import { VisualEditing } from 'next-sanity/visual-editing'
import { Analytics } from '@vercel/analytics/react'
import { VercelToolbar } from '@vercel/toolbar/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import '../styles/globals.css'
import { SanityLive } from '@/sanity/live'
import { getGoogleAnalyticsConfig } from '@/lib/analytics/google'

export const metadata = {
  title: 'Austin Leads Platform',
  description: 'Multi-tenant Next.js platform for Austin and Texas local service domains.',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
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
  const shouldShowVercelToolbar = !isDraftMode && process.env.VERCEL_ENV !== 'production'

  return (
    <html lang="en">
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {!gtmId && gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      <body className="text-foreground bg-background has-[admin-theme]:overflow-hidden">
        <Script
          src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
          strategy="lazyOnload"
        />
        {children}
        {shouldShowVercelToolbar ? <VercelToolbar /> : null}
        <SanityLive />
        {isDraftMode ? <VisualEditing /> : null}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
