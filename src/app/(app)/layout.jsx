import { headers } from 'next/headers'

import '@/styles/globals.css'

import { bodyClassName, fontSans } from '@/app/fonts'
import { AnalyticsProvider } from '@/app/providers'
import { RootHead, RootTools, SkipLink } from '@/app/root-parts'
import { resolveSiteByHost } from '@/lib/platform/content'
import { rootMetadata } from '@/lib/root-metadata'

export const metadata = rootMetadata

/**
 * Root layout for the operator app: admin, tools, Studio, cards and signing.
 *
 * These routes are per-user and never cached, so reading the host here costs
 * nothing. It only picks which PostHog project the session reports to. No
 * `data-public-site`, so the operator shell never inherits a tenant theme.
 */
export default async function AppRootLayout({ children }) {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const site = await resolveSiteByHost(host).catch(() => null)
  const analyticsSiteSlug = site?.slug ?? null

  return (
    <html
      lang="en"
      className={`${fontSans.variable} scheme-light dark:scheme-dark`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      {...(analyticsSiteSlug ? { 'data-analytics-site': analyticsSiteSlug } : {})}
    >
      <head>
        <RootHead />
      </head>
      <body className={bodyClassName}>
        <SkipLink />
        <AnalyticsProvider siteSlug={analyticsSiteSlug}>{children}</AnalyticsProvider>
        <RootTools />
      </body>
    </html>
  )
}
