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
  theme = 'light',
  pagePath = '/',
  pageTitle = 'Texas Solar and Roofing Pros',
  editAttributes,
}) {
  const isDarkTheme = theme === 'dark'
  const content = SECTION_VARIANTS[variant] || SECTION_VARIANTS.default
  const headline = section?.title || content.heading
  const copy = section?.body || content.copy
  const buttonLabel = section?.ctaLabel || content.buttonLabel
  const avatarEyebrow = section?.avatarEyebrow || section?.personLabel || ''
  const avatarName = section?.avatarName || section?.personName || ''
  const avatarRole = section?.avatarRole || section?.personRole || ''
  const avatarBlurb = section?.avatarBlurb || section?.personBlurb || ''
  const avatarColor = section?.avatarColor || ''
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
  const avatarStyle = avatarColor ? { backgroundColor: avatarColor } : undefined
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
      className={`relative overflow-hidden py-10 ${isDarkTheme ? 'text-white bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))]' : ''}`}
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/ConsultationSection.jsx',
        content: 'local JSX section + live lead form',
      })}
      style={{
        ...(isDarkTheme
          ? {}
          : {
              backgroundImage:
                'linear-gradient(to right, hsl(var(--color-secondary-h) 22% 78% / 0.12), hsl(var(--color-secondary-h) 40% 70% / 0), hsl(calc(var(--color-primary-h) + 10) 72% 72% / 0.12))',
            }),
      }}
    >
      <div className="grid relative items-center max-w-7xl gap-16 mx-auto px-4 lg:px-16 sm:px-3 md:px-6 z-20 grid-cols-1 py-12 md:grid-cols-[1.1fr_1fr]">
        <div {...editAttributes}>
          <h2 className={`mb-4 leading-[1em]! text-[clamp(2.875rem,6vw,3.75rem)] type-display ${isDarkTheme ? 'text-white' : 'text-secondary'}`}>{headline}</h2>
          <PortableTextContent as="div" value={copy} className={`font-semibold text-base type-accent ${isDarkTheme ? 'text-white/78' : 'text-slate-500'}`} />
          {avatarName ? (
            <div className="max-w-xl mt-8">
              <div className="flex items-center gap-4">
                <Avatar size="xl" className={`size-16 ${isDarkTheme ? 'bg-white/10 ring-white/20 ring-1' : 'bg-primary ring-1 ring-black/5'}`} style={avatarStyle}>
                  {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={avatarImageAlt} /> : null}
                  <AvatarFallback
                    className={`font-semibold text-base ${isDarkTheme ? 'text-white bg-white/12' : 'text-secondary-foreground bg-secondary'}`}
                    style={avatarStyle}
                  >
                    {avatarInitials || 'TS'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  {avatarEyebrow ? (
                    <div className={`mb-1 font-semibold text-[11px] tracking-[0.22em] uppercase ${isDarkTheme ? 'text-white/58' : 'text-secondary/70'}`}>
                      {avatarEyebrow}
                    </div>
                  ) : null}
                  <div className={`font-semibold text-lg ${isDarkTheme ? 'text-white' : 'text-foreground'}`}>{avatarName}</div>
                  {avatarRole ? <div className={`text-sm ${isDarkTheme ? 'text-white/72' : 'text-muted-foreground'}`}>{avatarRole}</div> : null}
                  {avatarBlurb ? (
                    <PortableTextContent
                      as="div"
                      value={avatarBlurb}
                      className={`mt-3 text-sm leading-6 ${isDarkTheme ? 'text-white/80' : 'text-muted-foreground'}`}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <Card className={`relative p-8 z-10 ${isDarkTheme ? 'text-white bg-white/6 border-white/12 backdrop-blur' : ''}`} id="consultation" radius="lg">
          <LeadCaptureForm
            context={leadContext}
            buttonLabel={buttonLabel}
            inputClassName={isDarkTheme ? 'border-b px-3 py-2 text-white placeholder:text-white/48' : 'border-color-grid placeholder:text-slate-700 focus:border-primary text-foreground'}
            labelClassName={isDarkTheme ? 'text-white/70' : 'text-slate-500'}
            checkboxClassName={isDarkTheme ? 'accent-white' : 'accent-primary'}
          />
        </Card>
      </div>
      {isDarkTheme ? null : <Gradient zIndex={0} />}
    </section>
  )
}
