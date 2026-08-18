import { HomeShield, SunLight, Thunderstorm } from 'iconoir-react'
import { iconoirRegistry } from './iconoir-registry'
import Image from 'next/image'
import Link from 'next/link'

import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'

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

const iconMap = {
  'solar:map-point-linear': Thunderstorm,
  'solar:home-linear': HomeShield,
  'solar:wad-of-money-linear': SunLight,
  thunderstorm: Thunderstorm,
  hail: Thunderstorm,
  roofing: HomeShield,
  solar: SunLight,
  sunlight: SunLight,
}

const getResourceIcon = (iconName) => {
  return iconMap[iconName] || iconoirRegistry[iconName] || null
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
  const showClouds =
    section?.cloudVisibility !== 'hide' &&
    section?.cloudVisibility !== 'off' &&
    section?.cloudVisibility !== false

  return (
    <CloudSectionBackground
      className="cloud-theme-section--editorial relative isolate overflow-hidden py-24"
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
      <div className="relative z-1 mx-auto w-[min(80rem,calc(100%-3rem))]">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="cloud-theme-section__heading type-accent m-0 text-[clamp(1.875rem,4vw,2.25rem)]">
            {title}
          </h2>
          <PortableTextContent
            as="div"
            value={body}
            className="cloud-theme-section__body type-accent m-0 text-[clamp(1rem,4vw,1.25rem)]"
          />
        </div>

        <div className="grid gap-6 max-[900px]:grid-cols-1 md:grid-cols-3">
          {items.map((item) => {
            const Icon = getResourceIcon(item.icon) || inferResourceIcon(item)

            return (
              <Link key={item.title} href={item.href}>
                <Card className="relative aspect-square" variant="media" radius="lg">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={700}
                    height={700}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-charade),rgba(11,59,66,0.2),transparent)]"></div>
                  <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Icon className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div className="type-accent text-[1.875rem] leading-[1.1] font-bold">{item.title}</div>
                    <PortableTextContent
                      as="div"
                      value={item.copy}
                      className="mt-1 text-sm font-semibold text-white/70"
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
