import Link from 'next/link'

import GuideCardGrid from './GuideCard'
import PortableTextContent from './PortableTextContent'
import { getDevSectionAttributes } from './dev/DevTrace'
import { getFeaturedSolarGuideCards } from '@/lib/platform/guides'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { getSanityEditAttributes } from '@/lib/sanity/visualEditing'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

const guides = getFeaturedSolarGuideCards(3)

function escapePathSegment(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export default function GuidesSection({
  section = null,
  page = null,
  sectionId = 'go-deeper',
  editAttributes = {},
}) {
  const title = section?.title || 'Go Deeper'
  const body = portableTextToPlainText(section?.body)
  const ctaLabel = section?.ctaLabel || 'See all guides'
  const icon = section?.icon || 'arrow-right'
  const sectionCards =
    Array.isArray(section?.items) && section.items.length
      ? section.items.map((item, index) => ({
          number: item?.number || String(index + 1).padStart(2, '0'),
          title: item?.title || `Guide ${index + 1}`,
          copy: portableTextToPlainText(item?.body),
          href: item?.href || '/guides',
          icon: item?.icon || '',
          color: item?.color || '',
          image: getImageUrl(item?.imageAsset, item?.image),
          imageAlt: getImageAlt(item?.imageAsset, item?.image, item?.title || ''),
          category: item?.category || '',
          editAttributes:
            page?.id && page?._type && section?._key && item?._key
              ? getSanityEditAttributes({
                  documentId: page.id,
                  documentType: page._type,
                  path: `sections[_key=="${escapePathSegment(section._key)}"].items[_key=="${escapePathSegment(item._key)}"]`,
                })
              : {},
        }))
      : null
  const cards = sectionCards || guides

  return (
    <section
      className="bg-warm py-24"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/GuidesSection.jsx',
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
              className="mt-3 max-w-3xl text-base leading-7 text-slate-600"
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
