import ConsultationSection from '@/components/ConsultationSection'
import DevTrace from '@/components/dev/DevTrace'
import { SchedulingForm } from '@/components/BookingForm'
import { roofingServices } from '@/lib/platform/service-catalog'
import { cleanRuntimeString } from '@/lib/sanity/stega'

import { CONSULTATION_ANCHOR_ID } from '../PublicSiteUtils'

export function CtaSection({ page, section, site, pathname, editAttributes }) {
  const pathnameSegments = (pathname || '').split('/').filter(Boolean)
  const topLevelPath = cleanRuntimeString(pathnameSegments[0])
  const serviceSlug = pathnameSegments[0] === 'services' ? cleanRuntimeString(pathnameSegments[1]) : ''
  const roofingServiceSlugs = new Set(roofingServices.map((service) => service.slug))
  const isRoofingContext =
    topLevelPath === 'roofing' ||
    topLevelPath === 'hail-damage' ||
    (topLevelPath === 'services' && roofingServiceSlugs.has(serviceSlug))
  const isChristmasLightsContext = site?.slug === 'txchristmaslights'
  const pageSlug = cleanRuntimeString(page?.slug)
  const pagePath = pageSlug ? `/${pageSlug}` : pathname || '/'

  if (isChristmasLightsContext) {
    return (
      <section id={CONSULTATION_ANCHOR_ID} className="scroll-mt-38" {...editAttributes}>
        <DevTrace
          markup="src/components/platform/sections/CtaSection.jsx"
          content="christmas lights booking form"
        />
        <SchedulingForm />
      </section>
    )
  }

  const ctaTheme = section?.theme === 'dark' ? 'dark' : 'light'
  const ctaVariant = isRoofingContext ? 'roofingInspection' : 'default'

  return (
    <>
      <DevTrace
        markup="src/components/platform/sections/CtaSection.jsx"
        content={`shared consultation section fallback for page from ${page?.source || 'fixture'}`}
      />
      <ConsultationSection
        site={site}
        section={section}
        sectionId={CONSULTATION_ANCHOR_ID}
        variant={ctaVariant}
        theme={ctaTheme}
        pagePath={pagePath}
        pageTitle={page?.title || 'Texas Solar and Roofing Pros'}
        editAttributes={editAttributes}
      />
    </>
  )
}
