import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import DevTrace, { getDevSectionAttributes } from '@/components/dev/DevTrace'
import PortableTextContent from '@/components/PortableTextContent'
import { buildRuntimeKey } from '@/lib/sanity/stega'

export function FaqSection({ section, sectionId, editAttributes = {} }) {
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
          <h2 className="font-display text-foreground text-3xl tracking-tight md:text-4xl">{section.title}</h2>
        </div>
        <div className="space-y-4">
          <Card className="bg-card border-border/80 p-4">
            <Accordion type="single" collapsible>
              {section.items?.map((item, index) => (
                <AccordionItem
                  key={buildRuntimeKey('faq-item', item.question, index)}
                  value={item.question}
                  className="border-border/80 border-b"
                >
                  <AccordionTrigger className="text-foreground text-xl">{item.question}</AccordionTrigger>
                  <AccordionContent>
                    <PortableTextContent
                      as="div"
                      value={item.answer}
                      className="text-muted-foreground text-lg leading-6"
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
