import DevTrace, { getDevSectionAttributes } from '@/components/dev/dev-trace'
import QuoteSection from '@/components/quote-section'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

export const QuoteBannerSection = ({ section, sectionId }) => {
  return (
    <section
      className="section-shell section-shell--paper-inverse"
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
