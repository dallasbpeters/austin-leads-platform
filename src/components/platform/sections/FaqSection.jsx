import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { Card } from '@/components/ui/card'
import { FaqAccordion } from './FaqAccordion'

export function FaqSection({ section, sectionId }) {
  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,0.98))]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/FaqSection.jsx',
        content: `faq section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/FaqSection.jsx"
        content={`faq section from ${section?._type || 'page section'}`}
      />
      <div className="mx-auto max-w-7xl px-3 py-20 md:px-6 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <h2 className="font-display text-foreground text-3xl tracking-normal md:text-4xl">
            {section.title}
          </h2>
        </div>
        <div className="space-y-4">
          <Card className="bg-card border-border/80 p-4">
            <FaqAccordion items={section.items} />
          </Card>
        </div>
      </div>
    </section>
  )
}
