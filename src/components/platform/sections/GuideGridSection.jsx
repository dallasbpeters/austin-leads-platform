import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import GuideCardGrid from '@/components/GuideCard'
import PortableTextContent from '@/components/PortableTextContent'
import { getGuideMetaByHref } from '@/lib/platform/guides'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

export function GuideGridSection({ section, sectionId, editAttributes = {} }) {
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
    tags:
      Array.isArray(item.tags) && item.tags.length ? item.tags : getGuideMetaByHref(item.href).tags,
  }))

  return (
    <section
      className="bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-size-[24px_24px] border-b border-border/60"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/GuideGridSection.jsx',
        content: `guide grid from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/GuideGridSection.jsx"
        content={`guide grid from ${section?._type || 'page section'}`}
      />
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div id={gridHeaderId} className="max-w-3xl mb-8 scroll-mt-28 md:scroll-mt-32">
          <h2 className="mb-4 text-3xl text-foreground md:text-4xl">{section.title}</h2>
          {section.body ? (
            <PortableTextContent
              as="div"
              value={section.body}
              className="leading-8 text-lg text-muted-foreground"
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
