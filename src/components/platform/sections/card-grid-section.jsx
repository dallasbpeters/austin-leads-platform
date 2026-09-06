// oxlint-disable func-style
import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { resolveIconoirIcon } from '@/lib/resolve-icon'
import { buildRuntimeKey } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

export function CardGridSection({ section, sectionId }) {
  return (
    <section
      className="card-grid section-shell"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/card-grid-section.jsx',
        content: `highlight cards from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/card-grid-section.jsx"
        content={`highlight cards from ${section?._type || 'page section'}`}
      />
      <div className="section-shell__inner card-grid__inner">
        <div className="section-shell__intro card-grid__intro">
          {section.eyebrow ? (
            <p className="section-shell__eyebrow section-shell__eyebrow--muted">{section.eyebrow}</p>
          ) : null}
          <h2 className="section-shell__title">{section.title}</h2>
          {section.subtitle ? (
            <PortableTextContent
              as="div"
              value={section.subtitle}
              className="section-shell__subtitle card-grid__subtitle"
            />
          ) : null}
        </div>
        <div className="card-grid__items">
          {section.items?.map((item, index) => {
            const reverse = index % 2 === 1
            const Icon = resolveIconoirIcon(item.icon)
            const eyebrow = item.eyebrow || 'Highlight'

            return (
              <article
                key={buildRuntimeKey('card-grid-item', item.title, item.question, index)}
                className={cn('card-grid__item', reverse && 'card-grid__item--reverse')}
              >
                {Icon ? (
                  <div className="card-grid__icon">
                    <Icon className="card-grid__icon-svg" strokeWidth={2} />
                  </div>
                ) : null}
                <p className="card-grid__eyebrow">{eyebrow}</p>
                <h3 className="card-grid__title">{item.title || item.question}</h3>
                <PortableTextContent as="div" value={item.body || item.answer} className="card-grid__body" />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
