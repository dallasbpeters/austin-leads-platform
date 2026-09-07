import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import GuideCardGrid from '@/components/guide-card'
import PortableTextContent from '@/components/portable-text-content'
import { getGuideMetaByHref } from '@/lib/platform/guides'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

export function GuideGridSection({ section, sectionId }) {
  const gridHeaderId = `${sectionId}-header`
  const cards = (section.items || []).map((item, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: item.title || item.question,
    copy: portableTextToPlainText(item.body || item.answer),
    icon: item.icon,
    color: item.color,
    href: item.href,
    image: getImageUrl(item.imageAsset, item.image),
    imageAlt: getImageAlt(item.imageAsset, item.image, item.title || item.question),
    category: item.category || getGuideMetaByHref(item.href).category,
    tags: Array.isArray(item.tags) && item.tags.length ? item.tags : getGuideMetaByHref(item.href).tags,
  }))

  return (
    <section
      className="guide-grid-section section-shell solar-grid-bg"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/guide-grid-section.jsx',
        content: `guide grid from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/guide-grid-section.jsx"
        content={`guide grid from ${section?._type || 'page section'}`}
      />
      <div className="section-shell__inner">
        <div id={gridHeaderId} className="section-shell__intro guide-grid-section__header">
          <h2 className="section-shell__title guide-grid-section__title text-fluid-500">{section.title}</h2>
          {section.body ? (
            <PortableTextContent
              as="div"
              value={section.body}
              className="section-shell__body text-size-100"
            />
          ) : null}
        </div>
        <GuideCardGrid
          cards={cards}
          columnsClassName="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          enableFiltering
          pageSize={6}
          scrollTargetId={gridHeaderId}
        />
      </div>
    </section>
  )
}
