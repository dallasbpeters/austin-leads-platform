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

export default function App({ heroSection = null }) {
  return (
    <>
      <Header />
      <main>
        <Hero heroSection={heroSection} />
        <Band colors={['#2660AE', '#1C447F', '#0C333A', 'var(--color-amber-400)', 'var(--color-amber-600)']} tint="#1C2432" />
        <StorySection />
        <CalculatorSection />
        <CostsSection />
        <GuidesSection />
        <SnapshotSection />
        <Band />
        <IncentivesSection />
        <ResourcesSection />
        <ConsultationSection />
      </main>
      <Footer />
    </>
  )
}
