import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import { Card } from '@/components/ui/card'
import { FaqAccordion } from './faq-accordion'

export function FaqSection({ section, sectionId }) {
  return (
    <section
      className="faq section-shell"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/faq-section.jsx',
        content: `faq section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/faq-section.jsx"
        content={`faq section from ${section?._type || 'page section'}`}
      />
      <div className="section-shell__inner">
        <div className="section-shell__intro">
          <h2 className="section-shell__title faq__title text-fluid-500">{section.title}</h2>
        </div>
        <div>
          <Card className="faq__card">
            <FaqAccordion items={section.items} />
          </Card>
        </div>
      </div>
    </section>
  )
}
