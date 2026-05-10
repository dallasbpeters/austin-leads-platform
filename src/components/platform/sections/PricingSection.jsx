import PortableTextContent from '@/components/PortableTextContent'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { buildRuntimeKey, cleanRuntimeString } from '@/lib/sanity/stega'

export function PricingSection({ section, sectionId, editAttributes = {} }) {
  const eyebrow = cleanRuntimeString(section?.eyebrow || '')
  const title = section?.title
  const body = section?.body
  const notes = Array.isArray(section?.notes) ? section.notes : []

  if (!title) return null

  return (
    <section
      className="bg-white border-border/60 border-b px-6 py-20 md:py-32 lg:py-40"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/PricingSection.jsx',
        content: 'pricing section',
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/PricingSection.jsx"
        content="pricing section"
      />
      <div className="mx-auto max-w-3xl">
        {eyebrow ? (
          <p className="text-muted-foreground mb-6 text-sm tracking-widest uppercase">
            {section.eyebrow}
          </p>
        ) : null}

        <h2 className="font-serif mb-2 text-3xl leading-tight tracking-tight text-balance md:mb-3 md:text-4xl lg:text-4xl">
          {title}
        </h2>

        {body ? (
          <PortableTextContent
            as="div"
            value={body}
            className="text-foreground/80 space-y-4 text-md leading-relaxed md:text-md"
          />
        ) : null}

        {notes.length > 0 ? (
          <>

            <div className="space-y-12 mt-4 md:space-y-16">
              {notes.map((note, index) => {
                const noteTitle = note?.title
                const noteBody = note?.body
                if (!noteTitle && !noteBody) return null
                const isCallout = note?.variant === 'callout'
                const key = buildRuntimeKey('pricing-note', note?._key, noteTitle, index)

                if (isCallout) {
                  return (
                    <div
                      key={key}
                      className="border-accent border-l-2 py-2 pl-6 md:pl-8"
                    >
                      {noteTitle ? (
                        <h3 className="font-serif mb-4 text-xl tracking-tight md:text-2xl">
                          {noteTitle}
                        </h3>
                      ) : null}
                      {noteBody ? (
                        <PortableTextContent
                          as="div"
                          value={noteBody}
                          className="text-foreground/70 space-y-4 text-[1rem] leading-relaxed"
                        />
                      ) : null}
                    </div>
                  )
                }

                return (
                  <div key={key} className="space-y-2">
                    {noteTitle ? (
                      <h3 className="font-serif text-1xl tracking-tight md:text-xl">
                        {noteTitle}
                      </h3>
                    ) : null}
                    {noteBody ? (
                      <PortableTextContent
                        as="div"
                        value={noteBody}
                        className="text-foreground/70 space-y-1 text-base leading-relaxed md:text-sm"
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default PricingSection
