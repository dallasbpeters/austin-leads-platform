import { headers } from 'next/headers'

import RootDocument from '@/components/root-document'
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

  return <RootDocument analyticsSiteSlug={site?.slug ?? null}>{children}</RootDocument>
}
