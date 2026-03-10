const categories = {
  solar: "Solar",
  roofing: "Roofing",
  weddings: "Weddings",
  homeServices: "Home Services",
};

const generateRedirectDomains = () => {
  const names = [
    ["austinsolarquotes.com", "austin-solar-pros", "solar"],
    ["texassolarhomes.com", "austin-solar-pros", "solar"],
    ["austinsolarrebates.com", "austin-solar-pros", "solar"],
    ["roofrepairaustin.net", "roof-pros-of-austin", "roofing"],
    ["atxroofquote.com", "roof-pros-of-austin", "roofing"],
    ["texasroofpros.online", "roof-pros-of-austin", "roofing"],
    ["weddingsinaustin.net", "austin-wedding-vendors", "weddings"],
    ["texasweddingguide.online", "austin-wedding-vendors", "weddings"],
    ["austinhomepro.co", "austin-home-services", "homeServices"],
    ["austinremodelquote.com", "austin-home-services", "homeServices"],
    ["texashandymanpros.com", "austin-home-services", "homeServices"],
    ["roundrocksolarhomes.com", "austin-solar-pros", "solar"],
    ["cedarparksolarquote.com", "austin-solar-pros", "solar"],
    ["pflugervilleroofpros.com", "roof-pros-of-austin", "roofing"],
    ["drippingspringsweddings.com", "austin-wedding-vendors", "weddings"],
    ["southaustinhomepros.com", "austin-home-services", "homeServices"],
  ];

  return names.map(([domain, redirectTarget, category], index) => ({
    id: `redirect-${index + 1}`,
    slug: domain.replace(/\./g, "-"),
    name: domain,
    category,
    categoryLabel: categories[category],
    tier: "redirect",
    primaryDomain: domain,
    aliases: [`www.${domain}`],
    redirectTarget,
    leadForm: null,
    vercelStatus: "redirect-only",
  }));
};

export const sites = [
  {
    id: "site-austin-solar-pros",
    slug: "austin-solar-pros",
    name: "Austin Solar Pros",
    shortName: "Solar",
    category: "solar",
    categoryLabel: categories.solar,
    tier: "hero",
    primaryDomain: "austinsolarpros.com",
    aliases: ["www.austinsolarpros.com", "localhost", "127.0.0.1"],
    redirectTarget: null,
    leadForm: {
      title: "Request a solar plan",
      description: "Tell us the bill size, roof type, and service area so the right installer workflow can follow up.",
      ctaLabel: "Request my solar plan",
    },
    seo: {
      title: "Austin Solar Pros",
      description:
        "A multi-page Austin solar site focused on cost, incentives, installer education, and high-intent lead capture.",
    },
    brand: {
      eyebrow: "Hero Site",
      primary: "hsl(14 88% 65%)",
      secondary: "hsl(190 61% 15%)",
      accent: "hsl(190 64% 63%)",
      surface: "hsl(20 50% 97%)",
      heroTone: "warm",
    },
    organization: {
      name: "Austin Solar Pros",
      type: "LocalBusiness",
      serviceArea: ["Austin", "Round Rock", "Cedar Park", "Pflugerville"],
      phone: "(512) 555-0147",
      email: "hello@austinsolarpros.com",
    },
  },
  {
    id: "site-roof-pros",
    slug: "roof-pros-of-austin",
    name: "Roof Pros of Austin",
    shortName: "Roofing",
    category: "roofing",
    categoryLabel: categories.roofing,
    tier: "hero",
    primaryDomain: "roofprosofaustin.com",
    aliases: ["www.roofprosofaustin.com"],
    redirectTarget: null,
    leadForm: {
      title: "Book a roofing callback",
      description: "Capture inspection requests, storm damage questions, and quote intent from Austin homeowners.",
      ctaLabel: "Request roofing quote",
    },
    seo: {
      title: "Roof Pros of Austin",
      description:
        "An Austin roofing hero site ready for service pages, financing content, and inspection-focused lead flows.",
    },
    brand: {
      eyebrow: "Hero Site",
      primary: "hsl(18 78% 58%)",
      secondary: "hsl(210 50% 14%)",
      accent: "hsl(24 85% 62%)",
      surface: "hsl(24 40% 97%)",
      heroTone: "dark",
    },
    organization: {
      name: "Roof Pros of Austin",
      type: "RoofingContractor",
      serviceArea: ["Austin", "Lakeway", "Bee Cave", "Leander"],
      phone: "(512) 555-0191",
      email: "roofing@roofprosofaustin.com",
    },
  },
  {
    id: "site-weddings",
    slug: "austin-wedding-vendors",
    name: "Austin Wedding Vendors",
    shortName: "Weddings",
    category: "weddings",
    categoryLabel: categories.weddings,
    tier: "hero",
    primaryDomain: "austinweddingvendors.com",
    aliases: ["www.austinweddingvendors.com"],
    redirectTarget: null,
    leadForm: {
      title: "Plan your shortlist",
      description: "Collect venue, planner, and date preferences and route them into a curated vendor workflow.",
      ctaLabel: "Start vendor matching",
    },
    seo: {
      title: "Austin Wedding Vendors",
      description:
        "An Austin wedding planning hero site with venue guides, vendor directories, and lead capture for planning inquiries.",
    },
    brand: {
      eyebrow: "Hero Site",
      primary: "hsl(348 68% 64%)",
      secondary: "hsl(216 34% 18%)",
      accent: "hsl(32 90% 70%)",
      surface: "hsl(0 0% 98%)",
      heroTone: "light",
    },
    organization: {
      name: "Austin Wedding Vendors",
      type: "ProfessionalService",
      serviceArea: ["Austin", "Dripping Springs", "Hill Country"],
      phone: "(512) 555-0114",
      email: "events@austinweddingvendors.com",
    },
  },
  {
    id: "site-solar-homes",
    slug: "austin-solar-homes",
    name: "Austin Solar Homes",
    shortName: "Solar Homes",
    category: "solar",
    categoryLabel: categories.solar,
    tier: "landing",
    primaryDomain: "austinsolarhomes.com",
    aliases: ["www.austinsolarhomes.com"],
    redirectTarget: null,
    leadForm: {
      title: "Compare solar-ready homes",
      description: "A focused landing page for homeowners who want solar pricing and home-value context.",
      ctaLabel: "See solar-ready options",
    },
    seo: {
      title: "Austin Solar Homes",
      description: "Landing page for solar-ready home buyers and Austin homeowners researching solar value.",
    },
    brand: {
      eyebrow: "Landing Page",
      primary: "hsl(20 90% 66%)",
      secondary: "hsl(198 58% 17%)",
      accent: "hsl(190 66% 62%)",
      surface: "hsl(28 48% 97%)",
      heroTone: "warm",
    },
    organization: {
      name: "Austin Solar Homes",
      type: "ProfessionalService",
      serviceArea: ["Austin", "Georgetown", "Buda"],
      phone: "(512) 555-0130",
      email: "homes@austinsolarhomes.com",
    },
  },
  {
    id: "site-home-services",
    slug: "austin-home-services",
    name: "Austin Home Services",
    shortName: "Home Services",
    category: "homeServices",
    categoryLabel: categories.homeServices,
    tier: "landing",
    primaryDomain: "austinhomeserviceshub.com",
    aliases: ["www.austinhomeserviceshub.com"],
    redirectTarget: null,
    leadForm: {
      title: "Book a home services consult",
      description: "A landing page for general home service demand until category-specific hero sites expand.",
      ctaLabel: "Request service match",
    },
    seo: {
      title: "Austin Home Services Hub",
      description: "Landing page for general Austin home services demand and routed lead capture.",
    },
    brand: {
      eyebrow: "Landing Page",
      primary: "hsl(28 70% 58%)",
      secondary: "hsl(204 38% 17%)",
      accent: "hsl(192 46% 58%)",
      surface: "hsl(34 42% 97%)",
      heroTone: "light",
    },
    organization: {
      name: "Austin Home Services Hub",
      type: "ProfessionalService",
      serviceArea: ["Austin", "Round Rock", "Kyle"],
      phone: "(512) 555-0183",
      email: "support@austinhomeserviceshub.com",
    },
  },
  {
    id: "site-austin-roof-repair",
    slug: "austin-roof-repair",
    name: "Austin Roof Repair",
    shortName: "Roof Repair",
    category: "roofing",
    categoryLabel: categories.roofing,
    tier: "landing",
    primaryDomain: "austinroofrepairpros.com",
    aliases: ["www.austinroofrepairpros.com"],
    redirectTarget: null,
    leadForm: {
      title: "Request roof repair pricing",
      description: "Landing page for storm-damage and urgent roof repair demand.",
      ctaLabel: "Request repair pricing",
    },
    seo: {
      title: "Austin Roof Repair Pros",
      description: "Focused landing page for Austin roof repair and storm-damage inquiries.",
    },
    brand: {
      eyebrow: "Landing Page",
      primary: "hsl(15 74% 55%)",
      secondary: "hsl(212 36% 17%)",
      accent: "hsl(24 90% 64%)",
      surface: "hsl(20 46% 97%)",
      heroTone: "dark",
    },
    organization: {
      name: "Austin Roof Repair Pros",
      type: "RoofingContractor",
      serviceArea: ["Austin", "Manor", "Pflugerville"],
      phone: "(512) 555-0168",
      email: "repair@austinroofrepairpros.com",
    },
  },
  ...generateRedirectDomains(),
];

const solarHomeSections = [
  {
    type: "hero",
    eyebrow: "Solar-ready home buyers",
    title: "Find the Austin neighborhoods where solar penciles out fastest.",
    body:
      "This focused landing page exists to capture buyers and homeowners who want fast answers on solar-readiness, utility savings, and resale value.",
    metrics: [
      { label: "Primary intent", value: "Home buyers" },
      { label: "Page type", value: "Landing" },
      { label: "Target CTA", value: "Consult" },
    ],
  },
  {
    type: "highlights",
    title: "Why this landing page exists",
    items: [
      {
        title: "Separate keyword target",
        body: "Own a solar-home keyword cluster without competing with the hero installer site.",
      },
      {
        title: "Focused conversion",
        body: "Use a lighter content footprint with a single job to do: capture warm discovery traffic.",
      },
      {
        title: "Shared platform",
        body: "Reuse the same rendering, SEO, and form engine as the hero properties.",
      },
    ],
  },
  {
    type: "cta",
    title: "Stand up additional Austin niche pages quickly.",
    body: "This template is intentionally lean so more long-tail domains can go live without rebuilding the stack.",
    ctaLabel: "Duplicate this landing pattern",
    ctaHref: "/dashboard",
  },
];

export const pages = [
  {
    id: "page-solar-home",
    siteSlug: "austin-solar-pros",
    slug: "",
    title: "Austin Solar Pros",
    description:
      "One hero site for Austin solar content, lead capture, incentives education, and AI-ready answers.",
    pageType: "home",
    templateLevel: "hero",
    sections: [
      {
        type: "hero",
        eyebrow: "One platform, many domains",
        title: "Build the Austin market from one shared engine instead of 31 disconnected sites.",
        body:
          "Austin Solar Pros is the phase-1 hero site. It demonstrates the platform model: reusable templates, structured SEO, unique content per domain, and lead capture flows that can scale across the whole portfolio.",
        metrics: [
          { label: "Portfolio size", value: "31 domains" },
          { label: "Phase 1", value: "1 hero site" },
          { label: "Routing model", value: "Host aware" },
        ],
        actions: [
          { label: "Open dashboard", href: "/dashboard", variant: "default" },
          { label: "View publish queue", href: "/publish", variant: "secondary" },
        ],
      },
      {
        type: "story",
        eyebrow: "The opportunity",
        title: "One kitchen, thirty-one menus.",
        body:
          "The platform serves different content, branding, and forms based on the incoming domain. The visitor sees a distinct site. Operations get one codebase, one deployment, one CMS, and one SEO system to maintain.",
      },
      {
        type: "highlights",
        title: "What phase 1 needs to prove",
        items: [
          {
            title: "Tiered domain strategy",
            body: "Hero, landing, and redirect domains each get the right build depth instead of one expensive default.",
          },
          {
            title: "Search-ready output",
            body: "Pre-rendered metadata, structured data, and per-domain sitemaps make every property machine-readable from day one.",
          },
          {
            title: "Operator-friendly tooling",
            body: "Sanity handles content. The admin UI handles workflow, publishing, and domain operations.",
          },
        ],
      },
      {
        type: "steps",
        title: "Platform flow",
        items: [
          { title: "Resolve the host", body: "Map the incoming domain to a site record and brand profile." },
          { title: "Fetch the content", body: "Read from Sanity when configured, otherwise use seeded fixtures for local build stability." },
          { title: "Render the template", body: "Compose the correct page shell, structured data, and lead capture blocks." },
          { title: "Measure and iterate", body: "Use the dashboard and publishing queue to expand the portfolio without rebuilding the stack." },
        ],
      },
      {
        type: "faq",
        title: "Why this architecture works",
        items: [
          {
            question: "Why not build 31 separate websites?",
            answer:
              "Separate codebases multiply maintenance, drift, and hosting overhead. A shared platform keeps the SEO engine consistent while still allowing each domain to feel distinct.",
          },
          {
            question: "Can each site still look unique?",
            answer:
              "Yes. Each site record includes brand tokens, content, navigation, and lead forms. The engine stays shared; the presentation layer changes per tenant.",
          },
          {
            question: "What happens to weaker domains?",
            answer:
              "They can stay in the inventory, be tracked in the domains UI, and redirect to stronger hero properties until they justify a standalone build.",
          },
        ],
      },
      {
        type: "cta",
        title: "Phase 1 is the foundation, not the finish line.",
        body: "The goal is one production-grade hero site, a real CMS, and the operations tooling needed to scale the next thirty domains quickly.",
        ctaLabel: "Review the domain plan",
        ctaHref: "/domains",
      },
    ],
  },
  {
    id: "page-solar-costs",
    siteSlug: "austin-solar-pros",
    slug: "solar-costs",
    title: "Austin Solar Cost Guide",
    description: "A service page template for solar pricing, savings, and financing education.",
    pageType: "servicePage",
    templateLevel: "hero",
    sections: [
      {
        type: "hero",
        eyebrow: "Service page",
        title: "Austin solar costs are only useful when the assumptions are visible.",
        body:
          "This page is structured like the long-tail service pages the platform will generate at scale: clear pricing ranges, assumptions, FAQ markup, and a focused lead capture step.",
        metrics: [
          { label: "Typical range", value: "$18k-$32k" },
          { label: "Payback", value: "7-9 years" },
          { label: "Intent", value: "High" },
        ],
      },
      {
        type: "highlights",
        title: "What this page should answer",
        items: [
          { title: "Installed cost", body: "Use range-based pricing with the variables that change the number." },
          { title: "Credits and exemptions", body: "Call out incentives without pretending they are guaranteed forever." },
          { title: "Decision criteria", body: "Help visitors decide whether they should request a quote or keep researching." },
        ],
      },
      {
        type: "faq",
        title: "Pricing questions",
        items: [
          {
            question: "Should every solar page use the same cost copy?",
            answer: "No. Each domain and page should target a distinct keyword cluster and angle so the properties do not compete with one another.",
          },
          {
            question: "Where should the final numbers come from?",
            answer: "From verified pricing sources and human review before publication. The platform can scaffold the structure; accuracy still needs editorial input.",
          },
        ],
      },
    ],
  },
  {
    id: "page-solar-incentives",
    siteSlug: "austin-solar-pros",
    slug: "incentives",
    title: "Austin Solar Incentives",
    description: "A focused incentives page with policy-oriented FAQ content.",
    pageType: "locationPage",
    templateLevel: "hero",
    sections: [
      {
        type: "hero",
        eyebrow: "Location page",
        title: "Use policy pages to answer the questions AI search engines quote most often.",
        body:
          "Incentive pages are ideal for clear factual writing, structured FAQ blocks, and update timestamps. They often become the most cited assets in AI overviews and answer engines.",
        metrics: [
          { label: "Schema", value: "FAQ + Article" },
          { label: "Update pattern", value: "Quarterly" },
          { label: "Goal", value: "Citations" },
        ],
      },
      {
        type: "story",
        eyebrow: "Content pattern",
        title: "Answer the rule, then explain the nuance.",
        body:
          "This template works best when it states the current credit or exemption clearly, then follows with verification notes, deadlines, and local applicability details.",
      },
      {
        type: "faq",
        title: "Incentive FAQs",
        items: [
          {
            question: "Why are incentive pages important for AI search?",
            answer:
              "They map cleanly to question-and-answer prompts and are easier for AI systems to parse and cite than vague homepage marketing copy.",
          },
          {
            question: "Should the page claim we handle rebate paperwork?",
            answer:
              "Only if the operating business actually does. The platform should default to factual, supportable claims rather than inflated service promises.",
          },
        ],
      },
    ],
  },
  {
    id: "page-solar-guides",
    siteSlug: "austin-solar-pros",
    slug: "guides",
    title: "Austin Solar Guides",
    description: "A topical authority hub for educational and comparison content.",
    pageType: "page",
    templateLevel: "hero",
    sections: [
      {
        type: "hero",
        eyebrow: "Guide hub",
        title: "Topical authority comes from a cluster, not a single hero page.",
        body:
          "The guide hub groups the comparison posts, how-to explainers, and FAQ-led pieces that help the hero site own broader search coverage over time.",
        metrics: [
          { label: "Content format", value: "Editorial" },
          { label: "Cadence", value: "Monthly" },
          { label: "Outcome", value: "Authority" },
        ],
      },
      {
        type: "highlights",
        title: "Recommended guide types",
        items: [
          { title: "Cost explainers", body: "Pages that unpack installation cost, financing, and bill offset assumptions." },
          { title: "Comparison pieces", body: "Installer comparisons, battery decisions, and utility-versus-solar tradeoffs." },
          { title: "AI-answer articles", body: "Question-led articles written to match how users ask Perplexity and ChatGPT." },
        ],
      },
    ],
  },
  {
    id: "page-solar-post",
    siteSlug: "austin-solar-pros",
    slug: "blog/austin-solar-installation-cost",
    title: "How Austin homeowners should think about solar installation cost",
    description: "Example article page for the publishing workflow.",
    pageType: "post",
    templateLevel: "hero",
    sections: [
      {
        type: "hero",
        eyebrow: "AI-assisted draft example",
        title: "Example article generated for the publish queue.",
        body:
          "This page exists to prove the post template, metadata pattern, and publish-to-CMS workflow. It is the type of asset the AI publishing interface will create and hand to human review.",
        metrics: [
          { label: "Content type", value: "Post" },
          { label: "Workflow", value: "Draft -> Review -> Publish" },
          { label: "Schema", value: "Article" },
        ],
      },
      {
        type: "story",
        eyebrow: "Article structure",
        title: "Drafts can be AI-assisted without being AI-slop.",
        body:
          "The workflow should start with clear source material, force human review, and publish only after the editorial owner is comfortable with accuracy, tone, and local relevance.",
      },
    ],
  },
  {
    id: "page-landing-solar-homes",
    siteSlug: "austin-solar-homes",
    slug: "",
    title: "Austin Solar Homes",
    description: "Focused landing page for solar-ready home buyers and homeowners.",
    pageType: "landingPage",
    templateLevel: "landing",
    sections: solarHomeSections,
  },
  {
    id: "page-home-services",
    siteSlug: "austin-home-services",
    slug: "",
    title: "Austin Home Services Hub",
    description: "Landing page used for broad home-services demand until deeper category sites are ready.",
    pageType: "landingPage",
    templateLevel: "landing",
    sections: [
      {
        type: "hero",
        eyebrow: "Landing page",
        title: "Use a broad services domain as a lead filter, not a bloated site.",
        body:
          "This landing page is intentionally simple. It captures general demand, qualifies the category, and routes people into the right downstream sales workflow.",
        metrics: [
          { label: "Intent", value: "Mixed" },
          { label: "Depth", value: "3-5 pages" },
          { label: "Role", value: "Support" },
        ],
      },
      {
        type: "highlights",
        title: "Best use cases",
        items: [
          { title: "General demand capture", body: "Catch top-of-funnel visitors who know the problem but not the category-specific site." },
          { title: "Rapid iteration", body: "Launch fast while the hero properties absorb most of the content investment." },
          { title: "Shared forms", body: "Reuse routing logic and lead forms without duplicating the platform." },
        ],
      },
    ],
  },
  {
    id: "page-roofing-home",
    siteSlug: "roof-pros-of-austin",
    slug: "",
    title: "Roof Pros of Austin",
    description: "Hero-site placeholder for the roofing category.",
    pageType: "home",
    templateLevel: "hero",
    sections: [
      {
        type: "hero",
        eyebrow: "Hero Site",
        title: "The same platform can pivot cleanly from solar to roofing.",
        body:
          "This is the cross-category proof point. Content, lead forms, and messaging change. The underlying SEO system, CMS model, and admin tooling stay shared.",
        metrics: [
          { label: "Category", value: "Roofing" },
          { label: "Pages in phase 1", value: "Placeholder" },
          { label: "Status", value: "Ready to expand" },
        ],
      },
    ],
  },
  {
    id: "page-weddings-home",
    siteSlug: "austin-wedding-vendors",
    slug: "",
    title: "Austin Wedding Vendors",
    description: "Hero-site placeholder for the weddings category.",
    pageType: "home",
    templateLevel: "hero",
    sections: [
      {
        type: "hero",
        eyebrow: "Hero Site",
        title: "The same CMS and routing model can also serve editorial marketplaces.",
        body:
          "Weddings prove the engine is not locked to contractor categories. The public templates can adapt to directory and editorial use cases without changing the operational core.",
        metrics: [
          { label: "Category", value: "Weddings" },
          { label: "Content mode", value: "Editorial + directory" },
          { label: "Status", value: "Placeholder" },
        ],
      },
    ],
  },
];

export const initialPublishJobs = [
  {
    id: "job-1",
    siteSlug: "austin-solar-pros",
    contentType: "post",
    title: "Austin Solar Installation Cost",
    prompt: "Write a practical guide about how Austin homeowners should evaluate installation cost, incentives, and payback.",
    sources: ["https://www.energy.gov/eere/solar/homeowners-guide-going-solar"],
    provider: "placeholder-openai",
    model: "gpt-4.1",
    status: "draft_ready",
    reviewStatus: "needs_review",
    output:
      "Draft generated from the placeholder AI pipeline. Replace this with durable queue-backed output when the real gateway is added.",
    createdAt: "2026-03-09T08:00:00.000Z",
    updatedAt: "2026-03-09T08:10:00.000Z",
  },
  {
    id: "job-2",
    siteSlug: "roof-pros-of-austin",
    contentType: "servicePage",
    title: "Austin Roof Inspection Guide",
    prompt: "Draft a lead-gen page about residential roof inspections in Austin after hail season.",
    sources: [],
    provider: "placeholder-anthropic",
    model: "claude-3.7-sonnet",
    status: "queued",
    reviewStatus: "not_started",
    output: "",
    createdAt: "2026-03-09T08:20:00.000Z",
    updatedAt: "2026-03-09T08:20:00.000Z",
  },
];

export const initialDomainRecords = sites.map((site, index) => ({
  id: `domain-${index + 1}`,
  domain: site.primaryDomain,
  siteSlug: site.redirectTarget ?? site.slug,
  tier: site.tier,
  category: site.category,
  redirectTarget: site.redirectTarget,
  projectId: process.env.VERCEL_PROJECT_ID ?? "local-project",
  verificationStatus: site.tier === "redirect" ? "redirect-only" : "pending",
  verified: false,
  dnsInstructions:
    site.tier === "redirect"
      ? []
      : [
          {
            type: "TXT",
            domain: `_vercel.${site.primaryDomain}`,
            value: `vc-domain-verify=${site.primaryDomain},placeholder`,
            reason: "Add this TXT record to verify the domain on Vercel.",
          },
        ],
  lastCheckedAt: "2026-03-09T09:00:00.000Z",
}));

export const initialAnalyticsSnapshots = [
  {
    siteSlug: "austin-solar-pros",
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
      { path: "/", sessions: 3610, conversionRate: 3.4 },
      { path: "/solar-costs", sessions: 1940, conversionRate: 4.2 },
      { path: "/incentives", sessions: 980, conversionRate: 2.3 },
    ],
    topQueries: [
      "austin solar installation cost",
      "austin solar tax credit",
      "best solar company austin",
    ],
  },
  {
    siteSlug: "roof-pros-of-austin",
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
      { path: "/", sessions: 1890, conversionRate: 2.9 },
      { path: "/hail-damage", sessions: 640, conversionRate: 3.1 },
    ],
    topQueries: ["roof repair austin", "austin roofing company", "hail damage roof austin"],
  },
  {
    siteSlug: "austin-wedding-vendors",
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
      { path: "/", sessions: 990, conversionRate: 2.0 },
      { path: "/venues", sessions: 430, conversionRate: 3.6 },
    ],
    topQueries: ["austin wedding vendors", "dripping springs venues", "austin wedding planner"],
  },
  {
    siteSlug: "austin-solar-homes",
    sessions: 1120,
    uniqueVisitors: 840,
    leads: 27,
    conversionRate: 2.41,
    aiReferrals: 11,
    organicSessions: 780,
    directSessions: 210,
    paidSessions: 70,
    avgEngagementSeconds: 98,
    topPages: [{ path: "/", sessions: 1120, conversionRate: 2.41 }],
    topQueries: ["austin solar homes", "solar ready homes austin", "solar home value austin"],
  },
  {
    siteSlug: "austin-home-services",
    sessions: 860,
    uniqueVisitors: 690,
    leads: 18,
    conversionRate: 2.09,
    aiReferrals: 6,
    organicSessions: 520,
    directSessions: 220,
    paidSessions: 90,
    avgEngagementSeconds: 86,
    topPages: [{ path: "/", sessions: 860, conversionRate: 2.09 }],
    topQueries: ["austin home services", "home service quotes austin", "austin contractor leads"],
  },
  {
    siteSlug: "austin-roof-repair",
    sessions: 740,
    uniqueVisitors: 610,
    leads: 16,
    conversionRate: 2.16,
    aiReferrals: 4,
    organicSessions: 470,
    directSessions: 190,
    paidSessions: 80,
    avgEngagementSeconds: 92,
    topPages: [{ path: "/", sessions: 740, conversionRate: 2.16 }],
    topQueries: ["austin roof repair", "roof leak repair austin", "emergency roof repair austin"],
  },
];

export const initialAnalyticsGoals = [
  {
    id: "goal-1",
    name: "Hero site lead form submit",
    scope: "site",
    siteSlug: "austin-solar-pros",
    eventName: "lead_form_submitted",
    targetValue: 180,
    interval: "monthly",
    status: "active",
    owner: "Growth Ops",
    notes: "Primary lead KPI for the first production hero site.",
  },
  {
    id: "goal-2",
    name: "AI referral traffic",
    scope: "portfolio",
    siteSlug: "all",
    eventName: "ai_referral_session",
    targetValue: 250,
    interval: "monthly",
    status: "active",
    owner: "SEO",
    notes: "Track cited traffic from AI search and conversational answer engines.",
  },
  {
    id: "goal-3",
    name: "Domain verification completion",
    scope: "portfolio",
    siteSlug: "all",
    eventName: "verified_domain_count",
    targetValue: 12,
    interval: "quarterly",
    status: "active",
    owner: "Platform Ops",
    notes: "Rollout KPI for moving domain inventory into verified live status.",
  },
];
