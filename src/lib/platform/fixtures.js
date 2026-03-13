import { getSolarGuideGridItems, getSolarGuidePages } from './guides.js'
import { mainServices, roofingServices, specialtyServices, servicePages } from './service-catalog.js'

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
    primary: 'hsl(16 82% 62%)',
    secondary: 'hsl(204 42% 13%)',
    accent: 'hsl(190 58% 61%)',
    surface: 'hsl(24 44% 97%)',
    heroTone: 'dark',
  },
  solar: {
    primary: 'hsl(14 88% 65%)',
    secondary: 'hsl(190 61% 15%)',
    accent: 'hsl(190 64% 63%)',
    surface: 'hsl(20 50% 97%)',
    heroTone: 'warm',
  },
  roofing: {
    primary: 'hsl(18 78% 58%)',
    secondary: 'hsl(210 50% 14%)',
    accent: 'hsl(24 85% 62%)',
    surface: 'hsl(24 40% 97%)',
    heroTone: 'dark',
  },
  weddings: {
    primary: 'hsl(348 68% 64%)',
    secondary: 'hsl(216 34% 18%)',
    accent: 'hsl(32 90% 70%)',
    surface: 'hsl(0 0% 98%)',
    heroTone: 'light',
  },
  homeServices: {
    primary: 'hsl(28 70% 58%)',
    secondary: 'hsl(204 38% 17%)',
    accent: 'hsl(192 46% 58%)',
    surface: 'hsl(34 42% 97%)',
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
  { domain: 'solarpanelsatx.com', seoScore: 100, tier: 'Hero', category: 'solar', slug: 'solar-panels-atx' },
  {
    domain: 'austinsolarsolutions.com',
    seoScore: 100,
    tier: 'Hero',
    category: 'solar',
    slug: 'austin-solar-solutions',
  },
  {
    domain: 'austinsolarpros.com',
    seoScore: 10,
    tier: 'Redirect',
    category: 'solarRoofing',
    slug: 'austin-solar-pros',
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
  { domain: 'roofsfortexas.com', seoScore: 40, tier: 'Mid', category: 'roofing', slug: 'roofs-for-texas' },
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
  { domain: 'texasplanners.com', seoScore: 40, tier: 'Mid', category: 'weddings', slug: 'texas-planners' },
  {
    domain: 'austinseliteweddings.com',
    seoScore: 40,
    tier: 'Mid',
    category: 'weddings',
    slug: 'austins-elite-weddings',
  },
  { domain: 'austinweddings.net', seoScore: 40, tier: 'Mid', category: 'weddings', slug: 'austin-weddings' },
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
  { domain: 'austinweddingsandspecialevents.com', seoScore: 10, tier: 'Redirect', category: 'weddings' },
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
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .replace(/^-|-$/g, '')
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
    seo: {
      title,
      description: `${title} \u2014 honest ${categories[entry.category].toLowerCase()} guidance for Austin and Texas homeowners who want real answers, not a sales pitch.`,
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
    title: "Not sure if your home is a good solar candidate? Let's find out.",
    body: 'Whether you are buying a home, comparing neighborhoods, or just tired of high energy bills, a quick conversation about your specific house is the fastest way to get a real answer.',
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
      'Honest roofing, solar, storm-damage, and energy guidance for Texas homeowners who want answers, not a sales pitch.',
    pageType: 'home',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Texas solar + roofing',
        title: "Storm damage? High electric bills? Let's figure out what your house actually needs.",
        body: 'Maybe it is hail damage. Maybe the roof is 20 years old. Maybe your electric bill hit $400 last summer and you are wondering if solar is the move. Whatever brought you here, the goal is the same: figure out what is going on with the house and handle it in the right order.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Texas home with rooftop solar panels',
        },
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
        title: 'Fix what is broken first. Then talk about upgrades.',
        body: 'Too many companies try to sell solar and roofing as one big package deal. That is not how homes work. If your roof has storm damage, handle that first. If your HVAC is bleeding money, address that. Solar is a smart move for a lot of Texas homes, but only when the timing is right and the roof underneath is solid.',
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
            title: 'Request a consultation once you know what you are dealing with',
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
              'Absolutely. But they should not be blurred into one sales pitch. Roof condition, storm timing, and insurance can all change when solar should happen and how it gets priced. Keeping them separate makes the plan smarter.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Tell us what is going on with the house. We will point you in the right direction.',
        body: 'Whether it is a roof that took hail, an electric bill that makes no sense, or a solar project you want to plan the right way, a short conversation about your specific home is the best starting point.',
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
        body: 'You have probably seen numbers all over the map. That is because every home is different. This page breaks down installed cost, financing, tax credits, and realistic payback so you can compare apples to apples before talking to anyone.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Solar panels on a residential roof during daylight',
        },
        metrics: [
          { label: 'Typical range', value: '$18k\u2013$32k' },
          { label: 'Avg. payback', value: '7\u20139 years' },
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
            body: 'The federal tax credit is the big one, but local utility programs and property-tax exemptions matter too. We explain what is available now and what you need to verify before signing.',
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
            body: 'Some projects are about fixing damage right now. Others are about improving the home over the next 5\u201310 years. Keeping those decisions separate saves you money and headaches.',
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
        title: 'Tell us what the house is doing and we will help you figure out where to start.',
        body: 'Storm damage, sky-high bills, aging equipment, or a solar project you want to plan carefully. Whatever it is, the next step should be a real conversation about your home, not a cookie-cutter sales call.',
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
      'Solar guidance for Texas homeowners who want to know the real savings before committing to a system.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Solar for Texas homes',
        title:
          "Will solar actually save you money? Let's look at the numbers before anyone tries to sell you panels.",
        body: 'This is for homeowners who want to compare system size, electric bill impact, tax credits, financing, and payback before they commit. If the math works, great. If it does not, you should know that upfront.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Residential solar array in sunlight',
        },
        metrics: [
          { label: 'Focus', value: 'Real savings' },
          { label: 'Covers', value: 'Cost, credits, payoff' },
          { label: 'Built for', value: 'Planning stage' },
        ],
      },
      {
        type: 'highlights',
        title: 'What a useful solar conversation should cover',
        items: [
          {
            title: 'System size that matches your home, not a sales target',
            body: 'Your roof layout, shade, energy use, and goals all affect the right system size. We show you what matters instead of pushing the biggest system possible.',
          },
          {
            title: 'Cost and financing with the assumptions laid bare',
            body: 'Cash price, financed price, what the tax credit actually covers, and realistic payback. No dressed-up numbers or best-case-only projections.',
          },
          {
            title: 'Whether now is the right time or you should wait',
            body: 'Sometimes the smart move is to fix the roof first, upgrade the HVAC, or wait for a better financing window. We help you figure that out.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Solar questions',
        items: [
          {
            question: 'Can I evaluate solar without it turning into a roofing conversation?',
            answer:
              'Yes. Solar should stand on its own for homeowners focused on savings. If your roof changes the picture, we will tell you, but we are not going to hijack your solar research with a roofing upsell.',
          },
          {
            question: 'How is this different from a typical solar installer page?',
            answer:
              'Most installer pages exist to get you to click "Get a Quote" as fast as possible. We explain the assumptions behind the savings so you actually understand the math before you talk to anyone.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Want the full picture? The guide library goes deeper.',
        body: 'Our guides cover costs, batteries, incentives, financing options, and roof readiness in the kind of detail a quick service page cannot.',
        ctaLabel: 'Browse the solar guides',
        ctaHref: '/guides',
      },
    ],
  },
  {
    id: 'page-roofing',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'roofing',
    title: 'Roofing',
    description:
      'Straight-talk roofing help for Texas homeowners dealing with hail damage, aging roofs, insurance claims, and replacement decisions.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Roofing in Texas',
        title:
          'Hail damage, insurance headaches, and an aging roof all hitting at once? We can help you sort it out.',
        body: 'When a storm rolls through, everything gets complicated fast: the roof, the claim, the adjuster, and if you have solar, the detach-and-reset question nobody warned you about. This side of the site helps you handle it in the right order.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1656646549671-000665d8d8bc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
          },
          alt: 'Residential roof viewed from above for inspection and replacement planning',
        },
        metrics: [
          { label: 'Focus', value: 'Storm + roof condition' },
          { label: 'Covers', value: 'Claims, RCV/ACV, replacement' },
          { label: 'Built for', value: 'Roof triage' },
        ],
      },
      {
        type: 'steps',
        title: 'What a useful roofing conversation helps you do',
        items: [
          {
            title: 'Figure out if the storm actually damaged your roof',
            body: 'Bad weather does not automatically mean roof damage. Start with a real inspection and actual evidence, not a door-knocker who showed up the day after the hail.',
          },
          {
            title: 'Understand the insurance language before it costs you',
            body: 'RCV vs. ACV, depreciation holdback, age thresholds, and detach-and-reset line items all affect what you are actually working with after the adjuster leaves.',
          },
          {
            title: 'Separate the urgency from the sales pressure',
            body: 'A damaged roof is urgent. A roofer pressuring you to sign before the insurance check clears is not. We help you tell the difference.',
          },
          {
            title: 'Connect the roof back to solar when it matters',
            body: 'If panels are already up there or solar is in your future plans, the roof decision affects the solar timeline. We make sure those two conversations stay connected.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Roofing questions',
        items: [
          {
            question: 'Why do you keep roofing separate from solar on this site?',
            answer:
              'Because a homeowner who just got hit by hail needs roof answers, not a solar pitch. We connect the two when it matters, but the first visit should answer the first question.',
          },
          {
            question: 'Where does detach-and-reset fit in?',
            answer:
              'Both places. It starts as a roofing and insurance issue (who pays, how it is scoped), but it also affects solar project planning and total cost. We cover it on both sides so nothing falls through the cracks.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Dealing with hail damage, an insurance claim, or a solar detach question?',
        body: 'The hail damage page walks you through what to document, what to ask before the claim gets messy, and how to handle detach-and-reset when solar is already on the roof.',
        ctaLabel: 'Go to the hail damage page',
        ctaHref: '/hail-damage',
      },
    ],
  },
  {
    id: 'page-solar-incentives',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'incentives',
    title: 'Austin Solar Incentives',
    description:
      'Which solar incentives, tax credits, and exemptions are actually available for Texas homeowners right now.',
    pageType: 'locationPage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Solar incentives in Texas',
        title: 'Know exactly which solar incentives apply to your home before you price a thing.',
        body: 'The federal tax credit gets the headlines, but local utility programs, property-tax exemptions, and financing deals all affect the real number. This page tells you what is available now and what you need to double-check before relying on it.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Solar panels representing incentive and project planning',
        },
        metrics: [
          { label: 'Biggest factor', value: 'Federal tax credit' },
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
              'Start with the federal solar tax credit. Then check your local utility for any active rebate, look at the property-tax exemption for solar in Texas, and factor in how financing assumptions change the payback.',
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
    description:
      "Who we are, how we work, and why we built a site that puts the homeowner's question before the sales pitch.",
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'About us',
        title: 'We built this site because Texas homeowners deserve straight answers about roofs and solar.',
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
        type: 'quote',
        eyebrow: 'Built on conviction',
        title: 'Our mission',
        body: "We run this business to honor God — which means we would rather give you the honest answer than the profitable one. If your home does not need the work, we'll say so. Doing right by people isn't a strategy. It's the standard.",
      },
      {
        type: 'highlights',
        title: 'What we are building here',
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
        body: 'The real challenge is not the storm. It is figuring out whether the roof shows real damage, whether the insurance scope covers everything, and how to handle detach-and-reset if solar is already up there. That is where projects get slow, expensive, and confusing.',
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
        body: 'The storm headline is not the problem. The problem is whether the roof evidence supports the claim, whether the adjuster missed code items or supplements, and whether anyone has defined the detach-and-reset plan before the reroof crew shows up. That is what we help you sort out.',
      },
      {
        type: 'quote',
        eyebrow: 'Our promise',
        title: 'Texas Solar and Roofing Pros',
        body: 'We help you sort out three things before any work starts: the roof condition, the insurance scope, and the solar removal-and-reinstall plan. When those three stay aligned, the project goes smoother and costs less.',
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
            title: 'How your policy language changes what you are actually working with',
            body: 'RCV vs. ACV, depreciation holdback, deductibles, and age-related exclusions all affect the real budget after the adjuster writes the first scope. You need to understand those terms before you sign anything.',
          },
          {
            title: "Whether the adjuster's first scope is actually complete",
            body: 'It usually is not. Code items, supplements, ventilation, decking issues, and other legitimate line items often need to be documented before the reroof budget makes sense.',
          },
        ],
      },
      {
        type: 'story',
        eyebrow: 'When solar is already on the roof',
        title: 'Panels on the roof turn a roofing claim into a three-way coordination problem.',
        body: 'Now you need the reroof and the solar work sequenced correctly. That means documenting system condition before removal, defining who handles detach-and-reset, checking for panel or wiring damage, and making sure the reinstall is not treated as an afterthought.',
      },
      {
        type: 'serviceGrid',
        title: 'What Hail Actually Does to a Texas Roof',
        subtitle: 'Hailstorms roll through Texas every year. If your home was in the path, the damage might not be obvious from the ground — but ignoring it gets expensive fast.',
        items: [
          {
            title: 'Roof leaks that start small and get worse',
            body: 'Hail cracks and punctures let water in. What starts as a small ceiling stain turns into warped decking, ruined insulation, and a repair bill that doubles every month you wait.',
            imageUrl: '/images/water-dripping-from-ceiling-damaged-interior-space-winter-season.jpg',
          },
          {
            title: 'Mold you won\'t see until it\'s a problem',
            body: 'That moisture has to go somewhere. It feeds mold behind walls and under insulation — the kind you don\'t notice until you smell it or someone in the house starts getting sick.',
            imageUrl: '/images/concrete-roof-wood-sky.jpg',
          },
          {
            title: 'Missing or cracked tiles that leave the house exposed',
            body: 'Hail knocks tiles loose or shatters them outright. Every gap is an open door for rain, pests, and heat loss. The longer it sits, the more damage spreads underneath.',
            imageUrl: '/images/overlapping-rows-yellow-ceramic-roofing-tiles-mounted-wooden-boards-covering-residential-building-roof-construction.jpg',
          },
        ],
      },
      {
        type: 'steps',
        title: 'How to keep the roof, insurance, and solar scopes aligned',
        items: [
          {
            title: 'Start with photos, notes, and storm timing',
            body: 'Document visible roof damage, interior leaks, soft-metal hits, and when the storm happened. Build the claim on evidence, not assumptions.',
          },
          {
            title: 'Get a real roof inspection, not just a weather recap',
            body: 'The inspection should tell you whether the roof actually shows storm damage, whether repair is realistic, and whether a claim or full replacement is justified.',
          },
          {
            title: 'Review the policy and scope before approving any work',
            body: 'Do not assume the first adjuster scope is complete. Check depreciation, code items, exclusions, and likely supplements before treating the budget as final.',
          },
          {
            title: 'Lock down detach-and-reset responsibilities early',
            body: 'If solar panels are on the roof, define who removes them, who reinstalls them, how condition is documented, and what happens if solar components are also damaged. Do this before the reroof, not during.',
          },
        ],
      },
      {
        type: 'hailMap',
        title: 'Use the storm map as supporting evidence, not the whole decision.',
        body: 'Check recent storm activity for your property and compare it to what the roof inspection actually finds. The map supports the conversation. It does not replace boots on the roof.',
        items: [
          {
            title: 'Anchor the timeline',
            body: 'Use storm dates and location data to connect the weather event, the inspection, and the claim conversation into one clear timeline.',
          },
          {
            title: 'Back up your documentation',
            body: 'The map is most useful when it supports your photos, notes, and a roof-level inspection instead of standing alone.',
          },
          {
            title: 'Keep the next step simple',
            body: 'If the roof concerns, inspection findings, and storm timing all line up, move into scope review and claim questions without overcomplicating it.',
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
              'No. Some roofs show minor or repairable damage. Others show enough impact to justify replacement. The useful inspection is the one that tells you the difference honestly, not the one that always says "you need a new roof."',
          },
          {
            question: 'What is RCV vs. ACV and why should I care?',
            answer:
              'It changes how much money you are actually working with. Replacement cost value and actual cash value are not the same thing, and depreciation or policy limits can leave you covering a much bigger gap than expected.',
          },
          {
            question: 'Who pays for detach-and-reset when solar is already on the roof?',
            answer:
              'Sometimes insurance contributes, sometimes it does not, and sometimes it depends on how the scope is written. That is why this needs to be nailed down before the reroof starts, not argued about halfway through.',
          },
          {
            question: 'What if the roof claim is approved but my solar panels are also damaged?',
            answer:
              'That should be caught before reinstall. A good detach-and-reset plan documents system condition during removal so damaged panels, wiring, or mounts do not become a surprise after the roof is done.',
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
      'Plain-language guides on solar costs, roofing decisions, insurance claims, and storm repair for Texas homeowners who want real answers.',
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Guide library',
        title: 'Skip the generic advice. These guides are built for Texas homeowners.',
        body: 'Roof condition, claim timing, detach-and-reset, solar costs, incentives, and whether solar even makes sense for your house. If the quick service pages leave you wanting more, the guides go deeper.',
        heroImage: {
          urls: {
            regular:
              'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
          },
          alt: 'Residential solar roof used as the guide library hero image',
        },
        metrics: [
          { label: 'Guides available', value: '6 guides' },
          { label: 'Built for', value: 'Research + planning' },
          { label: 'Audience', value: 'Texas homeowners' },
        ],
      },
      {
        type: 'guideGrid',
        title: 'Browse the guides',
        items: getSolarGuideGridItems(),
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
    topQueries: ['austin solar installation cost', 'austin solar tax credit', 'best solar company austin'],
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
      { path: '/', sessions: 990, conversionRate: 2.0 },
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
    scope: 'site',
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
    scope: 'portfolio',
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
    scope: 'portfolio',
    siteSlug: 'all',
    eventName: 'verified_domain_count',
    targetValue: 12,
    interval: 'quarterly',
    status: 'active',
    owner: 'Platform Ops',
    notes: 'Rollout KPI for moving domain inventory into verified live status.',
  },
]
