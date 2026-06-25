'use client'

import { useState } from 'react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { buildRuntimeKey } from '@/lib/sanity/stega'
import { trackAnalyticsEvent } from '@/lib/analytics/client'
import PortableTextContent from '@/components/portable-text-content'

export function FaqAccordion({ items }) {
  const [expandedValue, setExpandedValue] = useState(null)

  const handleValueChange = (value) => {
    const wasExpanded = value === expandedValue
    const question = items?.find((item) => item.question === value)?.question

    if (question) {
      trackAnalyticsEvent('faq_interaction', {
        faq_question: question.slice(0, 120),
        action: wasExpanded ? 'collapse' : 'expand',
        page_path: typeof window !== 'undefined' ? window.location.pathname : '/unknown',
      })
    }

    setExpandedValue(value)
  }

  return (
    <Accordion type="single" collapsible value={expandedValue} onValueChange={handleValueChange}>
      {items?.map((item, index) => (
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
  )
}
