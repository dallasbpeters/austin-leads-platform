import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
// import LeadCaptureForm from '@/components/LeadCaptureForm'
import PortableTextContent from '@/components/PortableTextContent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { cleanRuntimeString } from '@/lib/sanity/stega'
import { JobberDialog } from '@components/jobber-dialog'

import { CONSULTATION_ANCHOR_ID } from '../PublicSiteUtils'

export function CtaBannerSection({ page, section, site }) {
  const slug = cleanRuntimeString(page?.slug)
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
  const isDarkTheme = section?.theme !== 'light'
  const buttonLabel = section?.ctaLabel || 'Request an Install'

  const leadContext = {
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

  return (
    <section
      id={CONSULTATION_ANCHOR_ID}
      className={`py-20 ${isDarkTheme ? 'bg-[linear-gradient(135deg,hsl(var(--color-secondary-h)_34%_15%),hsl(var(--color-secondary-h)_28%_12%))] text-white' : 'bg-card text-foreground border-border/60 border-b'}`}
      {...getDevSectionAttributes({
        id: CONSULTATION_ANCHOR_ID,
        markup: 'src/components/platform/sections/CtaBannerSection.jsx',
        content: `cross-lead banner from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/CtaBannerSection.jsx"
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
          {avatarName ? (
            <div className="max-w-xl pt-2">
              <div className="flex items-center gap-4">
                <Avatar
                  size="xl"
                  className={`size-16 ${isDarkTheme ? 'bg-white/10 ring-1 ring-white/20' : 'bg-primary ring-1 ring-black/5'}`}
                  style={avatarStyle}
                >
                  {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={avatarImageAlt} /> : null}
                  <AvatarFallback
                    className={`text-[1rem] font-semibold ${isDarkTheme ? 'bg-white/12 text-white' : 'text-secondary-foreground bg-secondary'}`}
                    style={avatarStyle}
                  >
                    {avatarInitials || 'TS'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  {avatarEyebrow ? (
                    <div
                      className={`mb-1 text-[11px] font-semibold tracking-[0.22em] uppercase ${isDarkTheme ? 'text-white/58' : 'text-muted-foreground'}`}
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
              </div>
            </div>
          ) : null}
          <JobberDialog buttonLabel={buttonLabel} context={leadContext} />
        </div>
      </div>
    </section>
  )
}
