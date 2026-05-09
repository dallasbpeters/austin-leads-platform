import dynamic from 'next/dynamic'
import GuidesSection from '@/components/GuidesSection'

import { AboutProfileSection } from './AboutProfileSection'
import { BandSection } from './BandSection'
import { CardGridSection } from './CardGridSection'
import { CtaBannerSection } from './CtaBannerSection'
import { CtaSection } from './CtaSection'
import { FaqSection } from './FaqSection'
import { GallerySection } from './GallerySection'
import { GuideGridSection } from './GuideGridSection'
import { HailMapSection } from './HailMapSection'
import { HeroSection } from './HeroSection'
import { QuoteBannerSection } from './QuoteBannerSection'
import { RoofingLogoCloudSection } from './RoofingLogoCloudSection'
import { ScrollTextSection } from './ScrollTextSection'
import { SecondaryCTASection } from './SecondaryCTASection'
import { ServiceGridSection } from './ServiceGridSection'
import { SolarSwitchSection } from './SolarSwitchSection'
import { StepsSection } from './StepsSection'
import { StorySection } from './StorySection'

const EnergyChartSection = dynamic(() => import('@/components/EnergyChartSection'), { ssr: true })
const CalculatorSection = dynamic(() => import('@/components/CalculatorSection'), { ssr: true })
const CostsSection = dynamic(() => import('@/components/CostsSection'), { ssr: true })
const IncentivesSection = dynamic(() => import('@/components/IncentivesSection'), { ssr: true })
const ResourcesSection = dynamic(() => import('@/components/ResourcesSection'), { ssr: true })
const SnapshotSection = dynamic(() => import('@/components/SnapshotSection'), { ssr: true })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: true })

export const sectionRenderers = {
  hero: HeroSection,
  story: StorySection,
  calculator: CalculatorSection,
  costs: CostsSection,
  guides: GuidesSection,
  snapshot: SnapshotSection,
  incentives: IncentivesSection,
  testimonials: Testimonials,
  resourceGrid: ResourcesSection,
  scrollText: ScrollTextSection,
  aboutProfile: AboutProfileSection,
  secondaryCTA: SecondaryCTASection,
  quote: QuoteBannerSection,
  highlights: CardGridSection,
  guideGrid: GuideGridSection,
  serviceGrid: ServiceGridSection,
  faq: FaqSection,
  gallery: GallerySection,
  hailMap: HailMapSection,
  band: BandSection,
  logos: RoofingLogoCloudSection,
  solarSwitch: SolarSwitchSection,
  energyChart: EnergyChartSection,
  steps: StepsSection,
  cta: CtaSection,
  ctaBanner: CtaBannerSection,
}

export { RoofingLogoCloudSection }
export { CtaSection }
