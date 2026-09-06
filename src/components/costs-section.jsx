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
    labelStyle: { color: 'var(--color-voodoo)' },
    dividerStyle: { borderColor: `color-mix(in oklch, ${accentHex} 28%, transparent)` },
  }
}

function StatItem({ item, labelStyle }) {
  return (
    <div key={item._key || item.title}>
      <p className="solar-costs__stat-number">{item.number}</p>
      <p className="solar-costs__stat-label" style={labelStyle}>
        {item.title}
      </p>
      <PortableTextContent as="div" value={item.body} className="solar-costs__stat-body" />
    </div>
  )
}

export default function CostsSection({ section = null, sectionId = 'costs' }) {
  const { eyebrow, title, body, subtitle, stats, paybackEyebrow, paybackTitle, paybackBody } =
    resolveSectionContent(section)
  const { sectionStyle, labelStyle, dividerStyle } = getSectionStyles(section)

  return (
    <section
      className="solar-costs"
      style={sectionStyle}
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/costs-section.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="solar-costs__shell">
        <p className="solar-costs__eyebrow" style={labelStyle}>
          {eyebrow}
        </p>
        <h2 className="solar-costs__title">{title}</h2>
        <PortableTextContent as="div" value={body} className="solar-costs__body" />
        <PortableTextContent as="div" value={subtitle} className="solar-costs__subtitle" />
        <div className="solar-costs__stats">
          {stats.map((item) => (
            <StatItem key={item._key || item.title} item={item} labelStyle={labelStyle} />
          ))}
        </div>
        <div className="solar-costs__divider" style={dividerStyle} />
        <div className="solar-costs__payback">
          <p className="solar-costs__payback-eyebrow" style={labelStyle}>
            {paybackEyebrow}
          </p>
          <div>
            <p className="solar-costs__payback-title">{paybackTitle}</p>
            <PortableTextContent as="div" value={paybackBody} className="solar-costs__payback-body" />
          </div>
        </div>
      </div>
    </section>
  )
}
