import SaveContactButton from '@/components/cards/save-contact-button'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

const DEFAULT_COLORS = {
  logoBg: '#01064A',
  mainBg: '#F9FAFB',
  buttonBg: '#000033',
  cardBg: '#E5E7EB',
}

const PhoneIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
)

const GlobeIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const MailIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
)

const LinkIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const buildAction = ({ href, label, icon, external = false, key }) => ({
  external,
  href,
  icon,
  key,
  label,
})

const ActionButton = ({ href, label, icon, buttonBg, external }) => (
  <div className="flex min-w-0 flex-col items-center gap-2">
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex size-14 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105"
      style={{ backgroundColor: buttonBg }}
      aria-label={label}
    >
      <span className="size-6">{icon}</span>
    </a>
    <p className="max-w-full text-center text-sm leading-tight text-black/75">{label}</p>
  </div>
)

const formatAddress = (address) => {
  if (!address) {
    return null
  }
  const { street, city, state, postal, country } = address
  const locality = [city, state].filter(Boolean).join(', ')
  return [street, locality, postal, country].filter(Boolean).join(', ')
}

const resolveHero = ({ business, card, site }) => {
  const photoUrl = getImageUrl(card.photo, null, { width: 480 })
  if (photoUrl) {
    return {
      alt: getImageAlt(card.photo, null, card.fullName),
      kind: 'photo',
      url: photoUrl,
    }
  }

  const logoField = card.logo || site?.logo || null
  const logoUrl = getImageUrl(logoField, null, { width: 480 })
  if (!logoUrl) {
    return null
  }

  return {
    alt: getImageAlt(logoField, null, site?.name || business || ''),
    kind: 'logo',
    url: logoUrl,
  }
}

const buildActions = ({ card, links }) => {
  const actions = []

  if (card.phone) {
    actions.push(
      buildAction({
        href: `tel:${card.phone.replaceAll(/[^\d+]/g, '')}`,
        icon: <PhoneIcon className="size-6" />,
        key: 'call',
        label: 'Call',
      }),
    )
  }

  if (card.website) {
    actions.push(
      buildAction({
        external: true,
        href: card.website,
        icon: <GlobeIcon className="size-6" />,
        key: 'website',
        label: 'Website',
      }),
    )
  }

  if (card.email) {
    actions.push(
      buildAction({
        href: `mailto:${card.email}`,
        icon: <MailIcon className="size-6" />,
        key: 'email',
        label: 'Email',
      }),
    )
  }

  for (const link of links) {
    actions.push(
      buildAction({
        external: true,
        href: link.url,
        icon: <LinkIcon className="size-6" />,
        key: link.url,
        label: link.label,
      }),
    )
  }

  return actions
}

/** Renders a Sanity-backed digital business card, styled after the original microsite. */
const DigitalCard = ({ card }) => {
  const business = card.business || ''
  const colors = { ...DEFAULT_COLORS, ...card.colors }
  const site = card.site || null

  const hero = resolveHero({ business, card, site })
  const coverUrl = getImageUrl(card.cover, null, { width: 960 })
  const address = formatAddress(card.address)
  const links = card.links || []
  const actions = buildActions({ card, links })

  return (
    <div
      className="min-h-screen px-4 py-8 text-black sm:px-6 sm:py-10"
      style={{
        background: `linear-gradient(180deg, ${colors.logoBg} 0%, ${colors.logoBg} 12rem, ${colors.mainBg} 12rem, ${colors.mainBg} 100%)`,
      }}
    >
      <div className="mx-auto w-full max-w-120 overflow-hidden rounded-4xl bg-white shadow-[0_30px_90px_rgba(1,6,74,0.22)] ring-1 ring-black/5">
        <header className="relative isolate h-44 overflow-hidden" style={{ backgroundColor: colors.logoBg }}>
          {coverUrl ? (
            <>
              {/* oxlint-disable-next-line next/no-img-element */}
              <img
                src={coverUrl}
                alt={getImageAlt(card.cover)}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35" aria-hidden />
            </>
          ) : (
            <>
              <div
                className="absolute inset-x-0 top-0 h-full opacity-90"
                style={{
                  background: `radial-gradient(circle at top right, ${colors.cardBg} 0%, transparent 38%), linear-gradient(135deg, ${colors.logoBg} 0%, ${colors.buttonBg} 100%)`,
                }}
                aria-hidden
              />
              <div
                className="absolute -top-10 right-0 size-36 rounded-full bg-white/12 blur-2xl"
                aria-hidden
              />
            </>
          )}
        </header>

        <main className="relative px-5 pb-10" style={{ backgroundColor: colors.mainBg }}>
          <div className="flex flex-col items-center">
            {hero ? (
              <div
                className="relative -mt-16 flex size-36 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-lg sm:-mt-20 sm:size-40"
                style={{ backgroundColor: hero.kind === 'photo' ? colors.cardBg : '#ffffff' }}
              >
                {/* oxlint-disable-next-line next/no-img-element */}
                <img
                  src={hero.url}
                  alt={hero.alt}
                  className={
                    hero.kind === 'photo'
                      ? 'h-full w-full object-cover select-none'
                      : 'h-full w-full object-contain p-4 select-none'
                  }
                />
              </div>
            ) : null}

            <div className="mt-5 flex flex-col items-center text-center leading-tight">
              {card.pronouns ? (
                <p className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium tracking-[0.12em] text-black/65 uppercase">
                  {card.pronouns}
                </p>
              ) : null}
              <p className="mt-3 text-3xl font-bold tracking-tight">{card.fullName}</p>
              {card.jobTitle ? (
                <p className="mt-2 text-base font-medium text-black/80">{card.jobTitle}</p>
              ) : null}
              {business ? <p className="mt-1 text-base text-black/70">{business}</p> : null}
              {address ? (
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-black/55">{address}</p>
              ) : null}
            </div>

            {card.bio ? (
              <p className="mt-6 max-w-sm text-center text-sm leading-6 whitespace-pre-line text-black/72">
                {card.bio}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex justify-center">
            <SaveContactButton card={card} buttonBg={colors.buttonBg} />
          </div>

          {actions.length > 0 ? (
            <div className="mt-7 grid grid-cols-3 gap-x-3 gap-y-5">
              {actions.map((action) => (
                <ActionButton
                  key={action.key}
                  href={action.href}
                  label={action.label}
                  icon={action.icon}
                  external={action.external}
                  buttonBg={colors.buttonBg}
                />
              ))}
            </div>
          ) : null}
        </main>

        <footer className="border-t border-black/6 bg-white px-6 py-5 text-center text-xs tracking-[0.16em] text-black/45 uppercase">
          {business || site?.name || card.fullName}
        </footer>
      </div>
    </div>
  )
}

export default DigitalCard
