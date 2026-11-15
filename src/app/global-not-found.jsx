import '@/styles/globals.css'

import { bodyClassName, fontSans } from '@/app/fonts'
import { AnalyticsProvider } from '@/app/providers'
import { RootHead, RootTools, SkipLink } from '@/app/root-parts'

import NotFound from './(site)/tenant/[site]/not-found'

/*
 * The app has two root layouts (public tenant pages and the operator app), and
 * the public one sits under the dynamic `[site]` segment. Next then has no single
 * layout to wrap a 404 in, so cached pages that call `notFound()` fall back to
 * this page. It cannot know the tenant, so it renders with the neutral theme.
 */
export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontSans.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <RootHead />
      </head>
      <body className={bodyClassName}>
        <SkipLink />
        <AnalyticsProvider siteSlug={null}>
          <NotFound />
        </AnalyticsProvider>
        <RootTools />
      </body>
    </html>
  )
}
