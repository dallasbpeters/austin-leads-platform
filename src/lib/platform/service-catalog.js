const baseMeta = {
  siteSlug: 'texas-solar-and-roofing-pros',
  pageType: 'servicePage',
  templateLevel: 'hero',
}

export const mainServices = [
  {
    slug: 'energy-audits',
    title: 'Energy Audits',
    icon: 'audit',
    menuDescription: 'Find what is driving the bill.',
    eyebrow: 'Find the waste first',
    subtitleLabel: 'Best when',
    subtitleValue: 'Bills are high but the cause is unclear',
    body: 'A home energy audit helps identify where the house is losing money through poor insulation, air leaks, duct problems, equipment inefficiency, or usage patterns that need to be understood before bigger upgrades are priced.',
    image: {
      urls: { regular: '/assets/services/photos/energy-audits.jpg' },
      alt: 'Thermostat control being adjusted during a home energy audit',
    },
    detail: {
      heroEyebrow: 'Home performance',
      heroBody:
        'An energy audit is the right first move when utility costs are climbing but the house is giving mixed signals. It helps separate envelope issues, HVAC losses, and usage problems before money is spent in the wrong place.',
      storyTitle: 'Use an audit when the house feels expensive to run but the reason is still fuzzy.',
      storyBody:
        'A good audit turns vague frustration into a real scope. Instead of guessing between HVAC, insulation, windows, or solar, the homeowner gets a clearer picture of where comfort and energy losses are actually happening.',
      highlights: [
        {
          title: 'Envelope losses',
          body: 'Identify air leakage, insulation gaps, and rooms that are drifting out of balance.',
        },
        {
          title: 'Equipment performance',
          body: 'Check whether HVAC runtime, duct losses, or controls are making the bill worse.',
        },
        {
          title: 'Upgrade order',
          body: 'Show what should happen first so later quotes are built on the real problem.',
        },
      ],
      steps: [
        {
          title: 'Review the symptoms',
          body: 'Start with the homeowner’s complaints: high bills, hot rooms, cold rooms, humidity, or noisy equipment.',
        },
        {
          title: 'Inspect the likely loss points',
          body: 'Look at attic conditions, ducts, return paths, controls, and the overall condition of the thermal envelope.',
        },
        {
          title: 'Set the priority list',
          body: 'Turn the findings into a practical sequence so the next quote solves the right issue.',
        },
      ],
      faq: [
        {
          question: 'Do I need an energy audit before solar?',
          answer:
            'Not always, but it is useful when the bill is high and the home has obvious comfort or performance issues. An audit helps prevent overspending on generation before waste is addressed.',
        },
        {
          question: 'Will an audit tell me what to fix first?',
          answer:
            'That is the point. A useful audit should narrow the list, not make the project feel more confusing.',
        },
      ],
    },
  },
  {
    slug: 'insulation-and-air-sealing',
    title: 'Insulation and Air Sealing',
    icon: 'insulation',
    menuDescription: 'Tighten the envelope and stop air loss.',
    eyebrow: 'Keep conditioned air inside',
    subtitleLabel: 'Best when',
    subtitleValue: 'Rooms run unevenly or HVAC runs too long',
    body: 'Poor insulation and untreated air leaks force heating and cooling systems to work harder than they should. Tightening the envelope can lower utility costs and make the house noticeably more comfortable.',
    image: {
      urls: { regular: '/assets/services/photos/insulation-air-sealing.jpg' },
      alt: 'Residential attic space with reflective insulation installed',
    },
    detail: {
      heroEyebrow: 'Efficiency upgrades',
      heroBody:
        'Insulation and air sealing are often the highest-leverage comfort fixes in older homes. The goal is not just more material. It is a tighter, better-performing envelope that reduces unnecessary HVAC load.',
      storyTitle: 'If the house leaks conditioned air all day, the equipment never gets a fair shot.',
      storyBody:
        'Many homes struggle because the envelope is loose, not because the HVAC system is undersized. Sealing obvious leaks and correcting weak insulation can change room balance, runtime, and operating cost fast.',
      highlights: [
        {
          title: 'Attic leakage',
          body: 'Top-plate gaps, penetrations, and attic bypasses can quietly drain conditioned air.',
        },
        {
          title: 'Insulation quality',
          body: 'Coverage, depth, compression, and disturbed areas matter as much as nominal R-value.',
        },
        {
          title: 'Comfort impact',
          body: 'These upgrades often reduce hot spots, drafts, and the feeling that the system never catches up.',
        },
      ],
      steps: [
        {
          title: 'Identify the biggest loss points',
          body: 'Focus on the areas that are letting conditioned air escape or heat in.',
        },
        {
          title: 'Seal before adding material',
          body: 'Air sealing should usually come before simply piling on more insulation.',
        },
        {
          title: 'Verify the comfort change',
          body: 'The result should be lower load and better room consistency, not just a checkbox.',
        },
      ],
      faq: [
        {
          question: 'Can insulation lower my bill without replacing HVAC?',
          answer:
            'Yes. In many homes, the envelope is making the system work harder than necessary. Tightening the shell can reduce runtime and improve comfort even before equipment changes.',
        },
        {
          question: 'Is air sealing the same as adding insulation?',
          answer:
            'No. They work together, but air sealing addresses leakage while insulation slows heat transfer. Good results usually require both to be considered together.',
        },
      ],
    },
  },
  {
    slug: 'duct-sealing',
    title: 'Duct Sealing',
    icon: 'ducts',
    menuDescription: 'Reduce hidden HVAC loss in the ductwork.',
    eyebrow: 'Fix hidden HVAC losses',
    subtitleLabel: 'Best when',
    subtitleValue: 'Comfort is uneven or attic losses are likely',
    body: 'Leaky ducts waste conditioned air where you do not benefit from it. Sealing and correcting duct problems can improve system performance, room balance, and overall HVAC efficiency without jumping straight to equipment replacement.',
    image: {
      urls: { regular: '/assets/services/photos/duct-sealing.jpg' },
      alt: 'Architectural vent detail representing HVAC airflow and duct performance',
    },
    detail: {
      heroEyebrow: 'HVAC performance',
      heroBody:
        'Duct problems hide in attics, walls, and plenums, but the symptoms show up in every room. If the system runs hard and the comfort still feels wrong, duct leakage is part of the conversation.',
      storyTitle: 'The system can only perform as well as the air path allows.',
      storyBody:
        'Supply leaks, return issues, crushed runs, and disconnected sections all undermine comfort. Duct work should be evaluated before deciding the home simply needs bigger equipment.',
      highlights: [
        {
          title: 'Supply losses',
          body: 'Conditioned air can be dumped into attic or crawl spaces before it ever reaches the room.',
        },
        {
          title: 'Return imbalance',
          body: 'Poor return paths can create pressure problems and drag hot, dusty, or humid air into the house.',
        },
        {
          title: 'System efficiency',
          body: 'Sealing and correcting duct issues can improve both comfort and equipment performance.',
        },
      ],
      steps: [
        {
          title: 'Look for loss patterns',
          body: 'Start with rooms that are always off compared with the rest of the house.',
        },
        {
          title: 'Inspect the distribution path',
          body: 'Check for leakage, disconnections, restrictions, and return-side problems.',
        },
        {
          title: 'Correct before replacing',
          body: 'Fixing the delivery system often changes what equipment recommendation makes sense.',
        },
      ],
      faq: [
        {
          question: 'Can duct sealing really lower energy use?',
          answer:
            'Yes. If conditioned air is being lost before it gets to the living space, the system runs longer to make up for it.',
        },
        {
          question: 'How do I know if my ducts are the problem?',
          answer:
            'Common signs include uneven temperatures, weak airflow in certain rooms, hot attics with HVAC runs, and equipment that seems to run constantly.',
        },
      ],
    },
  },
  {
    slug: 'window-replacement',
    title: 'Window Replacement',
    icon: 'windows',
    menuDescription: 'Cut drafts, glare, and heat gain.',
    eyebrow: 'Reduce heat gain and loss',
    subtitleLabel: 'Best when',
    subtitleValue: 'Drafts, glare, and older windows are part of the problem',
    body: 'Window upgrades can improve comfort, reduce heat gain, and cut down on avoidable energy waste. They make the most sense when the existing windows are clearly contributing to comfort and efficiency issues.',
    image: {
      urls: { regular: '/assets/services/photos/window-replacement-flyer.jpg' },
      alt: 'Crew installing new residential windows on a house exterior',
    },
    detail: {
      heroEyebrow: 'Envelope upgrades',
      heroBody:
        'Windows matter when they are clearly contributing to heat gain, drafts, glare, or occupant discomfort. The goal is not replacing windows for the sake of it. The goal is fixing a real performance problem.',
      storyTitle:
        'If the windows are driving discomfort, they should be evaluated as part of the whole-home plan.',
      storyBody:
        'Older glass, poor seals, or weak frames can affect comfort and HVAC load. Window work should be priced alongside the other envelope decisions, not as an isolated sales pitch.',
      highlights: [
        {
          title: 'Comfort and glare',
          body: 'Rooms with strong heat gain or obvious draft issues often point to a window problem.',
        },
        {
          title: 'Envelope coordination',
          body: 'Window work should be considered together with insulation and air sealing, not in a vacuum.',
        },
        {
          title: 'Upgrade timing',
          body: 'The right time is when performance issues are real enough to justify the cost.',
        },
      ],
      steps: [
        {
          title: 'Identify the rooms that struggle',
          body: 'Look at the areas with glare, temperature swing, or visible aging in the window assembly.',
        },
        {
          title: 'Compare impact vs cost',
          body: 'Decide whether window replacement is the best next dollar compared with other envelope work.',
        },
        {
          title: 'Scope the upgrade carefully',
          body: 'Frame condition, glass package, orientation, and installation quality all matter.',
        },
      ],
      faq: [
        {
          question: 'Will new windows solve high energy bills by themselves?',
          answer:
            'Sometimes they help, but they are only one part of the envelope. Bills are often affected by multiple issues at once.',
        },
        {
          question: 'Are window replacements mostly about efficiency or comfort?',
          answer:
            'Usually both. The best candidates are the homes where the existing windows are clearly hurting everyday comfort as well as efficiency.',
        },
      ],
    },
  },
  {
    slug: 'heat-pump-upgrades',
    title: 'Heat Pump Upgrades',
    icon: 'heatpump',
    menuDescription: 'Upgrade aging HVAC with modern efficiency.',
    eyebrow: 'Modernize heating and cooling',
    subtitleLabel: 'Best when',
    subtitleValue: 'Existing HVAC is aging or inefficient',
    body: 'A heat pump upgrade can reduce operating cost and improve efficiency when the existing system is near the end of its life or no longer performing well. It should be evaluated as part of the whole-home energy picture, not in isolation.',
    image: {
      urls: { regular: '/assets/services/photos/heat-pump-upgrades.jpg' },
      alt: 'Residential outdoor heat pump unit mounted beside a home',
    },
    detail: {
      heroEyebrow: 'Equipment planning',
      heroBody:
        'A heat pump can be a smart move when the existing system is old, expensive to operate, or no longer keeping up. The key is making that decision in the context of the full house, not just the equipment quote.',
      storyTitle: 'A heat pump makes more sense when the load, ducting, and envelope are understood first.',
      storyBody:
        'Replacing equipment before understanding attic losses, duct problems, or window and insulation issues can lead to the wrong recommendation. Heat pump planning should start with how the house actually behaves.',
      highlights: [
        {
          title: 'System age',
          body: 'Older HVAC equipment often becomes noisy, unreliable, and expensive long before it fully dies.',
        },
        {
          title: 'Efficiency gains',
          body: 'Modern heat pumps can lower operating costs when the home and ductwork support the upgrade.',
        },
        {
          title: 'Whole-house fit',
          body: 'The right answer depends on load, comfort goals, panel capacity, and the rest of the house condition.',
        },
      ],
      steps: [
        {
          title: 'Look at current system performance',
          body: 'Start with age, runtime, repair history, and whether the current system still keeps up.',
        },
        {
          title: 'Check the supporting conditions',
          body: 'Ducts, insulation, leakage, and electrical readiness affect whether the upgrade will perform well.',
        },
        {
          title: 'Size and quote the right option',
          body: 'The replacement should match the actual load and goals, not just mimic the old unit.',
        },
      ],
      faq: [
        {
          question: 'Should I replace HVAC before considering solar?',
          answer:
            'Sometimes yes, especially if the old system is inefficient enough to distort the household energy picture. The best sequence depends on the condition of both the equipment and the home.',
        },
        {
          question: 'Can a heat pump improve comfort as well as efficiency?',
          answer:
            'Yes. A well-scoped upgrade can help with runtime, humidity, room balance, and overall system control.',
        },
      ],
    },
  },
  {
    slug: 'solar-and-battery-installations',
    title: 'Solar and Battery Installations',
    icon: 'solarbattery',
    menuDescription: 'Size solar and storage for the house.',
    eyebrow: 'Generate and store power',
    subtitleLabel: 'Best when',
    subtitleValue: 'The home is ready for a longer-term energy upgrade',
    body: 'Solar and battery projects make the most sense when the roof, electrical situation, and energy goals are understood clearly. The best projects do not start with hype. They start with whether the system fits the home and the numbers hold up.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
      },
      alt: 'Solar array installation under a bright sky',
    },
    detail: {
      heroEyebrow: 'Solar planning',
      heroBody:
        'Solar and battery projects should be sized around the home, the roof, and the actual electric profile. The useful conversation is not hype. It is whether the system fits and whether the numbers stay honest.',
      storyTitle: 'Good solar projects start with fit, not a generic savings claim.',
      storyBody:
        'Roof condition, usage, shade, electrical constraints, outage goals, and financing all change the recommendation. The most useful solar conversation is the one that makes those tradeoffs visible.',
      highlights: [
        {
          title: 'System fit',
          body: 'Roof shape, orientation, shading, and load profile all affect whether solar is worth doing.',
        },
        {
          title: 'Battery value',
          body: 'Storage should be scoped around resilience goals, critical loads, and economics, not added automatically.',
        },
        {
          title: 'Project sequence',
          body: 'Roofing or electrical work may need to happen before solar if the house is not ready.',
        },
      ],
      steps: [
        {
          title: 'Check the roof and load first',
          body: 'Start with whether the roof and utility profile make the project viable.',
        },
        {
          title: 'Scope solar and storage separately',
          body: 'Solar and battery should each earn their place in the proposal.',
        },
        {
          title: 'Price the project honestly',
          body: 'Cash, financing, incentives, and payback assumptions should all be visible.',
        },
      ],
      faq: [
        {
          question: 'Should every solar project include a battery?',
          answer:
            'No. A battery is useful when the homeowner wants backup power or time-shifting value, but it should not be treated as mandatory.',
        },
        {
          question: 'Do I need a new roof before solar?',
          answer:
            'Sometimes. If the roof is near the end of its service life, it should be discussed before panels go on.',
        },
      ],
    },
  },
]

export const roofingServices = [
  {
    slug: 'shingle-roofing',
    title: 'Shingle Roofing',
    icon: 'shingles',
    menuDescription: 'Repair or replace worn asphalt roofing.',
    body: 'Asphalt shingle systems remain the most common residential roofing option and should be evaluated for age, ventilation, storm wear, and repairability.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1762726012995-81c2f26e6a4b?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'Close-up of weathered roof shingles and eaves',
    },
    detail: {
      heroEyebrow: 'Roofing',
      heroBody:
        'Shingle roofing is still the most common residential roof system, but the right recommendation depends on age, storm history, ventilation, and whether the existing roof is repairable or truly worn out.',
      storyTitle:
        'The useful conversation is whether the roof can be repaired, restored, or whether replacement is actually justified.',
      storyBody:
        'Shingle roofs age unevenly. Granule loss, lifted tabs, hail strikes, ventilation issues, and prior repairs all matter. The goal is a clear scope, not an automatic replacement pitch.',
      highlights: [
        {
          title: 'Condition and age',
          body: 'The repair vs replacement decision depends on the actual condition of the field shingles and details.',
        },
        {
          title: 'Storm history',
          body: 'Recent hail and wind exposure can change what should be documented and how the roof should be assessed.',
        },
        {
          title: 'Ventilation and details',
          body: 'A roofing plan should look beyond shingles to flashing, valleys, ridge ventilation, and penetrations.',
        },
      ],
      steps: [
        {
          title: 'Inspect the roof surface',
          body: 'Look at wear patterns, exposed mats, lifted tabs, and repair history.',
        },
        {
          title: 'Check the supporting details',
          body: 'Ventilation, flashing, and penetrations can be as important as the shingles themselves.',
        },
        {
          title: 'Set the right scope',
          body: 'The end result should clearly explain whether repair, restoration, or replacement makes the most sense.',
        },
      ],
      faq: [
        {
          question: 'How do I know if my shingle roof is ready for replacement?',
          answer:
            'Age matters, but condition matters more. Widespread wear, storm damage, failed details, and repair fatigue usually point to replacement more than one isolated issue.',
        },
        {
          question: 'Can an older shingle roof still be repaired?',
          answer:
            'Sometimes. If the field condition is still serviceable and the problem is localized, repair may still be the right call.',
        },
      ],
    },
  },
  {
    slug: 'metal-roofing',
    title: 'Metal Roofing',
    icon: 'metalroofing',
    menuDescription: 'Long-life roofing with stronger storm resilience.',
    body: 'Metal roofing can be the right long-term fit when durability, reflectivity, and storm resilience matter more than the lowest upfront cost.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1718948173667-fbd912b6d1fa?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'House with a standing seam metal roof',
    },
    detail: {
      heroEyebrow: 'Roofing',
      heroBody:
        'Metal roofing is a long-term system choice. It tends to appeal when durability, reflectivity, and lifecycle value matter more than the cheapest upfront bid.',
      storyTitle:
        'Metal roofing is not the answer for every house, but it can be the right fit when longevity and storm resilience are the priority.',
      storyBody:
        'The useful comparison is not just cost. It is maintenance expectations, installation quality, noise assumptions, detailing, and whether the homeowner wants to invest in a longer-horizon roof system.',
      highlights: [
        {
          title: 'Longevity',
          body: 'Metal roofs can offer a longer service life when the system is designed and installed correctly.',
        },
        {
          title: 'Storm performance',
          body: 'Profile, gauge, fastening system, and detailing all matter when weather resilience is part of the decision.',
        },
        {
          title: 'Upfront vs lifecycle cost',
          body: 'The lowest bid is rarely the whole story with metal roofing.',
        },
      ],
      steps: [
        {
          title: 'Review the roof goals',
          body: 'Decide whether the homeowner is optimizing for budget, longevity, storm performance, or aesthetics.',
        },
        {
          title: 'Compare the right systems',
          body: 'Standing seam and exposed-fastener systems behave differently and should not be treated as interchangeable.',
        },
        {
          title: 'Price it around the full scope',
          body: 'Trim, penetrations, transitions, and installation details drive the real project value.',
        },
      ],
      faq: [
        {
          question: 'Is metal roofing worth the extra cost?',
          answer:
            'It can be, especially when the homeowner values a longer service life and a more durable system. The decision depends on budget horizon and roof goals.',
        },
        {
          question: 'Does metal roofing work well in storm-prone areas?',
          answer:
            'It can, but only when the system and details are chosen correctly. Material alone does not guarantee performance.',
        },
      ],
    },
  },
  {
    slug: 'storm-damage-restoration',
    title: 'Storm Damage Restoration',
    icon: 'stormdamage',
    menuDescription: 'Document damage and scope the recovery.',
    body: 'When a storm hits, the priority is documenting damage clearly, stabilizing the property, and creating a repair plan that insurance can actually follow.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1767385945380-37deed400d81?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'Storm-damaged structure with torn metal roofing',
    },
    detail: {
      heroEyebrow: 'Storm response',
      heroBody:
        'Storm restoration starts with clarity. The homeowner needs to know what was actually damaged, what needs immediate stabilization, and what the insurance process is likely to require.',
      storyTitle: 'After a storm, the first job is sorting real damage from panic and vague promises.',
      storyBody:
        'The right restoration process protects the house, documents the loss clearly, and creates a scope that can hold up with adjusters, contractors, and the homeowner.',
      highlights: [
        {
          title: 'Damage documentation',
          body: 'Photos, roof notes, and site conditions need to be captured while the evidence is fresh.',
        },
        {
          title: 'Stabilization',
          body: 'Leaks, exposed areas, and secondary damage risk should be addressed quickly.',
        },
        {
          title: 'Claim-ready scope',
          body: 'A clean restoration plan makes the insurance conversation more defensible.',
        },
      ],
      steps: [
        {
          title: 'Assess the damage',
          body: 'Start with roof, exterior, interior water signs, and vulnerable openings.',
        },
        {
          title: 'Protect the property',
          body: 'Temporary measures may be needed to prevent additional loss while the scope is built.',
        },
        {
          title: 'Build the restoration plan',
          body: 'The scope should explain what needs repair, what needs replacement, and why.',
        },
      ],
      faq: [
        {
          question: 'What should I do first after storm roof damage?',
          answer:
            'Document what you can safely see, protect the property from further loss if needed, and get the roof inspected before assumptions turn into the wrong repair plan.',
        },
        {
          question: 'Does storm restoration always mean a full roof replacement?',
          answer:
            'No. It depends on the damage pattern, the roof system, and whether the issues are localized or widespread.',
        },
      ],
    },
  },
  {
    slug: 'commercial-roofing',
    title: 'Commercial Roofing',
    icon: 'commercialroofing',
    menuDescription: 'Low-slope and membrane roofing for businesses.',
    body: 'Commercial roof work needs a different conversation around access, membrane condition, drainage, penetrations, maintenance, and disruption to operations.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1737256359080-9354dbcc21ef?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'Large commercial building roof under clear sky',
    },
    detail: {
      heroEyebrow: 'Commercial roofing',
      heroBody:
        'Commercial roofing is its own category of work. Drainage, penetrations, membrane condition, access, and business disruption all affect how the project should be planned.',
      storyTitle: 'Commercial roof decisions require a different scope than a residential roof conversation.',
      storyBody:
        'Flat or low-slope systems need to be evaluated around membrane age, seam condition, ponding, flashing, penetrations, service traffic, and the cost of downtime.',
      highlights: [
        {
          title: 'Drainage and ponding',
          body: 'Water behavior on the roof is a major part of commercial roof performance.',
        },
        {
          title: 'Penetrations and seams',
          body: 'Equipment curbs, pipe penetrations, seams, and flashing details often drive failures.',
        },
        {
          title: 'Operational impact',
          body: 'Scheduling and access should protect the building and limit disruption to the business.',
        },
      ],
      steps: [
        {
          title: 'Inspect the membrane and details',
          body: 'Start with drainage, seams, flashings, penetrations, and visible wear patterns.',
        },
        {
          title: 'Evaluate maintenance vs replacement',
          body: 'Some roofs need focused repair while others are beyond patchwork.',
        },
        {
          title: 'Build the work plan around the building',
          body: 'Scope, phasing, and access need to fit how the property operates.',
        },
      ],
      faq: [
        {
          question: 'How is commercial roofing different from residential roofing?',
          answer:
            'The systems, failure points, access considerations, and work sequencing are different enough that the scope has to be approached differently from the start.',
        },
        {
          question: 'Can a commercial roof be restored instead of replaced?',
          answer:
            'Sometimes. The answer depends on membrane condition, moisture history, drainage, and whether the roof is still a good candidate for restoration.',
        },
      ],
    },
  },
  {
    slug: 'hail-and-wind-damage-roof-inspection',
    title: 'Hail & Wind Damage Roof Inspection',
    icon: 'hailinspection',
    menuDescription: 'Separate real storm damage from normal wear.',
    body: 'An inspection should separate visible wear from real storm damage, note probable impact zones, and help decide whether repair, restoration, or replacement is justified.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1656646549671-000665d8d8bc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'Aerial view of a residential roof for inspection',
    },
    detail: {
      heroEyebrow: 'Storm inspection',
      heroBody:
        'A hail and wind inspection should do more than confirm that a storm happened. It should help determine whether the roof shows probable impact or uplift damage and what kind of next step is justified.',
      storyTitle:
        'The most useful inspection is the one that separates real storm evidence from ordinary wear.',
      storyBody:
        'Homeowners do not need guesswork after a storm. They need a clear read on whether the roof likely took damage, where it appears, and whether that points toward monitoring, repair, or a claim conversation.',
      highlights: [
        {
          title: 'Damage pattern',
          body: 'A credible inspection looks for consistent signal, not isolated marks or assumptions.',
        },
        {
          title: 'Repairability',
          body: 'Some roofs need minor work while others show enough storm effect to justify bigger action.',
        },
        {
          title: 'Claim readiness',
          body: 'Good documentation makes the next insurance or contractor conversation cleaner.',
        },
      ],
      steps: [
        {
          title: 'Inspect the full roof system',
          body: 'Look at field areas, ridges, soft metals, flashing, vents, and surrounding evidence.',
        },
        {
          title: 'Separate wear from storm effect',
          body: 'The goal is to distinguish age-related deterioration from likely hail or wind impact.',
        },
        {
          title: 'Set the right next step',
          body: 'Monitoring, repair, restoration, or claim support each require a different recommendation.',
        },
      ],
      faq: [
        {
          question: 'Can I tell if hail damaged my roof from the ground?',
          answer:
            'Sometimes you can see clues, but a real inspection should look at the full roof system and related evidence before making a recommendation.',
        },
        {
          question: 'Does hail always mean I need a new roof?',
          answer:
            'No. The degree and pattern of damage determine whether repair, restoration, or replacement is actually warranted.',
        },
      ],
    },
  },
]

export const specialtyServices = [
  {
    slug: 'detach-and-reset',
    title: 'Detach and Reset',
    icon: 'detachreset',
    menuDescription: 'Remove and reinstall solar for reroof work.',
    body: 'If the roof needs repair or replacement after solar is already installed, detach-and-reset planning keeps the reroof, panel removal, reinstall, and insurance conversation aligned before timing and cost drift.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
      },
      alt: 'Solar panels installed on a residential roof before roofing coordination work',
    },
    detail: {
      heroEyebrow: 'Solar coordination',
      heroBody:
        'Detach and reset matters when an existing solar array has to come off so the roof can be repaired or replaced. The useful conversation is who is handling removal and reinstall, how the reroof is being coordinated, and what happens if hail or age has damaged part of the solar system too.',
      storyTitle:
        'The real risk is not just taking panels off. It is letting the roofing scope, solar scope, and insurance scope drift apart.',
      storyBody:
        'Homeowners get stuck when the roofer, solar company, and carrier all assume someone else is covering the solar side. A good detach-and-reset scope should clarify sequencing, protect the system during removal, document existing equipment condition, and make the reinstall plan clear before the roof work starts.',
      highlights: [
        {
          title: 'Qualified solar removal',
          body: 'Panel removal and reinstall should be handled by a team that understands the solar system, not just the roofing schedule.',
        },
        {
          title: 'Insurance coordination',
          body: 'Detach-and-reset costs, roofing scope, and any storm-related documentation should be aligned early if the project involves a claim.',
        },
        {
          title: 'Damaged equipment review',
          body: 'Racking, wiring, and panel condition should be checked during removal so any damaged solar components are identified before reinstall.',
        },
      ],
      steps: [
        {
          title: 'Confirm the roof scope first',
          body: 'Settle whether the roof needs localized repair or full replacement before the array comes off, so the solar plan is built around a real roofing scope.',
        },
        {
          title: 'Document and remove the system carefully',
          body: 'Record the array condition, label the system components, and remove the equipment in a way that supports a clean reinstall.',
        },
        {
          title: 'Reinstall and verify production',
          body: 'Once the roof work is done, reinstall the system, inspect the electrical and mounting details, and verify the array is operating correctly before the project is closed.',
        },
      ],
      faq: [
        {
          question: 'When do I need detach and reset for solar?',
          answer:
            'Usually when the roof under an existing array needs significant repair or replacement. The panels have to come off before the roofing work can be done correctly.',
        },
        {
          question: 'Does insurance ever cover detach and reset?',
          answer:
            'Sometimes, especially when the reroof is tied to storm damage, but coverage depends on the policy and claim scope. That is why the solar side should be documented and discussed early, not after the roof work is already moving.',
        },
        {
          question: 'What if a panel or other solar component is damaged?',
          answer:
            'That should be identified during removal and inspection. If equipment itself has been damaged, the homeowner needs a clear recommendation on repair or replacement before reinstall, rather than discovering the problem after the system goes back up.',
        },
      ],
    },
  },
  {
    slug: 'rodent-deterrent',
    title: 'Rodent Deterrent',
    icon: 'rodent',
    menuDescription: 'Protect solar wiring from pest damage.',
    body: 'Screening helps protect rooftop solar systems from pests that can damage wiring and create repeat service issues.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1694248581706-a645f65a2f27?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'Close-up of rooftop solar panels',
    },
    detail: {
      heroEyebrow: 'Solar protection',
      heroBody:
        'Rodent deterrent work protects solar equipment from the kind of damage that turns into repeat service calls, wiring issues, and frustrating production loss.',
      storyTitle: 'Pest protection is small compared with the cost of avoidable wiring damage.',
      storyBody:
        'When rodents get under an array, they can create repeat service issues that are expensive and difficult to diagnose after the fact. Screening and prevention are often worth doing early.',
      highlights: [
        {
          title: 'Protect wiring',
          body: 'The main goal is preventing chewing and nesting that damages system components.',
        },
        {
          title: 'Reduce repeat service',
          body: 'Proactive screening is often cheaper than repeated diagnostics and repair visits.',
        },
        {
          title: 'Preserve system performance',
          body: 'Keeping the underside of the array protected helps avoid preventable disruptions.',
        },
      ],
      steps: [
        {
          title: 'Inspect the array edge',
          body: 'Look for access points and signs of activity around the roof-mounted system.',
        },
        {
          title: 'Install deterrent measures',
          body: 'Use screening and detailing that reduce access without harming the roof or array.',
        },
        {
          title: 'Monitor after install',
          body: 'Check that the system stays clean and protected over time.',
        },
      ],
      faq: [
        {
          question: 'Is rodent deterrent worth doing on solar?',
          answer:
            'It often is, especially if the area or roof conditions make pest activity more likely. Preventive work is usually cheaper than repair after damage occurs.',
        },
        {
          question: 'Can rodents really damage solar wiring?',
          answer:
            'Yes. Chewed wiring and nesting under panels can create recurring service and performance problems.',
        },
      ],
    },
  },
  {
    slug: 'electrical-services',
    title: 'Electrical Services',
    icon: 'electrical',
    menuDescription: 'Panel, wiring, and upgrade support.',
    body: 'Licensed electrical work supports upgrades, troubleshooting, service changes, and safe integration with larger projects.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1759692071712-adc78a8516c8?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'Electrical panel and power equipment',
    },
    detail: {
      heroEyebrow: 'Electrical support',
      heroBody:
        'Electrical work often sits behind the scenes, but it is what allows larger projects to happen safely and correctly. Service changes, troubleshooting, and upgrade readiness all depend on licensed electrical scope.',
      storyTitle: 'Many bigger home upgrades stall because the electrical side was never scoped honestly.',
      storyBody:
        'Panel capacity, breaker space, service condition, and wiring quality can all affect whether the next project is straightforward or needs electrical work first.',
      highlights: [
        {
          title: 'Upgrade readiness',
          body: 'Electrical review helps determine whether larger projects can be added cleanly.',
        },
        {
          title: 'Troubleshooting',
          body: 'Some problems need direct electrical diagnosis before any larger recommendation makes sense.',
        },
        {
          title: 'Safety and compliance',
          body: 'Licensed work matters when the project touches service equipment or critical circuits.',
        },
      ],
      steps: [
        {
          title: 'Review the existing service',
          body: 'Start with panel condition, capacity, and visible limitations.',
        },
        {
          title: 'Define the needed scope',
          body: 'Clarify whether the work is troubleshooting, upgrade support, or a service change.',
        },
        {
          title: 'Coordinate with the larger project',
          body: 'Electrical work should be timed and scoped around the broader home improvement plan.',
        },
      ],
      faq: [
        {
          question: 'Why would electrical work come before solar or EV charging?',
          answer:
            'Because panel capacity, service condition, and code-compliant integration determine whether those projects can be installed safely and correctly.',
        },
        {
          question: 'Do all home energy upgrades require electrical work?',
          answer:
            'No, but many larger upgrades either depend on it or benefit from having the electrical side reviewed first.',
        },
      ],
    },
  },
  {
    slug: 'car-chargers',
    title: 'Car Chargers',
    icon: 'evcharger',
    menuDescription: 'Install home EV charging that fits the panel.',
    body: 'Get a quote for a home EV charger that fits the panel, parking setup, and how the vehicle is actually used.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1724963914478-77af9eba1c50?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'Electric vehicle plugged into a home charger',
    },
    detail: {
      heroEyebrow: 'EV charging',
      heroBody:
        'A home car charger should be priced around the panel, parking layout, and how the vehicle is actually used. The useful quote is the one that fits the house, not just the charger hardware.',
      storyTitle:
        'Home EV charging is straightforward when the electrical side and daily use pattern are both understood.',
      storyBody:
        'Charging speed, panel capacity, conduit path, parking position, and daily mileage all affect which install makes sense and how much complexity the project really needs.',
      highlights: [
        {
          title: 'Panel fit',
          body: 'Capacity and breaker space determine what charger options are practical.',
        },
        {
          title: 'Parking layout',
          body: 'Charger placement should fit where the car actually lives and how the cable will be used.',
        },
        {
          title: 'Use pattern',
          body: 'Daily mileage and charging expectations affect whether a simple or more robust setup makes sense.',
        },
      ],
      steps: [
        {
          title: 'Review the electrical starting point',
          body: 'Look at panel condition, available capacity, and the path to the charging location.',
        },
        {
          title: 'Match the charger to usage',
          body: 'Select the charger around the vehicle and how the home actually uses it.',
        },
        {
          title: 'Install for long-term usability',
          body: 'Placement, cable reach, and future flexibility all matter.',
        },
      ],
      faq: [
        {
          question: 'Do I need a panel upgrade for a home EV charger?',
          answer:
            'Not always. It depends on the existing service, available capacity, and what other loads are already on the panel.',
        },
        {
          question: 'How do I know which charger level I need?',
          answer:
            'That depends on daily mileage, how long the car is parked at home, and whether the electrical system supports the faster option cleanly.',
        },
      ],
    },
  },
]

export const allServiceEntries = [...mainServices, ...roofingServices, ...specialtyServices]

export const servicePages = allServiceEntries.map((service) => ({
  id: `page-service-${service.slug}`,
  ...baseMeta,
  slug: `services/${service.slug}`,
  title: service.title,
  description: service.body,
  sections: [
    {
      type: 'hero',
      eyebrow: service.detail.heroEyebrow,
      title: service.title,
      body: service.detail.heroBody,
      heroImage: service.image,
      actions: [
        { label: 'Request a consultation', href: '#consultation', variant: 'default' },
        { label: 'View all services', href: '/services', variant: 'secondary' },
      ],
      metrics: [
        { label: 'Category', value: service.detail.heroEyebrow },
        { label: 'Focus', value: service.eyebrow || service.subtitleValue || 'Service planning' },
        { label: 'Next step', value: 'Consultation' },
      ],
    },
    {
      type: 'story',
      eyebrow: 'Overview',
      title: service.detail.storyTitle,
      body: service.detail.storyBody,
    },
    {
      type: 'highlights',
      title: `What a good ${service.title.toLowerCase()} scope should cover`,
      items: service.detail.highlights,
    },
    {
      type: 'steps',
      title: `How ${service.title.toLowerCase()} should be approached`,
      items: service.detail.steps,
    },
    {
      type: 'faq',
      title: `${service.title} questions`,
      items: service.detail.faq,
    },
    {
      type: 'cta',
      title: `Tell us what is going on with the house and we will help you figure out whether ${service.title.toLowerCase()} is the right next step.`,
      body: 'The goal is a clearer recommendation, a cleaner scope, and the right conversation first.',
      ctaLabel: 'Request a consultation',
      ctaHref: '#consultation',
    },
  ],
}))
