import Card from './Card'
import Gradient from './Gradient'
import LeadCaptureForm from './LeadCaptureForm'
import PortableTextContent from './PortableTextContent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { getDevSectionAttributes } from './dev/DevTrace'

const SECTION_VARIANTS = {
  default: {
    heading: (
      <>
        Talk with our team
      </>
    ),
    copy: 'Tell us what is happening with your home, and we will help you choose the right next step.',
    buttonLabel: 'Reach out to our team',
    sourceSection: 'homepage-consultation',
    serviceInterest: 'solar-roofing',
    metadata: {
      entryPoint: 'homepage',
    },
  },
  roofingInspection: {
    heading: (
      <>
        Request a
        roof inspection
      </>
    ),
    copy: 'We will help you sort out repair, replacement, or storm-related next steps.',
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
  section = null,
  sectionId = 'estimate',
  variant = 'default',
  pagePath = '/',
  pageTitle = 'Texas Solar and Roofing Pros',
  editAttributes,
}) {
  const content = SECTION_VARIANTS[variant] || SECTION_VARIANTS.default
  const headline = section?.title || content.heading
  const copy = section?.body || content.copy
  const buttonLabel = section?.ctaLabel || content.buttonLabel
  const avatarEyebrow = section?.avatarEyebrow || section?.personLabel || ''
  const avatarName = section?.avatarName || section?.personName || ''
  const avatarRole = section?.avatarRole || section?.personRole || ''
  const avatarBlurb = section?.avatarBlurb || section?.personBlurb || ''
  const avatarImageUrl = getImageUrl(
    section?.avatarImageAsset || section?.profileImageAsset,
    section?.avatarImage || section?.profileImage,
  )
  const avatarImageAlt = getImageAlt(
    section?.avatarImageAsset || section?.profileImageAsset,
    section?.avatarImage || section?.profileImage,
    avatarName,
  )
  const avatarInitials = String(avatarName || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
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
      className="relative py-10 overflow-hidden"
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
      <div className="grid relative items-center max-w-7xl gap-16 mx-auto px-4 lg:px-16 sm:px-6 z-20 grid-cols-1 py-12 md:grid-cols-[1.1fr_1fr]">
        <div {...editAttributes}>
          <h2 className="mb-4 leading-[1em]! text-[clamp(2.875rem,6vw,3.75rem)] text-secondary type-display">{headline}</h2>
          <PortableTextContent as="div" value={copy} className="font-semibold text-base text-slate-500 type-accent" />
          {avatarName ? (
            <div className="max-w-xl mt-8">
              <div className="flex items-center gap-4">
                <Avatar size="xl" className="bg-primary ring-1 ring-black/5 size-16">
                  {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={avatarImageAlt} /> : null}
                  <AvatarFallback className="font-semibold text-base text-secondary-foreground bg-secondary">
                    {avatarInitials || 'TS'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  {avatarEyebrow ? (
                    <div className="mb-1 font-semibold text-[11px] text-secondary/70 tracking-[0.22em] uppercase">
                      {avatarEyebrow}
                    </div>
                  ) : null}
                  <div className="font-semibold text-foreground text-lg">{avatarName}</div>
                  {avatarRole ? <div className="text-muted-foreground text-sm">{avatarRole}</div> : null}
                  {avatarBlurb ? (
                    <PortableTextContent
                      as="div"
                      value={avatarBlurb}
                      className="mt-3 leading-6 text-muted-foreground text-sm"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <Card className="relative p-8 z-10" id="consultation" radius="lg">
          <LeadCaptureForm
            context={leadContext}
            buttonLabel={buttonLabel}
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
