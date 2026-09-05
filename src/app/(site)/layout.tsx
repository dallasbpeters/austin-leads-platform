import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Mail } from 'iconoir-react'
import type { Metadata } from 'next'

import DevTrace from '@/components/dev/dev-trace'
import { JobberDialog } from '@/components/jobber-dialog'
import { getGoogleAnalyticsConfig, shouldLoadAnalyticsTags } from '@/lib/analytics/google'
import { resolveCurrentSite } from '@/lib/platform/content'

export const generateMetadata = async (): Promise<Metadata> => {
  const site = await resolveCurrentSite().catch(() => null)
  if (site?.slug !== 'txchristmaslights') {
    return {}
  }
  return {
    icons: {
      icon: [{ url: '/favicon-txchristmaslights.svg', type: 'image/svg+xml' }],
      shortcut: ['/favicon-txchristmaslights.svg'],
    },
  }
}

const SiteLayout = async ({ children }: { children: React.ReactNode }) => {
  const site = await resolveCurrentSite().catch(() => null)
  /*
   * Analytics live here rather than in the root layout so they cover the public
   * marketing site only -- the admin, studio, preview and card routes are
   * outside this route group and no longer report as customer traffic.
   */
  const { measurementId, gtmId } = getGoogleAnalyticsConfig(site?.slug)
  const analyticsEnabled = shouldLoadAnalyticsTags()

  return (
    <div className="bg-background text-foreground min-h-screen">
      <DevTrace markup="src/app/(site)/layout.tsx" content="site route shell" />
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
  )
}

export default SiteLayout
