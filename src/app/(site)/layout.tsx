import DevTrace from '@/components/dev/dev-trace'
import { resolveCurrentSite } from '@/lib/platform/content'

export const generateMetadata = async () => {
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
    </div>
  )
}

export default SiteLayout
