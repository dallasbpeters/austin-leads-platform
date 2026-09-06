import PortableTextContent from '@/components/portable-text-content'
import { resolveIconoirIcon } from '@/lib/resolve-icon'
import { buildRuntimeKey } from '@/lib/sanity/stega'

export default function AdoptionReasonCards({ reasons }) {
  if (!reasons?.length) {
    return null
  }

  return (
    <div className="adoption-reasons">
      <div className="adoption-reasons__grid">
        {reasons.map((reason, index) => {
          const Icon = resolveIconoirIcon(reason.icon)
          return (
            <div
              key={buildRuntimeKey('adoption-reason', reason.title, index)}
              className="adoption-reasons__item"
            >
              {Icon ? (
                <Icon className="adoption-reasons__icon" />
              ) : (
                <span className="adoption-reasons__index">{String(index + 1).padStart(2, '0')}</span>
              )}
              <h3 className="adoption-reasons__title">{reason.title}</h3>
              <PortableTextContent as="div" value={reason.body} className="adoption-reasons__body" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
