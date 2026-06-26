import { getDevSectionAttributes } from './dev/dev-trace'
import PortableTextContent from './portable-text-content'

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

const TEXT_FIELDS = [
  ['eyebrow', 'eyebrow', 'Solar Costs'],
  ['title', 'title', 'What Does Solar Actually Cost?'],
  [
    'body',
    'body',
    'A residential solar installation in Texas often lands between $18,000 and $28,000 before incentives. The final number depends on system size, equipment, electrical work, and how much energy the home actually uses.',
  ],
  [
    'subtitle',
    'subtitle',
    'If you are trying to decide whether solar is worth it, start with the numbers that matter most: total project cost, incentives, expected production, and realistic payback.',
  ],
  ['paybackEyebrow', 'secondaryTitle', 'Realistic Payback'],
]

function resolveSectionContent(section) {
  const content = {}
  for (const [key, field, fallback] of TEXT_FIELDS) {
    content[key] = section?.[field] || fallback
  }
  content.stats = section?.items?.length ? section.items : fallbackStatItems
  content.paybackTitle =
    section?.secondaryItems?.[0]?.title || 'Most homeowners still see solar break even in roughly 7–9 years.'
  content.paybackBody =
    section?.secondaryItems?.[0]?.body ||
    'The strongest quotes clearly separate contract cost, incentives, and expected production so you can compare options without guessing where the savings are supposed to come from.'
  return content
}

function getSectionStyles(section) {
  const rawColor = section?.color
  const accentHex = (typeof rawColor === 'string' ? rawColor : rawColor?.hex) || ''
  if (!accentHex) {
    return { sectionStyle: undefined, labelStyle: undefined, dividerStyle: undefined }
  }
  return {
    sectionStyle: {
      background: `linear-gradient(188deg, color-mix(in oklch, ${accentHex} 1%, white) 3.24%, color-mix(in oklch, ${accentHex} 12%, white) 110.59%)`,
    },
    labelStyle: { color: accentHex },
    dividerStyle: { borderColor: `color-mix(in oklch, ${accentHex} 28%, transparent)` },
  }
}

function StatItem({ item, labelStyle }) {
  return (
    <div key={item._key || item.title}>
      <p className="mb-3 text-6xl font-bold text-neutral-900">{item.number}</p>
      <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-cyan-800 uppercase" style={labelStyle}>
        {item.title}
      </p>
      <PortableTextContent
        as="div"
        value={item.body}
        className="text-[0.9375rem] leading-7 font-semibold text-neutral-500"
      />
    </div>
  )
}

export default function CostsSection({ section = null, sectionId = 'costs' }) {
  const { eyebrow, title, body, subtitle, stats, paybackEyebrow, paybackTitle, paybackBody } =
    resolveSectionContent(section)
  const { sectionStyle, labelStyle, dividerStyle } = getSectionStyles(section)

  return (
    <section
      className="grid place-content-center border-t border-stone-100 py-24"
      style={sectionStyle}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/costs-section.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="mx-auto w-full max-w-6xl px-12">
        <p
          className="type-accent mb-8 text-sm font-semibold tracking-[0.2em] text-cyan-900 uppercase"
          style={labelStyle}
        >
          {eyebrow}
        </p>
        <h2 className="mb-6 text-[clamp(2.25rem,5vw,3.5rem)] text-slate-900">{title}</h2>
        <PortableTextContent
          as="div"
          value={body}
          className="text-[1.125rem] leading-7 font-semibold text-neutral-500"
        />
        <PortableTextContent
          as="div"
          value={subtitle}
          className="mt-3 text-[1.125rem] leading-7 font-semibold text-neutral-500"
        />
        <div className="my-16 grid gap-12 lg:grid-cols-3">
          {stats.map((item) => (
            <StatItem key={item._key || item.title} item={item} labelStyle={labelStyle} />
          ))}
        </div>
        <div className="mb-12 border-t border-blue-300" style={dividerStyle} />
        <div className="flex items-baseline gap-8 max-[900px]:flex-col">
          <p
            className="shrink-0 text-sm font-semibold tracking-[0.2em] text-blue-900 uppercase"
            style={labelStyle}
          >
            {paybackEyebrow}
          </p>
          <div>
            <p className="text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.35] font-semibold text-neutral-900">
              {paybackTitle}
            </p>
            <PortableTextContent
              as="div"
              value={paybackBody}
              className="mt-3 text-[1rem] leading-7 font-semibold text-neutral-500"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
