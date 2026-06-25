import { Agentation } from 'agentation'

import { sectionRenderers } from '@/components/platform/sections'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { getSanityPageEditAttributes, getSanitySectionEditAttributes } from '@/lib/sanity/visualEditing'
import { CookieConsent } from '@/components/blocks/cookie-consent'

import Band from './components/band'
import CalculatorSection from './components/calculator-section'
import ConsultationSection from './components/consultation-section'
import CostsSection from './components/costs-section'
import DevTrace from './components/dev/dev-trace'
import Footer from './components/footer'
import GuidesSection from './components/guides-section'
import Header from './components/header'
import Hero from './components/hero'
import IncentivesSection from './components/incentives-section'
import QuoteSection from './components/quote-section'
import ResourcesSection from './components/resources-section'
import SnapshotSection from './components/snapshot-section'
import StorySection from './components/story-section'
import Testimonails from './components/testimonials'
import ArticleSection from './components/article-section'

export function CookieConsentWrapper() {
  return <CookieConsent variant="small" />
}

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
  const resolveSectionType = (section) => {
    if (section?.type) {
      return section.type
    }

    if (typeof section?._type === 'string' && section._type.endsWith('Section')) {
      return section._type.slice(0, -'Section'.length)
    }

    return ''
  }
  const findSection = (type, sanityType = '') =>
    homepageSections.find(
      (section) => resolveSectionType(section) === type || (sanityType && section._type === sanityType),
    ) || null
  const homepageEditAttrs = getSanityPageEditAttributes(homepage, 'sections')
  const storySection = findSection('story', 'storySection')
  const articleSection = findSection('article', 'articleSection')
  const calculatorSection = findSection('calculator', 'calculatorSection')
  const costsSection = findSection('costs', 'costsSection')
  const guidesSection = findSection('guides', 'guidesSection') || findSection('guideGrid', 'guideGridSection')
  const snapshotSection = findSection('snapshot', 'snapshotSection')
  const incentivesSection = findSection('incentives', 'incentivesSection')
  const testimonialsSection = findSection('testimonials', 'testimonialsSection')
  const quoteSection = findSection('quote', 'quoteSection')
  const ctaSection = findSection('cta', 'ctaSection')
  const bandSections = homepageSections.filter((section) => resolveSectionType(section) === 'band')
  const handledHomepageSectionTypes = new Set([
    'hero',
    'story',
    'article',
    'calculator',
    'costs',
    'guides',
    'guideGrid',
    'snapshot',
    'incentives',
    'testimonials',
    'quote',
    'cta',
    'resourceGrid',
    'resources',
    'band',
  ])
  const extraHomepageSections = homepageSections.filter((section) => {
    const sectionType = resolveSectionType(section)

    if (!sectionType) {
      return false
    }

    if (sectionType === 'cta') {
      return section !== ctaSection
    }

    return !handledHomepageSectionTypes.has(sectionType)
  })
  const firstBandSection = bandSections[0] || null
  const secondBandSection = bandSections[1] || null
  const extraBandSections = bandSections.slice(2)
  const sectionEditAttrs = (section, fallbackPath = 'sections') =>
    section ? getSanitySectionEditAttributes(homepage, section, fallbackPath) : {}
  const heroEditAttrs = getSanitySectionEditAttributes(homepage, heroSection, 'heroTitle')
  const storyEditAttrs = sectionEditAttrs(storySection)
  const articleEditAttrs = sectionEditAttrs(articleSection)
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
        note="ViewTransition wraps main content only (header/footer excluded)"
      />
      <DevTrace markup="src/components/header.jsx" content="local JSX nav and service catalog links" />
      <Header />
      <main id="main-content" {...getSanityPageEditAttributes(homepage, 'title')}>
        {heroSection ? (
          <>
            <DevTrace
              markup="src/components/hero.jsx"
              content={`local JSX hero copy + hero media from homepage record (${homepageSource})`}
            />
            <div {...heroEditAttrs}>
              <Hero heroSection={heroSection} />
            </div>
          </>
        ) : null}
        {renderBand(
          firstBandSection,
          'homepage-band-1',
          {
            colors: ['#2660AE', '#1C447F', '#0C333A', 'var(--color-secondary-alt)', 'var(--color-amber-600)'],
            maxHeight: 12,
            tint: 'var(--color-secondary-950)',
          },
          firstBandSection ? firstBandEditAttrs : homepageEditAttrs,
        )}
        <DevTrace
          markup="src/components/story-section.jsx"
          content={storySection ? `homepage story from ${homepageSource}` : 'local fallback story copy'}
        />
        <div {...storyEditAttrs}>
          <StorySection section={storySection} />
        </div>
        {articleSection ? (
          <>
            <DevTrace
              markup="src/components/article-section.jsx"
              content={`homepage article from ${homepageSource}`}
            />
            <div {...articleEditAttrs}>
              <ArticleSection section={articleSection} />
            </div>
          </>
        ) : null}
        <DevTrace
          markup="src/components/calculator-section.jsx"
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
          markup="src/components/costs-section.jsx"
          content={costsSection ? `homepage costs copy from ${homepageSource}` : 'local JSX copy'}
        />
        <div {...costsEditAttrs}>
          <CostsSection section={costsSection} />
        </div>
        <DevTrace
          markup="src/components/guides-section.jsx"
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
          markup="src/components/snapshot-section.jsx"
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
          markup="src/components/incentives-section.jsx"
          content={incentivesSection ? `homepage incentives copy from ${homepageSource}` : 'local JSX copy'}
        />
        <div {...incentivesEditAttrs}>
          <IncentivesSection section={incentivesSection} />
        </div>
        <DevTrace
          markup="src/components/testimonials.jsx"
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
              markup="src/components/quote-section.jsx"
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
          markup="src/components/resources-section.jsx"
          content={`typed homepage resource grid from ${resourcesSection ? homepageSource : 'local fallback cards'}`}
        />
        <div {...resourcesEditAttrs}>
          <ResourcesSection section={resourcesSection} />
        </div>
        <DevTrace
          markup="src/components/consultation-section.jsx"
          content={ctaSection ? `homepage cta from ${homepageSource}` : 'local fallback cta + live lead form'}
        />
        {extraHomepageSections.map((section, index) => {
          const sectionType = resolveSectionType(section)
          const Component = sectionRenderers[sectionType]
          if (!Component) {
            return null
          }

          return (
            <div
              key={`${section._key || sectionType || 'extra-homepage-section'}-${index}`}
              {...getSanitySectionEditAttributes(homepage, section)}
            >
              <Component
                page={homepage}
                section={section}
                site={site}
                sectionId={`homepage-extra-${sectionType}-${index}`}
              />
            </div>
          )
        })}
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
      <DevTrace markup="src/components/footer.jsx" content="local JSX footer + service catalog links" />
      <Footer />
      <CookieConsentWrapper />
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
