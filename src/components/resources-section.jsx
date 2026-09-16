import { resolveIconoirIcon } from '@/lib/resolve-icon'
import { HomeShield, SunLight, Thunderstorm } from 'iconoir-react'
import Image from 'next/image'
import Link from 'next/link'

import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

import { shouldShowClouds } from '@/lib/platform/section-helpers'
import Card from './card'
import CloudSectionBackground from './cloud-section-background'
import { getDevSectionAttributes } from './dev/dev-trace'
import PortableTextContent from './portable-text-content'

const defaultItems = [
  {
    icon: 'hail',
    title: 'Hail Damage',
    copy: 'Storm history, roof damage signs, and what to do after a hail event',
    href: '/hail-damage',
    image: 'https://images.unsplash.com/photo-1673140511598-2f23d9fec5dd?w=800&q=80',
    alt: 'Storm clouds over Texas',
  },
  {
    icon: 'roofing',
    title: 'Roofing + Insurance',
    copy: 'Roof age, claim language, and the insurance details that change the job',
    href: '/insurance-basics',
    image: 'https://images.unsplash.com/photo-1668097613572-40b7c11c8727?w=800&q=80',
    alt: 'Roofline in sunlight',
  },
  {
    icon: 'solar',
    title: 'Solar + Savings',
    copy: 'System cost, savings, incentives, and whether solar pencils out',
    href: '/solar-costs',
    image: 'https://images.unsplash.com/photo-1604177420682-0c840feb01de?w=800&q=80',
    alt: 'Rooftop work in progress',
  },
]

const getResourceIcon = (iconName) => {
  return resolveIconoirIcon(iconName)
}

const inferResourceIcon = (item) => {
  const text = `${item?.title || ''} ${item?.copy || ''} ${item?.href || ''}`.toLowerCase()

  if (text.includes('hail') || text.includes('storm')) {
    return Thunderstorm
  }
  if (text.includes('roof') || text.includes('insurance') || text.includes('claim')) {
    return HomeShield
  }
  if (text.includes('solar') || text.includes('savings') || text.includes('incentive')) {
    return SunLight
  }

  return HomeShield
}

const normalizeItems = (section) => {
  if (!section?.items?.length) {
    return defaultItems
  }

  return section.items.map((item, index) => ({
    icon: item.icon || defaultItems[index]?.icon || 'roofing',
    title: item.title,
    body: item.body,
    copy: item.body || item.answer || '',
    href: item.href || '#consultation',
    image: getImageUrl(item.imageAsset, item.image) || defaultItems[index]?.image,
    alt: getImageAlt(item.imageAsset, item.image, item.title) || defaultItems[index]?.alt || item.title,
  }))
}

export default function ResourcesSection({ section = null, sectionId = 'resources' }) {
  const items = normalizeItems(section)
  const title = section?.title || 'Start with what you need help with'
  const body =
    section?.body ||
    'The most common solar and roofing questions, organized by category so you can find what you need faster.'
  const showClouds = shouldShowClouds(section?.cloudVisibility)

  return (
    <CloudSectionBackground
      className="resources cloud-theme-section--editorial"
      density="thick"
      showClouds={showClouds}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/resources-section.jsx',
        content: section?.items?.length
          ? 'typed homepage resource grid from homepage record'
          : 'local fallback resource cards',
      })}
    >
      <div className="resources__shell">
        <div className="resources__intro">
          <h2 className="resources__title text-fluid-500 cloud-theme-section__heading">{title}</h2>
          <PortableTextContent
            as="div"
            value={body}
            className="resources__body text-fluid-200 cloud-theme-section__body"
          />
        </div>

        <div className="resources__grid">
          {items.map((item) => {
            const Icon = getResourceIcon(item.icon) || inferResourceIcon(item)

            return (
              <Link key={item.title} href={item.href}>
                <Card className="resources__card" variant="media" radius="lg">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={700}
                    height={700}
                    className="resources__image"
                  />
                  <div className="resources__wash"></div>
                  <div className="resources__copy">
                    <div className="resources__icon">
                      <Icon className="resources__icon-svg" strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div className="resources__card-title text-size-400">{item.title}</div>
                    <PortableTextContent
                      as="div"
                      value={item.copy}
                      className="resources__card-copy text-size-90"
                    />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </CloudSectionBackground>
  )
}
