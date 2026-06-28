import PortableTextContent from '@/components/portable-text-content'
import { buildRuntimeKey } from '@/lib/sanity/stega'
import { resolveIconoirIcon } from '@/lib/resolve-icon'

export default function AdoptionReasonCards({ reasons }) {
  if (!reasons?.length) {
    return null
  }

  return (
    <div className="bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2">
        {reasons.map((reason, index) => {
          const Icon = resolveIconoirIcon(reason.icon)
          return (
            <div
              key={buildRuntimeKey('adoption-reason', reason.title, index)}
              className="flex flex-col gap-4"
            >
              {Icon ? (
                <Icon className="h-8 w-8 text-white" />
              ) : (
                <span className="text-4xl font-bold text-white">{String(index + 1).padStart(2, '0')}</span>
              )}
              <h3 className="text-4xl font-bold text-white">{reason.title}</h3>
              <PortableTextContent
                as="div"
                value={reason.body}
                className="text-lg leading-relaxed text-white/60"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
