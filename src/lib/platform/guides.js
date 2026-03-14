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
          { _type: 'pageMetric', label: 'Reading time', value: '9 min' },
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
        body: 'Panels produce DC power during daylight hours. The inverter converts that into AC power the house can use, and the home draws from it first. When production exceeds demand — a typical midday scenario in central Texas — excess power can flow back to the grid depending on your utility arrangement. At night, during heavy cloud cover, or when the AC is working harder than the panels can keep up with, the home pulls from the grid as usual. Unless a battery is part of the system, there is no stored reserve. That is why solar is best understood as a bill-reduction project, not an off-grid project.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'The parts of the system homeowners should actually understand',
        items: [
          {
            _type: 'pageItem',
            title: 'Panels are only one piece of performance',
            body: 'Panel brand matters less than most marketing suggests. Roof orientation, pitch, shading, inverter strategy, and system sizing tend to have a bigger effect on real-world production in Texas heat.',
          },
          {
            _type: 'pageItem',
            title: 'The inverter is the operating brain',
            body: 'It converts DC to AC, manages grid-safety shutdowns, and often determines how monitoring, battery add-ons, and future expansion work. String inverters and microinverters serve different roof situations.',
          },
          {
            _type: 'pageItem',
            title: 'The grid still matters every single day',
            body: 'Most Texas residential systems are grid-tied. That means utility rate structure, export-credit policy, and interconnection rules directly affect the economics of the project.',
          },
          {
            _type: 'pageItem',
            title: 'Storage is a separate decision',
            body: 'A battery adds backup capability and load shifting, but it is not required for a solid solar project. It should be evaluated on its own cost and value, not bundled in to make the proposal look more exciting.',
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
            body: 'Orientation, pitch, shading, and available area define what the system can realistically produce. That assessment should come before any brand or equipment conversations.',
          },
          {
            _type: 'pageItem',
            title: 'Focus on expected annual production, not just panel count',
            body: 'Two proposals with the same wattage can deliver different results if the layout assumptions, shade modeling, or inverter approach differ. Ask for the kWh number.',
          },
          {
            _type: 'pageItem',
            title: 'Ask how exports are valued by your utility',
            body: 'If exported power is credited below retail rate — which is common in parts of Texas — oversizing a system becomes less attractive. That changes how the project should be sized.',
          },
          {
            _type: 'pageItem',
            title: 'Separate solar economics from battery economics',
            body: 'If storage is included, its cost and value should be modeled separately. Backup power is worth something, but it should not be hidden inside the solar payback calculation.',
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
              'Not by default. Grid-tied systems shut down when the grid goes out — it is a safety requirement. Backup power during an outage requires battery storage or another approved islanding configuration.',
          },
          {
            _type: 'pageItem',
            question: 'Do I need the biggest system the roof can hold?',
            answer:
              'Rarely. The right system size depends on how much usage you want to offset, how your utility values exported power, and whether your roof supports that size efficiently. Bigger is not always better economics.',
          },
          {
            _type: 'pageItem',
            question: 'Is Texas a good state for solar?',
            answer:
              'Texas has strong solar irradiance and a property-tax exemption for residential solar. But the outcome still depends on your specific roof, utility arrangement, electric bill, and installed cost. Sunlight alone is not the whole story.',
          },
          {
            _type: 'pageItem',
            question: 'What should I be most skeptical about in a solar quote?',
            answer:
              'Any proposal that does not clearly explain annual production assumptions, how it treats exported power, and whether the system is sized to your actual usage rather than a generic sales target.',
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
          { _type: 'pageMetric', label: 'Reading time', value: '10 min' },
          { _type: 'pageMetric', label: 'Decision point', value: 'Price, structure, and payback' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'The variables that actually move payback',
        items: [
          {
            _type: 'pageItem',
            title: 'Installed price per watt',
            body: 'This is the starting comparison point, but it only means something when paired with a credible production estimate and a clear equipment scope.',
          },
          {
            _type: 'pageItem',
            title: 'Federal tax credit timing',
            body: 'The credit matters, but the homeowner needs to know when they can actually realize that benefit and whether the quote assumes they do so immediately.',
          },
          {
            _type: 'pageItem',
            title: 'Utility export value',
            body: 'If exported power is credited below retail rate, oversizing a system becomes much harder to justify. This single variable changes system sizing strategy.',
          },
          {
            _type: 'pageItem',
            title: 'Financing structure and dealer fees',
            body: 'Dealer fees, loan term, and interest rate can make two similar-looking proposals behave very differently over their lifetime. The advertised monthly payment often hides this.',
          },
          {
            _type: 'pageItem',
            title: 'Your actual usage profile',
            body: 'Homes with high daytime usage — common in Texas summers — capture more direct value from solar. Homes that use most power after sunset get less direct offset without storage.',
          },
          {
            _type: 'pageItem',
            title: 'Upcoming roof or electrical work',
            body: 'If the home needs a roof replacement or panel upgrade soon, that scope should be part of the real project cost, not a surprise six months later.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'Reading quotes honestly',
        title: 'The cleanest comparison is cost, production, and total paid over time.',
        body: 'Most homeowners get pushed to compare proposals on the wrong variable. One quote leads with monthly payment, another with tax-credit-adjusted cost, another looks cheaper because the production assumptions are weaker. The useful comparison is installed price, expected annual production, export treatment, financing terms, total paid, and break-even timing under assumptions you can actually verify.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to pressure-test a solar savings estimate',
        items: [
          {
            _type: 'pageItem',
            title: 'Ask for annual production in writing',
            body: 'If the savings story depends on production numbers, the quote should state them clearly and explain the shade and orientation assumptions behind them.',
          },
          {
            _type: 'pageItem',
            title: 'Check whether export value equals retail rate',
            body: 'If the proposal quietly assumes exported solar is worth full retail rate and your utility does not offer that, the payback estimate is inflated.',
          },
          {
            _type: 'pageItem',
            title: 'Separate system price from financing effect',
            body: 'A financed system can have a very different total cost than the same system bought in cash. The quote should make that transparent.',
          },
          {
            _type: 'pageItem',
            title: 'Ask what happens if utility rates change',
            body: 'Some payback estimates assume aggressive rate escalation. A defensible quote shows the system logic clearly enough that you can test what happens if rates do not climb as fast.',
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
              'Installed price, equipment scope, expected annual production, warranties, financing terms, export assumptions, and how the quote treats incentives. If one of those is missing, the comparison is incomplete.',
          },
          {
            _type: 'pageItem',
            question: 'Is a monthly payment lower than my electric bill enough to sign?',
            answer:
              'No. You also need to understand total cost over time, break-even timing, and whether the quote uses realistic assumptions. A low monthly number can coexist with an expensive total project.',
          },
          {
            _type: 'pageItem',
            question: 'Why do payback estimates vary so much between companies?',
            answer:
              'Because they depend on different assumptions about system price, production, electric-rate inflation, export credits, tax-credit treatment, and household usage over time. The math is only as good as the inputs.',
          },
          {
            _type: 'pageItem',
            question: 'Should I trust a quote that feels unusually cheap?',
            answer:
              'Only after checking what was excluded. A cheaper number may reflect weaker equipment, optimistic production assumptions, hidden financing cost, or a system that is simply not sized the same way.',
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
          { _type: 'pageMetric', label: 'Reading time', value: '8 min' },
          { _type: 'pageMetric', label: 'Primary risk', value: 'Outdated program assumptions' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'The incentives Texas homeowners should care about most',
        items: [
          {
            _type: 'pageItem',
            title: 'Federal residential clean energy credit',
            body: 'This is typically the single largest incentive in the stack. It reduces your federal tax liability by a percentage of the installed system cost, which is exactly why the quote should explain it carefully instead of waving it around as a sales shortcut.',
          },
          {
            _type: 'pageItem',
            title: 'Texas property-tax exemption for solar',
            body: 'Texas law prevents your property tax from increasing because of a solar installation. For homeowners already watching their appraisal climb every year, this is meaningful protection.',
          },
          {
            _type: 'pageItem',
            title: 'Local utility programs and rebates',
            body: 'Some Texas utilities and co-ops offer additional incentives, but program details change. Any quote that relies on a local rebate should cite the current program terms and expiration date.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'How to think about incentives',
        title: 'Incentives should improve a project that already makes sense — not rescue one that does not.',
        body: 'If the economics only work when every incentive assumption is maximized and every program stays active, the quote is fragile. A strong solar project should pencil out conservatively, and incentives should make a good deal better rather than turn a marginal one into a go.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to verify incentive claims before signing anything',
        items: [
          {
            _type: 'pageItem',
            title: 'Check whether the quote explains eligibility clearly',
            body: 'A credible proposal should state what the incentive is, who qualifies, and what assumptions it is making — not just show you a lower net number and move on.',
          },
          {
            _type: 'pageItem',
            title: 'Look for current source material on local programs',
            body: 'If a local utility program is mentioned, you should be able to verify rules and dates yourself. If the quote does not give you enough to do that, ask.',
          },
          {
            _type: 'pageItem',
            title: 'Ask how the credit is treated in the financing model',
            body: 'Some solar loans assume the homeowner applies the federal credit in a specific way or on a specific timeline. That needs to be stated explicitly, not embedded in the fine print.',
          },
          {
            _type: 'pageItem',
            title: 'Do not rely on stacking assumptions you cannot verify',
            body: 'Multiple incentives can sometimes stack, but eligibility, timing, and program rules all matter. Verify each one independently before letting the total savings number drive the decision.',
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
              'No. The credit reduces your federal tax liability. It does not change the contract price at signing. Quotes should distinguish between what you pay the installer and the post-incentive economics.',
          },
          {
            _type: 'pageItem',
            question: 'Can I always stack federal, state, and local incentives together?',
            answer:
              'Not automatically. Eligibility, timing, tax situation, and utility rules all matter. Verify each piece individually — do not assume the full stack applies to your situation without checking.',
          },
          {
            _type: 'pageItem',
            question: 'Will my property taxes go up if I install solar in Texas?',
            answer:
              'Texas has a property-tax exemption for residential solar energy devices. The added value of the solar system is excluded from your property tax assessment.',
          },
          {
            _type: 'pageItem',
            question: 'How often do local incentive programs change?',
            answer:
              'They can change with limited notice. Program budgets run out, rules get updated, and utility policies shift. Always verify current terms at the time you are evaluating quotes, not based on what a website said six months ago.',
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
      alt: 'Roofing crew working on a residential roof with solar panel racking visible',
      color: '#8a6b52',
      creditName: 'Bill Mead',
      creditUrl: 'https://unsplash.com/@billmead',
      creditUsername: 'billmead',
      description: 'Residential roof replacement work in progress.',
      source: 'unsplash',
      unsplashId: 'wmaP3Tl80ww',
      unsplashUrl: 'https://unsplash.com/photos/wmaP3Tl80ww',
      url: 'https://images.unsplash.com/photo-1632759145219-6e45036d7fda?q=80&w=1600&auto=format&fit=crop',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 04',
        title: 'What happens to solar panels when the roof needs replacing',
        body: 'If you already have solar and the roof underneath it needs work — whether from age, storm damage, or an insurance claim — the panels have to come off before roofing can start and go back on after. That process is called a detach and reset. It sounds straightforward, but the coordination, cost, timeline, and warranty details matter more than most homeowners expect.',
        heroImage: createStaticHeroImage({
          alt: 'Roofing crew working on a residential roof with solar panel racking visible',
          color: '#8a6b52',
          creditName: 'Bill Mead',
          creditUrl: 'https://unsplash.com/@billmead',
          creditUsername: 'billmead',
          description: 'Residential roof replacement work in progress.',
          source: 'unsplash',
          unsplashId: 'wmaP3Tl80ww',
          unsplashUrl: 'https://unsplash.com/photos/wmaP3Tl80ww',
          url: 'https://images.unsplash.com/photo-1632759145219-6e45036d7fda?q=80&w=1600&auto=format&fit=crop',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Panel removal and reinstall' },
          { _type: 'pageMetric', label: 'Reading time', value: '10 min' },
          { _type: 'pageMetric', label: 'Common trigger', value: 'Storm damage or aging roof' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'Why this matters',
        title: 'A detach and reset done wrong can void warranties, damage equipment, or delay the whole project by weeks.',
        body: 'The panels themselves are usually fine — they are built to last decades. The risk is in how the work is coordinated. If the solar company and roofing crew are not working from the same timeline, if racking penetrations are not properly resealed, if electrical disconnects are handled carelessly, or if nobody checks whether the original solar warranty survives the process, the homeowner ends up with problems that could have been avoided with better planning up front. In Texas, where hail damage triggers thousands of roof replacements every year, this is not an edge case. It is one of the most common solar-and-roofing coordination scenarios in the state.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How the detach-and-reset process works',
        items: [
          {
            _type: 'pageItem',
            title: 'The solar system gets de-energized and disconnected',
            body: 'A licensed solar technician shuts the system down, disconnects it from the grid, and ensures all circuits are safe before any physical removal begins. This is not something the roofing crew should handle.',
          },
          {
            _type: 'pageItem',
            title: 'Panels and racking are removed and stored on site',
            body: 'Panels come off the roof, along with the racking and any conduit that runs across the roof surface. Equipment is inventoried, inspected for pre-existing damage, and stored safely while roof work is in progress.',
          },
          {
            _type: 'pageItem',
            title: 'The roof is replaced or repaired',
            body: 'Once the panels are clear, the roofer has full access. New underlayment, decking repairs if needed, and new shingles or material go down. The roofer should know where the racking penetrations were and plan flashing around reinstall points.',
          },
          {
            _type: 'pageItem',
            title: 'Solar is reinstalled on the new roof',
            body: 'The solar crew returns to remount racking, replace any hardware that cannot be reused, reinstall panels, and reconnect the system. New roof penetrations get properly sealed and flashed. The system is re-energized and tested.',
          },
          {
            _type: 'pageItem',
            title: 'Inspection and reconnection',
            body: 'Depending on your jurisdiction, the reinstall may need a permit and inspection. The system gets reconnected to the grid and monitoring is verified. This is also the time to confirm warranty status with the solar manufacturer.',
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
            title: 'Know who is responsible for what',
            body: 'The solar company handles the electrical and panel work. The roofer handles the roof. If those scopes overlap or nobody owns the handoff, things get missed. Get the coordination plan in writing.',
          },
          {
            _type: 'pageItem',
            title: 'Understand the cost before work begins',
            body: 'A detach and reset is a separate line item. It is not typically included in the roofing bid or covered under the original solar contract. Get a clear price from the solar company before approving the project.',
          },
          {
            _type: 'pageItem',
            title: 'Check your solar warranty before anyone touches the system',
            body: 'Some manufacturers require the original installer or a certified partner to perform the work. If an uncertified crew handles the removal, the warranty may not survive. Ask the manufacturer directly if you are unsure.',
          },
          {
            _type: 'pageItem',
            title: 'Inspect equipment before and after',
            body: 'Panels should be photographed and documented before removal. After reinstall, production monitoring should confirm the system is performing at or near its pre-removal output. Any decline should be investigated promptly.',
          },
          {
            _type: 'pageItem',
            title: 'Insurance claims and D&R cost',
            body: 'If the roof is being replaced due to storm damage, the detach-and-reset cost is sometimes included in the insurance claim. Ask your adjuster whether solar removal and reinstall is covered, and get that answer before the claim is finalized.',
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
            question: 'How much does a solar detach and reset cost?',
            answer:
              'It varies by system size, roof complexity, and who performs the work. Most residential D&R projects in Texas range from a few thousand dollars depending on the number of panels and the difficulty of the roof layout. Get an itemized quote from the solar company before the roofing contract is signed.',
          },
          {
            _type: 'pageItem',
            question: 'Can my roofer just remove the panels themselves?',
            answer:
              'They should not. Solar panels involve DC electrical circuits that can be dangerous if handled improperly. The disconnect, removal, and reinstall should be performed by a licensed solar contractor — both for safety and to protect equipment warranties.',
          },
          {
            _type: 'pageItem',
            question: 'Will my solar warranty still be valid after a detach and reset?',
            answer:
              'It depends on who does the work and how it is documented. Some manufacturers require the original installer or a certified partner. Others are more flexible as long as the work is done by a licensed professional. Verify this before the project starts, not after.',
          },
          {
            _type: 'pageItem',
            question: 'How long will my solar system be offline during the process?',
            answer:
              'Typically one to two weeks depending on how fast the roof replacement happens and how quickly the solar crew can schedule the reinstall. If you are producing significant power, that downtime is worth factoring into the project timeline.',
          },
          {
            _type: 'pageItem',
            question: 'Does insurance cover the detach and reset when the roof claim is storm-related?',
            answer:
              'Sometimes. Many adjusters will include solar removal and reinstall as part of the roof replacement scope if the panels are in the way of the covered work. But it is not automatic — you need to ask for it and get it included in the claim before settlement.',
          },
          {
            _type: 'pageItem',
            question: 'What if some panels or hardware are damaged during the process?',
            answer:
              'That is why pre-removal documentation matters. If equipment is damaged during the D&R, the responsible party depends on who was handling it at the time. Clear scope of work and a written agreement about liability help prevent disputes.',
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
        body: 'Texas gets hit hard — hail, straight-line wind, and severe thunderstorms roll through central Texas regularly. The question after a major storm is not just whether the roof looks damaged from the ground. It is whether the damage is there, whether it meets the threshold for an insurance claim, and what the homeowner should do before time and weather make things worse.',
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
          { _type: 'pageMetric', label: 'Reading time', value: '9 min' },
          { _type: 'pageMetric', label: 'Key risk', value: 'Waiting too long to file' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'Why urgency matters',
        title: 'Storm damage does not always look obvious, but it gets worse with time.',
        body: 'Hail bruises shingles in ways that are hard to see from the ground. Granule loss accelerates UV degradation. Cracked or lifted shingles let moisture into the underlayment and eventually the decking. What starts as cosmetic damage can become a leak, mold issue, or structural problem if it sits through another season. Texas insurance policies also have filing deadlines — waiting too long can mean losing coverage for damage that was absolutely claimable. The clock starts with the storm, not with the day you notice a problem inside.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'What to do after a major storm hits your area',
        items: [
          {
            _type: 'pageItem',
            title: 'Do a safe ground-level check first',
            body: 'Look for downed shingles, dented gutters, damaged screens or siding, and any visible debris on the roof. Do not climb onto the roof yourself — a professional inspection is safer and more thorough.',
          },
          {
            _type: 'pageItem',
            title: 'Document what you can see',
            body: 'Take photos and video of any visible damage from the ground. Note the date of the storm and your address. This becomes part of your claim file if you move forward.',
          },
          {
            _type: 'pageItem',
            title: 'Schedule a professional roof inspection',
            body: 'A qualified roofer can identify hail hits, wind lift, bruising, granule loss, and compromised flashing that you cannot see from the ground. This inspection is typically free and should include a written report.',
          },
          {
            _type: 'pageItem',
            title: 'File the insurance claim if damage is confirmed',
            body: 'Contact your insurance company to open a claim. The adjuster will inspect the roof independently. Having your roofer present during the adjuster visit can help ensure all damage is identified and documented.',
          },
          {
            _type: 'pageItem',
            title: 'Do not sign a roofing contract before the claim is settled',
            body: 'You need to know what insurance will cover before committing to a scope and price. A reputable roofer will not pressure you to sign before the claim process is complete.',
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
            body: 'Most hail damage is not visible from inside the house until months later when the compromised shingles start failing. By then, the claim window may be closed.',
          },
          {
            _type: 'pageItem',
            title: 'Waiting too long to file',
            body: 'Texas insurers typically require claims to be filed within one to two years of the storm date, but policies vary. Waiting reduces your leverage and can allow secondary damage to develop.',
          },
          {
            _type: 'pageItem',
            title: 'Not having a roofer present during the adjuster visit',
            body: 'The adjuster works for the insurance company. A qualified roofer at the inspection helps ensure all damage is identified, photographed, and included in the scope.',
          },
          {
            _type: 'pageItem',
            title: 'Signing with the first contractor who knocks on the door',
            body: 'Storm chasers show up fast after major hail events. Not all of them will be around to honor a warranty. Verify licensing, insurance, local presence, and references before signing anything.',
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
            question: 'Will filing a claim raise my insurance rates?',
            answer:
              'It can, depending on your insurer and claims history. But if the roof has legitimate storm damage, not filing can lead to much larger problems and costs down the road. Weigh the cost of the deductible against the cost of ignoring the damage.',
          },
          {
            _type: 'pageItem',
            question: 'What if the adjuster says there is no damage but my roofer disagrees?',
            answer:
              'You have the right to request a re-inspection or get a second opinion. Your roofer can provide a detailed report and photos. Some homeowners also hire a public adjuster for a second evaluation if the discrepancy is significant.',
          },
          {
            _type: 'pageItem',
            question: 'Does my homeowner insurance cover solar panel damage from hail?',
            answer:
              'Most standard homeowner policies cover solar panels as part of the dwelling, but coverage details and deductible structure vary. Check with your insurer to confirm what is covered and how a claim involving both roof and solar would be handled.',
          },
          {
            _type: 'pageItem',
            question: 'How long does the insurance process usually take?',
            answer:
              'From filing to settlement, the process can take anywhere from a few weeks to several months depending on the severity of the storm, adjuster availability, and whether a supplement is needed for additional damage found during tear-off.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'ctaBanner',
        eyebrow: 'Recent storm in your area?',
        title: 'Get a professional roof inspection before the damage gets worse.',
        body: 'If a storm recently came through your neighborhood, a free inspection can tell you whether there is claimable damage — before the filing window closes or the next storm makes it worse.',
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
      creditName: 'Dillon Kydd',
      creditUrl: 'https://unsplash.com/@kyddvisuals',
      creditUsername: 'kyddvisuals',
      description: 'Residential roofline photographed in warm light.',
      source: 'unsplash',
      unsplashId: '2keCPb73aQY',
      unsplashUrl: 'https://unsplash.com/photos/2keCPb73aQY',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop',
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
          creditName: 'Dillon Kydd',
          creditUrl: 'https://unsplash.com/@kyddvisuals',
          creditUsername: 'kyddvisuals',
          description: 'Residential roofline photographed in warm light.',
          source: 'unsplash',
          unsplashId: '2keCPb73aQY',
          unsplashUrl: 'https://unsplash.com/photos/2keCPb73aQY',
          url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Roof condition and timing' },
          { _type: 'pageMetric', label: 'Reading time', value: '8 min' },
          { _type: 'pageMetric', label: 'Key decision', value: 'Repair vs. replace' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'The Texas factor',
        title: 'Texas roofs age faster than the warranty implies.',
        body: 'A shingle rated for 25 or 30 years in a manufacturer test does not always last that long on a house in central Texas. Sustained summer heat, UV intensity, thermal cycling, hail events, and occasional high wind all accelerate wear. A roof that looks acceptable from the curb can still be losing granules, developing soft spots, or holding moisture underneath. That is why age alone is not the only indicator — condition matters, and condition in Texas changes faster than most homeowners expect.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'Warning signs a Texas homeowner should not ignore',
        items: [
          {
            _type: 'pageItem',
            title: 'Granule loss in gutters and downspouts',
            body: 'Some granule loss is normal, but heavy accumulation in the gutters — especially after recent storms — signals that the shingles are losing their protective layer faster than expected.',
          },
          {
            _type: 'pageItem',
            title: 'Curling, cracking, or blistering shingles',
            body: 'These are visible signs that the shingle material is breaking down. Once it starts, it typically accelerates with each season of Texas heat.',
          },
          {
            _type: 'pageItem',
            title: 'Soft spots or sagging on the roof deck',
            body: 'If you can see sag lines from the ground or feel soft areas when walking the attic, moisture has likely compromised the decking. That usually means the roof has failed in that area.',
          },
          {
            _type: 'pageItem',
            title: 'Repeated leaks or patch jobs',
            body: 'One repair is maintenance. Multiple repairs in different areas suggest the roof is declining system-wide, and continued patching may cost more over time than a replacement.',
          },
          {
            _type: 'pageItem',
            title: 'Age beyond expected material life',
            body: 'If the roof is 15 or more years old and has been through multiple Texas hail seasons, a professional inspection is worth the time even if nothing looks wrong from the ground.',
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
            body: 'A qualified roofer can assess remaining life, identify hidden damage, and give you an honest recommendation. If they only want to sell you a roof, get a second opinion.',
          },
          {
            _type: 'pageItem',
            title: 'Compare repair cost against replacement value',
            body: 'If repair costs are approaching a meaningful percentage of what a full replacement would cost, the replacement usually wins on long-term economics.',
          },
          {
            _type: 'pageItem',
            title: 'Factor in other planned work',
            body: 'If solar, a home sale, or a renovation is coming in the next few years, doing the roof first may save money and avoid project conflicts later.',
          },
          {
            _type: 'pageItem',
            title: 'Understand material options for the replacement',
            body: 'Texas homeowners have choices beyond standard three-tab shingles. Impact-resistant shingles, architectural profiles, and metal roofing each have different lifespans, insurance implications, and cost profiles worth understanding before committing.',
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
            question: 'How long do asphalt shingles actually last in Texas?',
            answer:
              'Standard three-tab shingles typically last 15 to 20 years in central Texas conditions. Architectural shingles can go longer, and impact-resistant products may last 25 years or more — but actual performance depends on installation quality, ventilation, and storm history.',
          },
          {
            _type: 'pageItem',
            question: 'Does an impact-resistant roof lower my insurance premium?',
            answer:
              'In Texas, many insurers offer a discount for Class 4 impact-resistant shingles. The discount varies by carrier, but it can be significant enough to affect the material choice decision. Ask your insurer for the specific discount before finalizing the roof spec.',
          },
          {
            _type: 'pageItem',
            question: 'Should I replace the whole roof or just the damaged section?',
            answer:
              'It depends on the age and condition of the rest of the roof. Patching one section while the rest is near end-of-life can mean paying for another project sooner than expected. A full inspection helps you make that call with real data.',
          },
          {
            _type: 'pageItem',
            question: 'What should I do about the roof if I am planning to add solar soon?',
            answer:
              'If the roof is within a few years of needing replacement, doing the roof first is almost always the right call. Installing solar on a roof that will need work soon means paying for a detach and reset later, which adds cost and risk.',
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
        body: 'When both projects are on the horizon, the order matters. Doing them in the wrong sequence — or with the wrong contractors — can mean paying twice for work that should have been done once, losing warranty coverage, or creating timeline headaches that delay everything.',
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
          { _type: 'pageMetric', label: 'Reading time', value: '9 min' },
          { _type: 'pageMetric', label: 'Key benefit', value: 'Avoiding double work' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'The coordination problem',
        title: 'Two good projects done in the wrong order become one expensive mistake.',
        body: 'Here is the scenario that costs Texas homeowners the most money: solar goes on a roof that needed replacement, and a year or two later the panels have to come off for a reroof at additional cost. Or the homeowner does the roof first but picks materials or flashing details that complicate the solar install. When both projects are happening within a few years of each other, planning them together — even if the work happens in stages — can save meaningful money and eliminate the most common coordination failures.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'Why planning both projects together pays off',
        items: [
          {
            _type: 'pageItem',
            title: 'You avoid the detach-and-reset cost entirely',
            body: 'If the roof is replaced before solar is installed, there are no panels to remove and reinstall. That alone can save thousands of dollars compared to doing it in the wrong order.',
          },
          {
            _type: 'pageItem',
            title: 'The roof can be optimized for solar from the start',
            body: 'Material choice, flashing approach, and even vent placement can be coordinated with the solar layout so the installation is cleaner and the roof penetrations are managed properly.',
          },
          {
            _type: 'pageItem',
            title: 'One timeline instead of two disruptions',
            body: 'When both scopes are planned together, the homeowner goes through one project cycle instead of two separate mobilizations, permits, and inspection schedules.',
          },
          {
            _type: 'pageItem',
            title: 'Solar goes onto a roof with full remaining life',
            body: 'A 25-year solar system should sit on a roof that can match that timeline. Starting with a new roof removes the biggest risk in the solar investment — premature panel removal.',
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
            body: 'If the roof is within five years of needing replacement, plan the roof first. If it has 15 or more years of life left, solar can go forward independently.',
          },
          {
            _type: 'pageItem',
            title: 'Get both scopes quoted together when possible',
            body: 'A company that handles both roofing and solar can coordinate the two scopes into one project plan, which simplifies the timeline and often reduces total cost.',
          },
          {
            _type: 'pageItem',
            title: 'Discuss material selection with the solar layout in mind',
            body: 'If you are choosing a new roof knowing solar will follow, ask how the roofing material and flashing plan will accommodate racking and penetrations.',
          },
          {
            _type: 'pageItem',
            title: 'Confirm permit and inspection requirements for both',
            body: 'Some jurisdictions require separate permits for roofing and solar. Understanding the inspection sequence upfront avoids scheduling surprises.',
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
              'Often yes. You avoid detach-and-reset costs, reduce mobilization expenses, and can sometimes negotiate better pricing when both scopes are handled together. The savings depend on the project, but coordination almost always reduces total cost compared to doing them separately.',
          },
          {
            _type: 'pageItem',
            question: 'Can one company handle both roofing and solar?',
            answer:
              'Some companies do both. The advantage is a single point of coordination, one timeline, and clear accountability for the handoff between roof and solar. If you use separate contractors, make sure the scope boundaries and timing are agreed to in writing.',
          },
          {
            _type: 'pageItem',
            question: 'What if I already have solar and need a new roof?',
            answer:
              'That is a detach-and-reset situation. The panels come off, the roof is replaced, and the panels go back on. See our detach-and-reset guide for the full process, cost expectations, and warranty considerations.',
          },
          {
            _type: 'pageItem',
            question: 'Should I wait for a storm to replace the roof before adding solar?',
            answer:
              'If your roof is near end-of-life, waiting for a storm is a gamble. Insurance may cover storm damage, but it may not cover a roof that simply aged out. If both the roof and solar are in the plan, it is usually better to control the timing rather than hope a storm makes the decision for you.',
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
        body: 'Storage is one of the easiest places for a quote to get emotionally persuasive and economically fuzzy. A battery may absolutely be the right call — especially in Texas, where grid reliability is a real concern — but the decision should start with outage needs, critical loads, and an honest look at what backup power is worth to you.',
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
          { _type: 'pageMetric', label: 'Reading time', value: '9 min' },
          { _type: 'pageMetric', label: 'Key tradeoff', value: 'Resilience vs. cost' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'What batteries really solve',
        title: 'A battery is about resilience and control — not simple payback.',
        body: 'Most homeowners do not add storage because the return on paper is the fastest. They add it because they want backup power during grid outages, better control over critical loads, or protection against a grid they no longer fully trust. After the winter storm events that hit Texas, that motivation is not theoretical — it is personal. That means storage deserves its own decision framework, not a supporting role buried inside the base solar quote.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to decide whether battery backup belongs in the project',
        items: [
          {
            _type: 'pageItem',
            title: 'Start with the outage problem',
            body: 'If backup power is not solving a real household need — whether that is medical equipment, food preservation, climate control, or simply peace of mind — the extra spend may be hard to justify on economics alone.',
          },
          {
            _type: 'pageItem',
            title: 'Know which loads need to stay on',
            body: 'Whole-home backup and critical-load backup are fundamentally different designs with very different price tags. Be specific about what you need powered during an outage and for how long.',
          },
          {
            _type: 'pageItem',
            title: 'Model the economics separately from solar',
            body: 'The storage cost and value should stand on their own in the proposal so you can see what resilience costs independently of the base solar project.',
          },
          {
            _type: 'pageItem',
            title: 'Ask how the system behaves in a real outage',
            body: 'Runtime, recharge speed, transfer behavior, and which loads are supported all vary by design. Those details matter far more than a generic battery label on the proposal page.',
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
            title: 'Backup scope is implied instead of stated',
            body: 'The homeowner needs to know exactly which circuits stay on in an outage and for roughly how long. If the quote does not specify, ask.',
          },
          {
            _type: 'pageItem',
            title: 'Battery value gets mixed into solar value',
            body: 'Combining the numbers makes the overall system look better than the solar and storage components individually justify. Separate them.',
          },
          {
            _type: 'pageItem',
            title: 'Future expansion is not discussed',
            body: 'Some battery systems can be expanded later and some cannot. The equipment choice you make now can limit or enable flexibility down the road, and that is worth knowing before signing.',
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
              'Sometimes, but it depends on battery capacity, selected loads, inverter configuration, and how the system was intentionally designed. Whole-home backup costs more and requires more careful engineering than critical-load backup.',
          },
          {
            _type: 'pageItem',
            question: 'Does every solar system in Texas need a battery?',
            answer:
              'No. Batteries solve a resilience and load-management problem. They are not required for a strong solar project and should not be treated as mandatory. The decision should be based on your specific outage concerns and budget.',
          },
          {
            _type: 'pageItem',
            question: 'Can I add storage later instead of now?',
            answer:
              'Often yes, but it depends on the equipment and system design. That is why asking about future expandability before signing is important — some inverter and panel configurations make it easier to add batteries later than others.',
          },
          {
            _type: 'pageItem',
            question: 'Is a battery worth it just for the grid-independence feeling?',
            answer:
              'That is a personal decision, not a financial one. If grid independence and outage protection matter to you — and in Texas they matter to a lot of people — a battery can be worth the investment. Just make sure the quote reflects what you are actually getting for the money.',
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
        body: 'Whether you are financing solar, a roof replacement, or both — the right comparison is total paid, monthly obligation, break-even timing, and flexibility if your plans change. The advertised payment number is only one piece of the story, and it is often the most misleading one.',
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
          { _type: 'pageMetric', label: 'Reading time', value: '8 min' },
          { _type: 'pageMetric', label: 'Primary risk', value: 'Hidden financing cost' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'How financing can mislead',
        title: 'A low monthly payment can still hide an expensive project.',
        body: 'Longer terms, dealer fees, and tax-credit assumptions can make a financed system feel easier month-to-month while adding meaningful cost over its lifetime. This applies to solar loans, roofing financing, and combined project loans. The homeowner should be able to compare the same scope under cash and financed options without losing visibility into what the financing itself costs.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'What to compare between cash and financing',
        items: [
          {
            _type: 'pageItem',
            title: 'Total paid over the life of the project',
            body: 'This is the clearest single number for understanding whether the financing is helping or quietly inflating the cost. Always ask for it.',
          },
          {
            _type: 'pageItem',
            title: 'Tax-credit timing assumptions on solar loans',
            body: 'Some solar loan structures assume you apply the federal credit as a lump-sum prepayment. If you do not, the payment goes up. That assumption should be written down clearly.',
          },
          {
            _type: 'pageItem',
            title: 'Dealer fees baked into the price',
            body: 'A financing product can make the monthly payment look manageable by embedding significant cost into the system price itself. Compare the cash price to the financed price — if there is a large gap, dealer fees are likely in play.',
          },
          {
            _type: 'pageItem',
            title: 'Exit flexibility',
            body: 'What happens if you sell the home, refinance, or want to pay the project off early? Some financing structures are more flexible than others, and that matters more than homeowners typically expect.',
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
            title: 'Request the same scope under multiple payment structures',
            body: 'Keep the equipment and work scope constant so you can see what the financing itself changes about the cost and timeline.',
          },
          {
            _type: 'pageItem',
            title: 'Ask whether the quote assumes a tax-credit re-amortization',
            body: 'If it does, the homeowner should understand what happens to the payment if that assumption is not met on time.',
          },
          {
            _type: 'pageItem',
            title: 'Compare early payoff terms',
            body: 'Some financing options preserve more flexibility than others if you decide to pay off the balance sooner. Check for prepayment penalties or restrictive terms.',
          },
          {
            _type: 'pageItem',
            title: 'Look at lifetime cost, not just year-one comfort',
            body: 'The cheapest-feeling monthly payment today is not always the least expensive project over its full life. Compare the 10, 15, and 20-year total cost numbers.',
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
              'Not automatically. Cash usually reduces total cost, but financing can preserve liquidity for other priorities. The right answer depends on the specific loan terms, your financial situation, and how much flexibility matters to you.',
          },
          {
            _type: 'pageItem',
            question: 'Why can two loans with similar monthly payments feel so different?',
            answer:
              'Because term length, dealer fees, interest structure, and tax-credit assumptions can all change the total paid — even when the monthly number looks comparable.',
          },
          {
            _type: 'pageItem',
            question: 'What financing detail do homeowners miss most often?',
            answer:
              'Usually the total cost of financing over time and whether the solar quote assumes the homeowner applies the tax credit in a specific way to maintain the advertised payment.',
          },
          {
            _type: 'pageItem',
            question: 'Can I finance both a roof replacement and solar together?',
            answer:
              'Some lenders and contractors offer combined project financing. This can simplify the process and sometimes improve terms, but the same comparison rules apply — total cost, flexibility, and fee transparency should all be clear before signing.',
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
