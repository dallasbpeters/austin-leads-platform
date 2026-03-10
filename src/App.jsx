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
