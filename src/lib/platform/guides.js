function createStaticHeroImage({ alt, color = '#d7c2ad', creditName = '', creditUrl = '', creditUsername = '', description = '', downloadLocation = '', source = 'manual', unsplashId = '', unsplashUrl = '', url }) {
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
  {
    id: 'guide-how-solar-works-austin',
    number: '01',
    slug: 'how-solar-works-austin',
    title: 'How Solar Works in Austin',
    cardCopy: 'A clear walkthrough of panels, inverters, grid connection, export credits, and what actually happens on an Austin home.',
    description: 'A practical Austin-focused guide to how a residential solar system works, how energy flows through the home, and which local utility details matter before you buy.',
    image: createStaticHeroImage({
      alt: 'Modern Austin home with rooftop solar in warm daylight',
      color: '#c97a46',
      description: 'Editorial exterior of a modern Austin home with rooftop solar panels.',
      url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7c81dc6c-677b-458c-9c27-a3d6ff08395d_1600w.png',
    }),
    sections: [
      {
        _type: 'pageSection',
        type: 'hero',
        eyebrow: 'Guide 01',
        title: 'How solar actually works on an Austin home',
        body: 'The useful version of this topic is not a science lesson. It is understanding where the power goes, what the utility still does, what changes on your bill, and why two systems with the same number of panels can perform very differently.',
        heroImage: createStaticHeroImage({
          alt: 'Modern Austin home with rooftop solar in warm daylight',
          color: '#c97a46',
          description: 'Editorial exterior of a modern Austin home with rooftop solar panels.',
          url: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7c81dc6c-677b-458c-9c27-a3d6ff08395d_1600w.png',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Best for', value: 'First-time research' },
          { _type: 'pageMetric', label: 'Reading time', value: '9 min' },
          { _type: 'pageMetric', label: 'Primary question', value: 'What changes after the system is installed?' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'System basics',
        title: 'Solar offsets the power you buy from the grid. It does not replace the grid connection.',
        body: 'The panels generate direct current electricity, the inverter turns that into usable household power, and the home uses that energy first when the sun is out. If the system makes more than the home is using at that moment, the excess can flow outward depending on your utility arrangement. At night, during storms, or when usage spikes above production, the home still pulls from the grid unless you have storage. That is why solar is best understood as a bill-offset system first and a backup-power system only when storage is included.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'The four moving parts homeowners should understand',
        items: [
          {
            _type: 'pageItem',
            title: 'Panels are only one piece of performance',
            body: 'Panel brand matters less than most marketing implies. Roof layout, shading, inverter strategy, and system sizing can have a bigger effect on real production.',
          },
          {
            _type: 'pageItem',
            title: 'The inverter is the operating brain',
            body: 'This is what converts panel output into usable electricity, manages shutdown rules, and often determines how monitoring and battery add-ons work later.',
          },
          {
            _type: 'pageItem',
            title: 'The grid still matters every day',
            body: 'Most Austin systems remain grid-tied. That means utility policy, export value, and interconnection rules directly affect the economics.',
          },
          {
            _type: 'pageItem',
            title: 'Storage solves resilience, not basic solar function',
            body: 'A battery can provide backup and load shifting, but it is not required for a strong solar project. It should be justified on its own merits.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'What to understand before you ask for bids',
        items: [
          {
            _type: 'pageItem',
            title: 'Start with roof reality',
            body: 'Orientation, pitch, shading, and usable roof area control what the system can realistically produce. That should come before brand comparisons.',
          },
          {
            _type: 'pageItem',
            title: 'Look at expected annual production, not just panel count',
            body: 'Two quotes with the same wattage can produce different results if layout assumptions, shade treatment, or inverter design differ.',
          },
          {
            _type: 'pageItem',
            title: 'Ask how exports are valued',
            body: 'If exported power is credited below the retail rate, oversizing a system becomes less attractive. That affects how the project should be sized.',
          },
          {
            _type: 'pageItem',
            title: 'Separate solar value from battery value',
            body: 'If storage is included, it should be modeled separately. Backup capability is useful, but it changes cost and should not be hidden inside the solar payback story.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Common first questions from Austin homeowners',
        items: [
          {
            _type: 'pageItem',
            question: 'Do solar panels power the house during an outage?',
            answer: 'Not by default. Most grid-tied systems shut down when the grid goes down unless the system includes battery backup or another approved backup configuration.',
          },
          {
            _type: 'pageItem',
            question: 'Do I need the biggest system possible?',
            answer: 'Usually no. The better question is how much usage you want to offset, how your utility values exports, and whether your roof supports that size efficiently.',
          },
          {
            _type: 'pageItem',
            question: 'Does Austin sunlight make solar worth it?',
            answer: 'Austin has strong solar potential, but the outcome still depends on your roof, electric bill, export value, and installation cost. Sun alone is not the full answer.',
          },
          {
            _type: 'pageItem',
            question: 'What part of the quote should I be most skeptical of?',
            answer: 'Be skeptical of any quote that does not clearly explain annual production assumptions, export-credit treatment, and whether the system is sized to actual usage instead of a sales target.',
          },
        ],
      },
    ],
  },
  {
    id: 'guide-austin-solar-costs-and-savings',
    number: '02',
    slug: 'austin-solar-costs-and-savings',
    title: 'Costs & Savings',
    cardCopy: 'A more useful look at installed price, financing, tax-credit timing, export value, and what really changes payback.',
    description: 'A detailed Austin solar cost guide covering installed price, incentives, financing structure, export assumptions, and the questions to ask before you trust a payback estimate.',
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
        title: 'What Austin homeowners should expect solar to cost',
        body: 'The useful answer is not a national average and it is not the monthly payment in the ad. It is the installed price, the expected production, the export value, the financing structure, and how the federal credit is actually being treated in the math.',
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
        title: 'The numbers that actually move payback',
        items: [
          {
            _type: 'pageItem',
            title: 'Installed price per watt',
            body: 'This is the starting point for comparison, but it only matters when paired with credible production assumptions and equipment scope.',
          },
          {
            _type: 'pageItem',
            title: 'Federal tax credit timing',
            body: 'The credit improves total economics, but homeowners still need to know when they can actually realize that benefit and whether the quote assumes they immediately do so.',
          },
          {
            _type: 'pageItem',
            title: 'Utility export value',
            body: 'If exported power is worth materially less than the retail rate, oversizing a system becomes much harder to justify.',
          },
          {
            _type: 'pageItem',
            title: 'Financing structure',
            body: 'Dealer fees, term length, and rate can make two similar-looking proposals behave very differently over time.',
          },
          {
            _type: 'pageItem',
            title: 'Your actual usage profile',
            body: 'Homes with high daytime usage often capture more direct value from solar than homes that use most of their power after sunset.',
          },
          {
            _type: 'pageItem',
            title: 'Future roof or electrical work',
            body: 'If the home needs roof replacement or panel upgrades soon, that extra scope should be part of the real project math.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'Reading quotes',
        title: 'The cleanest quote comparison is cost, production, and total paid over time.',
        body: 'Homeowners often get forced into comparing offers on the wrong axis. One quote highlights monthly payment, another highlights tax-credit-adjusted cost, another highlights a lower system price with weaker production assumptions. The more useful comparison is installed price, expected production, export treatment, financing terms, total paid, and break-even timing under realistic assumptions.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to pressure-test a solar savings estimate',
        items: [
          {
            _type: 'pageItem',
            title: 'Ask for annual production in writing',
            body: 'If the savings story depends on production, the quote should show that number clearly and explain what assumptions it uses.',
          },
          {
            _type: 'pageItem',
            title: 'Check whether export value equals retail rate',
            body: 'If the quote quietly assumes exported solar is worth full retail power, the payback may be overstated.',
          },
          {
            _type: 'pageItem',
            title: 'Separate base system price from financing effect',
            body: 'A financed system may have a very different total cost than the same system purchased in cash. That should be explicit.',
          },
          {
            _type: 'pageItem',
            title: 'Ask what happens if utility rates or usage change',
            body: 'Good quotes show the system logic clearly enough that you can understand which assumptions are optimistic and which are defensible.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Cost questions worth asking on every quote',
        items: [
          {
            _type: 'pageItem',
            question: 'What should I compare between installers?',
            answer: 'Compare installed price, equipment scope, expected annual production, warranties, financing terms, export assumptions, and how the quote treats incentives. If one of those is missing, the comparison is incomplete.',
          },
          {
            _type: 'pageItem',
            question: 'Is monthly payment lower than my electric bill enough?',
            answer: 'No. You also need to know total paid over time, how long it takes to break even, and whether the quote is using realistic assumptions to get to that monthly story.',
          },
          {
            _type: 'pageItem',
            question: 'Why do payback estimates vary so much?',
            answer: 'Because they depend on system price, production assumptions, electric-rate inflation, export value, tax-credit treatment, and what your household actually uses over time.',
          },
          {
            _type: 'pageItem',
            question: 'Should I trust a quote that feels unusually cheap?',
            answer: 'Only after checking what was left out. A cheaper quote may reflect weaker equipment, optimistic production assumptions, hidden financing cost, or a system that is simply not sized the same way.',
          },
        ],
      },
    ],
  },
  {
    id: 'guide-austin-solar-incentives',
    number: '03',
    slug: 'austin-solar-incentives',
    title: 'Austin Solar Incentives',
    cardCopy: 'A factual guide to the federal credit, Texas property-tax treatment, and how to verify any local programs without hand-wavy promises.',
    description: 'A practical solar incentives guide for Austin homeowners covering the federal credit, Texas property-tax treatment, and how to verify changing local utility details.',
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
        title: 'Which Austin solar incentives actually matter',
        body: 'This topic gets messy when sites try to sound helpful by promising more certainty than they really have. The better approach is simple: know the incentives that materially affect project economics, understand which ones are date-sensitive, and verify local utility details before you make the quote math depend on them.',
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
        title: 'The three incentive topics homeowners care about most',
        items: [
          {
            _type: 'pageItem',
            title: 'Federal residential clean energy credit',
            body: 'This is usually the single largest incentive in the stack, which is exactly why the quote should explain it carefully instead of using it as a marketing shortcut.',
          },
          {
            _type: 'pageItem',
            title: 'Texas property-tax exemption',
            body: 'This matters because homeowners worry about adding value to the property and then getting penalized for it. Texas gives real protection here.',
          },
          {
            _type: 'pageItem',
            title: 'Local utility program details',
            body: 'Program details can change, which is why this part of the conversation needs citations, dates, and clear caveats instead of blanket claims.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'How to use this page',
        title: 'Treat incentives as a support for the project, not the whole reason to do it.',
        body: 'If the project only works when every incentive assumption is maximized, that is a sign the quote is fragile. Incentives should improve the economics of a system that already makes sense, not rescue one that does not.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to verify incentive claims before signing',
        items: [
          {
            _type: 'pageItem',
            title: 'Check whether the quote explains eligibility',
            body: 'A serious quote should say what the incentive is, who qualifies, and what assumptions it is making rather than merely showing a lower net number.',
          },
          {
            _type: 'pageItem',
            title: 'Look for dated source material on local programs',
            body: 'If a local utility program is mentioned, the homeowner should be able to verify current rules without guessing whether the page is stale.',
          },
          {
            _type: 'pageItem',
            title: 'Ask how the credit is treated in financing',
            body: 'Some financing models assume the homeowner applies the credit in a specific way. That needs to be explicit, not implied.',
          },
          {
            _type: 'pageItem',
            title: 'Avoid unsupported paperwork promises',
            body: 'If the operating business does not truly handle the entire process, the content should not imply otherwise.',
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
            question: 'Can I always stack every incentive together?',
            answer: 'Not automatically. Eligibility, timing, tax situation, and utility rules all matter. The stack should be verified, not assumed.',
          },
          {
            _type: 'pageItem',
            question: 'Does a tax credit reduce the installer price?',
            answer: 'No. It affects the homeowner’s tax situation rather than lowering the contract price at signing, which is why quotes should distinguish contract price from post-incentive economics.',
          },
          {
            _type: 'pageItem',
            question: 'Should incentive pages promise paperwork handling?',
            answer: 'Only if that is actually true for the operating business. The content should stay factual and supportable.',
          },
          {
            _type: 'pageItem',
            question: 'How often should I re-check local incentive details?',
            answer: 'Before relying on them in a decision. Local utility rules and program availability can change, so homeowners should verify current details at the time they are evaluating quotes.',
          },
        ],
      },
    ],
  },
  {
    id: 'guide-austin-solar-battery-backup',
    number: '04',
    slug: 'austin-solar-battery-backup',
    title: 'Solar + Battery Backup',
    cardCopy: 'A practical guide to when storage is worth adding, what it actually does in an outage, and how to keep the economics honest.',
    description: 'A detailed guide to deciding whether solar plus battery backup makes sense for an Austin home, including outage behavior, load planning, and cost tradeoffs.',
    image: createStaticHeroImage({
      alt: 'Contemporary utility room with home battery equipment',
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
        eyebrow: 'Guide 04',
        title: 'When a battery changes the solar conversation',
        body: 'Storage is one of the easiest places for a quote to get emotionally persuasive and economically fuzzy. A battery may be the right move, but the decision should start with resilience needs, critical loads, and how much value you assign to backup power.',
        heroImage: createStaticHeroImage({
          alt: 'Contemporary utility room with home battery equipment',
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
          { _type: 'pageMetric', label: 'Best for', value: 'Backup planning' },
          { _type: 'pageMetric', label: 'Reading time', value: '9 min' },
          { _type: 'pageMetric', label: 'Key tradeoff', value: 'Resilience vs. cost' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'What batteries really solve',
        title: 'A battery is about resilience and control more than simple payback.',
        body: 'Most homeowners do not add storage because it produces the fastest return on paper. They add it because they care about backup power, want better control over critical loads, or expect future utility conditions to make storage more valuable. That means it deserves its own decision framework, not a cameo inside the base solar quote.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'How to decide whether battery backup belongs in the project',
        items: [
          {
            _type: 'pageItem',
            title: 'Start with the outage problem',
            body: 'If backup power is not solving a real household problem, the extra spend may be difficult to justify on economics alone.',
          },
          {
            _type: 'pageItem',
            title: 'Know which loads matter',
            body: 'Whole-home backup and critical-load backup are different design decisions with very different budgets and expectations.',
          },
          {
            _type: 'pageItem',
            title: 'Model the economics separately',
            body: 'The storage add-on should stand on its own in the quote so the homeowner can see what resilience costs separately from the base solar project.',
          },
          {
            _type: 'pageItem',
            title: 'Ask how the system behaves in a real outage',
            body: 'Runtime, recharge behavior, transfer behavior, and supported loads vary. Those details matter more than a generic battery label on the proposal.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'Where battery quotes usually get confusing',
        items: [
          {
            _type: 'pageItem',
            title: 'Backup scope is often implied instead of stated',
            body: 'The homeowner needs to know exactly what will stay on in an outage and for roughly how long.',
          },
          {
            _type: 'pageItem',
            title: 'Battery value gets mixed into solar value',
            body: 'That makes the system look better than it really is. The cleaner method is to evaluate storage as a separate decision.',
          },
          {
            _type: 'pageItem',
            title: 'Future flexibility is not always discussed',
            body: 'Homeowners should know whether storage can be expanded later and what equipment choices make that easier or harder.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Battery questions homeowners ask before signing',
        items: [
          {
            _type: 'pageItem',
            question: 'Can batteries run my whole house?',
            answer: 'Sometimes, but not always. It depends on battery capacity, selected loads, inverter setup, and how the system is intentionally designed.',
          },
          {
            _type: 'pageItem',
            question: 'Does every solar system need a battery now?',
            answer: 'No. Batteries solve a resilience and load-management problem. They are not mandatory for a strong solar project and should not be treated as such.',
          },
          {
            _type: 'pageItem',
            question: 'Can I add storage later instead of now?',
            answer: 'Often yes, but it depends on the equipment and the way the system is designed up front. That is why future expandability is worth asking about before signing.',
          },
        ],
      },
    ],
  },
  {
    id: 'guide-buy-or-finance-solar-austin',
    number: '05',
    slug: 'buy-or-finance-solar-austin',
    title: 'Buy or Finance Solar',
    cardCopy: 'A practical framework for cash, loans, dealer fees, early payoff, and the financing details that actually change total cost.',
    description: 'A thorough guide to comparing cash purchase and financing options for solar so homeowners can evaluate total cost, payment structure, and flexibility.',
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
        eyebrow: 'Guide 05',
        title: 'Cash versus financing is not just a monthly-payment question',
        body: 'The right comparison is total paid, monthly obligation, break-even timing, tax-credit assumptions, and flexibility if your plans change. The advertised payment is only one piece of that story, and often the most misleading one.',
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
          { _type: 'pageMetric', label: 'Focus', value: 'Ownership structure' },
          { _type: 'pageMetric', label: 'Reading time', value: '8 min' },
          { _type: 'pageMetric', label: 'Primary risk', value: 'Dealer-fee confusion' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'How to compare offers',
        title: 'A low monthly payment can still hide an expensive project.',
        body: 'Longer terms, dealer fees, and tax-credit assumptions can make a financed system feel easier in the short term while materially increasing total cost. The homeowner should be able to compare the same system under cash and financing without losing visibility into what the financing itself adds.',
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'What to compare between cash and financing',
        items: [
          {
            _type: 'pageItem',
            title: 'Total paid over the life of the system',
            body: 'This is often the clearest way to see whether the financing structure is helping or quietly inflating the project.',
          },
          {
            _type: 'pageItem',
            title: 'Tax-credit timing assumptions',
            body: 'Some loan structures assume a prepayment or a certain tax-credit application. That should be written down, not implied.',
          },
          {
            _type: 'pageItem',
            title: 'Exit flexibility',
            body: 'Ask what happens if you sell the home, refinance, or want to pay off the system early.',
          },
          {
            _type: 'pageItem',
            title: 'Dealer fees and hidden financing cost',
            body: 'A financing product can make the price look lower month to month while embedding meaningful cost into the system price itself.',
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
            title: 'Request the same system under multiple payment structures',
            body: 'That keeps the equipment and production assumptions constant so you can see what financing itself changes.',
          },
          {
            _type: 'pageItem',
            title: 'Ask whether the quote assumes a tax-credit re-amortization',
            body: 'If it does, the homeowner should understand what happens if that assumption is not met.',
          },
          {
            _type: 'pageItem',
            title: 'Compare early payoff terms',
            body: 'Some financing options preserve more flexibility than others if the homeowner wants out of the loan sooner.',
          },
          {
            _type: 'pageItem',
            title: 'Look at lifetime cost, not just year-one comfort',
            body: 'The cheapest-feeling payment today may not be the least expensive system over the long run.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Financing questions to put on every comparison sheet',
        items: [
          {
            _type: 'pageItem',
            question: 'Is cash always better than financing?',
            answer: 'Not automatically. Cash often improves total cost, but financing can preserve liquidity and may fit a homeowner’s priorities better. The right answer depends on the actual loan structure and what flexibility is worth to you.',
          },
          {
            _type: 'pageItem',
            question: 'Why can two loans with similar payments feel so different?',
            answer: 'Because term length, dealer fees, interest structure, and tax-credit assumptions can change the total paid even if the monthly number looks manageable.',
          },
          {
            _type: 'pageItem',
            question: 'What financing detail is easiest to miss?',
            answer: 'Usually the total cost of financing over time and whether the quote assumes the homeowner applies the tax credit in a specific way to keep the payment where it was advertised.',
          },
        ],
      },
    ],
  },
  {
    id: 'guide-is-your-roof-ready-for-solar',
    number: '06',
    slug: 'is-your-roof-ready-for-solar',
    title: 'Is Your Roof Ready for Solar?',
    cardCopy: 'A practical roof-readiness guide covering age, condition, layout, shading, and when roofing work should happen before solar.',
    description: 'A detailed homeowner guide to evaluating roof readiness before solar, including age, material, shading, usable area, and project sequencing.',
    image: createStaticHeroImage({
      alt: 'Austin roofline in warm afternoon light',
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
        title: 'A good solar quote starts with an honest roof assessment',
        body: 'If the roof is near the end of its useful life, heavily shaded, or layout-constrained, the right move may be roof work first, a smaller system, or a different expectation about production. A serious quote should start there instead of glossing over the constraints.',
        heroImage: createStaticHeroImage({
          alt: 'Austin roofline in warm afternoon light',
          color: '#8a5b45',
          creditName: 'Dillon Kydd',
          creditUrl: 'https://unsplash.com/@kyddvisuals',
          creditUsername: 'kyddvisuals',
          description: 'Residential roofline photographed in warm light.',
        }),
        metrics: [
          { _type: 'pageMetric', label: 'Focus', value: 'Roof suitability' },
          { _type: 'pageMetric', label: 'Reading time', value: '8 min' },
          { _type: 'pageMetric', label: 'Primary decision', value: 'Roof first or solar first' },
        ],
      },
      {
        _type: 'pageSection',
        type: 'story',
        eyebrow: 'Why this matters',
        title: 'The cheapest mistake is the one you avoid before panels are installed.',
        body: 'Solar lasts a long time. If the roof underneath it is already questionable, the homeowner may end up paying for avoidable removal and reinstall work later. That is why roof condition, remaining life, shade, and usable area deserve real attention before comparing glossy proposals.',
      },
      {
        _type: 'pageSection',
        type: 'steps',
        title: 'The roof checks worth doing before you request bids',
        items: [
          {
            _type: 'pageItem',
            title: 'Estimate remaining roof life',
            body: 'If replacement is likely in the near future, it is usually better to plan for that now than remove a system later.',
          },
          {
            _type: 'pageItem',
            title: 'Check shading honestly',
            body: 'Trees, neighboring structures, vent placement, and roof geometry can materially change real production.',
          },
          {
            _type: 'pageItem',
            title: 'Confirm usable roof area',
            body: 'Chimneys, vents, valleys, hips, setbacks, and code-required clearances can reduce available panel space more than homeowners expect.',
          },
          {
            _type: 'pageItem',
            title: 'Coordinate with roofing scope when needed',
            body: 'If roofing work is likely, compare the sequencing options before signing the solar contract so the two scopes do not conflict.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'highlights',
        title: 'What a good roof-readiness conversation should include',
        items: [
          {
            _type: 'pageItem',
            title: 'Material and age',
            body: 'The roof material and its remaining useful life affect whether solar should happen now or later.',
          },
          {
            _type: 'pageItem',
            title: 'Layout efficiency',
            body: 'A roof with plenty of square footage can still be awkward for panels if obstructions and geometry break up the usable area.',
          },
          {
            _type: 'pageItem',
            title: 'Shade pattern over time',
            body: 'Not all shading is constant. Seasonal tree coverage and afternoon shading can matter more than a single snapshot suggests.',
          },
        ],
      },
      {
        _type: 'pageSection',
        type: 'ctaBanner',
        eyebrow: 'Need roof help first?',
        title: 'If the roof needs work before solar, we can connect you to the right roofing professional.',
        body: 'Some homes are not ready for solar yet because the roof itself needs attention first. Use this form if you want a roofing-first conversation before you come back to solar.',
        ctaLabel: 'Request a roofing consult',
      },
      {
        _type: 'pageSection',
        type: 'faq',
        title: 'Roof readiness questions that change the plan',
        items: [
          {
            _type: 'pageItem',
            question: 'Can solar go on an older roof?',
            answer: 'Sometimes, but the answer depends on remaining roof life, current condition, and whether replacement is likely soon enough to create avoidable removal and reinstall cost.',
          },
          {
            _type: 'pageItem',
            question: 'Does every roof get the same production value?',
            answer: 'No. Orientation, pitch, shading, obstructions, and layout constraints all change expected output and can make two homes with similar bills very different solar candidates.',
          },
          {
            _type: 'pageItem',
            question: 'Should roofing work happen before solar if both are needed?',
            answer: 'Often yes, especially if the roof is near replacement. The cleaner sequence depends on timing, budget, and how likely it is that near-term roof work would disrupt a new system.',
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

export function getSolarGuidePages(siteSlug = 'austin-solar-pros') {
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
