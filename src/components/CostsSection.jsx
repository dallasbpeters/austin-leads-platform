import { getDevSectionAttributes } from './dev/DevTrace'
import PortableTextContent from './PortableTextContent'

const fallbackStatItems = [
  {
    number: '70%',
    title: 'Panel Cost Drop',
    body: 'Solar panel costs have dropped over 70% in the last decade. That means the same system that was out of reach five years ago is often affordable today with standard financing.',
  },
  {
    number: '$$$',
    title: 'Texas Utility Context',
    body: 'Savings depend on your actual utility, electric rate, usage pattern, and whether the system is sized to offset the right amount of annual consumption.',
  },
  {
    number: '$0',
    title: 'Property Tax Increase',
    body: "Solar panels can increase your home's value, but Texas law exempts that added value from property taxes. Your tax bill does not automatically go up just because the home appraises higher.",
  },
]

export default function CostsSection({ section = null, sectionId = 'costs', editAttributes = {} }) {
  const eyebrow = section?.eyebrow || 'Solar Costs'
  const title = section?.title || 'What Does Solar Actually Cost?'
  const body =
    section?.body ||
    'A residential solar installation in Texas often lands between $18,000 and $28,000 before incentives. The final number depends on system size, equipment, electrical work, and how much energy the home actually uses.'
  const subtitle =
    section?.subtitle ||
    'If you are trying to decide whether solar is worth it, start with the numbers that matter most: total project cost, incentives, expected production, and realistic payback.'
  const stats = section?.items?.length ? section.items : fallbackStatItems
  const paybackEyebrow = section?.secondaryTitle || 'Realistic Payback'
  const paybackTitle =
    section?.secondaryItems?.[0]?.title || 'Most homeowners still see solar break even in roughly 7–9 years.'
  const paybackBody =
    section?.secondaryItems?.[0]?.body ||
    'The strongest quotes clearly separate contract cost, incentives, and expected production so you can compare options without guessing where the savings are supposed to come from.'

  return (
    <section
      className="grid py-24 bg-gradient border-stone-100 border-t place-content-center"
      {...editAttributes}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/CostsSection.jsx',
        content: 'local JSX copy',
      })}
      >
      <div className="max-w-7xl w-full mx-auto px-4">
        <p className="mb-8 font-semibold text-cyan-900 text-sm tracking-[0.2em] type-accent uppercase">
          {eyebrow}
        </p>
        <h2 className="mb-6 text-[clamp(2.25rem,5vw,3.5rem)] text-slate-900">{title}</h2>
        <PortableTextContent as="div" value={body} className="font-semibold leading-7 text-[1.125rem] text-neutral-500" />
        <PortableTextContent
          as="div"
          value={subtitle}
          className="mt-3 font-semibold leading-7 text-[1.125rem] text-neutral-500"
        />

        <div className="grid gap-12 my-16 lg:grid-cols-3">
          {stats.map((item) => (
            <div key={item._key || item.title}>
              <p className="mb-3 font-bold text-6xl text-neutral-900">{item.number || item.title}</p>
              <p className="mb-3 font-semibold text-cyan-800 text-sm tracking-[0.2em] uppercase">
                {item.title || item.eyebrow}
              </p>
              <PortableTextContent
                as="div"
                value={item.body}
                className="font-semibold leading-7 text-[0.9375rem] text-neutral-500"
              />
            </div>
          ))}
        </div>

        <div className="mb-12 border-blue-300 border-t"></div>

        <div className="flex max-[900px]:flex-col items-baseline gap-8">
          <p className="font-semibold text-blue-900 text-sm tracking-[0.2em] shrink-0 uppercase">
            {paybackEyebrow}
          </p>
          <div>
            <p className="font-semibold leading-[1.35] text-[clamp(1.5rem,4vw,1.875rem)] text-neutral-900">
              {paybackTitle}
            </p>
            <PortableTextContent
              as="div"
              value={paybackBody}
              className="mt-3 font-semibold leading-7 text-base text-neutral-500"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
