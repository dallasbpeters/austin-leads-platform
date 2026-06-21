import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { getDevSectionAttributes } from './dev/DevTrace'
import Gradient from './Gradient'
import { JobberDialog } from './jobber-dialog'
import PortableTextContent from './PortableTextContent'

const SECTION_VARIANTS = {
  default: {
    heading: <>Talk with our team</>,
    copy: 'Tell us what is happening with your home, and we will help you choose the right next step.',
    buttonLabel: 'Reach out to our team',
    sourceSection: 'homepage-consultation',
    serviceInterest: 'solar-roofing',
    metadata: {
      entryPoint: 'homepage',
    },
  },
  roofingInspection: {
    heading: <>Request a roof inspection</>,
    copy: 'We will help you sort out repair, replacement, or storm-related next steps.',
    buttonLabel: 'Request Free Inspection',
    sourceSection: 'roofing-consultation',
    serviceInterest: 'roofing',
    metadata: {
      entryPoint: 'roofing-page',
    },
  },
  christmasLights: {
    heading: <>Secure your install date</>,
    copy: 'Spots fill up fast. A small deposit reserves your install window — we handle the hanging, any mid-season bulb issues, and full takedown after the holidays.',
    buttonLabel: 'Reserve My Install Date',
    sourceSection: 'christmas-lights-deposit',
    serviceInterest: 'christmas-lights',
    serviceOptions: [
      { value: 'roofline', label: 'Roofline' },
      { value: 'full-front', label: 'Full front' },
      { value: 'full-property', label: 'Full property' },
    ],
    metadata: {
      entryPoint: 'christmas-lights-page',
    },
  },
}

export default function ConsultationSection({
  site = null,
  section = null,
  sectionId = 'consultation',
  variant = 'default',
  theme = 'light',
  pagePath = '/',
  pageTitle = 'Texas Solar and Roofing Pros',
}) {
  const isChristmasTheme = theme === 'christmasLights'
  const isDarkTheme = theme === 'dark' || isChristmasTheme
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
      id={sectionId}
      className={`relative scroll-mt-38 overflow-hidden py-10 ${isDarkTheme ? 'text-white' : ''} ${theme === 'dark' ? 'bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))]' : ''}`}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/ConsultationSection.jsx',
        content: 'local JSX section + live lead form',
      })}
      style={{
        ...(theme === 'light' && {
          backgroundImage:
            'linear-gradient(to right, hsl(var(--color-secondary-h) 22% 78% / 0.12), hsl(var(--color-secondary-h) 40% 70% / 0), hsl(calc(var(--color-primary-h) + 10) 72% 72% / 0.12))',
        }),
        ...(isChristmasTheme && {
          backgroundColor: '#090e09',
          backgroundImage: [
            'radial-gradient(at 80.5% 40.8%, #14420e 0px, transparent 100%)',
            'radial-gradient(at 50.8% 17.7%, #16390d 0px, transparent 100%)',
            'radial-gradient(at 36.3% 72.7%, #0a570f 0px, transparent 50%)',
            'radial-gradient(at 10% 33%, #213819 0px, transparent 100%)',
          ].join(', '),
        }),
      }}
    >
      <div className="relative z-20 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 py-12 sm:px-3 md:grid-cols-[1.1fr_1fr] md:px-6 lg:px-16">
        <div>
          <h2
            className={`type-display mb-4 text-[clamp(2.875rem,6vw,3.75rem)] leading-[1em]! ${isDarkTheme ? 'text-white' : 'text-secondary'}`}
          >
            {headline}
          </h2>
          <PortableTextContent
            as="div"
            value={copy}
            className={`type-accent text-base font-semibold ${isDarkTheme ? 'text-white/78' : 'text-slate-500'}`}
          />
          {avatarName ? (
            <div className="mt-8 max-w-xl">
              <div className="flex items-center gap-4">
                <Avatar
                  size="xl"
                  className={`size-16 ${isDarkTheme ? 'bg-white/10 ring-1 ring-white/20' : 'bg-primary ring-1 ring-black/5'}`}
                  style={avatarStyle}
                >
                  {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={avatarImageAlt} /> : null}
                  <AvatarFallback
                    className={`text-base font-semibold ${isDarkTheme ? 'bg-white/12 text-white' : 'text-secondary-foreground bg-secondary'}`}
                    style={avatarStyle}
                  >
                    {avatarInitials || 'TS'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  {avatarEyebrow ? (
                    <div
                      className={`mb-1 text-[11px] font-semibold tracking-[0.22em] uppercase ${isDarkTheme ? 'text-white/58' : 'text-secondary/70'}`}
                    >
                      {avatarEyebrow}
                    </div>
                  ) : null}
                  <div className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-foreground'}`}>
                    {avatarName}
                  </div>
                  {avatarRole ? (
                    <div className={`text-sm ${isDarkTheme ? 'text-white/72' : 'text-muted-foreground'}`}>
                      {avatarRole}
                    </div>
                  ) : null}
                  {avatarBlurb ? (
                    <PortableTextContent
                      as="div"
                      value={avatarBlurb}
                      className={`mt-3 text-sm leading-6 ${isDarkTheme ? 'text-white/80' : 'text-muted-foreground'}`}
                    />
                  ) : null}
                </div>
                <JobberDialog buttonLabel={buttonLabel} context={leadContext} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {isDarkTheme ? null : <Gradient zIndex={0} />}
    </section>
  )
}
