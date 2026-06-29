// oxlint-disable func-style
import Image from 'next/image'

import { Marquee } from '@/components/magicui/marquee'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

const defaultLogos = [
  {
    key: 'gaf-commercial',
    src: '/images/GAF+Commercial+logo-1920w.webp',
    alt: 'GAF Commercial',
    width: 300,
    height: 300,
  },
  {
    key: 'gaf-master-elite',
    src: '/images/GAF+Master+Elite+Residential+Logo-1920w.webp',
    alt: 'Accredited Solar Contractor',
    width: 300,
    height: 300,
  },
  {
    key: 'iko-roofselect',
    src: '/images/IKO+RoofSelect+logo-1920w.webp',
    alt: 'IKO RoofSelect',
    width: 734,
    height: 716,
  },
  {
    key: 'rcat-members',
    src: '/images/RCAT+Members+logo-1920w.png',
    alt: 'RCAT Members',
    width: 600,
    height: 333,
  },
  {
    key: 'tamko-pro',
    src: '/images/Tamko+Pro+logo-1920w.webp',
    alt: 'Tamko Pro',
    width: 768,
    height: 1020,
  },
  {
    key: 'rsra-committee-member',
    src: '/images/RSRA+Main+Logo+Black+and+Gold+Clear+Background+-+Committee+Member-1920w.webp',
    alt: 'RSRA Committee Member',
    width: 1920,
    height: 1920,
  },
]

function resolveLogoKey(item, index) {
  return item?._key || item?.title || `logo-${index + 1}`
}

function resolveLogoDimensions(imageAsset) {
  return imageAsset?.asset?.metadata?.dimensions
}

function normalizeLogoItem(item, index) {
  const imageAsset = item?.imageAsset
  const image = item?.image
  const src = getImageUrl(imageAsset, image)
  if (!src) {
    return null
  }

  const dims = resolveLogoDimensions(imageAsset)
  return {
    key: resolveLogoKey(item, index),
    src,
    alt: getImageAlt(imageAsset, image, item?.title || `Logo ${index + 1}`),
    href: item?.href || '',
    width: dims?.width || 600,
    height: dims?.height || 300,
  }
}

const LogoCloud = ({ items = null }) => {
  const hasCustomItems = Array.isArray(items) && items.length > 0
  const logos = hasCustomItems ? items.map(normalizeLogoItem).filter(Boolean) : defaultLogos

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 md:px-6">
      <Marquee
        pauseOnHover
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-16 px-4">
          {logos.map((logo) => {
            const image = (
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-24 w-auto object-contain mix-blend-screen"
                style={hasCustomItems ? { height: '46px' } : undefined}
              />
            )

            if (!logo.href) {
              return <div key={logo.key}>{image}</div>
            }

            return (
              <a
                key={logo.key}
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                {image}
              </a>
            )
          })}
        </div>
      </Marquee>
    </div>
  )
}

export default LogoCloud
