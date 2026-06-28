import { getDevSectionAttributes } from '@/components/dev/dev-trace'
import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { resolveIconoirIcon } from '@/lib/resolve-icon'

const defaultItems = [
  {
    icon: 'Page',
    title: 'Pay the same amount every month',
    body: 'Solar financing can help replace unpredictable power bills with a steadier monthly plan built around your home and usage.',
  },
  {
    icon: 'Wallet',
    title: 'No upfront or out-of-pocket cost to switch',
    body: 'Many homeowners qualify for financing options that reduce the upfront barrier while the system starts offsetting utility power.',
  },
  {
    icon: 'HomeShield',
    title: 'Designed around the roof first',
    body: 'A good solar plan respects roof age, shingle condition, shade, electrical constraints, and future service needs.',
  },
]

const SolarBenefitsSection = ({ section = null, sectionId = 'solar-benefits' }) => {
  const items = Array.isArray(section?.items) && section.items.length ? section.items : defaultItems
  const title = section?.title || ''
  const body = portableTextToPlainText(section?.body)

  return (
    <section
      className="bg-black py-24 text-white sm:py-32"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/solar-benefits-section.jsx',
        content: 'dark solar benefits grid',
      })}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {title || body ? (
          <div className="mb-16 max-w-4xl">
            {title ? (
              <h2 className="type-accent m-0 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-black tracking-[-0.065em]">
                {title}
              </h2>
            ) : null}
            {body ? <p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">{body}</p> : null}
          </div>
        ) : null}
        <div className="grid gap-x-24 gap-y-18 md:grid-cols-2">
          {items.map((item, index) => {
            const Icon = resolveIconoirIcon(item.icon)
            const itemBody = portableTextToPlainText(item.body)
            return (
              <article key={item._key || `${item.title}-${index}`} className="max-w-xl">
                {Icon ? (
                  <Icon className="mb-7 size-10 text-white" aria-hidden="true" strokeWidth={2} />
                ) : null}
                <h3 className="m-0 text-[clamp(2rem,4vw,3.4rem)] leading-[1.05] font-black tracking-[-0.055em] text-balance">
                  {item.title}
                </h3>
                {itemBody ? <p className="mt-6 text-lg leading-8 text-white/72">{itemBody}</p> : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default SolarBenefitsSection
