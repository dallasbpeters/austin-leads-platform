import { Mail } from 'iconoir-react'
import type { Metadata } from 'next'

import DevTrace from '@/components/dev/dev-trace'
import { JobberDialog } from '@/components/jobber-dialog'
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
  return (
    <div className="bg-background text-foreground min-h-screen">
      <DevTrace markup="src/app/(site)/layout.tsx" content="site route shell" />
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
