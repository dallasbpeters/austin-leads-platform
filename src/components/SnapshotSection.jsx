import * as IconoirIcons from 'iconoir-react'
import { Wallet, StatUp, Leaf, Clock } from 'iconoir-react'

import Card from './Card'
import { getDevSectionAttributes } from './dev/DevTrace'
import PortableTextContent from './PortableTextContent'

const items = [
  {
    icon: 'solar:wallet-money-linear',
    value: '$18k-$28k',
    copy: 'Typical residential solar range before credits and roof-related adders',
  },
  {
    icon: 'solar:chart-square-linear',
    value: '10+ years',
    copy: 'Roof age is where insurance and timing questions usually start',
  },
  {
    icon: 'solar:leaf-linear',
    value: '2 years',
    copy: 'A common claim window for detach-and-reset conversations after roof work',
  },
  {
    icon: 'solar:history-linear',
    value: '7–9 years',
    copy: 'Typical solar payback range once the roof plan is already solid',
  },
]

const iconifyFallbackIconMap = {
  'solar:wallet-money-linear': Wallet,
  'solar:chart-square-linear': StatUp,
  'solar:leaf-linear': Leaf,
  'solar:history-linear': Clock,
}

function inferSnapshotIcon(item) {
  const text = `${item?.value || ''} ${item?.copy || ''}`.toLowerCase()

  if (text.includes('payback') || text.includes('savings') || text.includes('$')) return Wallet
  if (text.includes('year') || text.includes('timeline') || text.includes('window')) return Clock
  if (text.includes('roof') || text.includes('claim') || text.includes('insurance')) return StatUp
  if (text.includes('solar') || text.includes('energy')) return Leaf

  return StatUp
}

export default function SnapshotSection({ section = null, sectionId = 'texas-snapshot' }) {
  const eyebrow = section?.eyebrow || 'Texas Snapshot'
  const title = section?.title || 'The numbers people usually ask for.'
  const body =
    section?.body ||
    "Most homeowners walk into their first quote with zero frame of reference. These are the cost ranges, timelines, and coverage benchmarks we see on Central Texas projects — so you're not starting from scratch. Your numbers will vary based on roof size, material, and carrier, but at least you'll know what ballpark you're in."
  const resolvedItems = section?.items?.length
    ? section.items.map((item, index) => ({
        icon: item.icon || items[index]?.icon || 'solar:wallet-money-linear',
        value: item.number || item.title,
        copy: item.body || items[index]?.copy || '',
      }))
    : items

  const renderIcon = (item) => {
    const iconName = item?.icon

    if (!iconName) {
      const InferredIcon = inferSnapshotIcon(item)
      return <InferredIcon className="size-6" strokeWidth={2} />
    }

    // Support legacy iconify ids and Iconoir PascalCase names from Sanity.
    if (iconName.includes(':')) {
      const Icon = iconifyFallbackIconMap[iconName] || inferSnapshotIcon(item)
      return <Icon className="size-6" strokeWidth={2} />
    }

    const Icon = IconoirIcons[iconName] || inferSnapshotIcon(item)
    return <Icon className="size-6" strokeWidth={2} />
  }

  return (
    <section
      className="relative overflow-hidden bg-cyan-950 py-24 text-white"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/SnapshotSection.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="400"
          height="400"
          viewBox="0 0 24 24"
          className="absolute top-10 left-[10%] h-100 w-100"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="6"></circle>
            <path
              strokeLinecap="round"
              d="M12 2v1m0 18v1m10-10h-1M3 12H2m17.07-7.07l-.392.393M5.322 18.678l-.393.393m14.141-.001l-.392-.393M5.322 5.322l-.393-.393"
            ></path>
          </g>
        </svg>
      </div>

      <div className="relative z-1 mx-auto w-[min(80rem,calc(100%-3rem))]">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-primary type-accent mb-4 text-sm font-semibold tracking-[0.2em] uppercase">
            {eyebrow}
          </p>
          <h2 className="mb-4 text-[clamp(1.875rem,4vw,2.25rem)]">{title}</h2>
          <PortableTextContent
            as="div"
            value={body}
            className="type-accent m-0 text-[1rem] font-semibold text-white/70"
          />
        </div>

        <div className="grid gap-6 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1 md:grid-cols-4">
          {resolvedItems.map((item) => (
            <Card key={item.value} className="p-8" variant="darkGlass">
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                {renderIcon(item)}
              </div>
              <div className="type-accent mb-2 text-[1.875rem] font-bold">{item.value}</div>
              <PortableTextContent
                as="div"
                value={item.copy}
                className="type-accent text-sm leading-6 font-semibold text-white/60"
              />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
