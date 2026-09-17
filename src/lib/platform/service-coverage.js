// Shared by the fixtures and targeted Sanity content updates.
export const serviceAreaSection = {
  type: 'serviceAreaMap',
  eyebrow: 'Where we work',
  title: 'Serving Texas from DFW to San Antonio',
  description:
    'Solar, electrical work, and coordination with select roofers along the I-35 corridor, from Dallas and Fort Worth through Austin to San Antonio.',
  areas: [
    'Dallas',
    'Tarrant',
    'Ellis',
    'Johnson',
    'Hill',
    'McLennan',
    'Bell',
    'Williamson',
    'Travis',
    'Bastrop',
    'Hays',
    'Comal',
    'Bexar',
  ].map((name) => ({
    _key: name.toLowerCase(),
    _type: 'serviceAreaItem',
    countyKey: name.toLowerCase(),
    displayName: `${name} County`,
  })),
}

const locationCities = new Set(['Austin', 'Round Rock', 'Georgetown', 'Leander', 'Pflugerville', 'Kyle'])
const cities = [
  'Dallas',
  'Austin',
  'Round Rock',
  'Georgetown',
  'Leander',
  'Cedar Park',
  'Pflugerville',
  'Kyle',
  'Bastrop',
  'San Antonio',
  'Waco',
]

export const serviceCityScrollSection = {
  type: 'scrollText',
  text: [`${cities.join(' • ')} •`],
  linkedItems: cities.map((label) => {
    const slug = label.toLowerCase().replaceAll(' ', '-')
    return {
      _key: slug,
      _type: 'scrollTextItem',
      label,
      ...(locationCities.has(label)
        ? {
            page: { _type: 'reference', _ref: `locationPage-${slug}`, _weak: true },
          }
        : {}),
    }
  }),
  fontSize: 38,
  velocity: 90,
  direction: 'left',
  damping: 50,
  stiffness: 400,
  numCopies: 2,
}
