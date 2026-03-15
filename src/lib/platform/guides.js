function createStaticHeroImage({
  alt,
  color = '#d7c2ad',
  creditName = '',
  creditUrl = '',
  creditUsername = '',
  description = '',
  downloadLocation = '',
  source = 'manual',
  unsplashId = '',
  unsplashUrl = '',
  url,
}) {
  return {
    _type: 'heroImage',
    source,
    unsplashId,
    alt,
    description,
    color,
    blurHash: '',
    width: 1600,
    height: 1067,
    creditName,
    creditUsername,
    creditUrl,
    unsplashUrl,
    downloadLocation,
    urls: {
      _type: 'heroImageUrls',
      raw: url,
      full: url,
      regular: url,
      small: url,
      thumb: url,
    },
  }
}

export const solarGuides = [
  // ─────────────────────────────────────────────
  // GUIDE 01 — How Solar Works
  // ─────────────────────────────────────────────
  {
    id: 'guide-how-solar-works-texas',
    number: '01',
    slug: 'how-solar-works-texas',
    title: 'How Solar Actually Works on a Texas Home',
    cardCopy:
      'Panels, inverters, the grid, and what actually changes on the electric bill once a system goes live in Texas.',
    description:
      'A practical guide to how residential solar works in Texas — how power moves through the home, what the grid still does, and what to understand before comparing proposals.',
    image: createStaticHeroImage({
      alt: 'Modern Austin home with rooftop solar panels in warm afternoon light',
      color: '#c97a46',
      description: 'Editorial exterior of a modern Austin home with rooftop solar panels.',
      url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7c81dc6c-677b-458c-9c27-a3d6ff08395d_1600w.png',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 01',
        title: 'How solar actually works on a Texas home',
        body: 'The useful version is understanding where the power goes, when the grid still matters, what changes on the bill, and why two systems with the same panel count can perform very differently depending on roof layout and inverter design.',
        heroImage: createStaticHeroImage({
          alt: 'Modern Austin home with rooftop solar panels in warm afternoon light',
          color: '#c97a46',
          description: 'Editorial exterior of a modern Austin home with rooftop solar panels.',
          url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7c81dc6c-677b-458c-9c27-a3d6ff08395d_1600w.png',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Best for', value: 'First-time research' },
          { _type: 'pageMetric', label: 'Reading time', value: '12 min' },
          {
            _type: 'pageMetric',
            label: 'Primary question',
            value: 'What changes after the system is installed?',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'System basics',
        title: 'Solar reduces the power you buy from the grid. It does not make the grid disappear.',
        body: 'Panels produce DC power during daylight hours. The inverter converts that into AC power the house can use, and the home draws from it first. When production exceeds demand — a typical midday scenario in central Texas where solar irradiance averages 5.5 to 6.0 peak sun hours per day — excess power can flow back to the grid depending on your utility arrangement.\n\nAt night, during heavy cloud cover, or when the AC is working harder than the panels can keep up with, the home pulls from the grid as usual. In a typical Austin summer, air conditioning alone can account for 40 to 60 percent of a household electric bill. That means even a well-sized system will not zero out every month — the grid handles the gap between what the panels produce and what the house actually uses in real time.\n\nUnless a battery is part of the system, there is no stored reserve. When the sun goes down, the house returns to full grid dependence. And during a grid outage — which Texas homeowners have increasingly valid reasons to worry about — a standard grid-tied system shuts down entirely as a safety requirement. That is why solar is best understood as a bill-reduction project first, not an off-grid project or a backup power solution.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'The parts of the system homeowners should actually understand',
        items: [
          {
            _type: 'pageItem',
            title: 'Panels are only one piece of performance',
            body: "Panel brand matters less than most marketing suggests. Roof orientation, pitch, shading, inverter strategy, and system sizing tend to have a bigger effect on real-world production. A south-facing roof at 15 to 30 degrees pitch in central Texas will typically outproduce a west-facing roof by 10 to 15 percent with the same equipment, and shade from a single large oak tree can reduce a roof plane's output by 25 percent or more.",
          },
          {
            _type: 'pageItem',
            title: 'The inverter is the operating brain',
            body: 'It converts DC to AC, manages grid-safety shutdowns, and often determines how monitoring, battery add-ons, and future expansion work. String inverters work well on unshaded, uniform roofs. Microinverters or DC optimizers handle complex roof layouts and partial shading better because each panel operates independently. The inverter choice also affects what happens when you want to add storage later — not all configurations are battery-ready.',
          },
          {
            _type: 'pageItem',
            title: 'The grid still matters every single day',
            body: 'Most Texas residential systems are grid-tied. That means your utility rate structure, export-credit policy, and interconnection rules directly affect the economics. Austin Energy, Oncor, CenterPoint, and the various Texas co-ops all handle solar exports differently. Some offer close to retail value for exported power, others offer significantly less. That single variable — what your exported kWh is actually worth — can shift payback by years.',
          },
          {
            _type: 'pageItem',
            title: 'Storage is a separate decision with separate economics',
            body: 'A battery adds backup capability and load shifting, but it is not required for a solid solar project. Battery storage typically adds $10,000 to $18,000 to a residential system depending on capacity and configuration. It should be evaluated on its own cost and value — not bundled into the solar proposal to make the overall package look more impressive without clear economic justification.',
          },
          {
            _type: 'pageItem',
            title: 'System size should match usage, not roof space',
            body: 'A typical Texas home uses 1,000 to 1,500 kWh per month. A 6 to 10 kW system often handles 70 to 100 percent of that, depending on roof layout and utility export policy. Filling every available roof surface sounds appealing, but if your utility credits exports at a fraction of retail rate, oversizing a system produces diminishing returns.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'What to understand before requesting a quote',
        items: [
          {
            _type: 'pageItem',
            title: 'Start with roof reality',
            body: 'Orientation, pitch, shading, age, and usable area define what the system can realistically produce. A roof that faces primarily north, has heavy tree coverage, or needs replacement within the next five years changes the conversation entirely. That assessment should come before any brand or equipment discussions.',
          },
          {
            _type: 'pageItem',
            title: 'Pull 12 months of electric bills',
            body: 'Your actual usage pattern matters more than the average Texas household. A home that runs the AC hard from May through October looks very different from one that stays moderate year-round. Monthly usage data helps size the system accurately and gives you a baseline to measure real savings against after installation.',
          },
          {
            _type: 'pageItem',
            title: 'Focus on expected annual production, not panel count',
            body: 'Two proposals with identical wattage can deliver different annual kWh if the layout assumptions, shade modeling, or inverter approach differ. Ask every installer for their projected first-year production in kWh — not just the system size in watts — and make sure that number accounts for your specific roof, not a generic estimate.',
          },
          {
            _type: 'pageItem',
            title: 'Ask how exports are valued by your specific utility',
            body: 'If exported power is credited below retail rate — which is increasingly common across Texas utilities — oversizing a system becomes less attractive. A system that offsets 80 percent of your usage may actually deliver better economics than one that offsets 120 percent if the excess power is worth less than you paid for it.',
          },
          {
            _type: 'pageItem',
            title: 'Separate solar economics from battery economics',
            body: 'If storage is included in the proposal, its cost and value should be modeled separately. Backup power is worth something — especially in Texas — but that value should be stated clearly and not hidden inside the solar payback timeline to make the overall number look faster.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Common questions from Texas homeowners',
        items: [
          {
            _type: 'pageItem',
            question: 'Will my solar panels keep the lights on during a grid outage?',
            answer:
              'Not by default. Grid-tied systems are required to shut down when the grid goes out — this is a safety regulation called anti-islanding that protects utility workers. Backup power during an outage requires battery storage or another approved islanding configuration. If outage protection is a priority — and for many Texas homeowners it is, given recent grid reliability concerns — discuss battery options as a separate addition to the solar project.',
          },
          {
            _type: 'pageItem',
            question: 'Do I need the biggest system the roof can hold?',
            answer:
              'Rarely. The right system size depends on how much usage you want to offset, how your utility values exported power, and whether your roof supports that size efficiently. A 10 kW system on a roof that only gets good sun on 60 percent of its surface may not outperform a well-placed 7 kW system. And if your utility credits exports at half the retail rate, every kWh you overproduce is worth less than the kWh you use directly.',
          },
          {
            _type: 'pageItem',
            question: 'Is Texas a good state for solar?',
            answer:
              'Texas has strong solar irradiance — averaging 5.5 to 6.0 peak sun hours per day in central Texas — and a property-tax exemption that prevents your tax bill from increasing because of the solar installation. But the financial outcome still depends on your specific roof orientation, utility rate structure, electric bill size, and installed cost. Statewide solar potential is strong, but individual project economics vary meaningfully from one home to the next.',
          },
          {
            _type: 'pageItem',
            question: 'What should I be most skeptical about in a solar quote?',
            answer:
              'Any proposal that does not clearly state expected annual production in kWh, how it treats exported power, what assumptions drive the savings estimate, and whether the system is sized to your actual historical usage rather than a generic target. Also watch for quotes that fold battery cost into the solar payback story without separating the two — that often makes the economics look better than they are.',
          },
          {
            _type: 'pageItem',
            question: 'How long does a solar installation take from signing to being live?',
            answer:
              'In the Austin area, most residential installations take 2 to 4 months from contract to permission to operate. The physical installation itself is usually 1 to 3 days. The rest of the time is permitting, utility interconnection paperwork, and scheduling. If your utility requires an inspection or has a queue for interconnection approval, that can add weeks. Ask your installer for a realistic timeline specific to your utility territory.',
          },
          {
            _type: 'pageItem',
            question: 'Does solar increase my home value?',
            answer:
              'Research from the Lawrence Berkeley National Laboratory shows that homes with owned solar systems sell for a premium — roughly $4 per watt of installed capacity on average nationally. In Texas, the property-tax exemption means the added value does not increase your tax assessment. However, leased systems or systems with financing liens can complicate a home sale, so ownership structure matters.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GUIDE 02 — Solar Costs and Payback
  // ─────────────────────────────────────────────
  {
    id: 'guide-solar-costs-and-payback-texas',
    number: '02',
    slug: 'solar-costs-and-payback-texas',
    title: 'What Solar Costs and What Drives Payback',
    cardCopy:
      'Installed price, tax-credit math, financing cost, export value, and the variables that actually determine whether a system pays for itself.',
    description:
      'A detailed guide to solar project cost in Texas — installed price per watt, financing structure, export assumptions, and the questions to ask before trusting any payback estimate.',
    image: createStaticHeroImage({
      alt: 'Calculator, utility bill, and warm-toned tabletop still life',
      color: '#d59b53',
      description: 'Editorial still life with energy bill papers and a calculator.',
      url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1619b254-4925-4861-ae23-ae515f16291f_1600w.png',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 02',
        title: 'What homeowners should actually expect solar to cost',
        body: 'The real answer is not a national average and it is not the monthly payment on a postcard. It is the installed price, expected production, export value, financing structure, and how the federal credit is being treated in the numbers. All of those things vary by project.',
        heroImage: createStaticHeroImage({
          alt: 'Calculator, utility bill, and warm-toned tabletop still life',
          color: '#d59b53',
          description: 'Editorial still life with energy bill papers and a calculator.',
          url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1619b254-4925-4861-ae23-ae515f16291f_1600w.png',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Project economics' },
          { _type: 'pageMetric', label: 'Reading time', value: '12 min' },
          { _type: 'pageMetric', label: 'Decision point', value: 'Price, structure, and payback' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'Reading quotes honestly',
        title: 'The cleanest comparison is cost, production, and total paid over time.',
        body: 'Most homeowners get pushed to compare proposals on the wrong variable. One quote leads with a low monthly payment, another highlights the tax-credit-adjusted cost, and a third looks cheaper because the production assumptions are weaker or the equipment scope is thinner.\n\nThe useful comparison strips all of that down to a few numbers: installed price before incentives, expected annual production in kWh, how exported power is valued, financing terms and total paid over the life of the loan, and break-even timing under assumptions you can actually verify. In the Austin market, installed cost for a typical residential system currently ranges from roughly $2.50 to $3.50 per watt before the federal credit, depending on equipment, installer, and project complexity. A 8 kW system at $3.00 per watt is $24,000 before the federal credit — which at 30 percent brings the effective cost to roughly $16,800.\n\nBut that number only means something when paired with the production estimate, the utility rate, and the export-credit structure. A system that produces 12,000 kWh per year in a utility territory where exports are credited at full retail rate has a very different payback profile than the same system in a territory that credits exports at avoided cost — which can be 40 to 60 percent less. These details are not fine print. They are the difference between a 7-year payback and a 12-year payback.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'The variables that actually move payback',
        items: [
          {
            _type: 'pageItem',
            title: 'Installed price per watt',
            body: 'This is the starting comparison point. In central Texas, expect $2.50 to $3.50 per watt for a quality installation with tier-one equipment. Anything significantly below that range deserves scrutiny — it may reflect thinner equipment, subcontracted labor, or optimistic scope assumptions. Anything above it should come with a clear explanation of what additional value justifies the premium.',
          },
          {
            _type: 'pageItem',
            title: 'Federal Investment Tax Credit (ITC)',
            body: 'The residential clean energy credit currently covers 30 percent of the installed system cost, including battery storage if added. This credit reduces your federal tax liability — it is not a check from the government and it is not a discount at signing. If your federal tax liability in the year of installation is less than the credit amount, the remainder rolls forward to future tax years. Make sure your quote explains this clearly.',
          },
          {
            _type: 'pageItem',
            title: 'Utility export value',
            body: 'If exported power is credited below retail rate, oversizing a system becomes much harder to justify. Austin Energy currently offers a Value of Solar rate for exported generation that differs from the retail rate. Other Texas utilities handle it differently. This single variable changes system sizing strategy more than almost any other factor in the proposal.',
          },
          {
            _type: 'pageItem',
            title: 'Financing structure and dealer fees',
            body: 'Dealer fees — sometimes called origination fees or channel fees — can add 15 to 30 percent to the financed amount on some solar loans, even though the monthly payment looks similar to a loan without them. A $24,000 system financed with a 25 percent dealer fee actually becomes a $30,000 loan. That difference gets buried in the term and rate, but it is real money that extends the payback timeline significantly.',
          },
          {
            _type: 'pageItem',
            title: 'Your actual usage profile',
            body: 'A home that uses 1,500 kWh per month with heavy daytime AC load captures more direct value from solar than a 900 kWh home that runs most of its power after sunset. Usage pattern — not just total usage — determines how much of the solar production you consume directly versus how much gets exported at a potentially lower credit rate.',
          },
          {
            _type: 'pageItem',
            title: 'Upcoming roof or electrical work',
            body: 'If the home needs a roof replacement within the next five years or a panel upgrade to support the solar system, that scope should be part of the real project cost. Installing solar on a roof that needs replacement soon means paying for a detach-and-reset later — typically $2,000 to $5,000 depending on system size — plus the cost and hassle of coordinating two separate projects.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to pressure-test a solar savings estimate',
        items: [
          {
            _type: 'pageItem',
            title: 'Ask for annual production in writing',
            body: 'If the savings story depends on production numbers, the quote should state them clearly — first-year projected kWh, not just system wattage. Ask what shade and orientation assumptions were used and whether the estimate comes from a site-specific modeling tool like Aurora or Helioscope, or a generic lookup table.',
          },
          {
            _type: 'pageItem',
            title: 'Check whether export value equals retail rate',
            body: "If the proposal quietly assumes exported solar is worth full retail rate and your utility does not offer that, the payback estimate is inflated. Ask the installer to show you the specific export credit value they used in the model and verify it against your utility's current published rate.",
          },
          {
            _type: 'pageItem',
            title: 'Separate system price from financing effect',
            body: 'Request the cash price and the financed total-cost-over-time side by side. If the financed version is 20 to 30 percent more expensive than the cash price for the same equipment, dealer fees are likely embedded. A good installer will show you this comparison without being asked.',
          },
          {
            _type: 'pageItem',
            title: 'Ask what utility rate escalation is assumed',
            body: 'Some payback estimates assume electricity rates will increase 3 to 5 percent per year. Over a 25-year system life, that compounds dramatically. Ask what rate escalation assumption drives the savings number, and recalculate with a more conservative figure — even 2 percent per year — to see how sensitive the payback is to that assumption.',
          },
          {
            _type: 'pageItem',
            title: 'Look at the 10-year and 20-year total cost picture',
            body: 'A fast-sounding payback in year 7 does not matter much if financing cost pushes total paid well above the cash price. Map out the cumulative cost and cumulative savings at year 10, year 15, and year 20 to see the full economic picture rather than just a single break-even number.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Cost questions that belong on every quote comparison',
        items: [
          {
            _type: 'pageItem',
            question: 'What should I compare between solar installers?',
            answer:
              'Installed price per watt, equipment brand and specs, expected annual production in kWh, warranties on panels, inverters, and workmanship, financing terms and total cost over time, export-credit assumptions, and how the quote treats the federal tax credit. If any of those are missing, the comparison is incomplete. The best way to evaluate proposals is to put them side by side in a spreadsheet with the same line items.',
          },
          {
            _type: 'pageItem',
            question: 'Is a monthly payment lower than my electric bill enough to sign?',
            answer:
              'No. A solar loan payment of $150 per month that replaces a $180 electric bill sounds like savings, but if the loan runs 25 years with embedded dealer fees and the total paid is $45,000 for a system that cost $24,000 in cash, you have not saved money — you have restructured it. Always compare total cost over the life of the system, not just the monthly number.',
          },
          {
            _type: 'pageItem',
            question: 'Why do payback estimates vary so much between companies?',
            answer:
              'Because they depend on different assumptions about system price, production, electric-rate inflation, export credits, tax-credit treatment, and household usage patterns over time. One installer might assume 4 percent annual rate escalation and full retail export credit, while another assumes 2 percent and actual utility export rates. Same system, very different payback stories. The math is only as good as the inputs.',
          },
          {
            _type: 'pageItem',
            question: 'Should I trust a quote that feels unusually cheap?',
            answer:
              'Only after checking what was excluded. A price well below $2.50 per watt in the Austin market may reflect economy-tier equipment, subcontracted installation crews with less accountability, optimistic production assumptions, or a system scope that does not include everything you need — like a panel upgrade, conduit runs, or critter guard. Get the full equipment spec and scope in writing before comparing on price alone.',
          },
          {
            _type: 'pageItem',
            question: 'How much can I realistically save with solar in Texas?',
            answer:
              "It depends entirely on your bill size, roof, utility, and financing choice. A homeowner with a $200 monthly electric bill, a south-facing roof, and a cash purchase may see a payback period of 7 to 9 years and meaningful savings after that for the remaining 15 to 20 years of the system's life. A homeowner with a $100 bill, a shaded roof, and a high-fee financed loan may barely break even. The honest answer is project-specific — be skeptical of anyone quoting savings without knowing your details.",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GUIDE 03 — Solar Incentives and Tax Credits
  // ─────────────────────────────────────────────
  {
    id: 'guide-texas-solar-incentives',
    number: '03',
    slug: 'texas-solar-incentives-and-tax-credits',
    title: 'Solar Incentives and Tax Credits in Texas',
    cardCopy:
      'The federal credit, the Texas property-tax exemption, and how to verify local incentive claims before they drive your decision.',
    description:
      'A practical guide to solar incentives for Texas homeowners — the federal residential clean energy credit, property-tax protection, and how to verify changing local program details.',
    image: createStaticHeroImage({
      alt: 'Warm daylight over a solar-ready Austin neighborhood',
      color: '#7a9cb8',
      creditName: 'Kindel Media',
      creditUrl: 'https://unsplash.com/@kindelmedia',
      creditUsername: 'kindelmedia',
      description: 'Residential neighborhood scene used for incentives guide art.',
      source: 'unsplash',
      unsplashId: 'g4q8vO2PQL8',
      unsplashUrl: 'https://unsplash.com/photos/g4q8vO2PQL8',
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 03',
        title: 'Which solar incentives actually affect the project',
        body: 'Incentive pages get messy when sites promise more certainty than they can deliver. The better approach: know which incentives materially affect the project, understand which ones are time-sensitive, and verify local details yourself before letting them drive the math.',
        heroImage: createStaticHeroImage({
          alt: 'Warm daylight over a solar-ready Austin neighborhood',
          color: '#7a9cb8',
          creditName: 'Kindel Media',
          creditUrl: 'https://unsplash.com/@kindelmedia',
          creditUsername: 'kindelmedia',
          description: 'Residential neighborhood scene used for incentives guide art.',
          source: 'unsplash',
          unsplashId: 'g4q8vO2PQL8',
          unsplashUrl: 'https://unsplash.com/photos/g4q8vO2PQL8',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Credits and exemptions' },
          { _type: 'pageMetric', label: 'Reading time', value: '10 min' },
          { _type: 'pageMetric', label: 'Primary risk', value: 'Outdated program assumptions' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'How to think about incentives',
        title: 'Incentives should improve a project that already makes sense — not rescue one that does not.',
        body: "If the economics only work when every incentive assumption is maximized and every program stays active, the project is fragile. A strong solar investment should pencil out conservatively on its own, and incentives should make a good deal better rather than turn a marginal one into a go.\n\nThat said, the federal Investment Tax Credit alone can reduce the effective cost of a residential solar system by roughly 30 percent. On a $24,000 installation, that is a $7,200 reduction in federal tax liability — real money that significantly accelerates payback. The Texas property-tax exemption adds another layer of protection that matters more than most homeowners realize, especially in counties where appraisal increases have been aggressive.\n\nThe mistake happens when quotes stack incentives without verifying each one independently, or when local utility programs are presented as guaranteed when they are actually budget-limited or subject to annual changes. The homeowner's job is to understand which incentives are reliable, which are conditional, and what the project looks like if a conditional one falls through.",
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'The incentives Texas homeowners should care about most',
        items: [
          {
            _type: 'pageItem',
            title: 'Federal Residential Clean Energy Credit (ITC)',
            body: 'This is typically the single largest incentive in the stack — 30 percent of the total installed cost of the system, including battery storage. The credit applies to your federal income tax liability for the year the system is placed in service. If your tax liability is less than the credit amount, the unused portion carries forward to future tax years. The 30 percent rate is currently scheduled through 2032, stepping down to 26 percent in 2033 and 22 percent in 2034.',
          },
          {
            _type: 'pageItem',
            title: 'Texas property-tax exemption for solar and wind',
            body: "Under Texas Tax Code Section 11.27, residential solar energy devices are exempt from property tax assessment. That means installing a $24,000 solar system will not increase your property tax bill — even though it increases your home's market value. In Travis County, where effective property tax rates run around 1.5 to 1.8 percent, that exemption saves homeowners roughly $360 to $430 per year on a system of that size. Over the life of the system, that is meaningful.",
          },
          {
            _type: 'pageItem',
            title: 'Local utility programs and rebates',
            body: 'Some Texas utilities and electric co-ops offer additional incentives — performance-based credits, rebates, or favorable export rates. But program details change. Austin Energy has adjusted its Value of Solar rate multiple times. Co-op incentive programs have budgets that run out. Any quote that relies on a local rebate should cite the specific program name, current terms, and expiration date. If it does not, ask.',
          },
          {
            _type: 'pageItem',
            title: 'No state income tax means no state solar credit',
            body: 'Texas does not have a state income tax, which means there is no state-level solar tax credit. Some solar marketing implies a "state incentive" by referencing the property-tax exemption or local utility programs. Those are real, but they are not a state tax credit. If a proposal mentions a state incentive, ask exactly what it is and verify independently.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to verify incentive claims before signing anything',
        items: [
          {
            _type: 'pageItem',
            title: 'Check whether the quote explains eligibility clearly',
            body: 'A credible proposal should state what the incentive is, who qualifies, what the dollar amount or percentage is, and what assumptions it is making. If the quote just shows you a lower net number without explaining how it got there, ask for the math. The federal credit is straightforward — 30 percent of installed cost. Local programs are where things get murky.',
          },
          {
            _type: 'pageItem',
            title: 'Look for current source material on local programs',
            body: "If a local utility program is mentioned, you should be able to find the current terms on that utility's website. If the installer's information does not match what the utility publishes — or if the utility page has not been updated recently — treat the incentive as unverified until you can confirm it directly.",
          },
          {
            _type: 'pageItem',
            title: 'Ask how the credit is treated in the financing model',
            body: "Some solar loans assume the homeowner applies the federal credit as a lump-sum payment to the loan within 18 months. If that happens, the monthly payment drops. If it does not happen — because the homeowner's tax situation differs — the payment stays higher than advertised. This assumption should be stated explicitly in the financing terms, not buried in the fine print.",
          },
          {
            _type: 'pageItem',
            title: 'Verify each incentive independently before stacking them',
            body: 'Multiple incentives can sometimes stack, but eligibility, timing, and program rules all matter. The federal credit is reliable and well-documented. The Texas property-tax exemption is codified in state law. Local utility programs are variable. Verify each piece on its own before letting the combined savings number drive the decision.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Incentive questions that need current answers',
        items: [
          {
            _type: 'pageItem',
            question: 'Does the federal tax credit lower the price I pay the installer?',
            answer:
              'No. The credit reduces your federal tax liability when you file your return for the year the system is placed in service. You still pay the full contract price to the installer at signing or through your financing agreement. The credit comes back to you as a reduction in the taxes you owe — or as a larger refund if you have already paid more than your liability through withholding. Quotes should clearly distinguish between the contract price and the post-incentive effective cost.',
          },
          {
            _type: 'pageItem',
            question: 'Can I always stack federal, state, and local incentives together?',
            answer:
              'Texas does not have a state solar tax credit, so the typical stack is the federal ITC plus the property-tax exemption plus any local utility incentives. The federal credit and property-tax exemption are reliable. Local programs are conditional — verify current terms, budget availability, and eligibility requirements independently. Do not assume the full stack applies to your situation without checking each piece.',
          },
          {
            _type: 'pageItem',
            question: 'Will my property taxes go up if I install solar in Texas?',
            answer:
              'No. Texas Tax Code Section 11.27 exempts solar and wind energy devices from property tax assessment. The added value of the solar system is excluded from your property tax calculation. This exemption applies automatically — you do not need to apply for it separately, though confirming with your county appraisal district after installation is good practice.',
          },
          {
            _type: 'pageItem',
            question: 'What happens to the federal credit if I do not owe enough in taxes?',
            answer:
              'The residential clean energy credit is non-refundable, meaning it can reduce your tax liability to zero but will not generate a refund beyond what you have already paid. However, any unused credit carries forward to subsequent tax years. If you owe $5,000 in federal taxes and your credit is $7,200, you use $5,000 this year and carry the remaining $2,200 forward. Consult a tax professional for your specific situation.',
          },
          {
            _type: 'pageItem',
            question: 'How often do local incentive programs change?',
            answer:
              'They can change with limited notice. Utility program budgets run out, rate structures get updated, and policy decisions shift incentive levels. Austin Energy has adjusted its solar export rate several times over the past decade. The safest approach is to verify current terms directly with your utility at the time you are actively evaluating quotes — not based on what a website or installer said months ago.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GUIDE 04 — Detach and Reset
  // ─────────────────────────────────────────────
  {
    id: 'guide-solar-panel-detach-and-reset',
    number: '04',
    slug: 'solar-panel-detach-and-reset',
    title: 'Solar Panel Detach and Reset for Roof Replacement',
    cardCopy:
      'What happens to the panels when the roof needs work — the process, the cost, who handles what, and the questions most homeowners forget to ask.',
    description:
      'A complete guide to the solar panel detach-and-reset process during a Texas roof replacement — timeline, cost, coordination, warranty impact, and the details that protect your investment.',
    image: createStaticHeroImage({
      alt: 'Roofing crew working on a residential roof during a solar detach-and-reset project',
      color: '#8a6b52',
      description: 'Residential roofing work in progress before solar is reinstalled.',
      url: '/images/roof-install.png',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 04',
        title: 'What happens to solar panels when the roof needs replacing',
        body: 'If you already have solar and the roof underneath needs work — whether from age, storm damage, or an insurance claim — the panels have to come off before roofing can start and go back on after. That process is called a detach and reset. It sounds straightforward, but the coordination, cost, timeline, and warranty details matter more than most homeowners expect.',
        heroImage: createStaticHeroImage({
          alt: 'Roofing crew working on a residential roof during a solar detach-and-reset project',
          color: '#8a6b52',
          description: 'Residential roofing work in progress before solar is reinstalled.',
          url: '/images/roof-install.png',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Panel removal and reinstall' },
          { _type: 'pageMetric', label: 'Reading time', value: '12 min' },
          { _type: 'pageMetric', label: 'Common trigger', value: 'Storm damage or aging roof' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'Why this matters',
        title:
          'A detach and reset done wrong can void warranties, damage equipment, or delay the whole project by weeks.',
        body: 'The panels themselves are usually fine — they are built to last 25 to 30 years and can handle being removed and reinstalled. The risk is in how the work is coordinated. If the solar company and roofing crew are not working from the same timeline, panels sit on the ground longer than necessary. If racking penetrations are not properly resealed on the new roof, leaks develop at the very points that are supposed to be watertight. If electrical disconnects are handled carelessly, inverters or wiring can be damaged. And if nobody checks whether the original solar warranty survives the removal process, the homeowner may discover after the fact that their 25-year panel warranty is no longer honored.\n\nIn Texas, where hail damage triggers thousands of roof replacements every spring and summer, this is not an edge case — it is one of the most common solar-and-roofing coordination scenarios in the state. The Texas Department of Insurance reports that hail and wind claims make up the majority of homeowner insurance claims statewide. A significant number of those roofs have solar on them, and that number grows every year.\n\nThe homeowners who come through the process cleanly are the ones who understand the steps, get the coordination in writing, and make sure warranty and insurance questions are answered before the first panel comes off the roof — not after.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How the detach-and-reset process works',
        items: [
          {
            _type: 'pageItem',
            title: 'Step 1: The solar system gets de-energized and disconnected',
            body: 'A licensed solar technician shuts the system down following manufacturer-specified procedures, disconnects it from the grid, and ensures all DC and AC circuits are safe before any physical removal begins. This typically includes notifying the utility of the temporary disconnection. This is not something the roofing crew should handle — solar panels produce DC voltage whenever exposed to light, and improper handling creates real electrical hazard.',
          },
          {
            _type: 'pageItem',
            title: 'Step 2: Panels, racking, and conduit are removed and stored',
            body: 'Panels come off the roof one at a time, along with the racking system, flashing, and any conduit that runs across the roof surface. Each panel should be labeled for reinstall position, inspected for pre-existing damage, and stored safely on site — ideally on padded racks or in a protected area away from construction debris. A detailed inventory with photos protects both the homeowner and the solar contractor.',
          },
          {
            _type: 'pageItem',
            title: 'Step 3: The roof is replaced or repaired',
            body: "Once the panels and racking are clear, the roofer has full access. New underlayment, any necessary decking repairs, and new roofing material go down. The roofer should know exactly where the racking penetrations were located and plan flashing around the reinstall points. If the roofing and solar companies are coordinating, the roofer can pre-install flashing boots or standoff bases per the solar company's specifications — saving time on the reinstall.",
          },
          {
            _type: 'pageItem',
            title: 'Step 4: Solar is reinstalled on the new roof',
            body: 'The solar crew returns to remount racking, replace any hardware that cannot be reused — lag bolts, flashing, and weatherproofing components are typically replaced with new material — and reinstall panels in their original or optimized positions. New roof penetrations are properly sealed and flashed. The system is reconnected, re-energized, and tested to confirm production matches pre-removal output.',
          },
          {
            _type: 'pageItem',
            title: 'Step 5: Inspection, reconnection, and monitoring verification',
            body: 'Depending on your jurisdiction, the reinstall may require a permit and inspection — many Texas municipalities treat it the same as a new installation. The system gets reconnected to the grid, the utility is notified, and monitoring is verified to confirm all panels are producing as expected. This is also the time to confirm warranty status with the solar panel and inverter manufacturers in writing.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'Details that protect your investment during a D&R',
        items: [
          {
            _type: 'pageItem',
            title: 'Know who is responsible for what — in writing',
            body: 'The solar company handles the electrical work, panel removal, storage, and reinstallation. The roofer handles the roof. If those scopes overlap or nobody owns the handoff — especially around flashing, penetrations, and waterproofing — things get missed. Get the coordination plan and scope boundaries documented before work begins, not negotiated during the project.',
          },
          {
            _type: 'pageItem',
            title: 'Understand the cost before work begins',
            body: 'A detach and reset is a separate line item — typically $2,000 to $5,000 for a standard residential system, depending on system size, roof complexity, and whether any equipment needs replacement. It is not included in the roofing bid and not typically covered under the original solar contract. Get an itemized quote from the solar company before approving the roofing project.',
          },
          {
            _type: 'pageItem',
            title: 'Check your solar warranty before anyone touches the system',
            body: 'Some manufacturers require the original installer or a certified partner to perform removal and reinstallation for the warranty to remain valid. Others accept any licensed solar contractor with documentation. If an uncertified crew handles the work, the panel and inverter warranties may not survive. Contact the manufacturer directly to confirm their requirements before the project starts.',
          },
          {
            _type: 'pageItem',
            title: 'Document equipment condition before and after',
            body: 'Every panel should be photographed and its serial number recorded before removal. After reinstall, production monitoring should confirm the system is performing at or near its pre-removal output within the first week. Any decline in production should be investigated immediately — it could indicate a damaged panel, a wiring issue, or an inverter problem introduced during the process.',
          },
          {
            _type: 'pageItem',
            title: 'Insurance claims may cover D&R cost — but only if you ask',
            body: 'If the roof is being replaced due to storm damage, the detach-and-reset cost is often recoverable as part of the insurance claim. Many adjusters will include solar removal and reinstall in the roof replacement scope if the panels are in the way of the covered work. But this is not automatic — you need to request it specifically and get the line item included in the claim before settlement. Waiting until after the claim is finalized usually means paying out of pocket.',
          },
          {
            _type: 'pageItem',
            title: 'Timeline: expect 1 to 3 weeks of system downtime',
            body: 'The solar removal itself takes a day. The roof replacement takes 1 to 5 days depending on scope. The reinstall takes another day. Add scheduling gaps between crews, weather delays, and permitting, and most homeowners should expect their system to be offline for 1 to 3 weeks. If you are producing significant power — especially during Texas summer months — that downtime has a real dollar value worth factoring into the project timeline.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Detach and reset questions homeowners ask most',
        items: [
          {
            _type: 'pageItem',
            question: 'How much does a solar detach and reset cost in Texas?',
            answer:
              'Most residential D&R projects in central Texas range from $2,000 to $5,000 depending on system size, number of panels, roof complexity, and whether any hardware needs replacement during reinstall. Larger systems with 30 or more panels, multi-plane roofs, or ground-mounted conduit runs will be toward the higher end. Get an itemized quote from the solar company — not just a flat number — so you can see what is included.',
          },
          {
            _type: 'pageItem',
            question: 'Can my roofer just remove the panels themselves?',
            answer:
              'They should not. Solar panels involve DC electrical circuits that produce voltage any time they are exposed to light — even after the system is "turned off" at the inverter. Improper handling creates genuine electrical hazard and can damage equipment. The disconnect, removal, and reinstall should be performed by a licensed solar contractor, both for safety and to protect your equipment warranties.',
          },
          {
            _type: 'pageItem',
            question: 'Will my solar warranty still be valid after a detach and reset?',
            answer:
              "It depends on who does the work and how it is documented. Some manufacturers — like SunPower and Enphase — require the original installer or an authorized service partner to perform the work. Others accept any licensed solar professional with proper documentation. The key is to verify the manufacturer's requirements before the project begins and keep records of who performed the work, when, and what was done. Getting warranty confirmation in writing after the reinstall is complete is the safest approach.",
          },
          {
            _type: 'pageItem',
            question: 'How long will my solar system be offline during the process?',
            answer:
              'Typically 1 to 3 weeks, depending on how fast the roof replacement happens and how quickly the solar crew can schedule the reinstall. The removal and reinstall each take about a day. The gap in between is driven by the roofing timeline, weather, and crew scheduling. During Texas summer months, system downtime means lost production — a 10 kW system in Austin can produce 40 to 50 kWh per day in peak season, so a two-week outage represents real lost value.',
          },
          {
            _type: 'pageItem',
            question: 'Does insurance cover the detach and reset when the roof claim is storm-related?',
            answer:
              'Often, yes — but only if you include it in the claim. Many Texas insurance adjusters will approve solar panel removal and reinstallation as part of the roof replacement scope when the panels are in the work area. The D&R cost is treated as a necessary expense to complete the covered roof repair. However, you must request this line item before the claim is settled. If you wait until the claim is closed, the insurer has no obligation to reopen it for the additional cost.',
          },
          {
            _type: 'pageItem',
            question: 'What if some panels or hardware are damaged during the process?',
            answer:
              'That is exactly why pre-removal documentation matters. If equipment is damaged during the D&R, the responsible party depends on who was handling it at the time and what the scope-of-work agreement says. If the solar contractor damages a panel during removal, their insurance should cover it. If the roofing crew damages stored equipment, their liability policy applies. A clear written agreement about equipment responsibility and liability — signed before work begins — prevents disputes after the fact.',
          },
          {
            _type: 'pageItem',
            question: 'Can I upgrade my solar system during the detach and reset?',
            answer:
              'Yes, and this is actually a cost-effective time to do it. Since the panels are already coming off and going back on, adding panels, upgrading the inverter, or adding battery storage during the reinstall avoids a second mobilization and often reduces the incremental cost of the upgrade. If you have been considering expanding your system or adding backup power, discuss the options with your solar contractor before the D&R begins.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'ctaBanner',
        eyebrow: 'Need a detach and reset?',
        title: 'If your roof needs work and solar is already up there, start the coordination now.',
        body: 'We handle both sides of the project — roofing and solar — so the timeline, scope, and warranty details are managed under one roof. Reach out to get the D&R process started before scheduling your roofer.',
        ctaLabel: 'Request a D&R consultation',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GUIDE 05 — Texas Storm Damage and Roof Insurance
  // ─────────────────────────────────────────────
  {
    id: 'guide-texas-storm-damage-roof-insurance',
    number: '05',
    slug: 'texas-storm-damage-roof-insurance-claims',
    title: 'Texas Storm Damage: Roof Inspection and Insurance Claims',
    cardCopy:
      'Hail, wind, what to look for after a storm, how the insurance process works, and where homeowners lose money by waiting.',
    description:
      'A practical guide to storm damage roof inspection and insurance claims in Texas — what to check after hail or wind, how the adjuster process works, and the timeline mistakes that cost homeowners money.',
    image: createStaticHeroImage({
      alt: 'Dark storm clouds over a Texas residential neighborhood',
      color: '#4a5568',
      creditName: 'NOAA',
      creditUrl: 'https://unsplash.com/@noaa',
      creditUsername: 'noaa',
      description: 'Dramatic storm clouds over residential rooftops.',
      source: 'unsplash',
      unsplashId: 'ZVhbwDfLtYM',
      unsplashUrl: 'https://unsplash.com/photos/ZVhbwDfLtYM',
      url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1600&auto=format&fit=crop',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 05',
        title: 'What to do about your roof after a Texas storm',
        body: 'Texas gets hit hard. The state averages over 400 reported hailstorms per year — more than any other state — and central Texas sits squarely in what meteorologists call Hail Alley. The question after a major storm is not just whether the roof looks damaged from the ground. It is whether the damage meets the threshold for an insurance claim, and what the homeowner should do before time and weather make things worse.',
        heroImage: createStaticHeroImage({
          alt: 'Dark storm clouds over a Texas residential neighborhood',
          color: '#4a5568',
          creditName: 'NOAA',
          creditUrl: 'https://unsplash.com/@noaa',
          creditUsername: 'noaa',
          description: 'Dramatic storm clouds over residential rooftops.',
          source: 'unsplash',
          unsplashId: 'ZVhbwDfLtYM',
          unsplashUrl: 'https://unsplash.com/photos/ZVhbwDfLtYM',
          url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1600&auto=format&fit=crop',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Storm response and claims' },
          { _type: 'pageMetric', label: 'Reading time', value: '12 min' },
          { _type: 'pageMetric', label: 'Key risk', value: 'Waiting too long to act' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'Why urgency matters',
        title: 'Storm damage does not always look obvious — but it gets worse with every season you wait.',
        body: 'Hail bruises shingles in ways that are hard to see from the ground. A 1-inch hailstone — roughly quarter-sized — striking an asphalt shingle at terminal velocity can crack the mat, knock protective granules loose, and compromise the waterproofing layer without leaving an obvious mark visible from 30 feet below. Hailstones 1.5 inches and larger almost always cause functional damage to standard roofing materials, and Texas storms regularly produce hail in the 1 to 3 inch range.\n\nOnce that damage exists, the clock starts. Granule loss accelerates UV degradation of the exposed asphalt. Cracked or lifted shingles let moisture reach the underlayment and eventually the decking. What starts as cosmetic damage can become a leak, mold issue, or structural problem if it sits through another Texas summer — where sustained 100-degree heat, thermal cycling, and afternoon storms put additional stress on already-compromised materials.\n\nTexas insurance policies also have filing deadlines. Most homeowner policies require claims to be filed within one to two years of the storm date, though some carriers have tightened that window. Waiting too long can mean losing coverage for damage that was absolutely claimable. And here is the part most homeowners miss: the filing deadline starts with the storm, not with the day you notice a problem inside the house. By the time you see a water stain on the ceiling, the claim window may already be closing.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'What to do after a major storm hits your area',
        items: [
          {
            _type: 'pageItem',
            title: 'Do a safe ground-level check within the first 24 hours',
            body: 'Walk the perimeter of your home. Look for downed shingles or roofing debris in the yard, dented gutters and downspouts, cracked or pitted siding, damaged window screens, and dented outdoor HVAC units. If hail was large enough to dent aluminum gutters or outdoor furniture, it was almost certainly large enough to damage asphalt shingles. Do not climb onto the roof — a professional inspection is safer and far more thorough.',
          },
          {
            _type: 'pageItem',
            title: 'Document everything you can see — photos, video, and dates',
            body: 'Take photos and video of all visible damage from the ground, including wide shots of the roofline and close-ups of any debris, dents, or missing material. Note the date of the storm and save local weather reports or National Weather Service hail size data for your area. This documentation becomes part of your claim file and establishes the storm date if there is ever a question about timing.',
          },
          {
            _type: 'pageItem',
            title: 'Schedule a professional roof inspection within 72 hours',
            body: 'A qualified roofer can identify hail hits, wind lift, bruising, granule loss, cracked flashing, and compromised sealant that you cannot see from the ground. Most reputable roofing companies offer free storm-damage inspections and provide a written report with photos. Get this done quickly — within 72 hours if possible — because early documentation strengthens the insurance claim and helps establish the timeline.',
          },
          {
            _type: 'pageItem',
            title: 'File the insurance claim promptly if damage is confirmed',
            body: "Contact your insurance company to open a claim as soon as professional inspection confirms damage. Provide the storm date, your documentation, and the roofer's inspection report. Request a claim number and your adjuster's contact information. Most insurers prefer notification within 30 days of the storm — even though the legal deadline may be longer — and immediate reporting demonstrates good faith effort to protect the property.",
          },
          {
            _type: 'pageItem',
            title: 'Have your roofer present during the adjuster inspection',
            body: 'The insurance adjuster works for the insurance company. A qualified roofer at the inspection advocates for complete damage identification. They can point out damage the adjuster might overlook, provide context about how specific damage affects the roof system, and ensure the scope of the claim reflects the actual repair needs — not just the most obvious surface issues.',
          },
          {
            _type: 'pageItem',
            title: 'Do not sign a roofing contract before the claim is settled',
            body: 'You need to know what insurance will cover before committing to a scope and price. A reputable roofer will not pressure you to sign before the claim process is complete. Be especially cautious of contractors who show up uninvited after a storm and push for an immediate signature — legitimate local companies do not need to chase storms door to door.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'What Texas homeowners get wrong about storm damage claims',
        items: [
          {
            _type: 'pageItem',
            title: 'Assuming no visible leak means no damage',
            body: 'Most hail damage is not visible from inside the house until months later when compromised shingles start failing under UV exposure and thermal cycling. Granule loss, hairline cracks, and bruised mat material can all exist without a single interior leak — until the next heavy rain finds the weakened spots. By then, the claim window may be closing or closed.',
          },
          {
            _type: 'pageItem',
            title: 'Waiting too long to file',
            body: 'Texas insurers generally require claims within one to two years of the storm date, but some carriers and policies have shorter windows. Beyond the legal deadline, waiting reduces your leverage — the insurer can argue that subsequent weather, wear, or neglect contributed to the current condition. Filing promptly, even if you are not sure the damage is severe, protects your options.',
          },
          {
            _type: 'pageItem',
            title: 'Not having a roofer present during the adjuster visit',
            body: 'Adjusters are trained to assess damage, but they are also trained to manage claim costs. A qualified roofer at the inspection ensures all damage is identified, documented with photos, and included in the claim scope. Homeowners who skip this step frequently receive initial claim estimates that undervalue the repair — sometimes by thousands of dollars — and then face a longer supplemental claim process to close the gap.',
          },
          {
            _type: 'pageItem',
            title: 'Signing with the first contractor who knocks on the door',
            body: "After a major hail event, storm-chasing contractors flood affected neighborhoods — sometimes within hours. Not all of them will be around in six months to honor a warranty. Before signing with any roofer, verify their Texas contractor license, confirm current liability and workers' compensation insurance, check their physical business address, and ask for local references. A company that has been serving central Texas for years has a very different accountability profile than one that arrived last Tuesday.",
          },
          {
            _type: 'pageItem',
            title: 'Accepting a claim denial without questioning it',
            body: "If the adjuster says there is no damage but your professional roofer disagrees, you have options. You can request a re-inspection with a different adjuster, provide your roofer's detailed report and photos as supplemental evidence, or hire a public adjuster for an independent evaluation. Claim denials are not always final — they are sometimes a starting point for negotiation, especially when the homeowner has strong documentation.",
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Storm damage and insurance questions',
        items: [
          {
            _type: 'pageItem',
            question: 'Will filing a storm damage claim raise my insurance rates?',
            answer:
              'It can, depending on your insurer, claims history, and whether the storm triggered widespread claims in your area. Some carriers apply surcharges after claims; others do not for weather-related events. However, not filing when the roof has legitimate storm damage can lead to much larger problems — a failing roof, interior water damage, mold, and eventual out-of-pocket replacement cost that dwarfs the potential rate increase. Weigh the cost of the deductible and any rate impact against the cost of ignoring the damage.',
          },
          {
            _type: 'pageItem',
            question: 'What if the adjuster and my roofer disagree about the damage?',
            answer:
              'This happens regularly. You have the right to request a re-inspection, provide supplemental evidence from your roofer, or hire a public adjuster to perform an independent assessment. Many disputes are resolved through the supplemental claim process, where additional damage found during tear-off or documented by a second professional opinion results in an adjusted claim amount. Keep detailed records of all communications.',
          },
          {
            _type: 'pageItem',
            question: 'Does my homeowner insurance cover solar panel damage from hail?',
            answer:
              'Most standard Texas homeowner policies cover solar panels as part of the dwelling structure, similar to roofing or siding. However, coverage details, deductible structure, and claim limits vary by carrier and policy. If you have solar panels, confirm with your insurer how a combined roof-and-solar claim would be handled, whether the panels are covered under the dwelling or personal property section, and whether the detach-and-reset cost for accessing the roof is included in the claim scope.',
          },
          {
            _type: 'pageItem',
            question: 'How long does the insurance claim process take in Texas?',
            answer:
              'From filing to settlement, the process typically takes 2 to 8 weeks for straightforward claims. Complex claims — those involving supplemental damage found during tear-off, disputes about scope, or multiple structures — can take several months. Under Texas law, insurers must acknowledge receipt of a claim within 15 days and approve or deny within 15 business days after receiving all required documentation. Delays beyond those timeframes may be grounds for a complaint to the Texas Department of Insurance.',
          },
          {
            _type: 'pageItem',
            question: 'What size hail causes roof damage that requires repair?',
            answer:
              'Hail as small as 1 inch in diameter — about the size of a quarter — can cause functional damage to standard asphalt shingles, especially when accompanied by the high winds common in Texas storms. Hailstones 1.5 inches and larger almost always require professional inspection and likely repair. At 2 inches and above, significant damage to most residential roofing materials is virtually certain. The National Weather Service documents that Texas storms frequently produce hail exceeding 2 inches in diameter.',
          },
          {
            _type: 'pageItem',
            question: 'Should I make temporary repairs before the adjuster comes?',
            answer:
              'Yes — and your insurance policy typically requires it. You have a duty to mitigate further damage, which means covering exposed areas with tarps, catching active leaks, and preventing water from reaching the interior. Document everything you do with photos, keep receipts for any materials purchased, and do not make permanent repairs until the adjuster has inspected. Temporary protective measures are typically reimbursable as part of the claim.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'ctaBanner',
        eyebrow: 'Recent storm in your area?',
        title: 'Get a professional roof inspection before the damage gets worse.',
        body: 'If a storm recently came through your neighborhood, a free inspection can tell you whether there is claimable damage — before the filing window closes or the next storm compounds the problem.',
        ctaLabel: 'Schedule a free storm inspection',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GUIDE 06 — When to Replace Your Roof
  // ─────────────────────────────────────────────
  {
    id: 'guide-when-to-replace-roof-texas',
    number: '06',
    slug: 'when-to-replace-your-roof-texas',
    title: 'When Does a Texas Roof Actually Need Replacing',
    cardCopy:
      'Age, material life, damage signs, and the honest conversation about whether to repair, replace, or plan ahead.',
    description:
      'A homeowner guide to knowing when a Texas roof needs replacing — age expectations by material, visible warning signs, and how to evaluate repair vs. replacement before it becomes an emergency.',
    image: createStaticHeroImage({
      alt: 'Close-up of aged asphalt shingles on a Texas residential roof',
      color: '#8a5b45',
      description: 'Close-up of asphalt shingles showing wear and texture.',
      url: '/images/closeup-shingle-roof-bright-sky-showcasing-texture-alignment-shingles-symbolizing-durability-protection.jpg',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 06',
        title: 'How to tell when a roof replacement is the right call',
        body: 'Not every problem means a full tear-off, and not every old roof is failing. But Texas weather — summer UV, temperature swings, hail, and wind — takes a real toll on roofing materials. The question is whether the roof still has reliable life left in it, or whether continued patching is just delaying an inevitable replacement at a higher total cost.',
        heroImage: createStaticHeroImage({
          alt: 'Close-up of aged asphalt shingles on a Texas residential roof',
          color: '#8a5b45',
          description: 'Close-up of asphalt shingles showing wear and texture.',
          url: '/images/closeup-shingle-roof-bright-sky-showcasing-texture-alignment-shingles-symbolizing-durability-protection.jpg',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Roof condition and timing' },
          { _type: 'pageMetric', label: 'Reading time', value: '10 min' },
          { _type: 'pageMetric', label: 'Key decision', value: 'Repair vs. replace' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'The Texas factor',
        title: 'Texas roofs age faster than the warranty implies.',
        body: "A shingle rated for 25 or 30 years in a manufacturer's controlled test does not always last that long on a house in central Texas. Sustained summer heat that pushes attic temperatures above 140°F, intense UV exposure across 200-plus clear-sky days per year, daily thermal cycling that expands and contracts roofing materials, and periodic hail events that strip granules and crack mat material — all of these accelerate aging well beyond what the warranty timeline suggests.\n\nStandard three-tab asphalt shingles, still found on many older Texas homes, typically deliver 12 to 18 years of reliable service in central Texas conditions. Architectural (dimensional) shingles perform better — 18 to 25 years is a reasonable expectation with decent ventilation. Class 4 impact-resistant shingles can extend that to 25 years or more, while standing-seam metal roofing commonly lasts 40 to 60 years with proper installation.\n\nBut these are averages. A roof that has taken two or three significant hail hits in its first decade may be functionally compromised well before its age would suggest. And a roof that looks acceptable from the curb can still be losing granules, developing soft spots under the shingle mat, or holding moisture in the underlayment. That is why age alone is not the only indicator — condition matters, and condition in Texas changes faster than most homeowners expect.",
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'Warning signs a Texas homeowner should not ignore',
        items: [
          {
            _type: 'pageItem',
            title: 'Heavy granule accumulation in gutters and downspouts',
            body: "Some granule loss is normal on new shingles, but heavy accumulation in the gutters — especially after storms or a hot summer — signals that the shingle's protective layer is breaking down faster than expected. When you start seeing bare asphalt patches on the shingles themselves, the waterproofing function is already compromised.",
          },
          {
            _type: 'pageItem',
            title: 'Curling, cracking, or blistering across multiple shingles',
            body: 'These are visible signs of material breakdown. Curling edges lift in wind and allow water underneath. Cracking exposes the mat to UV and moisture. Blistering indicates trapped moisture in the shingle itself. Once these symptoms appear across a large area — not just a few isolated shingles — the roof is telling you it is in decline.',
          },
          {
            _type: 'pageItem',
            title: 'Soft spots or sagging on the roof deck',
            body: 'If you can see sag lines from the ground or feel soft, spongy areas when walking the attic, moisture has likely compromised the decking. This usually means the roof has failed in that area — water has been getting through the shingle and underlayment layers long enough to damage the structural wood. This is not a repair situation; it is a replacement signal.',
          },
          {
            _type: 'pageItem',
            title: 'Repeated leaks or patch repairs in different areas',
            body: 'One repair is routine maintenance. Two in different areas is a yellow flag. Three or more suggests the roof is declining system-wide, and continued patching will cost more over the next few years than a single replacement would. Track your repair history — when the cost of patches starts approaching 30 percent of a replacement, the math typically favors replacing.',
          },
          {
            _type: 'pageItem',
            title: 'Age beyond expected material life for your climate',
            body: 'If the roof is 15 or more years old with standard asphalt shingles and has been through multiple Texas hail seasons, a professional inspection is worth the time even if nothing looks obviously wrong from the ground. Many roof failures in Texas happen not because the roof suddenly breaks, but because cumulative damage crosses a threshold that the next storm exploits.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to evaluate whether it is time',
        items: [
          {
            _type: 'pageItem',
            title: 'Get a professional inspection with a written report',
            body: 'A qualified roofer can assess remaining material life, identify hidden damage from past storms, evaluate underlayment and decking condition, check ventilation performance, and give you an honest recommendation. If the inspector only wants to sell you a roof and does not discuss repair options, get a second opinion from someone who will.',
          },
          {
            _type: 'pageItem',
            title: 'Compare cumulative repair cost against replacement value',
            body: 'If you have spent — or are projected to spend — more than 25 to 30 percent of what a full replacement would cost on patches and repairs, the replacement usually wins on long-term economics. Factor in the risk that each repair is addressing a symptom while the underlying condition continues to decline.',
          },
          {
            _type: 'pageItem',
            title: 'Factor in other planned work on the home',
            body: 'If solar installation, a home sale, or a renovation is coming in the next few years, doing the roof first almost always saves money and avoids project conflicts. Installing solar on a roof that needs replacement soon means paying for a detach-and-reset later. Selling a home with a roof at end-of-life can reduce the sale price or trigger buyer demands during inspection.',
          },
          {
            _type: 'pageItem',
            title: 'Understand material options for the replacement',
            body: 'Texas homeowners have choices beyond standard three-tab shingles. Architectural shingles offer better wind resistance and longevity. Class 4 impact-resistant shingles reduce hail damage risk by up to 90 percent and often qualify for insurance premium discounts of 10 to 35 percent — sometimes recovering the material cost premium within 3 to 5 years. Metal roofing offers the longest lifespan but at a higher upfront cost. The right choice depends on budget, how long you plan to stay, and your tolerance for future storm risk.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Roof replacement questions worth asking',
        items: [
          {
            _type: 'pageItem',
            question: 'How long do asphalt shingles actually last in central Texas?',
            answer:
              'Standard three-tab shingles typically last 12 to 18 years in central Texas conditions. Architectural (dimensional) shingles perform better at 18 to 25 years. Class 4 impact-resistant shingles can exceed 25 years. Actual performance depends on installation quality, attic ventilation, storm history, and whether the roof has taken significant hail hits during its life. A roof that has been through three hail events in a decade is not the same as one that has had a quiet run.',
          },
          {
            _type: 'pageItem',
            question: 'Does an impact-resistant roof lower my insurance premium in Texas?',
            answer:
              'Yes. Many Texas insurers offer premium discounts of 10 to 35 percent for Class 4 impact-resistant roofing materials — which are UL 2218 rated to withstand repeated impact from a 2-inch steel ball. The exact discount varies by carrier and policy, but it can be significant enough to offset the higher material cost within 3 to 5 years. Ask your insurer for the specific discount before finalizing the roof material specification.',
          },
          {
            _type: 'pageItem',
            question: 'Should I replace the whole roof or just the damaged section?',
            answer:
              'It depends on the age and condition of the rest of the roof. If the damaged section is 5 years old and the rest of the roof is in good shape, a partial repair makes sense. If the damaged section is part of a 17-year-old roof with widespread granule loss and other signs of decline, patching one area while the rest is near end-of-life means you will likely be paying for a full replacement in a few years anyway — plus the cost of the partial repair you just did. A full inspection helps you make that call with real data.',
          },
          {
            _type: 'pageItem',
            question: 'What should I do about the roof if I am planning to add solar soon?',
            answer:
              "If the roof is within five years of needing replacement, doing the roof first is almost always the right call. Solar panels are designed to last 25 to 30 years. Installing them on a roof that will need work in year 5 means paying $2,000 to $5,000 for a detach-and-reset to remove and reinstall the panels during the roof replacement. Plan the roof first, then install solar on a surface that can match the system's lifespan.",
          },
          {
            _type: 'pageItem',
            question: 'How much does a roof replacement cost in central Texas?',
            answer:
              'For a typical 2,000 to 2,500 square foot home, a full replacement with architectural shingles runs roughly $8,000 to $15,000 depending on roof complexity, material grade, tear-off requirements, and any decking repairs needed. Impact-resistant shingles add 10 to 20 percent to the material cost. Metal roofing is significantly more — often $15,000 to $30,000 or more — but lasts substantially longer. Always get multiple written estimates with the same scope and materials specified for an accurate comparison.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GUIDE 07 — Roof and Solar Project Planning
  // ─────────────────────────────────────────────
  {
    id: 'guide-roof-and-solar-project-planning',
    number: '07',
    slug: 'planning-roof-and-solar-together',
    title: 'Planning a Roof and Solar Project Together',
    cardCopy:
      'Sequencing, bundling, cost coordination, and why the order you do things in can save or cost you thousands.',
    description:
      'A guide to coordinating roof replacement and solar installation as one project in Texas — sequencing, cost savings, contractor coordination, and the planning details that protect the investment.',
    image: createStaticHeroImage({
      alt: 'Aerial view of a Texas home with new roof and solar panels',
      color: '#6b8c5a',
      creditName: 'Vivint Solar',
      creditUrl: 'https://unsplash.com/@vivintsolar',
      creditUsername: 'vivintsolar',
      description: 'Overhead view of a completed roof and solar installation.',
      source: 'unsplash',
      unsplashId: 'ZEiFiOsV3K4',
      unsplashUrl: 'https://unsplash.com/photos/ZEiFiOsV3K4',
      url: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?q=80&w=1600&auto=format&fit=crop',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 07',
        title: 'How to sequence a roof replacement and solar install without wasting money',
        body: 'When both projects are on the horizon, the order matters. Doing them in the wrong sequence — or with disconnected contractors — can mean paying twice for work that should have been done once, losing warranty coverage, or creating timeline headaches that delay everything by months.',
        heroImage: createStaticHeroImage({
          alt: 'Aerial view of a Texas home with new roof and solar panels',
          color: '#6b8c5a',
          creditName: 'Vivint Solar',
          creditUrl: 'https://unsplash.com/@vivintsolar',
          creditUsername: 'vivintsolar',
          description: 'Overhead view of a completed roof and solar installation.',
          source: 'unsplash',
          unsplashId: 'ZEiFiOsV3K4',
          unsplashUrl: 'https://unsplash.com/photos/ZEiFiOsV3K4',
          url: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?q=80&w=1600&auto=format&fit=crop',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Project coordination' },
          { _type: 'pageMetric', label: 'Reading time', value: '10 min' },
          { _type: 'pageMetric', label: 'Key benefit', value: 'Avoiding double work and cost' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'The coordination problem',
        title: 'Two good projects done in the wrong order become one expensive mistake.',
        body: 'Here is the scenario that costs Texas homeowners the most money: solar goes on a roof that needed replacement, and a year or two later the panels have to come off for a reroof. The detach-and-reset alone costs $2,000 to $5,000. Add the production downtime during a Texas summer — where a 10 kW system produces $50 to $70 worth of electricity per week — and the scheduling hassle of coordinating two crews, and the total cost of doing it backwards easily reaches $4,000 to $7,000 more than doing it in the right order.\n\nThe reverse problem also happens. A homeowner does the roof first but picks materials or flashing details that complicate the solar install — or uses a roofer who does not account for where panels will go, resulting in vent placements or ridge details that reduce the usable solar area.\n\nWhen both projects are happening within a few years of each other, planning them together — even if the physical work happens in stages — can save real money and eliminate the most common coordination failures. The best outcomes come from homeowners who treat roof and solar as one project with two phases rather than two unrelated decisions.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'Why planning both projects together pays off',
        items: [
          {
            _type: 'pageItem',
            title: 'You avoid the detach-and-reset cost entirely',
            body: 'If the roof is replaced before solar is installed, there are no panels to remove and reinstall. That saves $2,000 to $5,000 in D&R cost, eliminates system downtime, and removes the warranty risk that comes with removal and reinstallation. This is the single biggest financial reason to get the sequence right.',
          },
          {
            _type: 'pageItem',
            title: 'The roof can be optimized for solar from the start',
            body: 'Material choice, flashing approach, vent placement, and even pipe boot locations can be coordinated with the planned solar layout. A roofer who knows where panels will go can avoid placing vents or obstructions in prime panel zones and can pre-install compatible flashing systems that make the solar installation cleaner and more watertight.',
          },
          {
            _type: 'pageItem',
            title: 'One timeline instead of two separate disruptions',
            body: 'When both scopes are planned together, the homeowner goes through one coordinated project cycle instead of two separate mobilizations, permit processes, and inspection schedules spread across months or years. Less disruption, fewer scheduling dependencies, and a clearer overall timeline.',
          },
          {
            _type: 'pageItem',
            title: 'Solar goes onto a roof with full remaining life',
            body: 'A 25-year solar system should sit on a roof that can match that timeline. Starting with a new roof — especially one with impact-resistant materials that reduce future storm-damage risk — eliminates the single biggest threat to a solar investment: premature panel removal due to roof failure underneath.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to plan the sequence',
        items: [
          {
            _type: 'pageItem',
            title: 'Assess the roof condition honestly before talking solar',
            body: 'If the roof has fewer than 5 years of expected remaining life — based on age, material condition, and storm history — plan the roof first. If it has 15 or more years of reliable life left, solar can go forward independently. The gray zone between 5 and 15 years is where a professional inspection and an honest conversation about material condition matters most.',
          },
          {
            _type: 'pageItem',
            title: 'Get both scopes quoted together when possible',
            body: 'A company that handles both roofing and solar can coordinate the two scopes into one project plan — shared timeline, single point of accountability, and often reduced total cost compared to managing two separate contractors independently. If you use separate companies, make sure the scope boundaries, timeline dependencies, and warranty handoff are documented clearly.',
          },
          {
            _type: 'pageItem',
            title: 'Choose roofing materials with the solar layout in mind',
            body: 'If you are choosing a new roof knowing solar will follow, ask how the material and flashing plan will accommodate racking penetrations. Impact-resistant shingles protect the investment underneath the panels. Properly placed pipe boots and ridge vents keep obstructions out of the best panel zones. Metal roofing interfaces with solar mounting differently than asphalt — discuss compatibility before committing to a material.',
          },
          {
            _type: 'pageItem',
            title: 'Confirm permit and inspection requirements for both scopes',
            body: 'Some Texas municipalities require separate permits for roofing and solar. Understanding the inspection sequence upfront — and whether your city allows overlapping permits or requires sequential completion — avoids scheduling surprises that can delay the solar install after the roof is complete.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Questions about combining roof and solar work',
        items: [
          {
            _type: 'pageItem',
            question: 'Is it cheaper to do both projects at the same time?',
            answer:
              'Almost always, compared to doing them in the wrong order. You avoid the $2,000 to $5,000 detach-and-reset cost, reduce mobilization expenses, and can often negotiate better pricing when both scopes are handled by one company. Even when using separate contractors, coordinated scheduling saves time and reduces the total project disruption. The savings depend on the specific project, but proper sequencing almost always reduces total cost.',
          },
          {
            _type: 'pageItem',
            question: 'Can one company handle both roofing and solar?',
            answer:
              'Some companies handle both. The advantage is a single point of coordination — one timeline, one scope agreement, and clear accountability for the handoff between roof completion and solar installation. You also avoid the finger-pointing that can happen when two separate companies disagree about flashing, penetration responsibility, or warranty boundaries. If you use separate contractors, get the scope boundaries and timeline dependencies in writing before either project starts.',
          },
          {
            _type: 'pageItem',
            question: 'What if I already have solar and need a new roof?',
            answer:
              'That is a detach-and-reset situation. The panels come off, the roof is replaced, and the panels go back on. See our detach-and-reset guide for the full process, cost expectations, warranty considerations, and insurance claim details. The key is to start planning the coordination before the roofing contract is signed — not after work has started.',
          },
          {
            _type: 'pageItem',
            question: 'Should I wait for a storm to replace the roof before adding solar?',
            answer:
              'If your roof is near end-of-life, waiting for a storm is a gamble. Insurance covers storm damage, but it does not cover a roof that simply aged out. If a storm hits and insurance covers the replacement, that is a good opportunity to add solar onto the new roof. But if no major storm comes and the roof continues to deteriorate, you may end up paying full replacement cost anyway — plus the risk of leaks and damage in the meantime. If both the roof and solar are in the plan, it is usually better to control the timing rather than hope the weather makes the decision for you.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'ctaBanner',
        eyebrow: 'Roof and solar on your list?',
        title: 'Plan both projects together and skip the most expensive mistakes.',
        body: 'If a roof replacement and solar installation are both in your near future, we can scope them as one coordinated project — saving time, money, and the headache of managing two separate contractors.',
        ctaLabel: 'Get a combined project estimate',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GUIDE 08 — Battery Backup
  // ─────────────────────────────────────────────
  {
    id: 'guide-solar-battery-backup',
    number: '08',
    slug: 'solar-battery-backup-guide',
    title: 'Solar Battery Backup: When Storage Is Worth the Money',
    cardCopy:
      'When a battery changes the economics, what it actually does in an outage, and how to keep the decision grounded in reality.',
    description:
      'A detailed guide to deciding whether solar battery backup makes sense for a Texas home — outage behavior, load planning, cost tradeoffs, and what the quote should actually explain.',
    image: createStaticHeroImage({
      alt: 'Contemporary utility room with home battery storage equipment',
      color: '#4a6c8f',
      creditName: 'Andreas Gucklhorn',
      creditUrl: 'https://unsplash.com/@draufsicht',
      creditUsername: 'draufsicht',
      description: 'Clean architectural scene suggesting backup power and home energy storage.',
      source: 'unsplash',
      unsplashId: 'SU2xOZ0D4FI',
      unsplashUrl: 'https://unsplash.com/photos/SU2xOZ0D4FI',
      url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 08',
        title: 'When a battery actually changes the solar equation',
        body: 'Storage is one of the easiest places for a proposal to get emotionally persuasive and economically vague. A battery may absolutely be the right call — especially in Texas, where grid reliability is a legitimate concern — but the decision should start with outage needs, critical loads, and an honest look at what backup power is actually worth to your household.',
        heroImage: createStaticHeroImage({
          alt: 'Contemporary utility room with home battery storage equipment',
          color: '#4a6c8f',
          creditName: 'Andreas Gucklhorn',
          creditUrl: 'https://unsplash.com/@draufsicht',
          creditUsername: 'draufsicht',
          description: 'Clean architectural scene suggesting backup power and home energy storage.',
          source: 'unsplash',
          unsplashId: 'SU2xOZ0D4FI',
          unsplashUrl: 'https://unsplash.com/photos/SU2xOZ0D4FI',
          url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Best for', value: 'Backup and resilience planning' },
          { _type: 'pageMetric', label: 'Reading time', value: '10 min' },
          { _type: 'pageMetric', label: 'Key tradeoff', value: 'Resilience vs. cost' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'What batteries really solve',
        title: 'A battery is about resilience and control — not simple payback.',
        body: 'Most homeowners do not add storage because the return-on-investment math is the fastest path to savings. They add it because they want the lights to stay on when the grid goes down, they want to protect medical equipment, keep food from spoiling during a multi-day outage, or maintain climate control in a Texas summer when losing AC is not just uncomfortable — it can be dangerous.\n\nAfter the February 2021 winter storm that left millions of Texans without power for days, and subsequent grid stress events in the summers that followed, battery interest in Texas surged. ERCOT — the grid operator for most of the state — has acknowledged that peak summer demand continues to push against available generation capacity. For homeowners who have lived through a multi-day outage, the value of backup power is not abstract.\n\nThat said, battery storage typically adds $10,000 to $18,000 to a residential solar project depending on capacity, brand, and installation complexity. A single battery unit — like a Tesla Powerwall (13.5 kWh) or Enphase IQ Battery 5P (5 kWh per unit) — provides limited runtime that depends entirely on which loads are connected and how much power those loads draw. That means the storage decision deserves its own analysis, separate from the base solar economics, so the homeowner knows exactly what they are buying and what it will actually do during an outage.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to decide whether battery backup belongs in the project',
        items: [
          {
            _type: 'pageItem',
            title: 'Start with the outage scenario that matters to you',
            body: 'Not every outage is the same. A 4-hour afternoon outage during a summer thunderstorm is very different from a 3-day winter event. Think about what has actually happened in your area, what you need powered during those events, and how long you need it to last. If your primary concern is a few hours of backup for the refrigerator and Wi-Fi, the battery sizing is very different than whole-home backup through a multi-day event.',
          },
          {
            _type: 'pageItem',
            title: 'Identify which loads need to stay on — and be specific',
            body: 'Whole-home backup and critical-load backup are fundamentally different designs with very different price tags. A critical-load panel that covers the refrigerator, some lights, a few outlets, and the internet router might need only one battery. Keeping the AC running adds enormous load — a typical central Texas AC system draws 3,000 to 5,000 watts — which may require two or three battery units to sustain for any meaningful period.',
          },
          {
            _type: 'pageItem',
            title: 'Model the economics separately from solar',
            body: 'The storage cost and value should stand on their own in the proposal. If the quote combines solar and battery payback into one blended number, ask for them separated. Solar payback is driven by production and bill offset. Battery value is driven by outage protection, load shifting, and how much you are willing to pay for resilience. Blending them obscures whether the battery is economically justified or just emotionally appealing.',
          },
          {
            _type: 'pageItem',
            title: 'Ask how the system behaves in a real outage — in detail',
            body: 'Runtime at different load levels, recharge speed from solar during daylight, transfer time between grid power and battery, which loads are automatically supported versus manually switched, and what happens when the battery is depleted — these details vary by design and matter far more than a generic "backup power" checkbox on the proposal.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'Where battery proposals usually get confusing',
        items: [
          {
            _type: 'pageItem',
            title: 'Backup scope is implied instead of specified',
            body: 'The homeowner needs to know exactly which circuits stay on during an outage, how long the battery will sustain those loads under realistic conditions, and what the recharge timeline looks like if the outage extends into a second day. If the proposal says "backup power" without specifying supported loads and expected runtime, it is not a complete proposal.',
          },
          {
            _type: 'pageItem',
            title: 'Battery value gets blended into solar payback',
            body: 'Combining the numbers makes the overall system look better than the individual components justify. A solar system with an 8-year payback and a battery with no clear economic payback becomes a "combined system" with a "10-year payback" — which hides the fact that the battery portion may never pay for itself in pure dollar terms. That does not mean it is not worth buying. It means the value should be framed as resilience, not return on investment.',
          },
          {
            _type: 'pageItem',
            title: 'Capacity numbers are misleading without load context',
            body: 'A 13.5 kWh battery sounds like a lot, but a Texas home running the AC, refrigerator, and lights can draw 4 to 6 kW continuously. At that rate, a single battery provides roughly 2 to 3 hours of runtime — not the "all day" backup that marketing materials sometimes imply. Runtime is a function of load, not just capacity.',
          },
          {
            _type: 'pageItem',
            title: 'Future expansion options are not always discussed',
            body: 'Some battery systems — like the Enphase IQ ecosystem — allow easy addition of units over time. Others have more rigid configurations. If you might want to expand storage later, the equipment choice you make now determines whether that is straightforward or requires significant additional work. Ask about expandability before signing.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Battery questions worth asking before signing',
        items: [
          {
            _type: 'pageItem',
            question: 'Can a battery run my whole house during an outage?',
            answer:
              'It depends on how many battery units are installed, which loads are connected, and how the system is designed. A single 13.5 kWh battery supporting a critical-load panel — refrigerator, lights, router, some outlets — can last 8 to 12 hours under modest load. Whole-home backup including air conditioning typically requires 2 to 4 battery units and significantly higher investment. The design should match your actual outage scenario, not a marketing promise.',
          },
          {
            _type: 'pageItem',
            question: 'Does every solar system in Texas need a battery?',
            answer:
              'No. Batteries solve a resilience and load-management problem, not a solar production problem. A well-designed solar system without a battery will still reduce your electric bill significantly. The battery adds outage protection and load shifting. If you rarely experience outages and your utility offers reasonable export credit, a battery may not be the best use of the additional $10,000 to $18,000. The decision should be based on your specific outage history, risk tolerance, and budget.',
          },
          {
            _type: 'pageItem',
            question: 'Can I add storage later instead of buying it now?',
            answer:
              'Often yes, but the cost and complexity depend on the equipment you install now. Inverters like the Enphase IQ series and SolarEdge Energy Hub are designed for battery-ready configurations that make future storage additions straightforward. Other inverter types may require additional hardware or a separate battery inverter. Asking about future expandability before signing the initial solar contract can save significant cost later.',
          },
          {
            _type: 'pageItem',
            question: 'How long do home batteries last before they need replacing?',
            answer:
              'Most residential batteries — including Tesla Powerwall, Enphase IQ, and similar products — carry warranties of 10 to 15 years or a specified number of charge cycles (typically 4,000 to 6,000). Degradation is gradual — similar to a phone battery losing capacity over time. After the warranty period, the battery will still function but at reduced capacity. Plan for eventual replacement cost when evaluating the long-term economics.',
          },
          {
            _type: 'pageItem',
            question: 'Is a battery worth it just for peace of mind?',
            answer:
              'That is a personal decision, not a financial one. If grid independence and outage protection matter to your household — because of medical needs, young children, extreme heat sensitivity, or simply the experience of past outages — a battery can be worth the investment even if the pure economic payback is slow. The key is making that decision with clear eyes about what the battery will and will not do, rather than basing it on a marketing claim.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GUIDE 09 — Cash vs. Financing
  // ─────────────────────────────────────────────
  {
    id: 'guide-cash-vs-financing-solar-roofing',
    number: '09',
    slug: 'cash-vs-financing-solar-and-roofing',
    title: 'Cash vs. Financing for Solar and Roofing Projects',
    cardCopy:
      'Cash, loans, dealer fees, early payoff, and the financing details that actually change total cost on solar and roofing work.',
    description:
      'A thorough guide to comparing cash and financing options for solar and roofing projects in Texas — total cost, payment structure, dealer fees, and how to avoid the most common financing traps.',
    image: createStaticHeroImage({
      alt: 'Warm residential desk scene with financing paperwork and coffee',
      color: '#b86c4f',
      creditName: 'Bench Accounting',
      creditUrl: 'https://unsplash.com/@benchaccounting',
      creditUsername: 'benchaccounting',
      description: 'Desk scene suggesting household finance planning.',
      source: 'unsplash',
      unsplashId: 'WjV8VYF8Q8s',
      unsplashUrl: 'https://unsplash.com/photos/WjV8VYF8Q8s',
      url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=1600&auto=format&fit=crop',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 09',
        title: 'The real comparison is total cost, not monthly payment',
        body: 'Whether you are financing solar, a roof replacement, or both — the right comparison is total paid over the life of the project, monthly obligation, break-even timing, and flexibility if your plans change. The advertised monthly payment is only one piece of the picture, and it is often the most misleading one.',
        heroImage: createStaticHeroImage({
          alt: 'Warm residential desk scene with financing paperwork and coffee',
          color: '#b86c4f',
          creditName: 'Bench Accounting',
          creditUrl: 'https://unsplash.com/@benchaccounting',
          creditUsername: 'benchaccounting',
          description: 'Desk scene suggesting household finance planning.',
          source: 'unsplash',
          unsplashId: 'WjV8VYF8Q8s',
          unsplashUrl: 'https://unsplash.com/photos/WjV8VYF8Q8s',
          url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=1600&auto=format&fit=crop',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Payment and ownership structure' },
          { _type: 'pageMetric', label: 'Reading time', value: '10 min' },
          { _type: 'pageMetric', label: 'Primary risk', value: 'Hidden financing cost' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'How financing can mislead',
        title: 'A low monthly payment can still hide an expensive project.',
        body: 'Here is how it works in practice. A solar system has a cash price of $24,000. Financed through a solar-specific lender with a 25-year term and embedded dealer fees of 25 percent, the actual loan amount becomes $30,000. At a 5 percent interest rate over 25 years, the monthly payment is roughly $175 — which the installer compares to your $200 electric bill. It sounds like savings.\n\nBut total paid over the life of that loan is approximately $52,500. The same system bought in cash for $24,000 — less the 30 percent federal tax credit bringing the effective cost to $16,800 — pays for itself in 7 to 9 years and then produces free electricity for another 15 to 20 years. The financed version does not break even until year 12 or later, and the total lifetime cost is more than three times the post-incentive cash price.\n\nThis does not mean financing is always wrong. Preserving cash for other priorities has real value, and not every homeowner can or should write a $24,000 check. But the homeowner should know what financing costs them — in real dollars, over real time — and make that choice with full visibility. The same dynamics apply to roofing projects, where financing terms and fee structures can vary just as widely.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'What to compare between cash and financing',
        items: [
          {
            _type: 'pageItem',
            title: 'Total paid over the life of the project',
            body: 'This is the clearest single number for understanding whether financing is helping or quietly inflating the cost. Ask for it. If the financed total is 50 to 100 percent more than the cash price, that gap is the cost of financing — and the homeowner should decide whether that tradeoff is worth the monthly payment convenience.',
          },
          {
            _type: 'pageItem',
            title: 'Dealer fees embedded in the financed price',
            body: 'Many solar-specific loans include dealer fees — sometimes called origination fees or channel fees — of 15 to 30 percent. These are added to the loan balance before interest, which means you pay interest on the fee itself over the life of the loan. A $24,000 system with a 25 percent dealer fee becomes a $30,000 loan. Compare the cash price to the financed amount — if there is a significant gap, dealer fees are in play.',
          },
          {
            _type: 'pageItem',
            title: 'Tax-credit assumptions in the loan structure',
            body: 'Some solar loans assume the homeowner applies the federal tax credit as a lump-sum payment to the loan within 12 to 18 months. If that happens, the monthly payment drops to the advertised level. If the homeowner does not apply the credit — because their tax situation differs or they simply choose not to — the payment stays higher. This should be clearly disclosed in the loan terms.',
          },
          {
            _type: 'pageItem',
            title: 'Early payoff and exit flexibility',
            body: 'What happens if you sell the home, refinance the mortgage, or want to pay off the system early? Some solar loans have prepayment penalties. Others allow flexible payoff but keep the dealer fee embedded. For roofing financing, similar questions apply around lien structure and transfer options. Understanding your exit options before signing prevents surprises later.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'Questions that make financing offers easier to compare',
        items: [
          {
            _type: 'pageItem',
            title: 'Request the same scope under cash and financed pricing',
            body: 'Keep the equipment and work scope identical so you can see exactly what the financing adds in cost. If the installer only presents one option, ask for the other. Any reluctance to show the cash price alongside the financed price should raise questions.',
          },
          {
            _type: 'pageItem',
            title: 'Ask for the total amount financed — not just the system price',
            body: 'If the loan amount is higher than the cash price, the difference is dealer fees. Ask the installer to confirm the fee percentage and show how it affects total cost over the loan term. This is not a hidden number — it is disclosed in the loan documents — but many homeowners do not look for it until after signing.',
          },
          {
            _type: 'pageItem',
            title: 'Ask what happens if the tax credit is not applied to the loan',
            body: 'If the loan assumes a re-amortization event — where the federal tax credit is applied as a lump sum to reduce the balance — ask what the monthly payment is without that assumption. This gives you the worst-case monthly number, which is what you should budget for.',
          },
          {
            _type: 'pageItem',
            title: 'Compare the 10-year and 20-year total cost picture',
            body: "Map out cumulative cost at year 10, year 15, and year 20 for both cash and financed scenarios. Include the electric bill savings in both cases. This shows you exactly when each option breaks even and how much total value each one delivers over the system's life.",
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Financing questions that belong on every comparison',
        items: [
          {
            _type: 'pageItem',
            question: 'Is cash always better than financing for solar or roofing?',
            answer:
              'Not automatically. Cash almost always reduces total cost, but financing preserves liquidity for other priorities — emergency fund, home improvements, investments with potentially higher returns. The right answer depends on the specific loan terms, your financial situation, and how much the flexibility of keeping cash on hand is worth to you. What matters is making the choice with full visibility into what financing actually costs.',
          },
          {
            _type: 'pageItem',
            question: 'Why can two loans with similar monthly payments feel so different?',
            answer:
              'Because term length, dealer fees, interest rate, and tax-credit assumptions can all differ while producing a similar monthly number. A 15-year loan at 4 percent with no dealer fee and a 25-year loan at 6 percent with a 25 percent dealer fee might both show $180 per month — but the total paid over the life of each loan is dramatically different. Always compare total cost, not monthly payment.',
          },
          {
            _type: 'pageItem',
            question: 'What financing detail do homeowners miss most often?',
            answer:
              'Dealer fees. Most homeowners focus on the interest rate and monthly payment without noticing that the financed amount is 15 to 30 percent higher than the cash price. That markup gets compounded by interest over the entire loan term. The second most-missed detail is the tax-credit re-amortization assumption — where the loan assumes you will make a large lump-sum payment that may or may not happen.',
          },
          {
            _type: 'pageItem',
            question: 'Can I finance both a roof replacement and solar together?',
            answer:
              'Some lenders and contractors offer combined project financing that covers both the roof and solar installation. This can simplify the process and sometimes improve terms by increasing the total project value — which the federal tax credit applies to for the solar portion. The same comparison rules apply: total cost, fee transparency, flexible terms, and clear documentation of what is covered.',
          },
          {
            _type: 'pageItem',
            question: 'What about using a home equity loan or HELOC instead of a solar loan?',
            answer:
              "Home equity products often offer lower interest rates and no dealer fees, which can significantly reduce total financing cost compared to solar-specific loans. The tradeoff is that your home is the collateral, the approval process may be longer, and the interest may or may not be tax-deductible depending on current tax law and how the funds are used. For homeowners with available equity and good credit, it is worth comparing a HELOC alongside the solar lender's offer.",
          },
        ],
      },
    ],
  },
]

export function getFeaturedSolarGuideCards(limit = 3) {
  return solarGuides.slice(0, limit).map((guide) => ({
    number: guide.number,
    title: guide.title,
    copy: guide.cardCopy,
    href: `/guides/${guide.slug}`,
    image: guide.image.urls.regular,
    imageAlt: guide.image.alt,
  }))
}

export function getSolarGuideGridItems() {
  return solarGuides.map((guide) => ({
    _type: 'pageItem',
    number: guide.number,
    title: guide.title,
    body: guide.cardCopy,
    href: `/guides/${guide.slug}`,
    image: guide.image,
  }))
}

export function getSolarGuidePages(siteSlug = 'texas-solar-and-roofing-pros') {
  return solarGuides.map((guide) => ({
    id: `page-${guide.id}`,
    siteSlug,
    slug: `guides/${guide.slug}`,
    title: guide.title,
    description: guide.description,
    pageType: 'post',
    templateLevel: 'hero',
    sections: guide.sections,
  }))
}

function slugFromGuideHref(href) {
  const value = String(href || '').trim()

  if (!value) {
    return ''
  }

  return value
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/guides\//, '')
    .replace(/^guides\//, '')
    .replace(/^\/+/, '')
    .toLowerCase()
}

export function getGuideMetaByHref(href) {
  const slug = slugFromGuideHref(href)

  if (!slug) {
    return {
      category: 'Guides',
      tags: ['Homeowner guide'],
    }
  }

  const taxonomyRules = [
    {
      match: /(cost|payback|finance|loan|price|rebate|incentive|credit)/,
      category: 'Cost and incentives',
      tags: ['Pricing', 'Tax credit', 'Payback'],
    },
    {
      match: /(storm|hail|claim|insurance)/,
      category: 'Storm and insurance',
      tags: ['Hail', 'Claims', 'Roof risk'],
    },
    {
      match: /(detach|reset|roof|planning)/,
      category: 'Roof and solar planning',
      tags: ['Project sequencing', 'Roof condition', 'Install planning'],
    },
    {
      match: /(battery|backup|outage|warrant)/,
      category: 'Equipment and protection',
      tags: ['Battery backup', 'Coverage', 'Reliability'],
    },
    {
      match: /(how-solar-works|solar-works)/,
      category: 'Solar basics',
      tags: ['System basics', 'Grid behavior', 'First-time research'],
    },
  ]

  const matchedRule = taxonomyRules.find((rule) => rule.match.test(slug))

  if (matchedRule) {
    return {
      category: matchedRule.category,
      tags: matchedRule.tags,
    }
  }

  return {
    category: 'Solar guidance',
    tags: ['Texas homeowners', 'Decision support'],
  }
}
