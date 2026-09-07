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
    stepNotes.length === 2 ? 'pricing__steps--2' : stepNotes.length >= 3 ? 'pricing__steps--3' : ''

  return (
    <section
      className="pricing"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/pricing-section.jsx',
        content: 'pricing section',
      })}
    >
      <DevTrace markup="src/components/platform/sections/pricing-section.jsx" content="pricing section" />

      <div className="pricing__inner">
        <div className="pricing__layout">
          <div className="pricing__heading">
            {eyebrow ? <p className="pricing__eyebrow text-size-90">{eyebrow}</p> : null}
            <h2 className="pricing__title text-fluid-400">{title}</h2>
            {body ? (
              <PortableTextContent as="div" value={body} className="pricing__body text-size-100" />
            ) : null}
          </div>

          {stepNotes.length > 0 ? (
            <div className={`pricing__steps ${stepCols}`}>
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
                    className="pricing__step"
                    style={{
                      paddingLeft: i > 0 ? '1.25rem' : 0,
                      paddingRight: i < stepNotes.length - 1 ? '1.25rem' : 0,
                    }}
                  >
                    <p className="pricing__step-index text-size-90">0{i + 1}</p>
                    {noteTitle ? <h3 className="pricing__step-title text-size-200">{noteTitle}</h3> : null}
                    <p className="pricing__step-due text-size-90">{paymentDue}</p>
                    <p className="pricing__step-amount text-size-400">{amount}</p>

                    {noteBody ? (
                      <PortableTextContent
                        as="div"
                        value={noteBody}
                        className="pricing__step-body text-size-90"
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}

          {calloutNotes.length > 0 ? (
            <div className="pricing__callouts">
              {calloutNotes.map((note, index) => {
                const noteTitle = note?.title
                const noteBody = note?.body
                if (!noteTitle && !noteBody) return null
                const key = buildRuntimeKey('pricing-callout', note?._key, noteTitle, index)

                return (
                  <div key={key}>
                    {noteTitle ? <h3 className="pricing__callout-title text-size-200">{noteTitle}</h3> : null}
                    {noteBody ? (
                      <PortableTextContent
                        as="div"
                        value={noteBody}
                        className="pricing__callout-body text-size-90"
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
