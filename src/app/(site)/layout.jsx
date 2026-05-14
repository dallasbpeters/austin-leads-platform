import { ViewTransition } from 'react'

import DevTrace from '@/components/dev/DevTrace'
import { resolveCurrentSite } from '@/lib/platform/content'

export async function generateMetadata() {
  const site = await resolveCurrentSite().catch(() => null)
  if (site?.slug !== 'txchristmaslights') return {}
  return {
    icons: {
      icon: [{ url: '/favicon-txchristmaslights.svg', type: 'image/svg+xml' }],
      shortcut: ['/favicon-txchristmaslights.svg'],
    },
  }
}

export default async function SiteLayout({ children }) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <DevTrace
        markup="src/app/(site)/layout.jsx"
        content="site route shell"
        note="ViewTransition boundary; tenant tokens come from <html data-public-site> in root layout"
      />
      <ViewTransition>{children}</ViewTransition>
    </div>
  )
}
