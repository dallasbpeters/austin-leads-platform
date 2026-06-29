'use client'

const escapeVCard = (value = '') =>
  String(value)
    .replace(/([,;\\])/g, '\\$1')
    .replace(/\n/g, '\\n')

/** Build a VCARD 3.0 string from a card document. */
const buildVCard = (card) => {
  const [firstName = '', ...rest] = (card.fullName || '').trim().split(/\s+/)
  const lastName = rest.join(' ')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
    `FN:${escapeVCard(card.fullName)}`,
  ]
  if (card.business) {
    lines.push(`ORG:${escapeVCard(card.business)}`)
  }
  if (card.jobTitle) {
    lines.push(`TITLE:${escapeVCard(card.jobTitle)}`)
  }
  if (card.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(card.phone)}`)
  }
  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(card.email)}`)
  }
  if (card.website) {
    lines.push(`URL:${escapeVCard(card.website)}`)
  }
  if (card.address) {
    const { street, city, state, postal, country } = card.address
    lines.push(
      `ADR;TYPE=WORK:;;${escapeVCard(street)};${escapeVCard(city)};${escapeVCard(state)};${escapeVCard(postal)};${escapeVCard(country)}`,
    )
  }
  if (card.bio) {
    lines.push(`NOTE:${escapeVCard(card.bio)}`)
  }
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

const UserPlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
    aria-hidden
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </svg>
)

const SaveContactButton = ({ card, buttonBg = '#000033' }) => {
  const handleSave = () => {
    const vcard = buildVCard(card)
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${(card.fullName || 'contact').replace(/\s+/g, '-').toLowerCase()}.vcf`
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      className="flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white transition-transform hover:scale-[1.02]"
      style={{ backgroundColor: buttonBg }}
    >
      <UserPlusIcon />
      <span>Save Contact</span>
    </button>
  )
}

export default SaveContactButton
