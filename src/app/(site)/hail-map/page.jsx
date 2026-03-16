import Link from 'next/link'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HailWeatherLookup from '@/components/HailWeatherLookup'
import LeadCaptureForm from '@/components/LeadCaptureForm'
import { Card, CardContent } from '@/components/ui/card'
import { resolveCurrentSite } from '@/lib/platform/content'

export const metadata = {
  title: 'Hail Map | Texas Solar and Roofing Pros',
  description:
    'Search recent hail activity near your property and request a roof + claim review from a local team.',
}

export default async function HailMapPage() {
  const site = await resolveCurrentSite()
  const leadContext = {
    sourceType: 'cross-lead',
    sourceSection: 'hail-map-cta-banner',
    serviceInterest: 'hail-damage',
    siteSlug: site?.slug || 'texas-solar-and-roofing-pros',
    siteName: site?.name || 'Texas Solar and Roofing Pros',
    sourceDomain: site?.primaryDomain || 'texassolarandroofingpros.com',
    pagePath: '/hail-map',
    pageTitle: 'Hail map + roof review',
    metadata: {
      entryPoint: 'hail-map-page',
    },
  }

  const hailSection = {
    title: 'Interactive hail map',
    body: 'Search your address or ZIP to review recent hail and storm signals, then request a roof review.',
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="pt-40 border-b border-border/60 bg-[linear-gradient(180deg,rgba(17,30,41,0.98),rgba(17,30,41,0.94))]">
        <div className="max-w-7xl mx-auto px-6 py-7 lg:px-10">
          <Link
            href="/hail-damage"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-white/62 uppercase transition-colors hover:text-white"
          >
            Back to hail damage page
          </Link>
          <h1 className="text-3xl tracking-tight text-white md:text-4xl">Hail map + roof review</h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-white/76">
            Check storm evidence first, then share your details to get guidance on roof condition, claims, and next
            steps.
          </p>
        </div>
      </section>

      <section className=" bg-gradient">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:px-10">
          <HailWeatherLookup section={hailSection} />
        </div>
      </section>

      <section className="py-20 text-white bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))]">
        <div className="grid max-w-7xl gap-12 mx-auto px-6 lg:px-10 place-items-center lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-sm text-white/58 tracking-[0.22em] uppercase">Roofing consultation</p>
            <h2 className="max-w-3xl text-3xl tracking-tight md:text-4xl">Request a hail damage review</h2>
            <p className="max-w-2xl leading-8 text-base text-white/78">
              If storm evidence and roof symptoms line up, we can help you plan inspection timing, claim questions,
              and next steps.
            </p>
          </div>

          <Card className="gap-0 text-white bg-white/6 border-white/12 backdrop-blur">
            <CardContent>
              <LeadCaptureForm
                context={leadContext}
                compact
                buttonLabel="Request a roof review"
                className="grid gap-4"
                inputClassName="border-b px-3 py-2 text-white placeholder:text-white/48"
                labelClassName="text-white/70"
                checkboxClassName="accent-white"
                messageClassName="text-left"
              />
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  )
}
