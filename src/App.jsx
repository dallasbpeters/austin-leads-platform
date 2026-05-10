import Header from './components/Header'
import Hero from './components/Hero'
import StorySection from './components/StorySection'
import CalculatorSection from './components/CalculatorSection'
import CostsSection from './components/CostsSection'
import GuidesSection from './components/GuidesSection'
import SnapshotSection from './components/SnapshotSection'
import IncentivesSection from './components/IncentivesSection'
import ResourcesSection from './components/ResourcesSection'
import ConsultationSection from './components/ConsultationSection'
import Footer from './components/Footer'
import Band from './components/Band'
import Testimonails from './components/Testimonials'
import QuoteSection from './components/QuoteSection'
import DevTrace from './components/dev/DevTrace'
import { Agentation } from 'agentation'
import { getSanityPageEditAttributes, getSanitySectionEditAttributes } from '@/lib/sanity/visualEditing'
import { portableTextToPlainText } from '@/lib/sanity/portableText'

export default function App({
  homepage = null,
  heroSection = null,
  resourcesSection = null,
  reviews = [],
  site = null,
  jsonLd = null,
  homepageSource = 'fixture',
}) {
  const homepageSections = homepage?.sections || []
  const findSection = (type, sanityType = '') =>
    homepageSections.find(
      (section) => section.type === type || (sanityType && section._type === sanityType),
    ) || null
  const homepageEditAttrs = getSanityPageEditAttributes(homepage, 'sections')
  const storySection = findSection('story', 'storySection')
  const calculatorSection = findSection('calculator', 'calculatorSection')
  const costsSection = findSection('costs', 'costsSection')
  const guidesSection = findSection('guides', 'guidesSection') || findSection('guideGrid', 'guideGridSection')
  const snapshotSection = findSection('snapshot', 'snapshotSection')
  const incentivesSection = findSection('incentives', 'incentivesSection')
  const testimonialsSection = findSection('testimonials', 'testimonialsSection')
  const quoteSection = findSection('quote', 'quoteSection')
  const ctaSection = findSection('cta', 'ctaSection')
  const bandSections = homepageSections.filter(
    (section) => section.type === 'band' || section._type === 'bandSection',
  )
  const firstBandSection = bandSections[0] || null
  const secondBandSection = bandSections[1] || null
  const extraBandSections = bandSections.slice(2)
  const sectionEditAttrs = (section, fallbackPath = 'sections') =>
    section ? getSanitySectionEditAttributes(homepage, section, fallbackPath) : {}
  const heroEditAttrs = getSanitySectionEditAttributes(homepage, heroSection, 'heroTitle')
  const storyEditAttrs = sectionEditAttrs(storySection)
  const calculatorEditAttrs = sectionEditAttrs(calculatorSection)
  const costsEditAttrs = sectionEditAttrs(costsSection)
  const guidesEditAttrs = sectionEditAttrs(guidesSection)
  const snapshotEditAttrs = sectionEditAttrs(snapshotSection)
  const incentivesEditAttrs = sectionEditAttrs(incentivesSection)
  const testimonialsEditAttrs = sectionEditAttrs(testimonialsSection)
  const quoteEditAttrs = sectionEditAttrs(quoteSection)
  const resourcesEditAttrs = sectionEditAttrs(resourcesSection)
  const consultationEditAttrs = sectionEditAttrs(ctaSection)
  const firstBandEditAttrs = sectionEditAttrs(firstBandSection)
  const secondBandEditAttrs = sectionEditAttrs(secondBandSection)

  const renderBand = (section, sectionId, fallbackProps = null, editAttributes = {}) => {
    const hasSectionConfig = Boolean(section)

    if (!hasSectionConfig && !fallbackProps) {
      return null
    }

    return (
      <div {...editAttributes}>
        <Band
          colors={
            Array.isArray(section?.colors) && section.colors.length ? section.colors : fallbackProps?.colors
          }
          tint={section?.tint || fallbackProps?.tint}
          minHeight={typeof section?.minHeight === 'number' ? section.minHeight : fallbackProps?.minHeight}
          maxHeight={typeof section?.maxHeight === 'number' ? section.maxHeight : fallbackProps?.maxHeight}
          rotate={typeof section?.rotate === 'boolean' ? section.rotate : Boolean(fallbackProps?.rotate)}
          scrollStart={
            typeof section?.scrollStart === 'number' ? section.scrollStart : fallbackProps?.scrollStart
          }
          scrollEnd={typeof section?.scrollEnd === 'number' ? section.scrollEnd : fallbackProps?.scrollEnd}
          reverse={typeof section?.reverse === 'boolean' ? section.reverse : Boolean(fallbackProps?.reverse)}
          autoAnimate={
            typeof section?.autoAnimate === 'boolean'
              ? section.autoAnimate
              : Boolean(fallbackProps?.autoAnimate)
          }
          speed={typeof section?.speed === 'number' ? section.speed : fallbackProps?.speed}
          amplitude={typeof section?.amplitude === 'number' ? section.amplitude : fallbackProps?.amplitude}
          sectionId={sectionId}
        />
      </div>
    )
  }

  return (
    <>
      <DevTrace
        markup="src/App.jsx"
        content="homepage composition shell"
        note="route-level ViewTransition lives in src/app/(site)/layout.jsx"
      />
      <DevTrace markup="src/components/Header.jsx" content="local JSX nav and service catalog links" />
      <Header />
      <main {...getSanityPageEditAttributes(homepage, 'title')}>
        <DevTrace
          markup="src/components/Hero.jsx"
          content={`local JSX hero copy + hero media from homepage record (${homepageSource})`}
        />
        <div {...heroEditAttrs}>
          <Hero heroSection={heroSection} />
        </div>
        {renderBand(
          firstBandSection,
          'homepage-band-1',
          {
            colors: ['#2660AE', '#1C447F', '#0C333A', 'var(--color-secondary-alt)', 'var(--color-amber-600)'],
            tint: 'var(--color-secondary-950)',
            maxHeight: 12,
          },
          firstBandSection ? firstBandEditAttrs : homepageEditAttrs,
        )}
        <DevTrace
          markup="src/components/StorySection.jsx"
          content={storySection ? `homepage story from ${homepageSource}` : 'local fallback story copy'}
        />
        <div {...storyEditAttrs}>
          <StorySection section={storySection} />
        </div>
        <DevTrace
          markup="src/components/CalculatorSection.jsx"
          content={
            calculatorSection
              ? `homepage calculator copy from ${homepageSource}`
              : 'local JSX copy and local calculator logic'
          }
        />
        <div {...calculatorEditAttrs}>
          <CalculatorSection section={calculatorSection} />
        </div>
        <DevTrace
          markup="src/components/CostsSection.jsx"
          content={costsSection ? `homepage costs copy from ${homepageSource}` : 'local JSX copy'}
        />
        <div {...costsEditAttrs}>
          <CostsSection section={costsSection} />
        </div>
        <DevTrace
          markup="src/components/GuidesSection.jsx"
          content={
            guidesSection
              ? `homepage guides framing copy from ${homepageSource} + guide cards from guides library`
              : 'local JSX section + guide cards from guides library'
          }
        />
        <div {...guidesEditAttrs}>
          <GuidesSection section={guidesSection} page={homepage} />
        </div>
        <DevTrace
          markup="src/components/SnapshotSection.jsx"
          content={snapshotSection ? `homepage snapshot copy from ${homepageSource}` : 'local JSX copy'}
        />
        <div {...snapshotEditAttrs}>
          <SnapshotSection section={snapshotSection} />
        </div>
        {renderBand(
          secondBandSection,
          'homepage-band-2',
          {},
          secondBandSection ? secondBandEditAttrs : homepageEditAttrs,
        )}
        <DevTrace
          markup="src/components/IncentivesSection.jsx"
          content={incentivesSection ? `homepage incentives copy from ${homepageSource}` : 'local JSX copy'}
        />
        <div {...incentivesEditAttrs}>
          <IncentivesSection section={incentivesSection} />
        </div>
        <DevTrace
          markup="src/components/Testimonials.jsx"
          content={
            testimonialsSection
              ? `homepage testimonials heading from ${homepageSource} and reviews from ${reviews.length ? 'sanity' : 'local fallback testimonials'}`
              : `homepage reviews from ${reviews.length ? 'sanity' : 'local fallback testimonials'}`
          }
        />
        <div {...testimonialsEditAttrs}>
          <Testimonails reviews={reviews} section={testimonialsSection} />
        </div>
        {quoteSection ? (
          <>
            <DevTrace
              markup="src/components/QuoteSection.jsx"
              content={`homepage quote from ${homepageSource}`}
            />
            <div {...quoteEditAttrs}>
              <QuoteSection
                quoteText={portableTextToPlainText(quoteSection?.body) || ''}
                eyebrow={quoteSection?.eyebrow}
                attribution={quoteSection?.title}
              />
            </div>
          </>
        ) : null}
        <DevTrace
          markup="src/components/ResourcesSection.jsx"
          content={`typed homepage resource grid from ${resourcesSection ? homepageSource : 'local fallback cards'}`}
        />
        <div {...resourcesEditAttrs}>
          <ResourcesSection section={resourcesSection} />
        </div>
        <DevTrace
          markup="src/components/ConsultationSection.jsx"
          content={ctaSection ? `homepage cta from ${homepageSource}` : 'local fallback cta + live lead form'}
        />
        <ConsultationSection site={site} section={ctaSection} editAttributes={consultationEditAttrs} />
        {extraBandSections.map((section, index) =>
          renderBand(
            section,
            `homepage-band-extra-${index + 1}`,
            null,
            getSanitySectionEditAttributes(homepage, section),
          ),
        )}
      </main>
      <DevTrace markup="src/components/Footer.jsx" content="local JSX footer + service catalog links" />
      <Footer />
      {process.env.NODE_ENV === 'development' && <Agentation />}
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      ) : null}
    </>
  )
}
