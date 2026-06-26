import { Fragment } from 'react'
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

const BAND1_FALLBACK_PROPS = {
  colors: ['#2660AE', '#1C447F', '#0C333A', 'var(--color-secondary-alt)', 'var(--color-amber-600)'],
  maxHeight: 12,
  tint: 'var(--color-secondary-950)',
}

const HANDLED_SECTION_TYPES = new Set([
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

function resolveSectionType(section) {
  if (section?.type) {
    return section.type
  }
  if (typeof section?._type === 'string' && section._type.endsWith('Section')) {
    return section._type.slice(0, -'Section'.length)
  }
  return ''
}

function findSection(homepageSections, type, sanityType = '') {
  return (
    homepageSections.find(
      (section) => resolveSectionType(section) === type || (sanityType && section._type === sanityType),
    ) || null
  )
}

function getSectionEditAttrs(homepage, section, fallbackPath = 'sections') {
  return section ? getSanitySectionEditAttributes(homepage, section, fallbackPath) : {}
}

function filterBandSections(homepageSections) {
  return homepageSections.filter((section) => resolveSectionType(section) === 'band')
}

function filterExtraSections(homepageSections, ctaSection) {
  return homepageSections.filter((section) => {
    const sectionType = resolveSectionType(section)
    if (!sectionType) {
      return false
    }
    if (sectionType === 'cta') {
      return section !== ctaSection
    }
    return !HANDLED_SECTION_TYPES.has(sectionType)
  })
}

const BAND_FIELD_RESOLVERS = [
  [
    'colors',
    (s, f) => {
      if (Array.isArray(s?.colors) && s.colors.length) {
        return s.colors
      }
      return f?.colors
    },
  ],
  ['tint', (s, f) => s?.tint || f?.tint],
  [
    'minHeight',
    (s, f) => {
      if (typeof s?.minHeight === 'number') {
        return s.minHeight
      }
      return f?.minHeight
    },
  ],
  [
    'maxHeight',
    (s, f) => {
      if (typeof s?.maxHeight === 'number') {
        return s.maxHeight
      }
      return f?.maxHeight
    },
  ],
  [
    'rotate',
    (s, f) => {
      if (typeof s?.rotate === 'boolean') {
        return s.rotate
      }
      return Boolean(f?.rotate)
    },
  ],
  [
    'scrollStart',
    (s, f) => {
      if (typeof s?.scrollStart === 'number') {
        return s.scrollStart
      }
      return f?.scrollStart
    },
  ],
  [
    'scrollEnd',
    (s, f) => {
      if (typeof s?.scrollEnd === 'number') {
        return s.scrollEnd
      }
      return f?.scrollEnd
    },
  ],
  [
    'reverse',
    (s, f) => {
      if (typeof s?.reverse === 'boolean') {
        return s.reverse
      }
      return Boolean(f?.reverse)
    },
  ],
  [
    'autoAnimate',
    (s, f) => {
      if (typeof s?.autoAnimate === 'boolean') {
        return s.autoAnimate
      }
      return Boolean(f?.autoAnimate)
    },
  ],
  [
    'speed',
    (s, f) => {
      if (typeof s?.speed === 'number') {
        return s.speed
      }
      return f?.speed
    },
  ],
  [
    'amplitude',
    (s, f) => {
      if (typeof s?.amplitude === 'number') {
        return s.amplitude
      }
      return f?.amplitude
    },
  ],
]

function buildBandProps(section, fallbackProps) {
  const props = {}
  for (const [key, resolve] of BAND_FIELD_RESOLVERS) {
    const value = resolve(section, fallbackProps)
    if (value !== undefined) {
      props[key] = value
    }
  }
  return props
}

function getTraceContent(section, homepageSource, fromLabel, fallbackLabel) {
  return section ? `homepage ${fromLabel} from ${homepageSource}` : `local JSX ${fallbackLabel}`
}

function renderHeroBlock(heroSection, heroEditAttrs, homepageSource) {
  if (!heroSection) {
    return null
  }
  return (
    <Fragment key="hero">
      <DevTrace
        markup="src/components/hero.jsx"
        content={`local JSX hero copy + hero media from homepage record (${homepageSource})`}
      />
      <div {...heroEditAttrs}>
        <Hero heroSection={heroSection} />
      </div>
    </Fragment>
  )
}

function renderStoryBlock(storySection, storyEditAttrs, homepageSource) {
  return (
    <Fragment key="story">
      <DevTrace
        markup="src/components/story-section.jsx"
        content={storySection ? `homepage story from ${homepageSource}` : 'local fallback story copy'}
      />
      <div {...storyEditAttrs}>
        <StorySection section={storySection} />
      </div>
    </Fragment>
  )
}

function renderArticleBlock(articleSection, articleEditAttrs, homepageSource) {
  if (!articleSection) {
    return null
  }
  return (
    <Fragment key="article">
      <DevTrace
        markup="src/components/article-section.jsx"
        content={`homepage article from ${homepageSource}`}
      />
      <div {...articleEditAttrs}>
        <ArticleSection section={articleSection} />
      </div>
    </Fragment>
  )
}

function renderSectionBlock(
  section,
  file,
  Component,
  editAttrs,
  homepageSource,
  fromLabel,
  fallbackLabel,
  extraProps,
) {
  return (
    <Fragment key={file}>
      <DevTrace
        markup={`src/components/${file}`}
        content={getTraceContent(section, homepageSource, fromLabel, fallbackLabel)}
      />
      <div {...editAttrs}>
        <Component section={section} {...extraProps} />
      </div>
    </Fragment>
  )
}

function renderQuoteBlock(quoteSection, quoteEditAttrs, homepageSource) {
  if (!quoteSection) {
    return null
  }
  return (
    <Fragment key="quote">
      <DevTrace markup="src/components/quote-section.jsx" content={`homepage quote from ${homepageSource}`} />
      <div {...quoteEditAttrs}>
        <QuoteSection
          quoteText={portableTextToPlainText(quoteSection?.body) || ''}
          eyebrow={quoteSection?.eyebrow}
          attribution={quoteSection?.title}
        />
      </div>
    </Fragment>
  )
}

function renderTestimonialsBlock(testimonialsSection, reviews, homepageSource, testimonialsEditAttrs) {
  const reviewSource = reviews.length ? 'sanity' : 'local fallback testimonials'
  const content = testimonialsSection
    ? `homepage testimonials heading from ${homepageSource} and reviews from ${reviewSource}`
    : `homepage reviews from ${reviewSource}`
  return (
    <Fragment key="testimonials">
      <DevTrace markup="src/components/testimonials.jsx" content={content} />
      <div {...testimonialsEditAttrs}>
        <Testimonails reviews={reviews} section={testimonialsSection} />
      </div>
    </Fragment>
  )
}

function renderExtraSections(extraHomepageSections, homepage, site) {
  return extraHomepageSections.map((section, index) => {
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
  })
}

function renderExtraBandSections(extraBandSections, homepage) {
  return extraBandSections.map((section, index) => {
    const bandProps = buildBandProps(section, null)
    return (
      <div key={`homepage-band-extra-${index + 1}`} {...getSanitySectionEditAttributes(homepage, section)}>
        <Band {...bandProps} sectionId={`homepage-band-extra-${index + 1}`} />
      </div>
    )
  })
}

function renderBandBlock(section, sectionId, fallbackProps, editAttributes) {
  const hasSectionConfig = Boolean(section)
  if (!hasSectionConfig && !fallbackProps) {
    return null
  }
  const bandProps = buildBandProps(section, fallbackProps)
  return (
    <div {...editAttributes}>
      <Band {...bandProps} sectionId={sectionId} />
    </div>
  )
}

function getResourcesContent(resourcesSection, homepageSource) {
  return `typed homepage resource grid from ${resourcesSection ? homepageSource : 'local fallback cards'}`
}

function getConsultationContent(ctaSection, homepageSource) {
  return ctaSection ? `homepage cta from ${homepageSource}` : 'local fallback cta + live lead form'
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
  const storySection = findSection(homepageSections, 'story', 'storySection')
  const articleSection = findSection(homepageSections, 'article', 'articleSection')
  const calculatorSection = findSection(homepageSections, 'calculator', 'calculatorSection')
  const costsSection = findSection(homepageSections, 'costs', 'costsSection')
  const guidesSection =
    findSection(homepageSections, 'guides', 'guidesSection') ||
    findSection(homepageSections, 'guideGrid', 'guideGridSection')
  const snapshotSection = findSection(homepageSections, 'snapshot', 'snapshotSection')
  const incentivesSection = findSection(homepageSections, 'incentives', 'incentivesSection')
  const testimonialsSection = findSection(homepageSections, 'testimonials', 'testimonialsSection')
  const quoteSection = findSection(homepageSections, 'quote', 'quoteSection')
  const ctaSection = findSection(homepageSections, 'cta', 'ctaSection')

  const bandSections = filterBandSections(homepageSections)
  const firstBandSection = bandSections[0] || null
  const secondBandSection = bandSections[1] || null
  const extraBandSections = bandSections.slice(2)
  const extraHomepageSections = filterExtraSections(homepageSections, ctaSection)

  const storyEditAttrs = getSectionEditAttrs(homepage, storySection)
  const articleEditAttrs = getSectionEditAttrs(homepage, articleSection)
  const calculatorEditAttrs = getSectionEditAttrs(homepage, calculatorSection)
  const costsEditAttrs = getSectionEditAttrs(homepage, costsSection)
  const guidesEditAttrs = getSectionEditAttrs(homepage, guidesSection)
  const snapshotEditAttrs = getSectionEditAttrs(homepage, snapshotSection)
  const incentivesEditAttrs = getSectionEditAttrs(homepage, incentivesSection)
  const testimonialsEditAttrs = getSectionEditAttrs(homepage, testimonialsSection)
  const quoteEditAttrs = getSectionEditAttrs(homepage, quoteSection)
  const resourcesEditAttrs = getSectionEditAttrs(homepage, resourcesSection)
  const consultationEditAttrs = getSectionEditAttrs(homepage, ctaSection)

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
        {renderHeroBlock(
          heroSection,
          getSectionEditAttrs(homepage, heroSection, 'heroTitle'),
          homepageSource,
        )}
        {renderBandBlock(
          firstBandSection,
          'homepage-band-1',
          BAND1_FALLBACK_PROPS,
          firstBandSection
            ? getSectionEditAttrs(homepage, firstBandSection)
            : getSanityPageEditAttributes(homepage, 'sections'),
        )}
        {renderStoryBlock(storySection, storyEditAttrs, homepageSource)}
        {renderArticleBlock(articleSection, articleEditAttrs, homepageSource)}
        {renderSectionBlock(
          calculatorSection,
          'calculator-section.jsx',
          CalculatorSection,
          calculatorEditAttrs,
          homepageSource,
          'calculator copy',
          'copy and local calculator logic',
        )}
        {renderSectionBlock(
          costsSection,
          'costs-section.jsx',
          CostsSection,
          costsEditAttrs,
          homepageSource,
          'costs copy',
          'copy',
        )}
        {renderSectionBlock(
          guidesSection,
          'guides-section.jsx',
          GuidesSection,
          guidesEditAttrs,
          homepageSource,
          'guides framing copy + guide cards from guides library',
          'section + guide cards from guides library',
          { page: homepage },
        )}
        {renderSectionBlock(
          snapshotSection,
          'snapshot-section.jsx',
          SnapshotSection,
          snapshotEditAttrs,
          homepageSource,
          'snapshot copy',
          'copy',
        )}
        {renderBandBlock(
          secondBandSection,
          'homepage-band-2',
          {},
          secondBandSection
            ? getSectionEditAttrs(homepage, secondBandSection)
            : getSanityPageEditAttributes(homepage, 'sections'),
        )}
        {renderSectionBlock(
          incentivesSection,
          'incentives-section.jsx',
          IncentivesSection,
          incentivesEditAttrs,
          homepageSource,
          'incentives copy',
          'copy',
        )}
        {renderTestimonialsBlock(testimonialsSection, reviews, homepageSource, testimonialsEditAttrs)}
        {renderQuoteBlock(quoteSection, quoteEditAttrs, homepageSource)}
        <DevTrace
          markup="src/components/resources-section.jsx"
          content={getResourcesContent(resourcesSection, homepageSource)}
        />
        <div {...resourcesEditAttrs}>
          <ResourcesSection section={resourcesSection} />
        </div>
        <DevTrace
          markup="src/components/consultation-section.jsx"
          content={getConsultationContent(ctaSection, homepageSource)}
        />
        {renderExtraSections(extraHomepageSections, homepage, site)}
        <ConsultationSection site={site} section={ctaSection} editAttributes={consultationEditAttrs} />
        {renderExtraBandSections(extraBandSections, homepage)}
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
