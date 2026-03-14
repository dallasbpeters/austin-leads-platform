import Card from './Card'
import Gradient from './Gradient'
import LeadCaptureForm from './LeadCaptureForm'
import { getDevSectionAttributes } from './dev/DevTrace'

const SECTION_VARIANTS = {
  default: {
    heading: (
      <>
        Tell us what
        <br />
        you&apos;re dealing with
      </>
    ),
    copy:
      "If you're dealing with hail damage, an older roof, an insurance question, or a solar project you want to price out properly, send the details and we'll help you figure out the right next step.",
    buttonLabel: 'Contact Us Today',
    sourceSection: 'homepage-consultation',
    serviceInterest: 'solar-roofing',
    metadata: {
      entryPoint: 'homepage',
    },
  },
  roofingInspection: {
    heading: (
      <>
        Request a free
        <br />
        roof inspection
      </>
    ),
    copy:
      "If you're dealing with hail, wind damage, an aging roof, or an insurance claim, send the details and we'll help you figure out whether you need repairs, a full replacement, or a cleaner claim-ready scope.",
    buttonLabel: 'Request Free Inspection',
    sourceSection: 'roofing-consultation',
    serviceInterest: 'roofing',
    metadata: {
      entryPoint: 'roofing-page',
    },
  },
}

export default function ConsultationSection({
  site = null,
  sectionId = 'estimate',
  variant = 'default',
  pagePath = '/',
  pageTitle = 'Texas Solar and Roofing Pros',
}) {
  const content = SECTION_VARIANTS[variant] || SECTION_VARIANTS.default
  const leadContext = {
    sourceType: 'consultation',
    sourceSection: content.sourceSection,
    serviceInterest: content.serviceInterest,
    siteSlug: site?.slug || 'texas-solar-and-roofing-pros',
    siteName: site?.name || 'Texas Solar and Roofing Pros',
    sourceDomain: site?.primaryDomain || 'texassolarandroofingpros.com',
    pagePath,
    pageTitle,
    metadata: content.metadata,
  }

  return (
    <section
      className="relative overflow-hidden py-24"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/ConsultationSection.jsx',
        content: 'local JSX section + live lead form',
      })}
      style={{
        backgroundImage:
          'linear-gradient(to right, hsl(var(--color-secondary-h) 22% 78% / 0.12), hsl(var(--color-secondary-h) 40% 70% / 0), hsl(calc(var(--color-primary-h) + 10) 72% 72% / 0.12))',
      }}
    >
      <div className="py-12max-xl:grid-cols-1 relative z-20 mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <h2 className="type-display text-secondary mb-4 text-[clamp(2.875rem,6vw,3.75rem)]">
            {content.heading}
          </h2>
          <p className="type-accent max-w-104 text-base font-semibold text-slate-500">
            {content.copy}
          </p>
        </div>

        <Card className="relative z-10 p-8" id="consultation" radius="lg">
          <LeadCaptureForm
            context={leadContext}
            buttonLabel={content.buttonLabel}
            inputClassName="border-color-grid placeholder:text-slate-700 focus:border-primary text-foreground"
            labelClassName="text-slate-500"
            checkboxClassName="accent-primary"
          />
        </Card>
      </div>
      <Gradient zIndex={0} />
    </section>
  )
}
