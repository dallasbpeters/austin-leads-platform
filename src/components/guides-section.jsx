import Link from 'next/link'

import { getFeaturedSolarGuideCards } from '@/lib/platform/guides'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { getSanityEditAttributes } from '@/lib/sanity/visualEditing'

import { getDevSectionAttributes } from './dev/dev-trace'
import GuideCardGrid from './guide-card'
import PortableTextContent from './portable-text-content'

const guides = getFeaturedSolarGuideCards(3)

function escapePathSegment(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function buildCardEditAttributes(page, sectionKey, itemKey) {
  if (!page?.id || !page?._type || !sectionKey || !itemKey) return {}
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

export default function GuidesSection({ section = null, page = null, sectionId = 'go-deeper' }) {
  const title = section?.title || 'Go Deeper'
  const body = portableTextToPlainText(section?.body)
  const ctaLabel = section?.ctaLabel || 'See all guides'
  const icon = section?.icon || 'arrow-right'
  const sectionKey = section?._key
  const sectionCards =
    Array.isArray(section?.items) && section.items.length
      ? section.items.map((item, index) => buildCardFromItem(item, index, page, sectionKey))
      : null
  const cards = sectionCards || guides

  return (
    <section
      className="bg-warm py-24"
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
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-8">
          <h2 className="text-secondary type-accent m-0 text-[clamp(1.875rem,4vw,2.25rem)]">{title}</h2>
          {body ? (
            <PortableTextContent
              as="div"
              value={body}
              className="mt-3 max-w-3xl text-[1rem] leading-7 text-slate-600"
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
    </section>
  )
}
