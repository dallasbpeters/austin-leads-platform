import Card from './Card'
import { HomeSimple } from 'iconoir-react'
import * as IconoirIcons from 'iconoir-react'
import { getDevSectionAttributes } from './dev/DevTrace'

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

export default function SnapshotSection({ section = null, sectionId = 'texas-snapshot', editAttributes = {} }) {
  const eyebrow = section?.eyebrow || 'Texas Snapshot'
  const title = section?.title || 'The numbers people usually ask for.'
  const body =
    section?.body ||
    "Most homeowners walk into their first quote with zero frame of reference. These are the cost ranges, timelines, and coverage benchmarks we see on Central Texas projects — so you're not starting from scratch. Your numbers will vary based on roof size, material, and carrier, but at least you'll know what ballpark you're in."
  const resolvedItems =
    section?.items?.length
      ? section.items.map((item, index) => ({
          icon: item.icon || items[index]?.icon || 'solar:wallet-money-linear',
          value: item.number || item.title,
          copy: item.body || items[index]?.copy || '',
        }))
      : items

  const renderIcon = (iconName) => {
    if (!iconName) {
      return <HomeSimple className="size-6" strokeWidth={2} />
    }

    // Support iconify ids (e.g. "solar:wallet-money-linear") and Iconoir PascalCase names from Sanity.
    if (iconName.includes(':')) {
      return <iconify-icon icon={iconName} className="text-xl" />
    }

    const Icon = IconoirIcons[iconName] || HomeSimple
    return <Icon className="size-6" strokeWidth={2} />
  }

  return (
    <section
      className="relative py-24 text-white bg-cyan-950 overflow-hidden"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/SnapshotSection.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="absolute opacity-10 inset-0 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="400"
          height="400"
          viewBox="0 0 24 24"
          className="absolute h-100 w-100 left-[10%] top-10"
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

      <div className="relative w-[min(80rem,calc(100%-3rem))] mx-auto z-1">
        <div className="max-w-3xl mb-16 mx-auto text-center">
          <p className="mb-4 font-semibold text-primary text-sm tracking-[0.2em] type-accent uppercase">
            {eyebrow}
          </p>
          <h2 className="mb-4 text-[clamp(1.875rem,4vw,2.25rem)]">{title}</h2>
          <p className="m-0 font-semibold text-base text-white/70 type-accent">
            {body}
          </p>
        </div>

        <div className="grid gap-6 max-[640px]:grid-cols-1 max-[900px]:grid-cols-2 md:grid-cols-4">
          {resolvedItems.map((item) => (
            <Card key={item.value} className="p-8" variant="darkGlass">
              <div className="items-center justify-center h-10 w-10 mb-6 text-white bg-white/10 rounded-full inline-flex">
                {renderIcon(item.icon)}
              </div>
              <div className="mb-2 font-bold text-[1.875rem] type-accent">{item.value}</div>
              <div className="font-semibold leading-6 text-sm text-white/60 type-accent">{item.copy}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
