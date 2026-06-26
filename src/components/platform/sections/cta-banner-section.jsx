import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
// import LeadCaptureForm from '@/components/lead-capture-form'
import PortableTextContent from '@/components/portable-text-content'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { cleanRuntimeString } from '@/lib/sanity/stega'
import { JobberDialog } from '@components/jobber-dialog'

import { CONSULTATION_ANCHOR_ID } from '../public-site-utils'

function avatarCx(isDarkTheme, lightClass, darkClass) {
  return isDarkTheme ? darkClass : lightClass
}

function AvatarVisual({ avatarImageUrl, avatarImageAlt, avatarInitials, avatarStyle, isDarkTheme }) {
  return (
    <Avatar
      size="xl"
      className={`size-16 ${avatarCx(isDarkTheme, 'bg-primary ring-1 ring-black/5', 'bg-white/10 ring-1 ring-white/20')}`}
      style={avatarStyle}
    >
      {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={avatarImageAlt} /> : null}
      <AvatarFallback
        className={`text-[1rem] font-semibold ${avatarCx(isDarkTheme, 'text-secondary-foreground bg-secondary', 'bg-white/12 text-white')}`}
        style={avatarStyle}
      >
        {avatarInitials || 'TS'}
      </AvatarFallback>
    </Avatar>
  )
}

function AvatarInfo({ avatarEyebrow, avatarName, avatarRole, avatarBlurb, isDarkTheme }) {
  return (
    <div className="min-w-0">
      {avatarEyebrow ? (
        <div
          className={`mb-1 text-[11px] font-semibold tracking-[0.22em] uppercase ${avatarCx(isDarkTheme, 'text-muted-foreground', 'text-white/58')}`}
        >
          {avatarEyebrow}
        </div>
      ) : null}
      <div className={`text-lg font-semibold ${avatarCx(isDarkTheme, 'text-foreground', 'text-white')}`}>
        {avatarName}
      </div>
      {avatarRole ? (
        <div className={`text-sm ${avatarCx(isDarkTheme, 'text-muted-foreground', 'text-white/72')}`}>
          {avatarRole}
        </div>
      ) : null}
      {avatarBlurb ? (
        <PortableTextContent
          as="div"
          value={avatarBlurb}
          className={`mt-3 text-sm leading-6 ${avatarCx(isDarkTheme, 'text-muted-foreground', 'text-white/80')}`}
        />
      ) : null}
    </div>
  )
}

function computeInitials(name) {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function buildAvatarSection(section, isDarkTheme) {
  const s = section || {}
  const avatarEyebrow = s.avatarEyebrow || s.personLabel || ''
  const avatarName = s.avatarName || s.personName || ''
  if (!avatarName) return null

  const avatarRole = s.avatarRole || s.personRole || ''
  const avatarBlurb = s.avatarBlurb || s.personBlurb || ''
  const avatarColor = s.avatarColor || ''
  const imageAsset = s.avatarImageAsset || s.profileImageAsset
  const image = s.avatarImage || s.profileImage

  return (
    <div className="max-w-xl pt-2">
      <div className="flex items-center gap-4">
        <AvatarVisual
          avatarImageUrl={getImageUrl(imageAsset, image)}
          avatarImageAlt={getImageAlt(imageAsset, image, avatarName)}
          avatarInitials={computeInitials(avatarName)}
          avatarStyle={avatarColor ? { backgroundColor: avatarColor } : undefined}
          isDarkTheme={isDarkTheme}
        />
        <AvatarInfo
          avatarEyebrow={avatarEyebrow}
          avatarName={avatarName}
          avatarRole={avatarRole}
          avatarBlurb={avatarBlurb}
          isDarkTheme={isDarkTheme}
        />
      </div>
    </div>
  )
}

function buildLeadContext(page, section, site) {
  const slug = cleanRuntimeString(page?.slug)
  return {
    sourceType: 'cross-lead',
    sourceSection: 'cta-banner',
    serviceInterest: 'roofing',
    siteSlug: site?.slug || 'texas-solar-and-roofing-pros',
    siteName: site?.name || 'Texas Solar and Roofing Pros',
    sourceDomain: site?.primaryDomain || 'texassolarandroofingpros.com',
    pagePath: slug ? `/${slug}` : '/',
    pageTitle: page?.title || section?.title || 'Guide CTA',
    metadata: { entryPoint: 'guide-cta-banner' },
  }
}

export function CtaBannerSection({ page, section, site }) {
  const isDarkTheme = section?.theme !== 'light'
  const buttonLabel = section?.ctaLabel || 'Request an Install'
  const leadContext = buildLeadContext(page, section, site)

  return (
    <section
      id={CONSULTATION_ANCHOR_ID}
      className={`py-20 ${isDarkTheme ? 'bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))] text-white' : 'bg-card text-foreground border-border/60 border-b'}`}
      {...getDevSectionAttributes({
        id: CONSULTATION_ANCHOR_ID,
        markup: 'src/components/platform/sections/cta-banner-section.jsx',
        content: `cross-lead banner from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/cta-banner-section.jsx"
        content={`cross-lead banner from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 place-items-center gap-12 px-3 md:px-6 lg:grid-cols-2 lg:px-10">
        <div className="space-y-4">
          {section.eyebrow ? (
            <p
              className={`text-sm tracking-[0.22em] uppercase ${isDarkTheme ? 'text-white/58' : 'text-muted-foreground'}`}
            >
              {section.eyebrow}
            </p>
          ) : null}
          <h2 className="max-w-6xl text-3xl tracking-normal md:text-4xl">{section.title}</h2>
          <PortableTextContent
            as="div"
            value={section.body}
            className={`max-w-2xl text-[1rem] leading-8 ${isDarkTheme ? 'text-white/78' : 'text-muted-foreground'}`}
          />
          {buildAvatarSection(section, isDarkTheme)}
          <JobberDialog buttonLabel={buttonLabel} context={leadContext} />
        </div>
      </div>
    </section>
  )
}
