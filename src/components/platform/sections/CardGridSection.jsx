import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { buildRuntimeKey } from '@/lib/sanity/stega'

export function CardGridSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,242,0.96))] border-b border-border/60"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/CardGridSection.jsx',
        content: `highlight cards from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/CardGridSection.jsx"
        content={`highlight cards from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-20 lg:px-10">
        <div className="grid max-w-3xl gap-2 mb-8">
          <h2 className="text-3xl text-foreground md:text-4xl">{section.title}</h2>
          {section.subtitle ? (
            <PortableTextContent
              as="div"
              value={section.subtitle}
              className="mb-4 leading-8 text-foreground text-xl"
            />
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {section.items?.map((item, index) => {
            const number = String(index + 1).padStart(2, '0')
            const reverse = index % 2 === 1

            return (
              <article
                key={buildRuntimeKey('card-grid-item', item.title, item.question, index)}
                className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-6 shadow-theme-sm md:p-8"
              >
                <div
                  className={`grid gap-6 md:items-start ${
                    reverse
                      ? 'md:grid-cols-[minmax(0,1fr)_auto]'
                      : 'md:grid-cols-[auto_minmax(0,1fr)]'
                  }`}
                >
                  <div className={reverse ? 'md:order-2 md:text-right' : 'md:order-1'}>
                    <p className="text-[0.65rem] tracking-[0.22em] uppercase text-muted-foreground">
                      Highlight
                    </p>
                    <p className="type-display mt-1 text-4xl leading-none text-primary md:text-5xl">
                      {number}
                    </p>
                  </div>
                  <div className={reverse ? 'md:order-1' : 'md:order-2'}>
                    <h3 className="text-xl tracking-tight text-foreground md:text-2xl">
                      {item.title || item.question}
                    </h3>
                    <PortableTextContent
                      as="div"
                      value={item.body || item.answer}
                      className="mt-3 max-w-[70ch] text-md leading-7 text-muted-foreground"
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
