import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Mail } from 'iconoir-react'
import type { Metadata } from 'next'

import DevTrace from '@/components/dev/dev-trace'
import { JobberDialog } from '@/components/jobber-dialog'
import { getPublicDataSiteAttribute } from '@/components/platform/public-site-utils'
import RootDocument from '@/components/root-document'
import { getGoogleAnalyticsConfig, shouldLoadAnalyticsTags } from '@/lib/analytics/google'
import { resolveSiteBySlug } from '@/lib/platform/content'
import { rootMetadata as sharedRootMetadata } from '@/lib/root-metadata'

// Env-driven verification values may be unset; Next drops undefined entries.
const rootMetadata = sharedRootMetadata as Metadata

/*
 * Root layout for every public tenant page.
 *
 * `src/proxy.js` rewrites `example.com/about` to `/tenant/<site-slug>/about`, the
 * same pattern as Vercel's Platforms starter. The tenant comes from the route
 * param, not from request headers, so each page is rendered once per site and
 * served from the cache until it revalidates.
 *
 * An empty list here means no site is built ahead of time; each one renders on
 * its first visit and is cached from then on.
 */
export const generateStaticParams = async () => []

/** Matches the 60-second `revalidate` on the Sanity reads the pages make. */
export const revalidate = 60

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ site: string }>
}

export const generateMetadata = async ({ params }: Pick<TenantLayoutProps, 'params'>): Promise<Metadata> => {
  const { site: siteSlug } = await params
  const site = await resolveSiteBySlug(siteSlug).catch(() => null)
  if (site?.slug !== 'txchristmaslights') {
    return rootMetadata
  }
  return {
    ...rootMetadata,
    icons: {
      icon: [{ url: '/favicon-txchristmaslights.svg', type: 'image/svg+xml' }],
      shortcut: ['/favicon-txchristmaslights.svg'],
    },
  }
}

const TenantRootLayout = async ({ children, params }: TenantLayoutProps) => {
  const { site: siteSlug } = await params
  const site = await resolveSiteBySlug(siteSlug).catch(() => null)
  /*
   * Analytics live here rather than in the operator layout so they cover the
   * public marketing site only -- admin, studio and card routes do not report
   * as customer traffic.
   */
  const { measurementId, gtmId } = getGoogleAnalyticsConfig(site?.slug)
  const analyticsEnabled = shouldLoadAnalyticsTags()

  return (
    <RootDocument publicSite={getPublicDataSiteAttribute(site)} analyticsSiteSlug={site?.slug ?? null}>
      <div className="bg-background text-foreground min-h-screen">
        <DevTrace markup="src/app/(site)/tenant/[site]/layout.tsx" content="site route shell" />
        {analyticsEnabled && gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
        {analyticsEnabled && !gtmId && measurementId ? <GoogleAnalytics gaId={measurementId} /> : null}
        {children}
        <JobberDialog
          fixed
          iconOnly
          icon={<Mail className="size-8" width={48} height={48} aria-hidden />}
          buttonLabel="Get a free quote"
          title="Get a free quote"
          context={{ sourceSection: 'contact_fab' }}
        />
      </div>
    </RootDocument>
  )
}

export default TenantRootLayout
