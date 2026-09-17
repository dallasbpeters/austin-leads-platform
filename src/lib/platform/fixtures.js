import { getSolarGuideGridItems, getSolarGuidePages } from './guides.js'
import { mainServices, roofingServices, servicePages, specialtyServices } from './service-catalog.js'
import { serviceAreaSection, serviceCityScrollSection } from './service-coverage.js'

const categories = {
  solarRoofing: 'Solar + Roofing',
  solar: 'Solar',
  roofing: 'Roofing',
  weddings: 'Weddings',
  homeServices: 'Home Services',
}

const tierMap = {
  Hero: 'hero',
  Mid: 'landing',
  Redirect: 'redirect',
}

const brandByCategory = {
  solarRoofing: {
    primary: 'oklch(51.82% 0.1441 249.42deg)',
    secondary: 'oklch(25.09% 0.0309 238.88deg)',
    accent: 'oklch(76.29% 0.0944 212.4deg)',
    surface: 'oklch(97.75% 0.0056 56.35deg)',
    heroTone: 'dark',
  },
  solar: {
    primary: 'oklch(71.67% 0.1568 37.66deg)',
    secondary: 'oklch(30.88% 0.0448 213.39deg)',
    accent: 'oklch(78.27% 0.0979 212.44deg)',
    surface: 'oklch(97.66% 0.0065 48.67deg)',
    heroTone: 'warm',
  },
  roofing: {
    primary: 'oklch(68.2% 0.1588 42.53deg)',
    secondary: 'oklch(25.31% 0.0415 249.77deg)',
    accent: 'oklch(73.86% 0.1445 52.23deg)',
    surface: 'oklch(97.75% 0.0051 56.36deg)',
    heroTone: 'dark',
  },
  weddings: {
    primary: 'oklch(66.52% 0.1567 9.94deg)',
    secondary: 'oklch(28.59% 0.0387 258.3deg)',
    accent: 'oklch(82.43% 0.1174 68.66deg)',
    surface: 'oklch(98.48% 0 0deg)',
    heroTone: 'light',
  },
  homeServices: {
    primary: 'oklch(71.88% 0.1292 59.56deg)',
    secondary: 'oklch(29.32% 0.0352 238.8deg)',
    accent: 'oklch(71.88% 0.0826 215.88deg)',
    surface: 'oklch(97.96% 0.0057 74.92deg)',
    heroTone: 'light',
  },
}

const portfolioDomains = [
  {
    domain: 'texassolarandroofingpros.com',
    name: 'Texas Solar and Roofing Pros',
    seoScore: 100,
    tier: 'Hero',
    category: 'solarRoofing',
    slug: 'texas-solar-and-roofing-pros',
  },
  {
    domain: 'austinweddingvendors.com',
    seoScore: 100,
    tier: 'Hero',
    category: 'weddings',
    slug: 'austin-wedding-vendors',
  },
  {
    domain: 'roofprosofaustin.com',
    seoScore: 100,
    tier: 'Hero',
    category: 'roofing',
    slug: 'roof-pros-of-austin',
  },
  {
    domain: 'solarpanelsatx.com',
    seoScore: 100,
    tier: 'Hero',
    category: 'solar',
    slug: 'solar-panels-atx',
  },
  {
    domain: 'austinsolarsolutions.com',
    seoScore: 100,
    tier: 'Hero',
    category: 'solar',
    slug: 'austin-solar-solutions',
  },
  {
    domain: 'austinsolarhomes.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'solar',
    slug: 'austin-solar-homes',
  },
  {
    domain: 'austinweddingsandevents.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'weddings',
    slug: 'austin-weddings-and-events',
  },
  {
    domain: 'sanantonioweddingplanners.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'weddings',
    slug: 'san-antonio-wedding-planners',
  },
  {
    domain: 'eliteweddingsaustin.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'weddings',
    slug: 'elite-weddings-austin',
  },
  {
    domain: 'roofsfortexas.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'roofing',
    slug: 'roofs-for-texas',
  },
  {
    domain: 'austinsolarenergy.net',
    seoScore: 40,
    tier: 'Mid',
    category: 'solar',
    slug: 'austin-solar-energy',
  },
  {
    domain: 'renewableenergytexas.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'solar',
    slug: 'renewable-energy-texas',
  },
  {
    domain: 'solarroofstexas.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'roofing',
    slug: 'solar-roofs-texas',
  },
  {
    domain: 'eliteeventsaustin.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'weddings',
    slug: 'elite-events-austin',
  },
  {
    domain: 'texasplanners.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'weddings',
    slug: 'texas-planners',
  },
  {
    domain: 'austinseliteweddings.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'weddings',
    slug: 'austins-elite-weddings',
  },
  {
    domain: 'austinweddings.net',
    seoScore: 40,
    tier: 'Mid',
    category: 'weddings',
    slug: 'austin-weddings',
  },
  {
    domain: 'austinshomebuilders.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'homeServices',
    slug: 'austins-home-builders',
  },
  { domain: 'solarpanelstexashomes.com', seoScore: 10, tier: 'Redirect', category: 'solar' },
  { domain: 'buildsolarforyourhome.com', seoScore: 10, tier: 'Redirect', category: 'solar' },
  { domain: 'austinsweddingofficiants.com', seoScore: 10, tier: 'Redirect', category: 'weddings' },
  { domain: 'singingspringsfarms.com', seoScore: 10, tier: 'Redirect', category: 'weddings' },
  { domain: 'texascountrymusicscene.com', seoScore: 10, tier: 'Redirect', category: 'weddings' },
  { domain: 'corporateaustin.com', seoScore: 10, tier: 'Redirect', category: 'weddings' },
  { domain: 'austinweddings.events', seoScore: 10, tier: 'Redirect', category: 'weddings' },
  { domain: 'austinweddings.online', seoScore: 10, tier: 'Redirect', category: 'weddings' },
  { domain: 'austinweddings.us', seoScore: 10, tier: 'Redirect', category: 'weddings' },
  {
    domain: 'austinweddingsandspecialevents.com',
    seoScore: 10,
    tier: 'Redirect',
    category: 'weddings',
  },
  { domain: 'kathielovessolar.com', seoScore: 10, tier: 'Redirect', category: 'solar' },
  { domain: 'solarpanels-texas.com', seoScore: 10, tier: 'Redirect', category: 'solar' },
  { domain: 'texas-solarroofs.com', seoScore: 10, tier: 'Redirect', category: 'solar' },
]

const redirectTargetByCategory = {
  solarRoofing: 'texas-solar-and-roofing-pros',
  solar: 'texas-solar-and-roofing-pros',
  roofing: 'texas-solar-and-roofing-pros',
  weddings: 'austin-wedding-vendors',
  homeServices: 'texas-solar-and-roofing-pros',
}

function fallbackSlug(domain) {
  return domain
    .replace(/\.[^.]+$/, '')
    .replaceAll(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .replaceAll(/^-|-$/g, '')
}

function titleizeDomain(domain) {
  return domain
    .replace(/\.[^.]+$/, '')
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildLeadForm(domain, categoryLabel, nameOverride) {
  return {
    title: `Get a straight answer from ${nameOverride || titleizeDomain(domain)}`,
    description: `Connect Texas homeowners with real ${categoryLabel.toLowerCase()} guidance through ${domain}.`,
    ctaLabel: `Talk to a ${categoryLabel.toLowerCase()} pro`,
  }
}

function getSiteSeoDescription(slug, title, categoryLabel) {
  if (slug === 'texas-solar-and-roofing-pros') {
    return 'Solar, roofing, and energy services for Texas homeowners. Inspections, installations, storm damage, and guidance from start to finish.'
  }

  return `${title} — honest ${categoryLabel.toLowerCase()} guidance for Austin and Texas homeowners who want real answers before making a decision.`
}

const allCatalogServices = [...mainServices, ...roofingServices, ...specialtyServices]

const solarPagePrimaryServiceSlugs = new Set([
  'solar-and-battery-installations',
  'detach-and-reset',
  'electrical-services',
])

const solarPageRelatedServiceSlugs = new Set(['rodent-deterrent', 'car-chargers'])

const texasSolarNavigation = [
  { href: '/solar', label: 'Solar' },
  { href: '/roofing', label: 'Roofing' },
  { href: '/services', label: 'All Services' },
  { href: '/hail-damage', label: 'Hail & Storm Damage' },
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'About Us' },
  { href: '#consultation', label: 'Contact', variant: 'button' },
]

export const sites = portfolioDomains.map((entry, index) => {
  const tier = tierMap[entry.tier]
  const brand = brandByCategory[entry.category]
  const slug = entry.slug || fallbackSlug(entry.domain)
  const title = entry.name || titleizeDomain(entry.domain)

  return {
    id: `site-${slug}`,
    slug,
    name: title,
    shortName: categories[entry.category],
    category: entry.category,
    categoryLabel: categories[entry.category],
    tier,
    seoScore: entry.seoScore,
    primaryDomain: entry.domain,
    aliases:
      entry.domain === 'texassolarandroofingpros.com'
        ? [`www.${entry.domain}`, 'localhost', '127.0.0.1']
        : [`www.${entry.domain}`],
    redirectTarget: tier === 'redirect' ? redirectTargetByCategory[entry.category] : null,
    leadForm: tier === 'redirect' ? null : buildLeadForm(entry.domain, categories[entry.category], title),
    navigation: slug === 'texas-solar-and-roofing-pros' ? texasSolarNavigation : [],
    seo: {
      title,
      description: getSiteSeoDescription(slug, title, categories[entry.category]),
    },
    brand: {
      eyebrow: tier === 'hero' ? 'Featured Site' : tier === 'landing' ? 'Focused Site' : 'Redirect Domain',
      ...brand,
    },
    organization: {
      name: title,
      type: entry.category === 'roofing' ? 'RoofingContractor' : 'ProfessionalService',
      serviceArea: ['Austin', 'Texas'],
      phone: `(512) 555-${String(1100 + index).padStart(4, '0')}`,
      email: `hello@${entry.domain}`,
    },
  }
})

const solarHomeSections = [
  {
    type: 'hero',
    eyebrow: 'Solar-ready homes in Austin',
    title: 'Wondering if your Austin home is actually a good fit for solar?',
    body: 'Not every house is. This page helps you compare neighborhood factors, roof layout, electric bills, and resale value so you can figure that out before anyone tries to sell you a system.',
    heroImage: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
      },
      alt: 'Residential rooftop solar installation under a bright Texas sky',
    },
    metrics: [
      { label: 'Built for', value: 'Homeowners + buyers' },
      { label: 'Page type', value: 'Landing' },
      { label: 'Next step', value: 'Free consultation' },
    ],
  },
  {
    type: 'highlights',
    title: 'What you will find here',
    items: [
      {
        title: 'Which Austin neighborhoods work best for solar',
        body: 'Some areas, roof styles, and tree cover situations are better than others. We break that down so you know where you stand.',
      },
      {
        title: 'What your electric bill is really telling you',
        body: 'Your bill, roof condition, and home orientation all affect whether solar makes financial sense. We show you how to read those signals.',
      },
      {
        title: 'How to spot a solar-ready home vs. one that needs work first',
        body: 'Some houses are ready today. Others need a roof fix, electrical upgrade, or tree removal first. Knowing the difference saves you thousands.',
      },
    ],
  },
  {
    type: 'cta',
    title: 'Talk with a solar pro.',
    body: 'A short conversation can tell you whether your home is a good fit for solar.',
    ctaLabel: 'Request a free consultation',
    ctaHref: '/#consultation',
  },
]

export const pages = [
  {
    id: 'page-solar-home',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: '',
    title: 'Texas Solar and Roofing Pros',
    description:
      'Roofing and solar services for homeowners across Austin and Central Texas, including installation, repairs, inspections, and storm-damage help.',
    pageType: 'home',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Texas solar + roofing',
        titlePrimary: 'Texas Solar',
        titleAccent: '& Roofing',
        title: "Storm damage? High electric bills? Let's figure out what your house actually needs.",
        body: 'Maybe it is hail damage. Maybe the roof is 20 years old. Maybe your electric bill hit $400 last summer and you are wondering if solar is the move. Whatever brought you here, the goal is the same: figure out what is going on with the house and handle it in the right order.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Texas home with rooftop solar panels',
        },
        heroSlides: [
          {
            title: 'Solar installation',
            image: {
              urls: {
                regular: '/images/solar-install.png',
              },
              alt: 'Solar installation on a residential roof',
            },
          },
          {
            title: 'Roof installation',
            image: {
              urls: {
                regular: '/images/roof-install.png',
              },
              alt: 'Roof installation work on a Texas home',
            },
          },
          {
            title: 'Storm damage',
            image: {
              urls: {
                regular: '/images/storm-damage.jpg',
              },
              alt: 'Storm-damaged roof used for the homepage hero',
            },
          },
        ],
        metrics: [
          { label: 'Who we help', value: 'Texas homeowners' },
          { label: 'What we cover', value: 'Roofing + solar' },
          { label: 'How to start', value: 'Free consultation' },
        ],
        actions: [
          { label: 'See our services', href: '/services', variant: 'default' },
          { label: 'Read the guides', href: '/guides', variant: 'secondary' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'Our approach',
        title: 'Start with what your house actually needs.',
        body: 'Tree branches, water heaters, and shock electric bills. That is where most people start. We help you sort out the rest.',
        subtitle: 'One step at a time.',
      },
      {
        type: 'calculator',
        eyebrow: 'Free estimate · No commitment · Takes 2 minutes',
        title: 'See what solar could save',
        body: "Enter your average monthly electric bill and we'll estimate system size, possible savings, and a likely payback range. Solar stands on its own here, even when roofing decisions affect the bigger project.",
        subtitle: 'Based on typical Texas residential production assumptions and current utility-rate ranges',
        ctaLabel: 'Talk through your solar options',
        ctaHref: '#estimate',
        items: [
          {
            title: 'System Size',
            body: '~panels sized for your roof',
          },
          {
            title: 'Year 1 Savings',
            body: 'Avg monthly savings back in your pocket',
          },
          {
            title: '25-Year Savings',
            body: 'With 2.5% annual rate increase',
          },
          {
            title: 'Payback Period',
            body: 'After available local rebates',
          },
        ],
      },
      {
        type: 'costs',
        eyebrow: 'Solar Costs',
        title: 'What Does Solar Actually Cost?',
        body: 'A residential solar installation in Texas often lands between $18,000 and $28,000 before incentives. The final number depends on system size, equipment, electrical work, and how much energy the home actually uses.',
        subtitle:
          'If you are trying to decide whether solar is worth it, start with the numbers that matter most: total project cost, incentives, expected production, and realistic payback.',
        items: [
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
        ],
        secondaryTitle: 'Realistic Payback',
        secondaryItems: [
          {
            title: 'Most homeowners still see solar break even in roughly 7–9 years.',
            body: 'The strongest quotes clearly separate contract cost, incentives, and expected production so you can compare options without guessing where the savings are supposed to come from.',
          },
        ],
      },
      {
        type: 'guides',
        title: 'Go Deeper',
        body: '',
        ctaLabel: 'See all guides',
      },
      {
        type: 'snapshot',
        eyebrow: 'Texas Snapshot',
        title: 'The numbers people usually ask for.',
        body: "Most homeowners walk into their first quote with zero frame of reference. These are the cost ranges, timelines, and coverage benchmarks we see on Central Texas projects — so you're not starting from scratch. Your numbers will vary based on roof size, material, and carrier, but at least you'll know what ballpark you're in.",
        items: [
          {
            icon: 'Wallet',
            number: '$18k-$28k',
            body: 'Typical residential solar range before credits and roof-related adders',
          },
          {
            icon: 'Clock',
            number: '10+ years',
            body: 'Roof age is where insurance and timing questions usually start',
          },
          {
            icon: 'Leaf',
            number: '2 years',
            body: 'A common claim window for detach-and-reset conversations after roof work',
          },
          {
            icon: 'StatUp',
            number: '7–9 years',
            body: 'Typical solar payback range once the roof plan is already solid',
          },
        ],
      },
      {
        type: 'incentives',
        title: 'Roof insurance and claim realities',
        body: 'Roof claims get expensive when the details are misunderstood. This section is here to explain hail damage, aging roofs, RCV vs ACV policies, claim timing, and when detach and reset becomes part of the job.\n\nThe goal is simple: help you understand whether you are looking at normal roof wear, storm damage with an insurance angle, or a roofing project that needs to be planned correctly before solar enters the picture.',
        ctaLabel: 'Review roofing + insurance basics',
        ctaHref: '/resources/roof-insurance-and-claim-realities',
      },
      {
        type: 'testimonials',
        title: 'What customers are saying',
        body: 'about Texas Solar and Roofing Pros',
      },
      {
        type: 'highlights',
        title: 'Here is what homeowners actually come here looking for',
        items: [
          {
            title: 'A roof answer when the roof is the real problem',
            body: 'Storm damage, aging shingles, insurance headaches, and detach-and-reset questions deserve straight answers without getting buried in solar upsells.',
          },
          {
            title: 'Solar guidance that starts with the math, not a pitch',
            body: 'When the roof is solid, the real question is: will solar actually save you money? We walk you through system size, incentives, financing, and payback so you can decide for yourself.',
          },
          {
            title: 'A conversation that respects your time',
            body: 'By the time you reach out, you should already know what your house needs. That way the quote and inspection process is useful from minute one.',
          },
        ],
      },
      {
        type: 'steps',
        title: 'How to use this site',
        items: [
          {
            title: 'Start with the problem staring you in the face',
            body: 'Storm damage, an old roof, $400 electric bills, or solar curiosity each point to different pages and different first steps.',
          },
          {
            title: 'Use the service pages to zero in',
            body: 'Our service pages help you figure out whether you need roof work, efficiency upgrades, solar planning, or some combination.',
          },
          {
            title: 'Go deeper with the guides when you want the full picture',
            body: 'The guides cover cost breakdowns, incentive details, battery options, financing, insurance claims, and roof readiness in plain language.',
          },
          {
            title: 'Request a consultation when you are ready for a real next step',
            body: 'That way the conversation is about your house, not a generic pitch that could apply to anyone in the zip code.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Questions we hear every week',
        items: [
          {
            question: 'Should I fix the roof before I get a solar quote?',
            answer:
              'Almost always, yes. If the roof is damaged or near the end of its life, that needs to be settled first. Otherwise you are building a solar project on top of a problem you will have to deal with later anyway.',
          },
          {
            question:
              'I am not sure if this is a roof problem or an energy-cost problem. How do I figure it out?',
            answer:
              'That is exactly what the service pages and consultation are for. Sometimes it is both. The first useful step is figuring out what is actually driving the cost or the urgency, and we can help you sort that out.',
          },
          {
            question: 'Can roofing and solar be part of the same plan?',
            answer:
              'Absolutely. But they should not be blurred into one conversation. Roof condition, storm timing, and insurance can all change when solar should happen and how it gets priced. Keeping them separate makes the plan smarter.',
          },
        ],
      },
      {
        type: 'resourceGrid',
        title: 'Start with what you need help with',
        body: 'The most common solar and roofing questions, organized by category so you can find what you need faster.',
        items: [
          {
            icon: 'Thunderstorm',
            title: 'Hail Damage',
            body: 'Storm history, roof damage signs, and what to do after a hail event.',
            href: '/hail-damage',
            image: {
              urls: {
                regular: '/images/hail-damage.png',
              },
              alt: 'Texas roof with visible hail and storm damage',
            },
          },
          {
            icon: 'HomeShield',
            title: 'Roof Insurance and Claim Realities',
            body: 'Claim language, detach-and-reset timing, depreciation, and the insurance details that change the job.',
            href: '/resources/roof-insurance-and-claim-realities',
            image: {
              urls: {
                regular: '/images/storm-damage.jpg',
              },
              alt: 'Storm-damaged roof used for insurance and claim guidance',
            },
          },
          {
            icon: 'SunLight',
            title: 'Solar + Savings',
            body: 'System cost, savings, incentives, and whether solar actually pencils out for your house.',
            href: '/solar-costs',
            image: {
              urls: {
                regular: '/images/solar-install.png',
              },
              alt: 'Residential solar installation on a Texas home',
            },
          },
        ],
      },
      {
        type: 'bannerCta',
        eyebrow: 'Free consultation',
        title: 'Not sure whether the roof, solar, or storm claim comes first?',
        body: 'Start with a short conversation about the house and the timing. We will help you sort the next step before anyone talks scope or pricing.',
        ctaLabel: 'Start here',
        ctaHref: '#consultation',
        image: {
          urls: {
            regular: '/images/solar-install.png',
          },
          alt: 'Solar installation crew working on a residential roof',
        },
      },
      serviceAreaSection,
      {
        type: 'cta',
        title: 'Talk with our team.',
        body: 'A short conversation can help you choose the right next step for your home.',
        ctaLabel: 'Request a free consultation',
        ctaHref: '/#consultation',
      },
    ],
  },
  {
    id: 'page-solar-costs',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'solar-costs',
    title: 'Austin Solar Cost Guide',
    description:
      'What solar actually costs in Austin, what affects the price, and how to tell if the numbers work for your home.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Solar pricing in Austin',
        title: 'How much does solar actually cost in Texas? It depends on your house.',
        body: 'You have probably seen numbers all over the map. That is because every home is different. This page breaks down installed cost, financing, and realistic payback so you can compare apples to apples before talking to anyone.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Solar panels on a residential roof during daylight',
        },
        metrics: [
          { label: 'Typical range', value: '$18k-$32k' },
          { label: 'Avg. payback', value: '7-9 years' },
          { label: 'Buyer intent', value: 'High' },
        ],
      },
      {
        type: 'highlights',
        title: 'What this page will answer for you',
        items: [
          {
            title: 'What drives the installed price up or down',
            body: 'Roof layout, shading, panel choice, electrical work, and how you pay for it all change the final number. We show you each variable so nothing is a surprise.',
          },
          {
            title: 'Which credits and exemptions apply to you',
            body: 'Local utility programs and property-tax exemptions can reduce your net cost. We explain what is available now and what you need to verify before signing.',
          },
          {
            title: 'Whether you should get a quote or keep researching',
            body: 'Not every homeowner is ready for a quote. We help you figure out if the numbers are in the right ballpark for your situation first.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Solar pricing questions',
        items: [
          {
            question: 'Why do solar quotes vary so much from house to house?',
            answer:
              'Because your roof, shade, electrical panel, equipment choice, and financing all change the price. A neighbor three doors down could get a quote $8,000 different from yours and both numbers could be honest. This page helps you understand why.',
          },
          {
            question: 'How do I know if a solar quote is actually fair?',
            answer:
              'When you understand what drives the cost, you can spot inflated numbers and lowball bids. This page gives you the framework so you walk into any quote conversation informed.',
          },
        ],
      },
    ],
  },
  {
    id: 'page-services',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'services',
    title: 'Services',
    description:
      'Roofing, solar, efficiency, and home-energy services for Texas homeowners who want to spend less and fix what matters.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'What we do',
        title: "Stop guessing why your energy bills are so high. Let's fix the actual problem.",
        body: 'We help Texas homeowners figure out whether the issue is the roof, the insulation, the HVAC, or all three, then build a plan that actually lowers bills instead of just adding panels and hoping for the best.',
        heroImage: {
          urls: {
            regular: '/assets/services/photos/energy-audits.jpg',
          },
          alt: 'Home energy audit consultation in progress',
        },
        metrics: [
          { label: 'Best for', value: 'High bills + aging homes' },
          { label: 'Focus areas', value: 'Efficiency, roofing, solar' },
          { label: 'How to start', value: 'Free consultation' },
        ],
        actions: [
          { label: 'Request a free consultation', href: '/#consultation', variant: 'default' },
          { label: 'Read the solar guides', href: '/guides', variant: 'secondary' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'The honest truth',
        title: 'Some homes need efficiency work first. Some need a new roof. Some are ready for solar today.',
        body: 'The right answer depends on what is driving your bill, what shape the house is in, and whether the smart move is weatherization, HVAC work, a roof fix, or a solar project. We lay out the categories so you can start in the right place instead of buying the wrong thing first.',
      },
      {
        type: 'serviceGrid',
        eyebrow: 'Service categories',
        title: 'What we help with',
        body: 'Everything here is about one thing: lowering energy waste, improving comfort, protecting the house, and helping you figure out the right order to tackle it all.',
        items: mainServices.map((service) => ({
          ...service,
          href: `/services/${service.slug}`,
        })),
        roofingTitle: 'Roofing Services',
        roofingItems: roofingServices.map((service) => ({
          ...service,
          href: `/services/${service.slug}`,
        })),
        secondaryTitle: 'Specialty Services',
        secondaryItems: specialtyServices.map((service) => ({
          ...service,
          href: `/services/${service.slug}`,
        })),
      },
      serviceCityScrollSection,
      {
        type: 'steps',
        title: 'How to pick the right starting point',
        items: [
          {
            title: 'Start with the problem you already know about',
            body: 'If hail hit last week, start with roofing. If the problem is a $400 electric bill and no storm damage, start on the efficiency side. Do not let someone sell you solar when the real issue is a leaky attic.',
          },
          {
            title: 'Separate emergency repairs from long-term upgrades',
            body: 'Some projects are about fixing damage right now. Others are about improving the home over the next 5-10 years. Keeping those decisions separate saves you money and headaches.',
          },
          {
            title: 'Let the house condition set the order',
            body: 'Roof age, HVAC condition, insulation gaps, and electrical capacity all affect what should happen first. We help you read those signals.',
          },
          {
            title: 'Then get a quote that actually makes sense',
            body: 'Once you know the real issue, the quote process works. You are comparing options built around your house, not a generic package.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Questions we hear first',
        items: [
          {
            question: 'Do I need solar, or do I need to fix something else first?',
            answer:
              'Depends on what is driving the bill. In some homes, insulation, duct leaks, or an aging HVAC are burning more money than solar would save. In others, the house is ready for panels today. The useful first step is figuring out which one you are dealing with.',
          },
          {
            question: 'Can roofing, efficiency work, and solar all be part of one plan?',
            answer:
              'Yes, but they should not be sold as one blurred package. Each piece should make sense on its own, with a clear reason for doing it and a clear order. That is how you avoid overspending.',
          },
          {
            question: 'Is this site only about solar?',
            answer:
              'No. We cover it all because most homeowners need a mix of energy upgrades, home repairs, and solar planning, not just one isolated answer. The house does not care about marketing categories.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Talk with our team.',
        body: 'We will help you figure out where to start and what the right next step looks like.',
        ctaLabel: 'Request a free consultation',
        ctaHref: '/#consultation',
      },
    ],
  },
  {
    id: 'page-solar',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'solar',
    title: 'Solar',
    description:
      'Solar installation, battery backup, detach and reset, and related electrical services for homes across Austin and Central Texas.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Solar for Texas homes',
        title: 'Solar services for installation, storage, roof coordination, and electrical prep.',
        body: 'A shorter way to see the solar-side services we offer, from new installs to battery backup and detach-and-reset.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Residential solar array in sunlight',
        },
        metrics: [
          { label: 'Focus', value: 'Solar + storage' },
          { label: 'Also handles', value: 'Detach + reset' },
          { label: 'Service area', value: 'Austin + Central Texas' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'Solar overview',
        title: 'Solar is not just panels.',
        body: 'It is the install, the battery plan, the roof coordination, and the electrical work that has to be right before the project moves cleanly.',
      },
      {
        type: 'solarSwitch',
        leadingWords: ['Protect', 'your', 'home', 'and', 'lower', 'monthly', 'costs', 'with'],
        accentWord: 'solar',
        trailingText: 'without sacrificing roof integrity.',
      },
      {
        type: 'serviceGrid',
        eyebrow: 'Solar services',
        title: 'What we help with on the solar side',
        body: 'The install itself, the roof coordination around it, and the electrical work that supports it.',
        items: allCatalogServices
          .filter((service) => solarPagePrimaryServiceSlugs.has(service.slug))
          .map((service) => ({
            ...service,
            href: `/services/${service.slug}`,
          })),
        secondaryTitle: 'Related services',
        secondaryItems: specialtyServices
          .filter((service) => solarPageRelatedServiceSlugs.has(service.slug))
          .map((service) => ({
            ...service,
            href: `/services/${service.slug}`,
          })),
      },
      {
        type: 'faq',
        title: 'Solar questions',
        items: [
          {
            question: 'Can you help if the roof has to be handled before solar?',
            answer:
              'Yes. That is a common part of the job. We help sort out whether roofing work, detach-and-reset, or electrical prep needs to happen before the install.',
          },
          {
            question: 'Do I need battery backup with solar?',
            answer:
              'Not always. It depends on outage concerns, budget, and what you want the system to do during a grid failure.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Talk with a solar pro.',
        body: 'We will help you pick the right next step.',
        ctaLabel: 'Request a consultation',
        ctaHref: '#consultation',
      },
    ],
  },
  {
    id: 'page-roofing',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'roofing',
    title: 'Roofing',
    description:
      'Roofing services for homeowners across Austin and Central Texas, including inspections, repairs, replacement, storm restoration, and insurance-related roof work.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Roofing in Texas',
        title: 'Roofing services for inspection, repair, replacement, and storm work.',
        body: 'A shorter way to see the roofing services we offer, from inspections and replacement to storm restoration and roof work tied to solar.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1656646549671-000665d8d8bc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
          },
          alt: 'Residential roof viewed from above for inspection and replacement planning',
        },
        metrics: [
          { label: 'Focus', value: 'Roof condition + storm damage' },
          { label: 'Also handles', value: 'Claims + detach/reset' },
          { label: 'Service area', value: 'Austin + Central Texas' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'Roofing overview',
        title: 'Roofing work usually starts with condition, not assumptions.',
        body: 'Sometimes the roof needs a repair. Sometimes it needs replacement. Sometimes the real issue is storm damage, insurance timing, or roof work that has to happen before solar can move.',
      },
      {
        type: 'serviceGrid',
        eyebrow: 'Roofing services',
        title: 'What we help with on the roofing side',
        body: 'Inspection, replacement, storm restoration, and the roof work that often has to be handled before solar can move.',
        items: roofingServices.map((service) => ({
          ...service,
          href: `/services/${service.slug}`,
        })),
      },
      {
        type: 'faq',
        title: 'Roofing questions',
        items: [
          {
            question: 'Can you inspect the roof before I decide on replacement?',
            answer:
              'Yes. Inspection is usually the right place to start when the roof condition is unclear or storm damage may be involved.',
          },
          {
            question: 'Do you handle roofing work tied to solar projects?',
            answer:
              'Yes. We help with the roof work that has to be resolved before a solar install, including detach-and-reset situations.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Talk with a roofing pro.',
        body: 'We will help you figure out the right next step for the roof.',
        ctaLabel: 'Request a consultation',
        ctaHref: '#consultation',
      },
    ],
  },
  {
    id: 'page-solar-incentives',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'incentives',
    title: 'Austin Solar Incentives',
    description:
      'Which solar incentives and exemptions are actually available for Texas homeowners right now.',
    pageType: 'locationPage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Solar incentives in Texas',
        title: 'Know exactly which solar incentives apply to your home before you price a thing.',
        body: 'Local utility programs, property-tax exemptions, and financing deals all affect your real cost. This page tells you what is available now and what you need to double-check before relying on it.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Solar panels representing incentive and project planning',
        },
        metrics: [
          { label: 'Biggest factor', value: 'Equipment cost drop' },
          { label: 'Also check', value: 'Local utility programs' },
          { label: 'Use this for', value: 'Project planning' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'What you need to verify',
        title: 'We will tell you what is on the table. You verify it is still there when you are ready.',
        body: 'Incentive programs change. Local rebates run out. Eligibility rules shift. A useful incentives page gives you the current picture and tells you exactly where to confirm the details before you sign anything.',
      },
      {
        type: 'faq',
        title: 'Incentive questions',
        items: [
          {
            question: 'Which incentives should I check first?',
            answer:
              'Start with your local utility to check for any active rebate. Then look at the property-tax exemption for solar in Texas, and factor in how financing assumptions change the payback.',
          },
          {
            question: 'Can I count on a rebate still being available when I am ready to install?',
            answer:
              'Not always. Local programs can change or run out of funding. We help you identify what is available today, but always confirm current status before committing.',
          },
        ],
      },
    ],
  },
  {
    id: 'page-about',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'about',
    title: 'About',
    description: "Who we are, how we work, and why we built a site that puts the homeowner's question first.",
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'About us',
        title: 'Texas homeowners deserve straight answers about roofs and solar.',
        body: 'Texas Solar and Roofing Pros exists to help homeowners cut through the noise. Roof condition, storm damage, insurance friction, energy upgrades, solar planning. We help you understand what is happening with your house so you can make the call, not get pressured into one.',
        heroImage: {
          urls: {
            regular: '/images/about-us.jpg',
          },
          alt: 'Residential home exterior representing Texas homeowners and home improvement planning',
        },
        metrics: [
          { label: 'Focus', value: 'Texas Homeowners' },
          { label: 'Coverage', value: 'Roofs & Solar' },
          { label: 'Approach', value: 'Straight talk' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'How we think',
        title: 'Useful first. Credible always. No pressure ever.',
        body: 'We cover both roofing and solar because that is how real homeowner problems work. A hail-damaged roof changes the solar timeline. A $400 electric bill might be an insulation problem, not a solar problem. We treat them as connected decisions because your house does not care about marketing categories.',
      },
      {
        type: 'aboutProfile',
        eyebrow: 'Meet the team',
        title:
          'Kathie Millen and Tandra Peters help homeowners sort out the roof, the solar timing, and the insurance questions before the project drifts.',
        body: 'Kathie brings the solar side into focus when roof condition, production, detach-and-reset, and project timing all have to line up. Tandra brings the roofing perspective, inspection mindset, and on-the-ground practicality that helps families understand what the roof is actually telling them and what the next step should be.',
        people: [
          {
            label: 'Profile',
            name: 'Kathie Millen',
            role: 'Solar advisor and homeowner guide',
            blurb:
              'Kathie helps homeowners understand when solar makes sense, when roofing or insurance issues need to be solved first, and how to keep the whole project aligned so the next step is actually the right one.',
            profileImage: {
              urls: {
                regular: '/images/kathie-millen.png',
              },
              alt: 'Kathie Millen',
            },
            certificationLabel: 'Certification',
            certificationTitle: 'NABCEP Certified PV Technical Sales Professional',
            badgeImage: {
              urls: {
                regular: 'https://www.nabcep.org/wp-content/uploads/2020/01/PVTS-Registered-Seal.jpg',
              },
              alt: 'NABCEP Certified PV Technical Sales Professional badge',
            },
          },
          {
            label: 'Roofing Consultant',
            name: 'Tandra Peters',
            role: 'Roofing consultant',
            blurb:
              'Tandra helps homeowners make sense of roof inspections, storm-related findings, repair-versus-replacement questions, and what to do next when the house, the claim, and the timeline all start colliding. She brings a practical roofing perspective shaped by four years of consulting work and the real-life lens of raising a family while managing a home.',
            profileImage: {
              urls: {
                regular:
                  'https://framerusercontent.com/images/uiHRL1xLU2ipXyTy47BrE94JhGI.jpg?scale-down-to=1024',
              },
              alt: 'Tandra Peters',
            },
          },
        ],
      },
      {
        type: 'quote',
        eyebrow: 'Built on conviction',
        title: 'Our mission',
        body: "We run this business to honor God — which means we would rather give you the honest answer than the profitable one. If your home does not need the work, we'll say so. Doing right by people isn't a strategy. It's the standard.",
      },
      {
        type: 'highlights',
        title: 'What you should expect from us',
        items: [
          {
            title: 'Mission and values',
            body: 'We believe homeowners make better decisions when they understand the problem first. Every page on this site is built around that idea.',
          },
          {
            title: 'Credentials and partners',
            body: 'Certifications, training, and the operating companies that handle the field work. We want you to know who you are working with.',
          },
          {
            title: 'A clear process from first click to consultation',
            body: 'How we review questions, how consultations work, and what to expect after you reach out. No surprises.',
          },
        ],
      },
    ],
  },
  {
    id: 'page-hail-damage',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'hail-damage',
    title: 'Hail Damage, Roof Claims, and Solar Roof Reset Questions',
    description:
      'Texas hail damage help: what to do about your roof, your insurance claim, and your solar panels before the project gets expensive and confusing.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Hail damage + insurance',
        title:
          'Hail hit your home? Here is how to handle the roof, the claim, and the solar panels without getting burned.',
        body: 'The real challenge is not the storm. It is figuring out whether the roof actually has damage, what the insurance estimate covers, and how to handle removing and reinstalling solar if it is already on the roof. That is where projects get slow, expensive, and confusing.',
        heroImage: {
          urls: {
            regular: '/images/hail-damage.png',
          },
          alt: 'Storm-damaged roof representing hail claim and reroof concerns',
        },
        metrics: [
          { label: 'Main concern', value: 'Roof damage + claims' },
          { label: 'Also covers', value: 'Solar detach + reset' },
          { label: 'Best next step', value: 'Inspection + documentation' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'What homeowners are actually dealing with',
        title:
          'The stress starts when the roofer, the insurance company, and the solar crew all act like someone else is handling the hard part.',
        body: 'The storm headlines fade fast. The real problem is whether the roof damage actually matches the claim, whether the insurance estimate caught all the work needed, and whether anyone has planned how to remove and reinstall solar before the reroof crew shows up. That is what we help you sort out.',
      },
      {
        type: 'quote',
        eyebrow: 'Our promise',
        title: 'Texas Solar and Roofing Pros',
        body: 'We help you figure out three things before any work starts: the roof condition, what the insurance estimate covers, and the plan for removing and reinstalling solar. When those three stay aligned, the project goes smoother and costs less.',
      },
      {
        type: 'highlights',
        title: 'What we help you figure out on the roofing and insurance side',
        items: [
          {
            title: 'Does your roof actually have storm damage, or just age?',
            body: 'A bad storm in the area does not mean your roof is damaged. The real question is whether your roof shows consistent hail impact that changes the repair decision, not just scattered cosmetic marks.',
          },
          {
            title: 'How your policy language changes what you are working with',
            body: 'Replacement cost value versus actual cash value, depreciation deductions, deductibles, and age-related exclusions all affect the money available after the adjuster writes the estimate. You need to understand those terms before you sign anything.',
          },
          {
            title: 'Whether the insurance estimate actually covers everything',
            body: 'Usually it does not. Code items, additional line items, ventilation, decking issues, and other legitimate work often need to be documented after the initial estimate. That is why supplements happen before the reroof budget actually makes sense.',
          },
        ],
      },
      {
        type: 'story',
        eyebrow: 'When solar is already on the roof',
        title: 'Panels on the roof turn a roofing claim into a three-way coordination problem.',
        body: 'Now you need the reroof and the solar work sequenced correctly. That means documenting system condition before removal, defining who handles removal and reinstallation, checking for panel or wiring damage, and making sure the reinstall is not treated as an afterthought.',
      },
      {
        type: 'serviceGrid',
        title: 'What Hail Actually Does to a Texas Roof',
        subtitle:
          'Hailstorms roll through Texas every year. If your home was in the path, the damage might not be obvious from the ground — but ignoring it gets expensive fast.',
        items: [
          {
            title: 'Roof leaks that start small and get worse',
            body: 'Hail cracks and punctures let water in. What starts as a small ceiling stain turns into warped decking, ruined insulation, and a repair bill that doubles every month you wait.',
            imageUrl: '/images/water-dripping-from-ceiling-damaged-interior-space-winter-season.jpg',
          },
          {
            title: "Mold you won't see until it's a problem",
            body: "That moisture has to go somewhere. It feeds mold behind walls and under insulation — the kind you don't notice until you smell it or someone in the house starts getting sick.",
            imageUrl: '/images/concrete-roof-wood-sky.jpg',
          },
          {
            title: 'Missing or cracked tiles that leave the house exposed',
            body: 'Hail knocks tiles loose or shatters them outright. Every gap is an open door for rain, pests, and heat loss. The longer it sits, the more damage spreads underneath.',
            imageUrl:
              '/images/overlapping-rows-yellow-ceramic-roofing-tiles-mounted-wooden-boards-covering-residential-building-roof-construction.jpg',
          },
        ],
      },
      {
        type: 'steps',
        title: 'How to keep the roof, insurance, and solar repairs aligned',
        items: [
          {
            title: 'Start with photos, notes, and storm timing',
            body: 'Document visible roof damage, interior leaks, soft-metal hits, and when the storm happened. Build the claim on evidence, not assumptions.',
          },
          {
            title: 'Get a real roof inspection, not just a weather recap',
            body: 'The inspection should tell you whether the roof actually has storm damage, whether repair is realistic, and whether a claim or full replacement makes sense.',
          },
          {
            title: 'Review the policy and estimate before approving any work',
            body: 'Do not assume the first adjuster estimate covers everything. Check depreciation, code items, exclusions, and likely additional line items before treating the budget as final.',
          },
          {
            title: 'Lock down removal and reinstallation responsibilities early',
            body: 'If solar panels are on the roof, define who removes them, who reinstalls them, how condition is documented, and what happens if solar components are also damaged. Do this before the reroof starts, not during.',
          },
        ],
      },
      {
        type: 'hailMap',
        title: 'Use the storm map as supporting evidence, not the whole decision.',
        body: 'Check recent storm activity for your property and compare it to what the roof inspection actually finds. The map supports the conversation. It does not replace someone looking at the roof in person.',
        items: [
          {
            title: 'Anchor the timeline',
            body: 'Use storm dates and location data to connect the weather event, the inspection, and the claim conversation into one clear timeline.',
          },
          {
            title: 'Back up your documentation',
            body: 'The map is most useful when it supports your photos, notes, and an in-person roof inspection instead of standing alone.',
          },
          {
            title: 'Keep the next step simple',
            body: 'If the roof damage, inspection findings, and storm timing all line up, move into estimate review and claim questions without overcomplicating it.',
          },
        ],
        ctaLabel: 'Request a roof review',
        ctaHref: '#estimate',
      },
      {
        type: 'faq',
        title: 'Hail damage, claims, and solar reset questions',
        items: [
          {
            question: 'Does hail always mean I need a new roof?',
            answer:
              'No. Some roofs show minor damage that can be repaired. Others show enough impact across the surface to justify replacement. The useful inspection is one that tells you the difference honestly. A good inspection looks at impact patterns, baseline roof age, and what makes financial sense rather than just recommending replacement on every hail claim.',
          },
          {
            question: 'What is RCV vs. ACV and why does it matter?',
            answer:
              'Replacement cost value (RCV) is what it would cost to replace the roof new. Actual cash value (ACV) subtracts depreciation. Your policy may have one or the other, and some policies have depreciation holdback, which means you get part of the payout now and the rest after repairs are completed. This changes how much money you actually have available right now. If your policy has a $5,000 deductible and your ACV payout is $6,000, you are only working with $1,000 until the roof work is done and you get the remaining depreciation back.',
          },
          {
            question: 'Who pays for removing and reinstalling solar when the roof needs work?',
            answer:
              'Sometimes the insurance claim includes it. Sometimes it does not. It depends on how the estimate is written and whether the damage is attributed to the same storm that hit the roof. This is exactly why it needs to be discussed and documented before the reroof crew shows up. If solar removal and reinstallation costs $3,000 and nobody clarified who is paying, you could end up covering that out of pocket when the insurance estimate did not include it.',
          },
          {
            question: 'What if the roof claim is approved but the solar panels are also damaged?',
            answer:
              'A good removal and reinstallation plan documents the condition of panels, wiring, mounts, and equipment before they come off the roof. That way if damage is discovered during removal, it is documented and can be added to the claim while the file is still active. If the solar work is treated as an afterthought and panels are reinstalled without that documentation, you could end up paying for repairs that should have been covered by the same storm claim.',
          },
          {
            question: 'How long does the whole process take from inspection to finished roof?',
            answer:
              'That depends on whether you have solar, whether the claim needs supplements, and whether there are delays in the supply chain. A straightforward roof-only claim can move from inspection to finished work in 4 to 8 weeks. If solar removal and reinstallation is involved, add another 2 to 3 weeks because you have to schedule removal before roofing, then schedule reinstallation after. Weather delays and material availability can add time on either end.',
          },
        ],
      },
    ],
  },
  {
    id: 'page-roof-insurance-claim-realities',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'resources/roof-insurance-and-claim-realities',
    title: 'Roof Insurance and Claim Realities',
    description:
      'What Texas homeowners need to understand about roof insurance claims, storm documentation, deductibles, depreciation, and where solar complicates the job.',
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Roofing + insurance',
        title: 'Roof insurance and claim realities',
        body: 'Storm claims get expensive when the estimate, the roof condition, and the solar conversation are all treated like separate problems. This page is here to simplify what actually matters before work starts.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
          },
          alt: 'Homeowner insurance paperwork on a desk',
        },
        actions: [
          { label: 'Talk through a claim', href: '#consultation', variant: 'default' },
          { label: 'Use the hail map', href: '/hail-damage', variant: 'secondary' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'What homeowners run into',
        title:
          'The roof problem is usually clear. The paperwork and estimate are where the project starts drifting.',
        body: 'Most homeowners are not confused about whether something happened to the roof. They are confused about whether the policy covers it, whether the first estimate is complete, and who is paying when solar has to come off before roofing work can begin.',
      },
      {
        type: 'highlights',
        title: 'What usually changes the outcome',
        items: [
          {
            title: 'Storm proof matters',
            body: 'Dates, location, inspection notes, and photos make the claim stronger when the adjuster is trying to separate storm damage from age and wear.',
          },
          {
            title: 'The first estimate is rarely the final answer',
            body: 'Flashing, code items, ventilation changes, decking issues, and solar detach and reset work often get added later if they were not fully captured the first time.',
          },
          {
            title: 'Solar changes the sequencing',
            body: 'If the panels have to come off, that needs to be planned before roofing is scheduled. Otherwise the claim, the roof crew, and the reinstall timing start colliding.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Claim questions that come up fast',
        items: [
          {
            question: 'Does insurance always pay for detach and reset?',
            answer:
              'No. Sometimes it is included in the claim, sometimes it has to be justified, and sometimes it is left out entirely until someone raises it. That is why it needs to be discussed early.',
          },
          {
            question: 'Does hail automatically mean full roof replacement?',
            answer:
              'No. Some roofs can be repaired. Some cannot. The useful inspection is the one that separates cosmetic marks, repairable damage, and damage severe enough to justify replacement.',
          },
          {
            question: 'Why does the estimate still change after approval?',
            answer:
              'Because the first estimate is a starting point. Additional line items are common once crews inspect details more closely or work begins and hidden issues are found.',
          },
        ],
      },
      {
        type: 'cta',
        title:
          'If the roof claim and the solar question are tangled together, get clarity before signing the next step.',
        body: 'A short review can save a lot of avoidable confusion around timing, coverage, and who is actually paying for what.',
        ctaLabel: 'Request a roof review',
        ctaHref: '#consultation',
      },
    ],
  },
  {
    id: 'page-insurance-basics',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'insurance-basics',
    title: 'Insurance Basics for Roof and Storm Claims',
    description:
      'A plain-language guide to replacement cost value, actual cash value, deductibles, additional line items, depreciation, and how roof and solar work get out of sync after a storm claim.',
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Insurance basics',
        title: 'Understand the claim before the paperwork starts driving the project.',
        body: 'Roof claims get expensive when the language is unclear. Deductibles, depreciation, additional line items, exclusions, and removing and reinstalling solar all change the actual amount you are working with. This page is here to make those pieces easier to sort before you sign anything.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200',
          },
          alt: 'Insurance paperwork and home planning documents on a desk',
        },
        actions: [
          { label: 'Talk through a claim', href: '#consultation', variant: 'default' },
          { label: 'See hail damage help', href: '/hail-damage', variant: 'secondary' },
        ],
        metrics: [
          { label: 'Claim type', value: 'Roof + solar claims' },
          { label: 'Focus', value: 'Scope and payout clarity' },
          { label: 'Best for', value: 'Storm-driven roof decisions' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'Why this matters',
        title:
          'Most of the trouble starts after the storm, when the estimate does not match what the house actually needs.',
        body: 'The adjuster estimate is usually just the starting point. Homeowners get trapped between roof quotes, depreciation holdback, deductible timing, policy exclusions, and the solar question nobody raised early enough. The goal is to understand where the money is coming from, what work might be missing from the initial estimate, and what should be clarified before work starts.',
      },
      {
        type: 'highlights',
        title: 'The claim terms that change the real budget',
        items: [
          {
            title: 'RCV vs. ACV',
            body: 'Replacement cost value is what a new roof costs. Actual cash value subtracts what the roof has depreciated. One usually gets paid back after work is done. The other may come with a holdback. Knowing which one applies to you changes whether you have enough money now or if you are waiting for the second payment.',
          },
          {
            title: 'Deductible timing',
            body: 'The deductible is part of the project math from day one. If the estimate is smaller than you expected or the payout is delayed, that deductible eats up a bigger piece of what you actually have to work with right away.',
          },
          {
            title: 'Additional line items',
            body: 'An additional line item is what gets added when the initial estimate missed real work. That is common, especially when flashing details, code-required items, or removing and reinstalling solar were not accounted for in the first inspection. Do not treat the first estimate as final.',
          },
        ],
      },
      {
        type: 'steps',
        title: 'How to keep the claim from turning into a mess',
        items: [
          {
            title: 'Read the estimate before signing a roof contract',
            body: 'Make sure the estimate actually covers the roof condition, code-required items, accessories, and any solar-related work before the project starts moving forward.',
          },
          {
            title: 'Separate roof work from solar work, but plan them together',
            body: 'Removing and reinstalling solar should be discussed before the reroof starts, not after materials are ordered and schedules are locked. Different crews, different timing, but one project.',
          },
          {
            title: 'Clarify missing items while the insurance file is still active',
            body: 'If something is missing from the estimate, document it and push the conversation for additional line items early. Waiting until work starts is how projects stall and costs spike.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Insurance basics homeowners ask first',
        items: [
          {
            question: 'What is depreciation holdback?',
            answer:
              'If your policy is written on a replacement cost basis, you may not get the full amount up front. The insurance company pays part of the bill now, and the remainder after the work is completed and documented. This is called depreciation holdback. If the roof work costs $12,000 and depreciation is $3,000, you might get $9,000 initially and the remaining $3,000 after invoices are submitted and approved. If you do not account for that timing, the project cash flow can get very tight because your contractor usually needs payment upfront or shortly after the work is done, not weeks later.',
          },
          {
            question: 'Why does the first insurance estimate feel incomplete so often?',
            answer:
              'Because roofs, flashing details, code requirements, and solar-related work are not always fully captured in an initial inspection. An adjuster may spend a few hours on the roof, photograph the impact, and write an estimate based on what they saw. But flashing issues, ventilation problems, decking damage, or other details that only show up once work starts are not in that first estimate. Additional line items are normal, not a sign that something went wrong. This is why you should not treat the first estimate as the final budget.',
          },
          {
            question: 'Does insurance always pay for removing and reinstalling solar?',
            answer:
              'No. Sometimes it is covered under the same storm claim, sometimes it is partially covered, and sometimes it has to be justified separately with additional documentation. Whether it gets included depends on how the estimate is written and whether the damage is tied to the same weather event. That is why removing and reinstalling solar needs to be discussed with your insurance adjuster while the estimate is still being finalized, not after the reroof is already scheduled.',
          },
          {
            question: 'What if the estimate seems too low compared to other quotes?',
            answer:
              'Do not assume the insurance estimate is final or that your contractor has to stay within it. The adjuster is not a roofer. They estimate based on a limited inspection and standard pricing. Your roofing contractor may find additional work once they are on the roof. You can request additional line items to be added to the insurance file while it is still active. It is much easier to add work to the claim before the file is closed than it is to fight for coverage after the roof is already done.',
          },
          {
            question: 'How do I know if my homeowners insurance is actually going to cover this claim?',
            answer:
              'Read your policy and look at what is covered under storm damage. Most policies cover damage from hail, wind, and fallen trees. Some have exclusions for damage related to age, lack of maintenance, or gradual deterioration. If your roof is 25 years old and fails during a hailstorm, the damage is usually covered even if age contributed to the failure. But if the damage is not clearly tied to a specific storm event, the claim could be denied. That is why documentation, photos, and storm timing matter. If you are not sure whether your claim will be accepted, ask your insurance agent or the adjuster directly. Do not assume.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Talk with our team.',
        body: 'We will help you sort out the claim, the roof, and the right next step.',
        ctaLabel: 'Request a consultation',
        ctaHref: '#consultation',
      },
    ],
  },
  {
    id: 'page-privacy-policy',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description:
      'How Texas Solar and Roofing Pros collects, uses, stores, and shares personal information, including lead forms and website analytics data.',
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'story',
        eyebrow: 'Legal',
        title: 'Privacy Policy',
        body: `We use information to respond to inquiries, improve the site, and operate the business.

If you fill out a form, we collect the information you enter, such as your name, email address, phone number, address details, and anything else you choose to include. We use that information to respond to your request, coordinate services, and communicate about roofing, solar, hail, insurance, or energy-efficiency questions.

We also use Google Analytics 4 and similar website tools to understand how visitors use the site, which pages are working, how traffic arrives, and how the site can be improved. That data may include browser, device, referral, and page interaction information.

We may use trusted providers for hosting, analytics, CRM, email, form handling, and related business operations. They only get access to the information needed to perform those functions. We do not treat form submissions as public content, and we do not sell lead details as a retail data product.`,
      },
      {
        type: 'faq',
        title: 'Privacy questions',
        items: [
          {
            question: 'Do you use Google Analytics?',
            answer:
              'Yes. The site uses Google Analytics 4 to understand site traffic and behavior. That means analytics-related identifiers may be stored or read in your browser when analytics is enabled.',
          },
          {
            question: 'How do I request changes or deletion?',
            answer:
              'Email info@texassolarandroofingpros.com and describe the request. We will review it and respond based on the information we can verify and any legal or operational obligations that apply.',
          },
          {
            question: 'Do you share my information?',
            answer:
              'We may share it with service providers or project participants when needed to respond to your request or operate the site, but not as a general-purpose public data feed.',
          },
        ],
      },
    ],
  },
  {
    id: 'page-terms',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'terms',
    title: 'Terms of Use',
    description:
      'Terms governing use of the Texas Solar and Roofing Pros website, informational content, and request forms.',
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'article',
        eyebrow: 'Legal',
        title: 'Terms of Use',
        body: [
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-intro',
            markDefs: [],
            children: [
              {
                _type: 'span',
                marks: [],
                text: 'These Legal Terms constitute a legally binding agreement made between you and Texas Solar and Roofing Pros concerning your access to and use of our website and services.',
              },
            ],
          },
          {
            _type: 'block',
            style: 'h2',
            _key: 'fixture-toc',
            markDefs: [],
            children: [{ _type: 'span', marks: [], text: 'Table of Contents' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-toc-1',
            markDefs: [{ _key: 'lk-1', _type: 'link', href: '#1-our-services' }],
            children: [{ _type: 'span', marks: ['lk-1'], text: '1. OUR SERVICES' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-toc-2',
            markDefs: [{ _key: 'lk-2', _type: 'link', href: '#2-intellectual-property-rights' }],
            children: [{ _type: 'span', marks: ['lk-2'], text: '2. INTELLECTUAL PROPERTY RIGHTS' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-toc-3',
            markDefs: [{ _key: 'lk-3', _type: 'link', href: '#3-user-representations' }],
            children: [{ _type: 'span', marks: ['lk-3'], text: '3. USER REPRESENTATIONS' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-toc-4',
            markDefs: [{ _key: 'lk-4', _type: 'link', href: '#4-prohibited-activities' }],
            children: [{ _type: 'span', marks: ['lk-4'], text: '4. PROHIBITED ACTIVITIES' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-toc-5',
            markDefs: [{ _key: 'lk-5', _type: 'link', href: '#13-disclaimer' }],
            children: [{ _type: 'span', marks: ['lk-5'], text: '13. DISCLAIMER' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-toc-6',
            markDefs: [{ _key: 'lk-6', _type: 'link', href: '#14-limitations-of-liability' }],
            children: [{ _type: 'span', marks: ['lk-6'], text: '14. LIMITATIONS OF LIABILITY' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-toc-7',
            markDefs: [{ _key: 'lk-7', _type: 'link', href: '#18-contact-us' }],
            children: [{ _type: 'span', marks: ['lk-7'], text: '18. CONTACT US' }],
          },
          {
            _type: 'block',
            style: 'h2',
            _key: 'fixture-1',
            markDefs: [],
            children: [{ _type: 'span', marks: [], text: '1. OUR SERVICES' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-1-p1',
            markDefs: [],
            children: [
              {
                _type: 'span',
                marks: [],
                text: 'The Services are not tailored to comply with industry-specific regulations (HIPAA, FISMA, etc.), so if your interactions would be subjected to such laws, you may not use the Services.',
              },
            ],
          },
          {
            _type: 'block',
            style: 'h2',
            _key: 'fixture-13',
            markDefs: [],
            children: [{ _type: 'span', marks: [], text: '13. DISCLAIMER' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-13-p1',
            markDefs: [],
            children: [
              {
                _type: 'span',
                marks: [],
                text: 'THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK.',
              },
            ],
          },
          {
            _type: 'block',
            style: 'h2',
            _key: 'fixture-14',
            markDefs: [],
            children: [{ _type: 'span', marks: [], text: '14. LIMITATIONS OF LIABILITY' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-14-p1',
            markDefs: [],
            children: [
              {
                _type: 'span',
                marks: [],
                text: 'IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES.',
              },
            ],
          },
          {
            _type: 'block',
            style: 'h2',
            _key: 'fixture-18',
            markDefs: [],
            children: [{ _type: 'span', marks: [], text: '18. CONTACT US' }],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: 'fixture-18-p1',
            markDefs: [],
            children: [
              {
                _type: 'span',
                marks: [],
                text: 'If you have questions about these Legal Terms, please contact us at Texas Solar and Roofing Pros, 1700 Pagedale Cove, Cedar Park, TX 78613, (512) 775-0561, info@texas-srp.com.',
              },
            ],
          },
        ],
      },
      {
        type: 'faq',
        title: 'Terms questions',
        items: [
          {
            question: 'Can site content be outdated or change over time?',
            answer:
              'Yes. We try to keep content current, but programs, incentives, insurance rules, product availability, and pricing can change. The site is not a guarantee that any specific offer, figure, or policy treatment is currently available.',
          },
          {
            question: 'Does this site guarantee results or savings?',
            answer:
              'No. Results depend on the property, usage, roof condition, financing, utility rates, weather, workmanship, and other factors outside a simple web page.',
          },
          {
            question: 'How do I contact you about these terms?',
            answer:
              'Email info@texassolarandroofingpros.com if you have a question about site use or need to raise an issue related to these terms.',
          },
        ],
      },
    ],
  },
  ...servicePages,
  {
    id: 'page-solar-guides',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'guides',
    title: 'Texas Solar and Roofing Guides',
    description:
      'Plain-language guides on solar costs, roofing decisions, storm damage claims, detach and reset, and project planning for Texas homeowners who want real answers before signing anything.',
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Guide library',
        title: 'Skip the generic advice. These guides are built for Texas homeowners.',
        body: 'Solar economics, roof condition, storm damage claims, detach-and-reset, battery backup, financing traps, and how to plan both projects together. If the service pages leave you wanting more detail, the guides go deeper.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Residential solar roof used as the guide library hero image',
        },
        metrics: [
          { label: 'Guides available', value: '9 guides' },
          { label: 'Built for', value: 'Research + planning' },
          { label: 'Audience', value: 'Texas homeowners' },
        ],
      },
      {
        type: 'guideGrid',
        title: 'Solar and roofing guides',
        items: getSolarGuideGridItems(),
      },
      {
        type: 'cta',
        title: 'Talk with our team',
        body: 'Roof problem? We guide next steps.',
        ctaLabel: 'Reach out to our team',
      },
    ],
  },
  ...getSolarGuidePages(),
  {
    id: 'page-landing-solar-homes',
    siteSlug: 'austin-solar-homes',
    slug: '',
    title: 'Austin Solar Homes',
    description: 'Is your Austin home actually a good fit for solar? Find out before you get a quote.',
    pageType: 'landingPage',
    templateLevel: 'landing',
    sections: solarHomeSections,
  },
  {
    id: 'page-roofing-home',
    siteSlug: 'roof-pros-of-austin',
    slug: '',
    title: 'Roof Pros of Austin',
    description:
      'Dedicated roofing help for Austin homeowners dealing with storms, aging roofs, and replacement decisions.',
    pageType: 'home',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Austin roofing',
        title:
          "Austin's dedicated roofing site is coming. Storm pages, inspections, replacements, and claim support under one roof.",
        body: 'This site is reserved for a full roofing-first build with everything Austin homeowners need after a storm or when a roof reaches the end of its life.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1656646549671-000665d8d8bc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
          },
          alt: 'Residential roof representing the reserved roofing site',
        },
        metrics: [
          { label: 'Category', value: 'Roofing' },
          { label: 'Current status', value: 'Coming soon' },
          { label: 'Next step', value: 'Expansion ready' },
        ],
      },
    ],
  },
]

export const initialPublishJobs = [
  {
    id: 'job-1',
    siteSlug: 'texas-solar-and-roofing-pros',
    contentType: 'post',
    title: 'Austin Solar Installation Cost',
    prompt:
      'Write a practical guide about how Austin homeowners should evaluate installation cost, incentives, and payback.',
    sources: ['https://www.energy.gov/eere/solar/homeowners-guide-going-solar'],
    provider: 'placeholder-openai',
    model: 'gpt-4.1',
    status: 'draft_ready',
    reviewStatus: 'needs_review',
    output:
      'Draft generated from the placeholder AI pipeline. Replace this with durable queue-backed output when the real gateway is added.',
    createdAt: '2026-03-09T08:00:00.000Z',
    updatedAt: '2026-03-09T08:10:00.000Z',
  },
  {
    id: 'job-2',
    siteSlug: 'roof-pros-of-austin',
    contentType: 'servicePage',
    title: 'Austin Roof Inspection Guide',
    prompt: 'Draft a lead-gen page about residential roof inspections in Austin after hail season.',
    sources: [],
    provider: 'placeholder-anthropic',
    model: 'claude-3.7-sonnet',
    status: 'queued',
    reviewStatus: 'not_started',
    output: '',
    createdAt: '2026-03-09T08:20:00.000Z',
    updatedAt: '2026-03-09T08:20:00.000Z',
  },
]

export const initialDomainRecords = sites.map((site, index) => ({
  id: `domain-${index + 1}`,
  domain: site.primaryDomain,
  siteSlug: site.redirectTarget ?? site.slug,
  tier: site.tier,
  category: site.category,
  redirectTarget: site.redirectTarget,
  projectId: process.env.VERCEL_PROJECT_ID ?? 'local-project',
  verificationStatus: site.tier === 'redirect' ? 'redirect-only' : 'pending',
  verified: false,
  dnsInstructions:
    site.tier === 'redirect'
      ? []
      : [
          {
            type: 'TXT',
            domain: `_vercel.${site.primaryDomain}`,
            value: `vc-domain-verify=${site.primaryDomain},placeholder`,
            reason: 'Add this TXT record to verify the domain on Vercel.',
          },
        ],
  lastCheckedAt: '2026-03-09T09:00:00.000Z',
}))

export const initialAnalyticsSnapshots = [
  {
    siteSlug: 'texas-solar-and-roofing-pros',
    sessions: 8420,
    uniqueVisitors: 6150,
    leads: 214,
    conversionRate: 2.54,
    aiReferrals: 184,
    organicSessions: 5610,
    directSessions: 1490,
    paidSessions: 720,
    avgEngagementSeconds: 126,
    topPages: [
      { path: '/', sessions: 3610, conversionRate: 3.4 },
      { path: '/solar-costs', sessions: 1940, conversionRate: 4.2 },
      { path: '/incentives', sessions: 980, conversionRate: 2.3 },
    ],
    topQueries: ['austin solar installation cost', 'austin solar incentives', 'best solar company austin'],
  },
  {
    siteSlug: 'roof-pros-of-austin',
    sessions: 3280,
    uniqueVisitors: 2488,
    leads: 88,
    conversionRate: 2.68,
    aiReferrals: 42,
    organicSessions: 2070,
    directSessions: 710,
    paidSessions: 300,
    avgEngagementSeconds: 102,
    topPages: [
      { path: '/', sessions: 1890, conversionRate: 2.9 },
      { path: '/hail-damage', sessions: 640, conversionRate: 3.1 },
    ],
    topQueries: ['roof repair austin', 'austin roofing company', 'hail damage roof austin'],
  },
  {
    siteSlug: 'austin-wedding-vendors',
    sessions: 1940,
    uniqueVisitors: 1510,
    leads: 49,
    conversionRate: 2.53,
    aiReferrals: 28,
    organicSessions: 1240,
    directSessions: 470,
    paidSessions: 110,
    avgEngagementSeconds: 141,
    topPages: [
      { path: '/', sessions: 990, conversionRate: 2 },
      { path: '/venues', sessions: 430, conversionRate: 3.6 },
    ],
    topQueries: ['austin wedding vendors', 'dripping springs venues', 'austin wedding planner'],
  },
  {
    siteSlug: 'austin-solar-homes',
    sessions: 1120,
    uniqueVisitors: 840,
    leads: 27,
    conversionRate: 2.41,
    aiReferrals: 11,
    organicSessions: 780,
    directSessions: 210,
    paidSessions: 70,
    avgEngagementSeconds: 98,
    topPages: [{ path: '/', sessions: 1120, conversionRate: 2.41 }],
    topQueries: ['austin solar homes', 'solar ready homes austin', 'solar home value austin'],
  },
]

export const initialAnalyticsGoals = [
  {
    id: 'goal-1',
    name: 'Hero site lead form submit',
    goalLevel: 'site',
    siteSlug: 'texas-solar-and-roofing-pros',
    eventName: 'lead_form_submitted',
    targetValue: 180,
    interval: 'monthly',
    status: 'active',
    owner: 'Growth Ops',
    notes: 'Primary lead KPI for the first production hero site.',
  },
  {
    id: 'goal-2',
    name: 'AI referral traffic',
    goalLevel: 'portfolio',
    siteSlug: 'all',
    eventName: 'ai_referral_session',
    targetValue: 250,
    interval: 'monthly',
    status: 'active',
    owner: 'SEO',
    notes: 'Track cited traffic from AI search and conversational answer engines.',
  },
  {
    id: 'goal-3',
    name: 'Domain verification completion',
    goalLevel: 'portfolio',
    siteSlug: 'all',
    eventName: 'verified_domain_count',
    targetValue: 12,
    interval: 'quarterly',
    status: 'active',
    owner: 'Platform Ops',
    notes: 'Rollout KPI for moving domain inventory into verified live status.',
  },
]
