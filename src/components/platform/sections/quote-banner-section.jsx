import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import QuoteSection from '@/components/quote-section'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

export function QuoteBannerSection({ section, sectionId }) {
  return (
    <section
      className="border-border/60 border-b bg-[linear-gradient(180deg,rgba(247,244,239,0.98),rgba(255,255,255,0.98))]"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/platform/sections/quote-banner-section.jsx',
        content: `quote section from ${section?._type || 'page section'}`,
      })}
    >
      <DevTrace
        markup="src/components/platform/sections/quote-banner-section.jsx"
        content={`quote section from ${section?._type || 'page section'}`}
      />
      <QuoteSection
        variant="primary"
        eyebrow={section.eyebrow || 'KEY MESSAGE'}
        quoteText={portableTextToPlainText(section.body) || section.title || ''}
        attribution={section.title || 'Texas Solar and Roofing Pros'}
        sectionId={`${sectionId}-content`}
      />
    </section>
  )
}
