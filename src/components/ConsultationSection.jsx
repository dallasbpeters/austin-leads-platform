import Card from './Card'
import Gradient from './Gradient'
import LeadCaptureForm from './LeadCaptureForm'

export default function ConsultationSection({ site = null }) {
  const leadContext = {
    sourceType: 'consultation',
    sourceSection: 'homepage-consultation',
    serviceInterest: 'solar-roofing',
    siteSlug: site?.slug || 'texas-solar-and-roofing-pros',
    siteName: site?.name || 'Texas Solar and Roofing Pros',
    sourceDomain: site?.primaryDomain || 'texassolarandroofingpros.com',
    pagePath: '/',
    pageTitle: 'Texas Solar and Roofing Pros',
    metadata: {
      entryPoint: 'homepage',
    },
  }

  return (
    <section
      className="border-color-grid relative overflow-hidden border-t py-24"
      id="estimate"
      style={{
        backgroundImage: 'linear-gradient(to right, hsl(var(--color-secondary-h) 22% 78% / 0.12), hsl(var(--color-secondary-h) 40% 70% / 0), hsl(calc(var(--color-primary-h) + 10) 72% 72% / 0.12))',
      }}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-5">
        <div className="border-color-secondary absolute right-[-5rem] top-20 h-[800px] w-[800px] rounded-full border"></div>
        <div className="border-color-secondary absolute right-[-2.5rem] top-40 h-[600px] w-[600px] rounded-full border"></div>
      </div>

      <div className="mx-auto z-5 grid w-[min(80rem,calc(100%-3rem))] items-center gap-16 max-[900px]:grid-cols-1 md:grid-cols-2">
        <div>
          <h2 className="type-display text-color-secondary mb-4 text-[clamp(2.875rem,6vw,3.75rem)]">
            Tell us what
            <br />
            you&apos;re dealing with
          </h2>
          <p className="type-accent text-color-slate-500 max-w-[26rem] text-base font-semibold">If you&apos;re dealing with hail damage, an older roof, an insurance question, or a solar project you want to price out properly, send the details and we&apos;ll help you figure out the right next step.</p>
        </div>

        <Card className="relative z-10 p-8" id="consultation" radius="lg">
          <LeadCaptureForm context={leadContext} buttonLabel="Contact Us Today" inputClassName="border-color-grid placeholder:text-color-slate-700 focus:border-primary text-foreground" labelClassName="text-color-slate-500" checkboxClassName="accent-primary" />
        </Card>
      </div>
      <Gradient />
    </section>
  )
}
