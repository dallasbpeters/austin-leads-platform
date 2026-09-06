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
      className="solar-adoption"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/solar-adoption-section.jsx',
        content: 'ION-inspired roof and solar panel adoption section',
      })}
    >
      <div className="solar-adoption__inner">
        <div className="solar-adoption__intro">
          <div>
            {section?.eyebrow ? <p className="solar-adoption__eyebrow">{section.eyebrow}</p> : null}
            <h2 className="solar-adoption__title">
              {section?.title || 'Why nearly 30 million Americans have switched to solar'}
            </h2>
          </div>
          <PortableTextContent
            value={
              section?.body ||
              'Homeowners are moving to solar for more predictable energy costs, stronger home resilience, and better control over how their house uses power.'
            }
            className="solar-adoption__lede"
          />
        </div>
      </div>

      <div className="solar-adoption__scene">
        <div className="solar-adoption__roof">
          <Image src={roofImage} alt={roofAlt} fill sizes="100vw" className="solar-adoption__roof-image" />
        </div>
        <motion.div className="solar-adoption__panels" style={panelMotion}>
          <Image
            src={panelImage}
            alt={panelAlt}
            width={1200}
            height={450}
            sizes="(max-width: 900px) 96vw, 78rem"
            quality={95}
            className="solar-adoption__panels-image"
          />
        </motion.div>
        <div className="solar-adoption__fade" />
      </div>

      <AdoptionReasonCards reasons={section?.reasons} />
    </section>
  )
}

export default SolarAdoptionSection
