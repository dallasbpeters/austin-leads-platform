import CloudSectionBackground from '@/components/cloud-section-background'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
// import LeadCaptureForm from '@/components/lead-capture-form'
import { JobberDialog } from '@/components/jobber-dialog'
import PortableTextContent from '@/components/portable-text-content'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { cleanRuntimeString } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

import { CONSULTATION_ANCHOR_ID } from '../public-site-utils'

function AvatarVisual({ avatarImageUrl, avatarImageAlt, avatarInitials, avatarStyle }) {
  return (
    <Avatar size="xl" className="cta-banner__avatar" style={avatarStyle}>
      {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={avatarImageAlt} /> : null}
      <AvatarFallback className="cta-banner__avatar-fallback" style={avatarStyle}>
        {avatarInitials || 'TS'}
      </AvatarFallback>
    </Avatar>
  )
}

function AvatarInfo({ avatarEyebrow, avatarName, avatarRole, avatarBlurb, isCloudTheme }) {
  return (
    <div className="cta-banner__person-text">
      {avatarEyebrow ? (
        <div className={cn('cta-banner__person-eyebrow', isCloudTheme && 'cloud-theme-section__eyebrow')}>
          {avatarEyebrow}
        </div>
      ) : null}
      <div className={cn('cta-banner__person-name', isCloudTheme && 'cloud-theme-section__heading')}>
        {avatarName}
      </div>
      {avatarRole ? (
        <div className={cn('cta-banner__person-role', isCloudTheme && 'cloud-theme-section__body')}>
          {avatarRole}
        </div>
      ) : null}
      {avatarBlurb ? (
        <PortableTextContent
          as="div"
          value={avatarBlurb}
          className={cn('cta-banner__person-blurb', isCloudTheme && 'cloud-theme-section__body')}
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

/**
 * Builds the optional contact-person block used by the cross-lead CTA banner.
 *
 * @param {object | null} section - CTA banner content from Sanity.
 * @param {boolean} isDarkTheme - Whether the banner's fallback theme is dark.
 * @param {boolean} isCloudTheme - Whether local-time cloud colors are active.
 * @returns {JSX.Element | null} The avatar block when a person is configured.
 */
export function buildAvatarSection(section, isDarkTheme, isCloudTheme) {
  const s = section || {}
  const avatarEyebrow = s.avatarEyebrow || s.personLabel || ''
  const avatarName = s.avatarName || s.personName || ''
  if (!avatarName) {
    return null
  }

  const avatarRole = s.avatarRole || s.personRole || ''
  const avatarBlurb = s.avatarBlurb || s.personBlurb || ''
  const avatarColor = s.avatarColor || ''
  const imageAsset = s.avatarImageAsset || s.profileImageAsset
  const image = s.avatarImage || s.profileImage

  return (
    <div className="cta-banner__person">
      <div className="cta-banner__person-row">
        <AvatarVisual
          avatarImageUrl={getImageUrl(imageAsset, image)}
          avatarImageAlt={getImageAlt(imageAsset, image, avatarName)}
          avatarInitials={computeInitials(avatarName)}
          avatarStyle={avatarColor ? { backgroundColor: avatarColor } : undefined}
        />
        <AvatarInfo
          avatarEyebrow={avatarEyebrow}
          avatarName={avatarName}
          avatarRole={avatarRole}
          avatarBlurb={avatarBlurb}
          isCloudTheme={isCloudTheme}
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
  const showClouds =
    section?.cloudVisibility !== 'hide' &&
    section?.cloudVisibility !== 'off' &&
    section?.cloudVisibility !== false
  const buttonLabel = section?.ctaLabel || 'Request an Install'
  const leadContext = buildLeadContext(page, section, site)

  return (
    <CloudSectionBackground
      id={CONSULTATION_ANCHOR_ID}
      className={cn(
        'cta-banner',
        showClouds ? 'cloud-theme-section--cta' : isDarkTheme ? 'cta-banner--dark' : 'cta-banner--light',
      )}
      preserveSurfaceWhenCloudsHidden
      showClouds={showClouds}
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
      <div className="cta-banner__inner">
        <div className="cta-banner__copy">
          {section.eyebrow ? (
            <p className={cn('cta-banner__eyebrow', showClouds && 'cloud-theme-section__eyebrow')}>
              {section.eyebrow}
            </p>
          ) : null}
          <h2 className={cn('cta-banner__title', showClouds && 'cloud-theme-section__heading')}>
            {section.title}
          </h2>
          <PortableTextContent
            as="div"
            value={section.body}
            className={cn('cta-banner__body', showClouds && 'cloud-theme-section__body')}
          />
          {buildAvatarSection(section, isDarkTheme, showClouds)}
          <JobberDialog buttonLabel={buttonLabel} context={leadContext} />
        </div>
      </div>
    </CloudSectionBackground>
  )
}
