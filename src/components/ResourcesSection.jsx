import { HomeShield, HomeSimple, SunLight, Thunderstorm } from 'iconoir-react'
import * as IconoirIcons from 'iconoir-react'
import Image from 'next/image'
import { getImageAlt, getImageUrl } from '@/lib/platform/imageSource'
import Card from './Card'
import { getDevSectionAttributes } from './dev/DevTrace'
import PortableTextContent from './PortableTextContent'
import Link from 'next/link'

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

function getResourceIcon(iconName) {
  return iconMap[iconName] || IconoirIcons[iconName] || null
}

function inferResourceIcon(item) {
  const text = `${item?.title || ''} ${item?.copy || ''} ${item?.href || ''}`.toLowerCase()

  if (text.includes('hail') || text.includes('storm')) return Thunderstorm
  if (text.includes('roof') || text.includes('insurance') || text.includes('claim')) return HomeShield
  if (text.includes('solar') || text.includes('savings') || text.includes('incentive')) return SunLight

  return HomeShield
}

function normalizeItems(section) {
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

export default function ResourcesSection({ section = null, sectionId = 'resources', editAttributes = {} }) {
  const items = normalizeItems(section)
  const title = section?.title || 'Start with what you need help with'
  const body =
    section?.body ||
    'The most common solar and roofing questions, organized by category so you can find what you need faster.'

  return (
    <section
      className="py-24 bg-warm"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/ResourcesSection.jsx',
        content: section?.items?.length
          ? 'typed homepage resource grid from homepage record'
          : 'local fallback resource cards',
      })}
      style={{
        backgroundImage:
          'linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-[min(80rem,calc(100%-3rem))] mx-auto">
        <div className="max-w-3xl mb-16 mx-auto text-center">
          <h2 className="m-0 text-[clamp(1.875rem,4vw,2.25rem)] text-secondary type-accent">{title}</h2>
          <PortableTextContent as="div" value={body} className="m-0 text-[clamp(1rem,4vw,1.25rem)] text-foreground type-accent" />
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
                    className="absolute h-full w-full duration-500 transition-transform inset-0 object-cover hover:scale-105"
                  />
                  <div className="absolute bg-[linear-gradient(to_top,rgba(11,59,66,0.9),rgba(11,59,66,0.2),transparent)] inset-0"></div>
                  <div className="absolute p-8 text-white bottom-0 inset-x-0">
                    <div className="items-center justify-center h-14 w-14 mb-4 bg-white/20 rounded-full backdrop-blur-sm inline-flex">
                      <Icon className="h-8 w-8" strokeWidth={2} />
                    </div>
                    <div className="font-bold leading-[1.1] text-[1.875rem] type-accent">{item.title}</div>
                    <PortableTextContent as="div" value={item.copy} className="mt-1 font-semibold text-sm text-white/70" />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
