import Link from 'next/link'

import { getFeaturedSolarGuideCards } from '@/lib/platform/guides'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { getSanityEditAttributes } from '@/lib/sanity/visualEditing'

import CloudSectionBackground from './cloud-section-background'
import { getDevSectionAttributes } from './dev/dev-trace'
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
      className="guides cloud-theme-section--editorial"
      showClouds={showClouds}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/guides-section.jsx',
        content: 'local JSX section + guide cards from guides library',
      })}
    >
      <div className="guides__shell">
        <div className="guides__intro">
          <h2 className="guides__title cloud-theme-section__heading text-size-400">{title}</h2>
          {body ? (
            <PortableTextContent
              as="div"
              value={body}
              className="guides__body cloud-theme-section__body text-size-100"
            />
          ) : null}
        </div>
        <GuideCardGrid cards={cards} icon={icon} />
        <div className="guides__footer">
          <Link className="btn guides__all-link text-size-90" href="/guides">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </CloudSectionBackground>
  )
}
