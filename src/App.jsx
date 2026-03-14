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

export default function App({
  heroSection = null,
  resourcesSection = null,
  reviews = [],
  site = null,
  jsonLd = null,
  homepageSource = 'fixture',
}) {
  return (
    <>
      <DevTrace
        markup="src/App.jsx"
        content="homepage composition shell"
        note="route-level ViewTransition lives in src/app/(site)/layout.jsx"
      />
      <DevTrace markup="src/components/Header.jsx" content="local JSX nav and service catalog links" />
      <Header />
      <main>
        <DevTrace
          markup="src/components/Hero.jsx"
          content={`local JSX hero copy + hero media from homepage record (${homepageSource})`}
        />
        <Hero heroSection={heroSection} />
        <Band
          colors={['#2660AE', '#1C447F', '#0C333A', 'var(--color-secondary-alt)', 'var(--color-amber-600)']}
          tint="var(--color-secondary-950)"
          maxHeight={12}
        />
        <DevTrace markup="src/components/StorySection.jsx" content="local JSX copy" />
        <StorySection />
        <DevTrace
          markup="src/components/CalculatorSection.jsx"
          content="local JSX copy and local calculator logic"
        />
        <CalculatorSection />
        <DevTrace markup="src/components/CostsSection.jsx" content="local JSX copy" />
        <CostsSection />
        <DevTrace
          markup="src/components/GuidesSection.jsx"
          content="local JSX section + guide cards from guides library"
        />
        <GuidesSection />
        <DevTrace markup="src/components/SnapshotSection.jsx" content="local JSX copy" />
        <SnapshotSection />
        <Band />
        <DevTrace markup="src/components/IncentivesSection.jsx" content="local JSX copy" />
        <IncentivesSection />
        <DevTrace
          markup="src/components/Testimonials.jsx"
          content={`homepage reviews from ${reviews.length ? 'sanity' : 'local fallback testimonials'}`}
        />
        <Testimonails reviews={reviews} />
        <DevTrace markup="src/components/QuoteSection.jsx" content="local JSX quote content" />
        <QuoteSection />
        <DevTrace
          markup="src/components/ResourcesSection.jsx"
          content={`typed homepage resource grid from ${resourcesSection ? homepageSource : 'local fallback cards'}`}
        />
        <ResourcesSection section={resourcesSection} />
        <DevTrace
          markup="src/components/ConsultationSection.jsx"
          content="local JSX section + live lead form"
        />
        <ConsultationSection site={site} />
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
