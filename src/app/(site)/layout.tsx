import DevTrace from '@/components/dev/dev-trace'
import { resolveCurrentSite } from '@/lib/platform/content'

export async function generateMetadata() {
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

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <DevTrace markup="src/app/(site)/layout.tsx" content="site route shell" />
      {children}
    </div>
  )
}
