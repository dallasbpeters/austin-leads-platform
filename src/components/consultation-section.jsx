// oxlint-disable func-style
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { cn } from '@/lib/utils'
import { getDevSectionAttributes } from './dev/dev-trace'
import Gradient from './gradient'
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

function buildSectionStyle(theme, isChristmasTheme) {
  if (theme === 'light') {
    return {
      backgroundImage:
        'linear-gradient(to right, oklch(from var(--color-secondary) 78% calc(c * 0.36) h / 0.12), oklch(from var(--color-secondary) 70% calc(c * 0.66) h / 0), oklch(from var(--color-primary) 72% calc(c * 0.73) calc(h + 10) / 0.12))',
    }
  }
  if (isChristmasTheme) {
    return {
      backgroundColor: '#090e09',
      backgroundImage: [
        'radial-gradient(at 80.5% 40.8%, #14420e 0px, transparent 100%)',
        'radial-gradient(at 50.8% 17.7%, #16390d 0px, transparent 100%)',
        'radial-gradient(at 36.3% 72.7%, #0a570f 0px, transparent 50%)',
        'radial-gradient(at 10% 33%, #213819 0px, transparent 100%)',
      ].join(', '),
    }
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

function getAvatarInitials(name) {
  return String(name || '')
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
 * The light variant sits over the tone-tinted gradient, so its text takes the
 * same `--cloud-section-*` tokens the cloud sections use rather than fixed
 * colours. Without this the copy stays dark navy after the sky turns to night
 * and becomes unreadable. The dark variant (`consult--dark`) has its own
 * opaque background and keeps a fixed palette in consult.css.
 */
function getClassNames(isDarkTheme) {
  const light = (cloudClass) => (isDarkTheme ? '' : cloudClass)
  return {
    avatarClassName: 'consult__avatar',
    blurbClassName: cn('consult__person-blurb', light('cloud-theme-section__body')),
    copy: cn('consult__copy', light('cloud-theme-section__body')),
    eyebrowClassName: cn('consult__person-eyebrow', light('cloud-theme-section__eyebrow')),
    fallbackClassName: 'consult__avatar-fallback',
    heading: cn('consult__heading', light('cloud-theme-section__heading')),
    nameClassName: cn('consult__person-name', light('cloud-theme-section__heading')),
    roleClassName: cn('consult__person-role', light('cloud-theme-section__body')),
  }
}

function AvatarSection({ section, isDarkTheme }) {
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
  const classes = getClassNames(isDarkTheme)

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
  const isDarkTheme = theme === 'dark' || isChristmasTheme
  const content = getSectionContent(section, variant)
  const sectionStyle = buildSectionStyle(theme, isChristmasTheme)
  const leadContext = buildLeadContext(site, content, pagePath, pageTitle)

  return (
    <section
      id={sectionId}
      className={cn('consult', isDarkTheme && 'consult--dark', theme === 'dark' && 'consult--dark-gradient')}
      {...getDevSectionAttributes({
        content: 'local JSX section + live lead form',
        id: sectionId,
        markup: 'src/components/consultation-section.jsx',
      })}
      style={sectionStyle}
    >
      <div className="consult__shell">
        <div>
          <h2 className={getClassNames(isDarkTheme).heading}>{content.headline}</h2>
          <PortableTextContent as="div" value={content.copy} className={getClassNames(isDarkTheme).copy} />
          <AvatarSection section={section} isDarkTheme={isDarkTheme} />
          <div className="consult__cta">
            <JobberDialog buttonLabel={content.buttonLabel} context={leadContext} />
          </div>
        </div>
      </div>
      {isDarkTheme ? null : <Gradient zIndex={0} />}
    </section>
  )
}
