import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { buildRuntimeKey } from '@/lib/sanity/stega'

export function FaqSection({ section, sectionId, editAttributes = {} }) {
  return (
    <section
      className="bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,0.98))] border-b border-border/60"
      {...editAttributes}
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
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-20 lg:px-10">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl text-foreground tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="space-y-4">
          <Card className="bg-card border-border/80 p-4">
            <Accordion type="single" collapsible>
              {section.items?.map((item, index) => (
                <AccordionItem
                  key={buildRuntimeKey('faq-item', item.question, index)}
                  value={item.question}
                  className="border-b border-border/80"
                >
                  <AccordionTrigger className="text-foreground text-xl">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <PortableTextContent
                      as="div"
                      value={item.answer}
                      className="leading-6 text-lg text-muted-foreground"
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </div>
    </section>
  )
}
