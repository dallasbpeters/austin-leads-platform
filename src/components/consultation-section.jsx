// oxlint-disable func-style
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { shouldShowClouds } from '@/lib/platform/section-helpers'
import { cleanRuntimeString } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'
import CloudSectionBackground from './cloud-section-background'
import { getDevSectionAttributes } from './dev/dev-trace'
import { JobberDialog } from './jobber-dialog'
import PortableTextContent from './portable-text-content'

const SECTION_VARIANTS = {
  christmasLights: {
    buttonLabel: 'Reserve My Install Date',
    copy: 'Spots fill up fast. A small deposit reserves your install window — we handle the hanging, any mid-season bulb issues, and full takedown after the holidays.',
    heading: <>Secure your install date</>,
    metadata: { entryPoint: 'christmas-lights-page' },
    serviceInterest: 'christmas-lights',
    sourceSection: 'christmas-lights-deposit',
  },
  default: {
    buttonLabel: 'Set up a free call',
    copy: "Tell us about your roof, your bill, or the storm that just came through. We'll say what's worth doing, what isn't, and what it costs.",
    heading: <>Tell us what's going on with your house</>,
    metadata: { entryPoint: 'homepage' },
    serviceInterest: 'solar-roofing',
    sourceSection: 'homepage-consultation',
  },
  roofingInspection: {
    buttonLabel: 'Request Free Inspection',
    copy: "Tell us what you're seeing. We'll say plainly whether it's a repair, a replacement, or an insurance claim.",
    heading: <>Request a roof inspection</>,
    metadata: { entryPoint: 'roofing-page' },
    serviceInterest: 'roofing',
    sourceSection: 'roofing-consultation',
  },
}

function getSectionContent(section, variant) {
  const content = SECTION_VARIANTS[variant] || SECTION_VARIANTS.default
  return {
    buttonLabel: section?.ctaLabel || content.buttonLabel,
    copy: section?.body || content.copy,
    headline: section?.title || content.heading,
    metadata: content.metadata,
    serviceInterest: content.serviceInterest,
    sourceSection: content.sourceSection,
  }
}

function buildLeadContext(site, content, pagePath, pageTitle) {
  return {
    metadata: content.metadata,
    pagePath,
    pageTitle,
    serviceInterest: content.serviceInterest,
    siteName: site?.name || 'Texas Solar and Roofing Pros',
    siteSlug: site?.slug || 'texas-solar-and-roofing-pros',
    sourceDomain: site?.primaryDomain || 'texassolarandroofingpros.com',
    sourceSection: content.sourceSection,
    sourceType: 'consultation',
  }
}

const AVATAR_TEXT_FIELDS = [
  ['avatarName', 'avatarName', 'personName'],
  ['avatarEyebrow', 'avatarEyebrow', 'personLabel'],
  ['avatarRole', 'avatarRole', 'personRole'],
  ['avatarBlurb', 'avatarBlurb', 'personBlurb'],
]

export function getAvatarInitials(name) {
  // Initials are built from single letters, so the edit markers have to come off
  // first. Slicing a marker-carrying string can leave a lone invisible character,
  // which the Studio overlay then fails to decode.
  return String(cleanRuntimeString(name) || '')
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function getAvatarImageUrl(section) {
  return getImageUrl(
    section?.avatarImageAsset || section?.profileImageAsset,
    section?.avatarImage || section?.profileImage,
  )
}

function getAvatarImageAlt(section, name) {
  return getImageAlt(
    section?.avatarImageAsset || section?.profileImageAsset,
    section?.avatarImage || section?.profileImage,
    name,
  )
}

function getAvatarData(section) {
  const data = { avatarColor: section?.avatarColor || '' }
  for (const [key, primary, fallback] of AVATAR_TEXT_FIELDS) {
    data[key] = section?.[primary] || section?.[fallback] || ''
  }
  data.avatarImageUrl = getAvatarImageUrl(section)
  data.avatarImageAlt = getAvatarImageAlt(section, data.avatarName)
  data.avatarInitials = getAvatarInitials(data.avatarName) || 'TS'
  data.avatarStyle = data.avatarColor ? { backgroundColor: data.avatarColor } : undefined
  return data
}

/*
 * The band is a dark brand surface on every theme now, so there is no
 * light/dark text split to resolve -- consult.css owns the colours and this
 * only names the size step for each element.
 */
const CLASS_NAMES = {
  avatarClassName: 'consult__avatar',
  blurbClassName: 'consult__person-blurb text-size-90',
  copy: 'consult__copy text-size-100',
  eyebrowClassName: 'consult__person-eyebrow text-size-80',
  fallbackClassName: 'consult__avatar-fallback text-size-100',
  heading: 'consult__heading text-fluid-600',
  nameClassName: 'consult__person-name text-size-200',
  roleClassName: 'consult__person-role text-size-90',
}

function AvatarSection({ section }) {
  const {
    avatarName,
    avatarEyebrow,
    avatarRole,
    avatarBlurb,
    avatarImageUrl,
    avatarImageAlt,
    avatarInitials,
    avatarStyle,
  } = getAvatarData(section)
  const classes = CLASS_NAMES

  if (!avatarName) {
    return null
  }

  return (
    <div className="consult__person">
      <div className="consult__person-row">
        <Avatar size="xl" className={classes.avatarClassName} style={avatarStyle}>
          {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={avatarImageAlt} /> : null}
          <AvatarFallback className={classes.fallbackClassName} style={avatarStyle}>
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="consult__person-text">
          {avatarEyebrow ? <div className={classes.eyebrowClassName}>{avatarEyebrow}</div> : null}
          <div className={classes.nameClassName}>{avatarName}</div>
          {avatarRole ? <div className={classes.roleClassName}>{avatarRole}</div> : null}
          {avatarBlurb ? (
            <PortableTextContent as="div" value={avatarBlurb} className={classes.blurbClassName} />
          ) : null}
        </div>
      </div>
    </div>
  )
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
  const showClouds = shouldShowClouds(section?.cloudVisibility)
  const content = getSectionContent(section, variant)
  const leadContext = buildLeadContext(site, content, pagePath, pageTitle)

  return (
    <CloudSectionBackground
      id={sectionId}
      className={cn('consult', isChristmasTheme && 'consult--christmas')}
      showClouds={showClouds}
      {...getDevSectionAttributes({
        content: 'local JSX section + live lead form',
        id: sectionId,
        markup: 'src/components/consultation-section.jsx',
      })}
    >
      <div className="consult__shell">
        {/* The card is what holds contrast steady: the sky behind it runs from
            midday bright to near black, the card does not. */}
        <div className="consult__card">
          <h2 className={CLASS_NAMES.heading}>{content.headline}</h2>
          <PortableTextContent as="div" value={content.copy} className={CLASS_NAMES.copy} />
          <AvatarSection section={section} />
          <div className="consult__cta">
            <JobberDialog variant="inverse" buttonLabel={content.buttonLabel} context={leadContext} />
          </div>
        </div>
      </div>
    </CloudSectionBackground>
  )
}
