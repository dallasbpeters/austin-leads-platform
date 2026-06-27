// oxlint-disable no-nested-ternary curly func-style
import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { buildRuntimeKey, cleanRuntimeString } from '@/lib/sanity/stega'

export function PricingSection({ section, sectionId }) {
  const eyebrow = cleanRuntimeString(section?.eyebrow || '')
  const title = section?.title
  const body = section?.body
  const notes = Array.isArray(section?.notes) ? section.notes : []

  if (!title) {
    return null
  }

  const stepNotes = notes.filter((n) => n?.variant !== 'callout')
  const calloutNotes = notes.filter((n) => n?.variant === 'callout')

  const stepCols =
    stepNotes.length === 2 ? 'grid-cols-2' : stepNotes.length >= 3 ? 'grid-cols-3' : 'grid-cols-1'

  return (
    <section
      className="border-border border-b bg-white px-3 py-14 md:py-20"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/pricing-section.jsx',
        content: 'pricing section',
      })}
    >
      <DevTrace markup="src/components/platform/sections/pricing-section.jsx" content="pricing section" />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-x-14">
          {/* Left: heading block — spans both rows at lg */}
          <div className="lg:row-span-2">
            {eyebrow ? (
              <p className="text-muted-foreground mb-4 text-xs tracking-[0.2em] uppercase">{eyebrow}</p>
            ) : null}
            <h2 className="text-foreground mb-4 font-serif text-2xl leading-tight tracking-normal text-balance md:text-3xl">
              {title}
            </h2>
            {body ? (
              <PortableTextContent
                as="div"
                value={body}
                className="text-muted-foreground space-y-3 text-[0.9375rem] leading-relaxed"
              />
            ) : null}
          </div>

          {/* Right top: step columns */}
          {stepNotes.length > 0 ? (
            <div className={`divide-border border-border grid divide-x border-y ${stepCols}`}>
              {stepNotes.map((note, i) => {
                const noteTitle = note?.title
                const noteBody = note?.body
                const paymentDue = note?.paymentDue
                const amount = note?.amount
                if (!noteTitle && !noteBody) return null
                const key = buildRuntimeKey('pricing-step', note?._key, noteTitle, i)

                return (
                  <div
                    key={key}
                    className="py-5 first:pl-0 last:pr-0"
                    style={{
                      paddingLeft: i > 0 ? '1.25rem' : 0,
                      paddingRight: i < stepNotes.length - 1 ? '1.25rem' : 0,
                    }}
                  >
                    <p className="text-foreground/30 mb-2 text-xs font-bold tracking-[0.16em] uppercase">
                      0{i + 1}
                    </p>
                    {noteTitle ? (
                      <h3 className="text-foreground mb-1 font-serif text-xl tracking-normal">{noteTitle}</h3>
                    ) : null}
                    <p className="mb-1 text-xs font-bold tracking-[0.16em] text-amber-500 uppercase">
                      {paymentDue}
                    </p>
                    <p className="text-foreground mb-2 font-serif text-3xl leading-tight">{amount}</p>

                    {noteBody ? (
                      <PortableTextContent
                        as="div"
                        value={noteBody}
                        className="text-muted-foreground space-y-1 text-sm leading-relaxed"
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}

          {/* Right bottom: callout notes */}
          {calloutNotes.length > 0 ? (
            <div className="space-y-6">
              {calloutNotes.map((note, index) => {
                const noteTitle = note?.title
                const noteBody = note?.body
                if (!noteTitle && !noteBody) return null
                const key = buildRuntimeKey('pricing-callout', note?._key, noteTitle, index)

                return (
                  <div key={key}>
                    {noteTitle ? (
                      <h3 className="mb-2 font-serif text-xl font-bold tracking-normal text-green-900">
                        {noteTitle}
                      </h3>
                    ) : null}
                    {noteBody ? (
                      <PortableTextContent
                        as="div"
                        value={noteBody}
                        className="text-muted-foreground space-y-2 text-sm leading-relaxed"
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default PricingSection
