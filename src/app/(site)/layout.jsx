import { ViewTransition } from 'react'

import DevTrace from '@/components/dev/DevTrace'

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
