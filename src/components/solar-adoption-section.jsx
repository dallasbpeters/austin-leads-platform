'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

import AdoptionReasonCards from '@/components/adoption-reason-cards'
import { getDevSectionAttributes } from '@/components/dev/dev-trace'
import PortableTextContent from '@/components/portable-text-content'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

const FALLBACK_ROOF_IMAGE = '/images/shingle-roof.png'
const FALLBACK_PANEL_IMAGE = '/images/solar-panel-array.png'

const resolveImage = (assetField, fallbackField, fallbackUrl) =>
  getImageUrl(assetField, fallbackField, { width: 1800 }) || fallbackUrl

const SolarAdoptionSection = ({ section = null, sectionId = 'solar-adoption' }) => {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'end 72%'],
  })
  const panelMotion = {
    y: useTransform(scrollYProgress, [0, 0.72, 1], [-220, -20, 0]),
    scale: useTransform(scrollYProgress, [0, 1], [0.92, 1]),
    opacity: useTransform(scrollYProgress, [0, 0.22, 1], [0.68, 0.9, 1]),
    transition: { ease: 'easeInOut', duration: 0.4 },
  }

  const roofImage = resolveImage(section?.roofImageAsset, section?.roofImage, FALLBACK_ROOF_IMAGE)
  const roofAlt = getImageAlt(section?.roofImageAsset, section?.roofImage, 'Dark shingle roof')
  const panelImage = resolveImage(section?.panelImageAsset, section?.panelImage, FALLBACK_PANEL_IMAGE)
  const panelAlt = getImageAlt(section?.panelImageAsset, section?.panelImage, 'Residential solar panel array')

  return (
    <section
      ref={sectionRef}
      className="bg-background text-foreground"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/solar-adoption-section.jsx',
        content: 'ION-inspired roof and solar panel adoption section',
      })}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-10 sm:px-6 lg:px-8 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.66fr)_minmax(18rem,0.34fr)] lg:items-start">
          <div>
            {section?.eyebrow ? (
              <p className="text-primary-foreground/40 mb-5 text-xs font-semibold tracking-[0.24em] uppercase">
                {section.eyebrow}
              </p>
            ) : null}
            <h2 className="type-accent text-foreground m-0 max-w-4xl text-[clamp(3.1rem,4vw,6.75rem)] leading-[0.92] font-black text-balance">
              {section?.title || 'Why nearly 30 million Americans have switched to solar'}
            </h2>
          </div>
          <PortableTextContent
            value={
              section?.body ||
              'Homeowners are moving to solar for more predictable energy costs, stronger home resilience, and better control over how their house uses power.'
            }
            className="text-primary-foreground/40 max-w-md pt-2 text-lg leading-8 lg:pt-12"
          />
        </div>
      </div>

      <div className="relative min-h-55 sm:min-h-140 lg:min-h-165">
        <div className="absolute inset-x-0 bottom-0 h-[56%]">
          <Image src={roofImage} alt={roofAlt} fill sizes="100vw" className="object-cover object-top" />
        </div>
        <motion.div
          className="absolute inset-x-0 bottom-[7%] mx-auto w-[min(110rem,96vw)] will-change-transform"
          style={panelMotion}
        >
          <Image
            src={panelImage}
            alt={panelAlt}
            width={1200}
            height={450}
            sizes="(max-width: 900px) 96vw, 78rem"
            quality={95}
            className="mx-auto h-auto w-full"
          />
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-25 bg-linear-to-b from-transparent to-black" />
      </div>

      <AdoptionReasonCards reasons={section?.reasons} />
    </section>
  )
}

export default SolarAdoptionSection
