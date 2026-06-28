import * as IconoirIcons from 'iconoir-react'

import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { buildRuntimeKey } from '@/lib/sanity/stega'

const resolveItemIcon = (iconName) => {
  if (!iconName || typeof iconName !== 'string') {
    return null
  }
  const Component = IconoirIcons[iconName]
  return typeof Component === 'function' || typeof Component === 'object' ? Component : null
}

export function CardGridSection({ section, sectionId }) {
  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,242,0.96))]"
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
      <div className="mx-auto max-w-7xl px-3 py-20 md:px-6 lg:px-10">
        <div className="mb-8 grid max-w-3xl gap-2">
          {section.eyebrow ? (
            <p className="text-muted-foreground mb-2 text-[0.65rem] tracking-[0.22em] uppercase">
              {section.eyebrow}
            </p>
          ) : null}
          <h2 className="text-foreground text-3xl md:text-4xl">{section.title}</h2>
          {section.subtitle ? (
            <PortableTextContent
              as="div"
              value={section.subtitle}
              className="text-foreground mb-4 text-xl leading-8"
            />
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {section.items?.map((item, index) => {
            const number = String(index + 1).padStart(2, '0')
            const reverse = index % 2 === 1
            const Icon = resolveItemIcon(item.icon)
            const eyebrow = item.eyebrow || 'Highlight'

            return (
              <article
                key={buildRuntimeKey('card-grid-item', item.title, item.question, index)}
                className="border-border/70 bg-card/95 shadow-theme-sm relative overflow-hidden rounded-2xl border p-6 md:p-8"
              >
                <div
                  className={`grid gap-6 md:items-start ${
                    reverse ? 'md:grid-cols-[minmax(0,1fr)_auto]' : 'md:grid-cols-[auto_minmax(0,1fr)]'
                  }`}
                >
                  <div className={reverse ? 'md:order-2 md:text-right' : 'md:order-1'}>
                    <p className="text-muted-foreground mb-2 text-[0.65rem] tracking-[0.22em] uppercase">
                      {eyebrow}
                    </p>
                    <p className="type-display text-primary mt-1 text-4xl leading-none md:text-5xl">
                      {number}
                    </p>
                  </div>
                  <div className={reverse ? 'md:order-1' : 'md:order-2'}>
                    {Icon ? (
                      <div
                        className={`bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full ${
                          reverse ? 'md:ml-auto' : ''
                        }`}
                      >
                        <Icon className="size-6" strokeWidth={2} />
                      </div>
                    ) : null}
                    <h3 className="text-foreground text-xl tracking-normal md:text-2xl">
                      {item.title || item.question}
                    </h3>
                    <PortableTextContent
                      as="div"
                      value={item.body || item.answer}
                      className="text-md text-muted-foreground mt-3 max-w-[70ch] leading-7"
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
