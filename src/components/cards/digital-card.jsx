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

const ActionButton = ({ href, label, icon, buttonBg, external }) => (
  <div className="flex w-1/3 flex-col items-center p-2">
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex size-12 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
      style={{ backgroundColor: buttonBg }}
      aria-label={label}
    >
      <span className="size-6">{icon}</span>
    </a>
    <p className="mt-2 text-sm">{label}</p>
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

/** Renders a Sanity-backed digital business card, styled after the original microsite. */
const DigitalCard = ({ card }) => {
  const colors = { ...DEFAULT_COLORS, ...(card.colors || {}) }
  const site = card.site || null

  // Hero image: a personal photo takes precedence; otherwise fall back to the
  // org/site logo (a per-card logo override wins over the site logo).
  const photoUrl = getImageUrl(card.photo, null, { width: 480 })
  const logoField = card.logo || site?.logo || null
  const logoUrl = getImageUrl(logoField, null, { width: 480 })
  const hero = photoUrl
    ? { url: photoUrl, kind: 'photo', alt: getImageAlt(card.photo, null, card.fullName) }
    : logoUrl
      ? { url: logoUrl, kind: 'logo', alt: getImageAlt(logoField, null, site?.name || card.business || '') }
      : null

  const coverUrl = getImageUrl(card.cover, null, { width: 960 })
  const address = formatAddress(card.address)
  const links = card.links || []

  const actions = []
  if (card.phone) {
    actions.push({
      key: 'call',
      href: `tel:${card.phone.replace(/[^\d+]/g, '')}`,
      label: 'Call',
      icon: <PhoneIcon className="size-6" />,
    })
  }
  if (card.website) {
    actions.push({
      key: 'website',
      href: card.website,
      label: 'Website',
      icon: <GlobeIcon className="size-6" />,
      external: true,
    })
  }
  if (card.email) {
    actions.push({
      key: 'email',
      href: `mailto:${card.email}`,
      label: 'Email',
      icon: <MailIcon className="size-6" />,
    })
  }
  for (const link of links) {
    actions.push({
      key: link.url,
      href: link.url,
      label: link.label,
      icon: <LinkIcon className="size-6" />,
      external: true,
    })
  }

  return (
    <div
      className="relative mx-auto min-h-screen w-full max-w-120 text-black"
      style={{ backgroundColor: colors.mainBg }}
    >
      <header className="relative h-32 overflow-hidden" style={{ backgroundColor: colors.logoBg }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={getImageAlt(card.cover)}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        ) : null}
      </header>

      <main className="px-4 pb-12">
        <div className="flex flex-col items-center">
          {hero ? (
            <div
              className="-mt-20 flex size-40 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-md"
              style={{ backgroundColor: hero.kind === 'photo' ? colors.cardBg : '#ffffff' }}
            >
              <img
                src={hero.url}
                alt={hero.alt}
                className={
                  hero.kind === 'photo'
                    ? 'h-full w-full object-cover select-none'
                    : 'h-full w-full object-contain p-3 select-none'
                }
              />
            </div>
          ) : null}

          <div className="mt-4 flex flex-col items-center text-center leading-tight">
            {card.pronouns ? <p className="mb-1 text-sm font-normal opacity-80">{card.pronouns}</p> : null}
            <p className="text-xl font-bold">{card.fullName}</p>
            {card.jobTitle ? <p className="mt-1">{card.jobTitle}</p> : null}
            {card.business ? <p className="mt-1">{card.business}</p> : null}
            {address ? <p className="mt-2 text-sm opacity-60">{address}</p> : null}
          </div>

          {card.bio ? (
            <p className="mt-6 px-4 text-center text-sm leading-relaxed whitespace-pre-line">{card.bio}</p>
          ) : null}
        </div>

        <div className="mt-8 flex justify-center">
          <SaveContactButton card={card} buttonBg={colors.buttonBg} />
        </div>

        {actions.length > 0 ? (
          <div className="mt-6 flex flex-wrap justify-center">
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

      <footer className="px-6 pt-10 pb-8 text-center text-xs opacity-70">
        {card.business || site?.name || card.fullName}
      </footer>
    </div>
  )
}

export default DigitalCard
