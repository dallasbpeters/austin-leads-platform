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
import { getSanityPageEditAttributes, getSanitySectionEditAttributes } from '@/lib/sanity/visualEditing'

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
  const findSection = (type) => homepageSections.find((section) => section.type === type) || null
  const homepageEditAttrs = getSanityPageEditAttributes(homepage, 'sections')
  const storySection = findSection('story')
  const calculatorSection = findSection('calculator')
  const costsSection = findSection('costs')
  const guidesSection = findSection('guides')
  const snapshotSection = findSection('snapshot')
  const incentivesSection = findSection('incentives')
  const testimonialsSection = findSection('testimonials')
  const quoteSection = findSection('quote')
  const ctaSection = findSection('cta')
  const heroEditAttrs = getSanitySectionEditAttributes(homepage, heroSection, 'heroTitle')
  const storyEditAttrs = getSanitySectionEditAttributes(homepage, storySection)
  const calculatorEditAttrs = getSanitySectionEditAttributes(homepage, calculatorSection)
  const costsEditAttrs = getSanitySectionEditAttributes(homepage, costsSection)
  const guidesEditAttrs = getSanitySectionEditAttributes(homepage, guidesSection)
  const snapshotEditAttrs = getSanitySectionEditAttributes(homepage, snapshotSection)
  const incentivesEditAttrs = getSanitySectionEditAttributes(homepage, incentivesSection)
  const testimonialsEditAttrs = getSanitySectionEditAttributes(homepage, testimonialsSection)
  const quoteEditAttrs = getSanitySectionEditAttributes(homepage, quoteSection)
  const resourcesEditAttrs = getSanitySectionEditAttributes(homepage, resourcesSection)
  const consultationEditAttrs = getSanitySectionEditAttributes(homepage, ctaSection)

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
        <div {...homepageEditAttrs}>
          <Band
            colors={['#2660AE', '#1C447F', '#0C333A', 'var(--color-secondary-alt)', 'var(--color-amber-600)']}
            tint="var(--color-secondary-950)"
            maxHeight={12}
          />
        </div>
        <DevTrace
          markup="src/components/StorySection.jsx"
          content={storySection ? `homepage story from ${homepageSource}` : 'local fallback story copy'}
        />
        <div {...storyEditAttrs}>
          <StorySection section={storySection} />
        </div>
        <DevTrace
          markup="src/components/CalculatorSection.jsx"
          content={calculatorSection ? `homepage calculator copy from ${homepageSource}` : 'local JSX copy and local calculator logic'}
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
          <GuidesSection section={guidesSection} />
        </div>
        <DevTrace
          markup="src/components/SnapshotSection.jsx"
          content={snapshotSection ? `homepage snapshot copy from ${homepageSource}` : 'local JSX copy'}
        />
        <div {...snapshotEditAttrs}>
          <SnapshotSection section={snapshotSection} />
        </div>
        <div {...homepageEditAttrs}>
          <Band />
        </div>
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
        <DevTrace
          markup="src/components/QuoteSection.jsx"
          content={quoteSection ? `homepage quote from ${homepageSource}` : 'local fallback quote content'}
        />
        <div {...quoteEditAttrs}>
          <QuoteSection
            quoteText={quoteSection?.body}
            eyebrow={quoteSection?.eyebrow}
            attribution={quoteSection?.title}
          />
        </div>
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
      </main>
      <DevTrace markup="src/components/Footer.jsx" content="local JSX footer + service catalog links" />
      <Footer />
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
