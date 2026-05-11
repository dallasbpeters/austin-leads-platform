import { ViewTransition } from 'react'

import DevTrace from '@/components/dev/DevTrace'
import { getThemeClassForSite } from '@/components/platform/PublicSiteUtils'
import { resolveCurrentSite } from '@/lib/platform/content'

export default async function SiteLayout({ children }) {
  const site = await resolveCurrentSite().catch(() => null)
  const themeClass = getThemeClassForSite(site)

  return (
    <div className={`${themeClass} bg-background text-foreground min-h-screen`}>
      <DevTrace
        markup="src/app/(site)/layout.jsx"
        content="site route shell"
        note="ViewTransition boundary + per-tenant theme class wrapper (keeps tenant tokens out of <html>)"
      />
      <ViewTransition>{children}</ViewTransition>
    </div>
  )
}
