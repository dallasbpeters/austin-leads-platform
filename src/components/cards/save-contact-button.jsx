'use client'

import { getImageUrl } from '@/lib/platform/imageSource'

const escapeVCard = (value = '') =>
  String(value)
    .replaceAll(/([,;\\])/gu, '\\$1')
    .replaceAll(`'\n'`, '\\n')

const VCF_LINE_LIMIT = 75

const foldVCardLine = (line) => {
  if (line.length <= VCF_LINE_LIMIT) {
    return line
  }

  const chunks = []
  for (let start = 0; start < line.length; start += VCF_LINE_LIMIT) {
    const chunk = line.slice(start, start + VCF_LINE_LIMIT)
    chunks.push(start === 0 ? chunk : ` ${chunk}`)
  }
  return chunks.join('\r\n')
}

const toBase64 = (bytes) => {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte)
  }
  return btoa(binary)
}

const inferPhotoType = (url, mimeType) => {
  const resolvedMime = mimeType?.toUpperCase()
  if (resolvedMime?.startsWith('IMAGE/')) {
    return resolvedMime.slice('IMAGE/'.length)
  }

  const cleanedUrl = String(url || '')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase()

  if (cleanedUrl.endsWith('.png')) {
    return 'PNG'
  }
  if (cleanedUrl.endsWith('.gif')) {
    return 'GIF'
  }
  if (cleanedUrl.endsWith('.webp')) {
    return 'WEBP'
  }
  return 'JPEG'
}

const resolvePhotoField = (card) => {
  return card.photo || card.logo || card.site?.logo || null
}

const buildPhotoLine = async (card) => {
  const photoField = resolvePhotoField(card)
  const photoUrl = getImageUrl(photoField, null, { width: 480 })
  if (!photoUrl) {
    return null
  }

  try {
    const response = await fetch(photoUrl)
    if (!response.ok) {
      return null
    }

    const mimeType = response.headers.get('content-type')
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.length === 0) {
      return null
    }

    const encodedPhoto = toBase64(bytes)
    const photoType = inferPhotoType(photoUrl, mimeType)
    return foldVCardLine(`PHOTO;ENCODING=b;TYPE=${photoType}:${encodedPhoto}`)
  } catch {
    return null
  }
}

/** Build a VCARD 3.0 string from a card document. */
const buildVCard = async (card) => {
  const [firstName = '', ...rest] = (card.fullName || '').trim().split(/\s+/)
  const lastName = rest.join(' ')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
    `FN:${escapeVCard(card.fullName)}`,
  ]
  const photoLine = await buildPhotoLine(card)
  if (photoLine) {
    lines.push(photoLine)
  }
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
  const handleSave = async () => {
    const vcard = await buildVCard(card)
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${(card.fullName || 'contact').replaceAll(/\s+/g, '-').toLowerCase()}.vcf`
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full px-6 py-4 font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
      style={{ backgroundColor: buttonBg }}
    >
      <UserPlusIcon />
      <span>Save Contact</span>
    </button>
  )
}

export default SaveContactButton
