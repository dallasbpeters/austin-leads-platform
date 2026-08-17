import Link from 'next/link'

import { getFeaturedSolarGuideCards } from '@/lib/platform/guides'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { getSanityEditAttributes } from '@/lib/sanity/visualEditing'

import { getDevSectionAttributes } from './dev/dev-trace'
import CloudSectionBackground from './cloud-section-background'
import GuideCardGrid from './guide-card'
import PortableTextContent from './portable-text-content'

const guides = getFeaturedSolarGuideCards(3)

function escapePathSegment(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

function buildCardEditAttributes(page, sectionKey, itemKey) {
  if (!page?.id || !page?._type || !sectionKey || !itemKey) {
    return {}
  }
  return getSanityEditAttributes({
    documentId: page.id,
    documentType: page._type,
    path: `sections[_key=="${escapePathSegment(sectionKey)}"].items[_key=="${escapePathSegment(itemKey)}"]`,
  })
}

function buildCardFromItem(rawItem, index, page, sectionKey) {
  const item = rawItem || {}
  const num = String(index + 1).padStart(2, '0')
  return {
    number: item.number || num,
    title: item.title || `Guide ${index + 1}`,
    copy: portableTextToPlainText(item.body),
    href: item.href || '/guides',
    icon: item.icon || '',
    color: item.color || '',
    image: getImageUrl(item.imageAsset, item.image),
    imageAlt: getImageAlt(item.imageAsset, item.image, item.title || ''),
    category: item.category || '',
    editAttributes: buildCardEditAttributes(page, sectionKey, item._key),
  }
}

function getGuideCards(section, page, sectionKey) {
  if (!Array.isArray(section?.items) || section.items.length === 0) {
    return guides
  }

  return section.items.map((item, index) => buildCardFromItem(item, index, page, sectionKey))
}

function shouldShowClouds(cloudVisibility) {
  return !['hide', 'off', false].includes(cloudVisibility)
}

/**
 * Resolves Sanity-provided guide content while retaining the local card
 * fallback used by legacy and incomplete homepage sections.
 *
 * @param {object | null} section - The configured Guides section.
 * @param {object | null} page - The parent page for visual editing metadata.
 * @returns {{ body: string, cards: Array<object>, ctaLabel: string, icon: string, showClouds: boolean, title: string }} Render-ready Guides section values.
 */
function resolveGuidesSection(section, page) {
  const sectionKey = section?._key

  return {
    title: section?.title || 'Go Deeper',
    body: portableTextToPlainText(section?.body),
    ctaLabel: section?.ctaLabel || 'See all guides',
    icon: section?.icon || 'arrow-right',
    cards: getGuideCards(section, page, sectionKey),
    showClouds: shouldShowClouds(section?.cloudVisibility),
  }
}

export default function GuidesSection({ section = null, page = null, sectionId = 'go-deeper' }) {
  const { body, cards, ctaLabel, icon, showClouds, title } = resolveGuidesSection(section, page)

  return (
    <CloudSectionBackground
      className="cloud-theme-section--editorial relative isolate overflow-hidden py-24"
      showClouds={showClouds}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/guides-section.jsx',
        content: 'local JSX section + guide cards from guides library',
      })}
      style={{
        backgroundImage:
          'linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="relative z-1 mx-auto w-full max-w-7xl px-4">
        <div className="mb-8">
          <h2 className="cloud-theme-section__heading type-accent m-0 text-[clamp(1.875rem,4vw,2.25rem)]">
            {title}
          </h2>
          {body ? (
            <PortableTextContent
              as="div"
              value={body}
              className="cloud-theme-section__body mt-3 max-w-3xl text-[1rem] leading-7"
            />
          ) : null}
        </div>
        <GuideCardGrid cards={cards} icon={icon} />
        <div className="mt-8 flex justify-end">
          <Link
            className="btn bg-primary text-primary-foreground type-accent rounded-full px-4 py-2 text-sm font-semibold tracking-[0.18em] uppercase"
            href="/guides"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </CloudSectionBackground>
  )
}
