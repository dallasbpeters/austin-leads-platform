import dynamic from 'next/dynamic'
import { Fragment } from 'react'

import { CookieConsent } from '@/components/blocks/cookie-consent'
import { getSectionDomId } from '@/components/platform/public-site-utils'
import { sectionRenderers } from '@/components/platform/sections'
import SectionSurface from '@/components/platform/sections/section-surface'

import { getSanityPageEditAttributes, getSanitySectionEditAttributes } from '@/lib/sanity/visualEditing'
import ConsultationSection from './components/consultation-section'
import DevTrace from './components/dev/dev-trace'
import Footer from './components/footer'
import Header from './components/header'
import Hero from './components/hero'

export function CookieConsentWrapper() {
  return <CookieConsent variant="small" />
}

function resolveSectionType(section) {
  if (section?.type) {
    return section.type
  }
  if (typeof section?._type === 'string' && section._type.endsWith('Section')) {
    return section._type.slice(0, -'Section'.length)
  }
  return ''
}

/* Development-only: a static import bundles ~414 KB into production builds
 * even though the NODE_ENV guard removes the element. */
const Agentation =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('agentation').then((mod) => mod.Agentation))
    : () => null

export default function App({
  homepage = null,
  heroSection = null,
  reviews = [],
  caseStudies = [],
  site = null,
  navigation = [],
  jsonLd = null,
  homepageSource = 'fixture',
}) {
  const homepageSections = homepage?.sections || []

  // Determine whether the hero section is already inside the sections array.
  // If it is, it renders at its array position (no separate hero block).
  // If it's not (e.g. from heroHomepage or page-level hero fields), prepend it.
  const heroAlreadyInSections =
    heroSection &&
    (homepageSections.some((s) => resolveSectionType(s) === 'hero') ||
      homepageSections.some((s) => s._key && heroSection._key && s._key === heroSection._key))

  return (
    <>
      <DevTrace
        markup="src/App.jsx"
        content="homepage composition shell (order-driven from Sanity sections array)"
        note="ViewTransition wraps main content only (header/footer excluded)"
      />
      <DevTrace markup="src/components/header.jsx" content="Sanity site navigation with fallback links" />
      <Header navigation={navigation} />
      <main id="main-content" {...getSanityPageEditAttributes(homepage, 'title')}>
        {/* Hero: render first ONLY if it is NOT already in the sections array */}
        {!heroAlreadyInSections && heroSection ? (
          <Fragment key="hero">
            <DevTrace
              markup="src/components/hero.jsx"
              content={`homepage hero from ${homepageSource} (outside sections array)`}
            />
            <div {...getSanitySectionEditAttributes(homepage, heroSection, 'heroTitle')}>
              <Hero heroSection={heroSection} />
            </div>
          </Fragment>
        ) : null}

        {/* All sections rendered in Sanity array order */}
        {homepageSections.map((section, index) => {
          const sectionType = resolveSectionType(section)
          const Component = sectionRenderers[sectionType]
          if (!Component) {
            return null
          }

          const sectionId = getSectionDomId(section, index)
          const editAttrs = getSanitySectionEditAttributes(homepage, section)

          return (
            <div key={section._key || `${sectionType}-${index}`} {...editAttrs}>
              <DevTrace
                markup={`src/components/platform/sections/${sectionType}-section`}
                content={`homepage section "${sectionType}" at array index ${index} from ${homepageSource}`}
              />
              <SectionSurface section={section}>
                <Component
                  page={homepage}
                  section={section}
                  site={site}
                  reviews={reviews}
                  caseStudies={caseStudies}
                  sectionId={sectionId}
                  editAttributes={editAttrs}
                />
              </SectionSurface>
            </div>
          )
        })}

        {/* Consultation footer: only as fallback when no CTA section in the array */}
        {!homepageSections.some((s) => resolveSectionType(s) === 'cta') ? (
          <Fragment key="cta-fallback">
            <DevTrace
              markup="src/components/consultation-section.jsx"
              content="default consultation footer (no CTA section in array)"
            />
            <ConsultationSite site={site} />
          </Fragment>
        ) : null}
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

// Wraps ConsultationSection with the props it actually needs
function ConsultationSite({ site }) {
  return <ConsultationSection site={site} section={null} />
}
