import { getSolarGuideGridItems, getSolarGuidePages } from './guides.js'
import {
  mainServices,
  roofingServices,
  specialtyServices,
  servicePages,
} from './service-catalog.js'

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
    title: `Request information from ${nameOverride || titleizeDomain(domain)}`,
    description: `Capture high-intent ${categoryLabel.toLowerCase()} demand for ${domain}.`,
    ctaLabel: `Request ${categoryLabel.toLowerCase()} info`,
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
      description: `${title} is an owned ${entry.tier.toLowerCase()} domain in the Austin Leads platform portfolio.`,
    },
    brand: {
      eyebrow: tier === 'hero' ? 'Hero Site' : tier === 'landing' ? 'Landing Page' : 'Redirect Domain',
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
    eyebrow: 'Solar-ready home buyers',
    title: 'Find the Austin neighborhoods where solar penciles out fastest.',
    body: 'This focused landing page exists to capture buyers and homeowners who want fast answers on solar-readiness, utility savings, and resale value.',
    metrics: [
      { label: 'Primary intent', value: 'Home buyers' },
      { label: 'Page type', value: 'Landing' },
      { label: 'Target CTA', value: 'Consult' },
    ],
  },
  {
    type: 'highlights',
    title: 'Why this landing page exists',
    items: [
      {
        title: 'Separate keyword target',
        body: 'Own a solar-home keyword cluster without competing with the hero installer site.',
      },
      {
        title: 'Focused conversion',
        body: 'Use a lighter content footprint with a single job to do: capture warm discovery traffic.',
      },
      {
        title: 'Shared platform',
        body: 'Reuse the same rendering, SEO, and form engine as the hero properties.',
      },
    ],
  },
  {
    type: 'cta',
    title: 'Stand up additional Austin niche pages quickly.',
    body: 'This template is intentionally lean so more long-tail domains can go live without rebuilding the stack.',
    ctaLabel: 'Duplicate this landing pattern',
    ctaHref: '/dashboard',
  },
]

export const pages = [
  {
    id: 'page-solar-home',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: '',
    title: 'Texas Solar and Roofing Pros',
    description:
      'Texas Solar and Roofing Pros connects roofing, solar, insurance education, and lead capture in one primary service brand.',
    pageType: 'home',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Texas solar + roofing',
        title: 'One place to figure out the roof, the storm damage, and whether solar should come next.',
        body: 'Texas Solar and Roofing Pros is now the primary service brand. The site needs to work as a real lead-gen business first: clarify roof condition, explain insurance and detach-and-reset issues, and route qualified solar and roofing leads to the right partner.',
        metrics: [
          { label: 'Primary market', value: 'Texas homeowners' },
          { label: 'Core services', value: 'Roofing + solar' },
          { label: 'Lead flow', value: 'Direct to info@' },
        ],
        actions: [
          { label: 'Open dashboard', href: '/dashboard', variant: 'default' },
          { label: 'View publish queue', href: '/publish', variant: 'secondary' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'The opportunity',
        title: 'One kitchen, thirty-one menus.',
        body: 'The platform serves different content, branding, and forms based on the incoming domain. The visitor sees a distinct site. Operations get one codebase, one deployment, one CMS, and one SEO system to maintain.',
      },
      {
        type: 'highlights',
        title: 'What phase 1 needs to prove',
        items: [
          {
            title: 'Tiered domain strategy',
            body: 'Hero, landing, and redirect domains each get the right build depth instead of one expensive default.',
          },
          {
            title: 'Search-ready output',
            body: 'Pre-rendered metadata, structured data, and per-domain sitemaps make every property machine-readable from day one.',
          },
          {
            title: 'Operator-friendly tooling',
            body: 'Sanity handles content. The admin UI handles workflow, publishing, and domain operations.',
          },
        ],
      },
      {
        type: 'steps',
        title: 'Platform flow',
        items: [
          { title: 'Resolve the host', body: 'Map the incoming domain to a site record and brand profile.' },
          {
            title: 'Fetch the content',
            body: 'Read from Sanity when configured, otherwise use seeded fixtures for local build stability.',
          },
          {
            title: 'Render the template',
            body: 'Compose the correct page shell, structured data, and lead capture blocks.',
          },
          {
            title: 'Measure and iterate',
            body: 'Use the dashboard and publishing queue to expand the portfolio without rebuilding the stack.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Why this architecture works',
        items: [
          {
            question: 'Why not build 31 separate websites?',
            answer:
              'Separate codebases multiply maintenance, drift, and hosting overhead. A shared platform keeps the SEO engine consistent while still allowing each domain to feel distinct.',
          },
          {
            question: 'Can each site still look unique?',
            answer:
              'Yes. Each site record includes brand tokens, content, navigation, and lead forms. The engine stays shared; the presentation layer changes per tenant.',
          },
          {
            question: 'What happens to weaker domains?',
            answer:
              'They can stay in the inventory, be tracked in the domains UI, and redirect to stronger hero properties until they justify a standalone build.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Phase 1 is the foundation, not the finish line.',
        body: 'The goal is one production-grade hero site, a real CMS, and the operations tooling needed to scale the next thirty domains quickly.',
        ctaLabel: 'Review the domain plan',
        ctaHref: '/domains',
      },
    ],
  },
  {
    id: 'page-solar-costs',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'solar-costs',
    title: 'Austin Solar Cost Guide',
    description: 'A service page template for solar pricing, savings, and financing education.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Service page',
        title: 'Austin solar costs are only useful when the assumptions are visible.',
        body: 'This page is structured like the long-tail service pages the platform will generate at scale: clear pricing ranges, assumptions, FAQ markup, and a focused lead capture step.',
        metrics: [
          { label: 'Typical range', value: '$18k-$32k' },
          { label: 'Payback', value: '7-9 years' },
          { label: 'Intent', value: 'High' },
        ],
      },
      {
        type: 'highlights',
        title: 'What this page should answer',
        items: [
          {
            title: 'Installed cost',
            body: 'Use range-based pricing with the variables that change the number.',
          },
          {
            title: 'Credits and exemptions',
            body: 'Call out incentives without pretending they are guaranteed forever.',
          },
          {
            title: 'Decision criteria',
            body: 'Help visitors decide whether they should request a quote or keep researching.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Pricing questions',
        items: [
          {
            question: 'Should every solar page use the same cost copy?',
            answer:
              'No. Each domain and page should target a distinct keyword cluster and angle so the properties do not compete with one another.',
          },
          {
            question: 'Where should the final numbers come from?',
            answer:
              'From verified pricing sources and human review before publication. The platform can scaffold the structure; accuracy still needs editorial input.',
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
    description: 'Energy-saving home services, roofing support, and solar planning for Texas homeowners.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Our services',
        title: 'Lower your energy bills with the right improvements, not guesswork.',
        body: 'We help homeowners sort through practical energy and home-upgrade decisions, from audits and efficiency work to roofing coordination, heat pump upgrades, and solar plus battery planning.',
        metrics: [
          { label: 'Best for', value: 'High bills + aging homes' },
          { label: 'Core focus', value: 'Efficiency, roofing, solar' },
          { label: 'Next step', value: 'Consultation' },
        ],
        actions: [
          { label: 'Request a consultation', href: '/#consultation', variant: 'default' },
          { label: 'Explore solar guides', href: '/guides', variant: 'secondary' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'How this page helps',
        title: 'Some homes need efficiency work first. Some need roof work. Some are ready for solar now.',
        body: 'The right solution depends on what is driving the utility bill, what condition the home is in, and whether the next move should be weatherization, HVAC efficiency, roofing work, or a solar project. This page is meant to show the service categories clearly so you can start in the right place.',
      },
      {
        type: 'serviceGrid',
        eyebrow: 'Service categories',
        title: 'Our services',
        body: 'These are the core services we use to lower energy waste, improve comfort, protect the home, and help homeowners figure out what should happen first.',
        items: mainServices.map((service) => ({
          ...service,
          href: `/services/${service.slug}`,
        })),
        roofingTitle: 'Roofing Services',
        roofingItems: roofingServices.map((service) => ({
          ...service,
          href: `/services/${service.slug}`,
        })),
        secondaryTitle: 'Other Services',
        secondaryItems: specialtyServices.map((service) => ({
          ...service,
          href: `/services/${service.slug}`,
        })),
      },
      {
        type: 'steps',
        title: 'How to choose the right starting point',
        items: [
          {
            title: 'Start with the problem you already know',
            body: 'If the issue is obvious storm damage, start there. If the problem is just high utility bills, start with the efficiency side before assuming solar is automatically the first move.',
          },
          {
            title: 'Separate immediate repair from long-term upgrade',
            body: 'Some projects are about fixing damage or performance now. Others are about improving the home over the next several years. Keeping those decisions separate makes the plan much cleaner.',
          },
          {
            title: 'Use the house condition to set the order',
            body: 'Roof condition, HVAC age, insulation gaps, and electrical limitations can change what should happen first and what should wait.',
          },
          {
            title: 'Then price the right solution',
            body: 'Once the real issue is clear, the quote process becomes much more useful because you are comparing options built around the actual home instead of a generic pitch.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Service questions homeowners ask first',
        items: [
          {
            question: 'Do I need solar, or do I need efficiency work first?',
            answer:
              'That depends on what is driving the bill. In some homes, insulation, ducts, or HVAC issues should be addressed first. In others, the house is ready for solar right away. The useful first step is identifying which problem is actually costing you money.',
          },
          {
            question: 'Can roofing, efficiency, and solar all be part of the same plan?',
            answer:
              'Yes, but they should not all be sold as one blurred package. The right sequence matters, and each part of the project should stand on its own with a clear reason for doing it.',
          },
          {
            question: 'Is this page only about solar?',
            answer:
              'No. It is intentionally broader than a solar-only page because many homeowners need a mix of energy-saving upgrades, home-condition work, and solar planning rather than one isolated answer.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Tell us what the house is doing, and we’ll help you figure out the right place to start.',
        body: 'Whether the issue is storm damage, high bills, older equipment, or a solar project you want to plan carefully, the next step should be a clearer diagnosis, not a generic sales script.',
        ctaLabel: 'Request a consultation',
        ctaHref: '/#consultation',
      },
    ],
  },
  {
    id: 'page-solar-lane',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'solar',
    title: 'Solar',
    description:
      'A dedicated solar lane covering savings, incentives, system sizing, and whether solar makes sense for the home.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Solar lane',
        title: 'Use the solar lane when the question is savings, system fit, and long-term value.',
        body: 'This part of the site is for homeowners comparing system size, electric bill savings, incentives, financing choices, and whether the numbers actually work for their home.',
        metrics: [
          { label: 'Focus', value: 'Savings + fit' },
          { label: 'Topics', value: 'Cost, incentives, payoff' },
          { label: 'Best for', value: 'Solar planning' },
        ],
      },
      {
        type: 'highlights',
        title: 'What the solar lane should answer',
        items: [
          {
            title: 'System size and production',
            body: 'Show how roof layout, shade, usage, and goals affect the right system size instead of pretending every home wants the same design.',
          },
          {
            title: 'Cost and financing',
            body: 'Break out cash price, financed price, tax-credit assumptions, and realistic payback without dressing up the numbers.',
          },
          {
            title: 'Readiness questions',
            body: 'Help the homeowner decide whether they should keep researching, request a quote, or first solve a roof or electrical issue.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Solar questions',
        items: [
          {
            question: 'Can the solar lane stay separate from roofing?',
            answer:
              'Yes. It should stand on its own for homeowners who are evaluating energy savings first, while still linking clearly to roofing pages where the roof condition changes the project.',
          },
          {
            question: 'What makes this more useful than a generic installer page?',
            answer:
              'It should explain the assumptions behind savings, not just push a quote button. The best solar pages help a homeowner understand the math before they talk to anyone.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Use the guide library when you want a deeper solar answer.',
        body: 'The guide pages go deeper on costs, batteries, incentives, financing, and roof readiness when the quick service-page summary is not enough.',
        ctaLabel: 'Browse solar guides',
        ctaHref: '/guides',
      },
    ],
  },
  {
    id: 'page-roofing-lane',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'roofing',
    title: 'Roofing',
    description:
      'A dedicated roofing lane for hail damage, aging roofs, insurance friction, and roof replacement planning.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Roofing lane',
        title: 'Use the roofing lane when the problem is storm damage, claim timing, or the roof itself.',
        body: 'This side of the site is for homeowners dealing with hail, older roofs, insurance friction, replacement timing, and the questions that need to be answered before any connected solar conversation makes sense.',
        metrics: [
          { label: 'Focus', value: 'Storm + roof condition' },
          { label: 'Topics', value: 'Claims, RCV/ACV, replacement' },
          { label: 'Best for', value: 'Roof triage' },
        ],
      },
      {
        type: 'steps',
        title: 'What the roofing lane should help you do',
        items: [
          {
            title: 'Figure out whether a storm is relevant',
            body: 'Start with hail history, visible symptoms, and a roof inspection instead of guessing from one bad weather day.',
          },
          {
            title: 'Understand the policy language',
            body: 'RCV vs ACV, depreciation, age thresholds, and detach-and-reset implications can materially change the project economics.',
          },
          {
            title: 'Separate claim urgency from sales pressure',
            body: 'A useful roofing page should clarify decisions, not rush the homeowner into the wrong next step.',
          },
          {
            title: 'Connect the roof back to solar only when appropriate',
            body: 'If solar is part of the long-term plan, the roofing lane should explain when and how that overlap matters.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Roofing questions',
        items: [
          {
            question: 'Why separate roofing from solar in the site structure?',
            answer:
              'Because the intent is different. A storm-damage or claim visitor needs roof-specific answers first. Solar can be connected later, but it should not hijack the first visit.',
          },
          {
            question: 'Should detach and reset live here or on solar pages?',
            answer:
              'Both. It belongs in roofing because it often starts as a roof and insurance issue, and it belongs in solar because it affects total project planning and cost.',
          },
        ],
      },
      {
        type: 'cta',
        title: 'Start with the hail page when the question is storm damage.',
        body: 'That page should become the most practical local entry point for homeowners trying to figure out whether recent weather activity may have created a real roof issue.',
        ctaLabel: 'Open hail damage page',
        ctaHref: '/hail-damage',
      },
    ],
  },
  {
    id: 'page-solar-incentives',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'incentives',
    title: 'Austin Solar Incentives',
    description: 'A focused incentives page with policy-oriented FAQ content.',
    pageType: 'locationPage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Location page',
        title: 'Use policy pages to answer the questions AI search engines quote most often.',
        body: 'Incentive pages are ideal for clear factual writing, structured FAQ blocks, and update timestamps. They often become the most cited assets in AI overviews and answer engines.',
        metrics: [
          { label: 'Schema', value: 'FAQ + Article' },
          { label: 'Update pattern', value: 'Quarterly' },
          { label: 'Goal', value: 'Citations' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'Content pattern',
        title: 'Answer the rule, then explain the nuance.',
        body: 'This template works best when it states the current credit or exemption clearly, then follows with verification notes, deadlines, and local applicability details.',
      },
      {
        type: 'faq',
        title: 'Incentive FAQs',
        items: [
          {
            question: 'Why are incentive pages important for AI search?',
            answer:
              'They map cleanly to question-and-answer prompts and are easier for AI systems to parse and cite than vague homepage marketing copy.',
          },
          {
            question: 'Should the page claim we handle rebate paperwork?',
            answer:
              'Only if the operating business actually does. The platform should default to factual, supportable claims rather than inflated service promises.',
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
      'About Texas Solar and Roofing Pros and how the lead-generation and referral workflow is intended to work.',
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'About the business',
        title: 'A lead-gen business for homeowners who need clearer next steps on roofing and solar.',
        body: 'Texas Solar and Roofing Pros is being positioned as a service brand that helps homeowners sort out what they are dealing with and routes good-fit opportunities to the right operating partners.',
        metrics: [
          { label: 'Model', value: 'Lead generation' },
          { label: 'Focus', value: 'Roofing + solar' },
          { label: 'Next step', value: 'Direct consultation' },
        ],
      },
      {
        type: 'story',
        eyebrow: 'Positioning',
        title: 'This site needs to feel credible, useful, and direct.',
        body: 'The right about page should explain how the business thinks, what kinds of homeowner problems it helps clarify, and why the site covers both roofing and solar without pretending they are the same conversation.',
      },
      {
        type: 'highlights',
        title: 'What should live here over time',
        items: [
          {
            title: 'Mission and values',
            body: 'Explain the operating values and the practical homeowner-first posture of the brand.',
          },
          {
            title: 'Credentials and partners',
            body: 'Show certifications, training, and the operating companies that ultimately handle the field work.',
          },
          {
            title: 'Lead routing clarity',
            body: 'Make it obvious how inquiries are reviewed and where they go, so the business model does not feel hidden.',
          },
        ],
      },
    ],
  },
  {
    id: 'page-hail-damage',
    siteSlug: 'texas-solar-and-roofing-pros',
    slug: 'hail-damage',
    title: 'Hail Damage and Roof Claims',
    description:
      'A dedicated Texas hail-damage page focused on storm timing, roof impact, claim language, and next-step inspections.',
    pageType: 'servicePage',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Roofing lane',
        title: 'Find out whether hail hit your area and what it may mean for your roof.',
        body: 'This page is the homeowner entry point for recent storm activity, hail damage patterns, roof-inspection timing, and the insurance questions that usually follow.',
        metrics: [
          { label: 'Primary intent', value: 'Roofing' },
          { label: 'Focus', value: 'Storm + claim triage' },
          { label: 'CTA', value: 'Inspection request' },
        ],
      },
      {
        type: 'hailMap',
        title: 'Hail in your area?',
        body: 'Search by ZIP code, city, or current location to see active alerts, storm conditions, and whether this looks like a location worth documenting for a roof inspection.',
        items: [
          {
            title: 'Search by location',
            body: 'Check the neighborhood or ZIP code first, then compare the weather signal to what you are seeing on the roof, gutters, vents, and windows.',
          },
          {
            title: 'See claim-relevant context',
            body: 'Look for severe storm alerts, wind gusts, and rain intensity so the next conversation starts with timing and evidence instead of guesswork.',
          },
          {
            title: 'Convert quickly',
            body: 'If the weather signal and roof condition line up, move straight into a roof review request while the storm timeline is still fresh.',
          },
        ],
        ctaLabel: 'Request a roof review',
        ctaHref: '#estimate',
      },
      {
        type: 'steps',
        title: 'What homeowners should do after a storm',
        items: [
          {
            title: 'Document the timing',
            body: 'Write down the storm date, neighborhood, and any obvious exterior damage before details get fuzzy.',
          },
          {
            title: 'Check the policy type',
            body: 'RCV and ACV language can change how a claim feels financially, especially on older roofs.',
          },
          {
            title: 'Schedule an inspection',
            body: 'A qualified roof inspection should answer whether the damage looks claim-worthy, cosmetic, or unrelated to the storm.',
          },
          {
            title: 'Avoid rushing the solar decision',
            body: 'If the roof is now a live issue, separate the roofing conversation from the solar conversation until the condition is clear.',
          },
        ],
      },
      {
        type: 'faq',
        title: 'Hail damage questions',
        items: [
          {
            question: 'How do I know if hail actually hit my roof hard enough to matter?',
            answer:
              'Storm presence alone is not enough. The useful signal is storm timing plus roof-specific impact, which is why the page should combine map data with a clear inspection CTA.',
          },
          {
            question: 'Why is a dedicated hail page important?',
            answer:
              'Because hail traffic is high-intent roofing traffic. It deserves its own landing page, local SEO angle, and conversion flow instead of being buried inside generic roofing copy.',
          },
          {
            question: 'Should the hail page also talk about solar?',
            answer:
              'Only where it naturally overlaps. The primary job of this page is storm and roof triage. Solar should appear as a secondary connected path, not the main topic.',
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
      'A guide hub with practical solar, roofing, insurance, and storm-repair explainers for Texas homeowners.',
    pageType: 'page',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Guide hub',
        title:
          'Go deeper on solar, roofing, storms, and insurance without sifting through generic national advice.',
        body: 'This hub expands the core homeowner questions into practical guides built for people trying to figure out roof condition, claim timing, detach and reset, and whether solar still makes sense afterward.',
        metrics: [
          { label: 'Guide count', value: '6 guides' },
          { label: 'Primary use', value: 'Research' },
          { label: 'Audience', value: 'Texas homeowners' },
        ],
      },
      {
        type: 'guideGrid',
        title: 'Browse the guide library',
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
    description: 'Focused landing page for solar-ready home buyers and homeowners.',
    pageType: 'landingPage',
    templateLevel: 'landing',
    sections: solarHomeSections,
  },
  {
    id: 'page-roofing-home',
    siteSlug: 'roof-pros-of-austin',
    slug: '',
    title: 'Roof Pros of Austin',
    description: 'Hero-site placeholder for the roofing category.',
    pageType: 'home',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Hero Site',
        title: 'The same platform can pivot cleanly from solar to roofing.',
        body: 'This is the cross-category proof point. Content, lead forms, and messaging change. The underlying SEO system, CMS model, and admin tooling stay shared.',
        metrics: [
          { label: 'Category', value: 'Roofing' },
          { label: 'Pages in phase 1', value: 'Placeholder' },
          { label: 'Status', value: 'Ready to expand' },
        ],
      },
    ],
  },
  {
    id: 'page-weddings-home',
    siteSlug: 'austin-wedding-vendors',
    slug: '',
    title: 'Austin Wedding Vendors',
    description: 'Hero-site placeholder for the weddings category.',
    pageType: 'home',
    templateLevel: 'hero',
    sections: [
      {
        type: 'hero',
        eyebrow: 'Hero Site',
        title: 'The same CMS and routing model can also serve editorial marketplaces.',
        body: 'Weddings prove the engine is not locked to contractor categories. The public templates can adapt to directory and editorial use cases without changing the operational core.',
        metrics: [
          { label: 'Category', value: 'Weddings' },
          { label: 'Content mode', value: 'Editorial + directory' },
          { label: 'Status', value: 'Placeholder' },
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
