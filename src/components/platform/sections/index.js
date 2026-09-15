import dynamic from 'next/dynamic'

import GuidesSection from '@/components/guides-section'

import { AboutProfileSection } from './about-profile-section'
import { BandSection } from './band-section'
import { BannerCtaSection } from './banner-cta-section'
import { CardGridSection } from './card-grid-section'
import { CaseStudyGridSection } from './case-study-grid-section'
import { CtaBannerSection } from './cta-banner-section'
import { CtaSection } from './cta-section'
import { FaqSection } from './faq-section'
import { GallerySection } from './gallery-section'
import { GuideGridSection } from './guide-grid-section'
import { HailMapSection } from './hail-map-section'
import { HeroSection } from './hero-section'
import { HyperframesSection } from './hyperframes-section'
import { PricingSection } from './pricing-section'
import { QuoteBannerSection } from './quote-banner-section'
import { RoofingLogoCloudSection } from './roofing-logo-cloud-section'
import { ScrollTextSection } from './scroll-text-section'
import { SecondaryCTASection } from './secondary-cta-section'
import { ServiceGridSection } from './service-grid-section'
import { SolarSwitchSection } from './solar-switch-section'
import { StepsSection } from './steps-section'
import { StorySection } from './story-section'
import { VideoSection } from './video-section'

/* mapbox-gl is ~1.8 MB and only reachable through this one section. */
const ServiceAreaMapSection = dynamic(() => import('./service-area-map-section'), { ssr: true })
/* Pulls in lottie-web (~298 KB) through <InstallProcess>. */
const InstallProcessSection = dynamic(() => import('./install-process-section'), { ssr: true })
const EnergyChartSection = dynamic(() => import('@/components/energy-chart-section'), { ssr: true })
const CalculatorSection = dynamic(() => import('@/components/calculator-section'), { ssr: true })
const CostsSection = dynamic(() => import('@/components/costs-section'), { ssr: true })
const IncentivesSection = dynamic(() => import('@/components/incentives-section'), { ssr: true })
const ResourcesSection = dynamic(() => import('@/components/resources-section'), { ssr: true })
const SnapshotSection = dynamic(() => import('@/components/snapshot-section'), { ssr: true })
const Testimonials = dynamic(() => import('@/components/testimonials'), { ssr: true })
const ArticleSection = dynamic(() => import('@/components/article-section'), { ssr: true })
const SolarAdoptionSection = dynamic(() => import('@/components/solar-adoption-section'), { ssr: true })
const SolarBenefitsSection = dynamic(() => import('@/components/solar-benefits-section'), { ssr: true })
const SolarDifferenceSection = dynamic(() => import('@/components/solar-difference-section'), { ssr: true })

export const sectionRenderers = {
  aboutProfile: AboutProfileSection,
  article: ArticleSection,
  band: BandSection,
  bannerCta: BannerCtaSection,
  calculator: CalculatorSection,
  caseStudyGrid: CaseStudyGridSection,
  costs: CostsSection,
  cta: CtaSection,
  ctaBanner: CtaBannerSection,
  energyChart: EnergyChartSection,
  faq: FaqSection,
  gallery: GallerySection,
  guideGrid: GuideGridSection,
  guides: GuidesSection,
  hailMap: HailMapSection,
  hero: HeroSection,
  hyperframes: HyperframesSection,
  installProcess: InstallProcessSection,
  highlights: CardGridSection,
  incentives: IncentivesSection,
  logos: RoofingLogoCloudSection,
  pricing: PricingSection,
  quote: QuoteBannerSection,
  resourceGrid: ResourcesSection,
  scrollText: ScrollTextSection,
  secondaryCTA: SecondaryCTASection,
  serviceAreaMap: ServiceAreaMapSection,
  serviceGrid: ServiceGridSection,
  solarAdoption: SolarAdoptionSection,
  solarBenefits: SolarBenefitsSection,
  solarDifference: SolarDifferenceSection,
  snapshot: SnapshotSection,
  solarSwitch: SolarSwitchSection,
  steps: StepsSection,
  story: StorySection,
  testimonials: Testimonials,
  video: VideoSection,
}

export { CtaSection, RoofingLogoCloudSection }
