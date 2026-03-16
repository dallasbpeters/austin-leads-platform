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
    menuDescription: 'Find out where energy is being wasted in your home.',
    eyebrow: 'Find the waste first',
    subtitleLabel: 'Best when',
    subtitleValue: 'Your bills are high but nobody can tell you why',
    body: `Your electric bill isn't lying -- your house is losing energy somewhere. An energy audit uses blower door testing, thermal imaging, and duct diagnostics to find every leak, gap, and failure so you know exactly what to fix and in what order.`,
    image: {
      urls: { regular: '/assets/services/photos/energy-audits.jpg' },
      alt: 'Thermostat control being adjusted during a home energy audit',
    },
    detail: {
      heroEyebrow: 'Home performance',
      heroBody:
        'Most Texas homes lose 20-30% of their energy through gaps, bad insulation, and duct leaks. An energy audit shows you where that waste is happening and ranks fixes by how much money they save and how quickly they pay for themselves.',
      storyTitle: 'Stop guessing where your money goes.',
      storyBody: `You can feel the draft by the back door. You know the upstairs is ten degrees hotter than downstairs. But you don't know which problems cost you $40 a month and which ones cost $400. That's what an audit answers -- with diagnostic equipment that sees what you can't: air leaks behind walls, duct losses in the attic, insulation gaps that have been there since the house was built. You walk away with a prioritized fix list ranked by savings, not guesswork.`,
      highlights: [
        {
          title: 'Blower door testing reveals hidden air leaks',
          body: `A blower door depressurizes your home and measures exactly how much air escapes and where -- around outlets, plumbing, attic hatches, and penetrations you'd never find by feel.`,
        },
        {
          title: `Thermal imaging shows what's missing behind walls`,
          body: 'An infrared camera maps temperature differences across every wall and ceiling. Missing insulation, moisture problems, and thermal bridges light up on screen -- no guessing, no tearing open drywall.',
        },
        {
          title: 'Duct leakage testing catches hidden HVAC losses',
          body: 'In many Texas homes, 20-30% of the conditioned air your system produces never reaches your rooms. Duct testing measures exactly how much escapes and where, usually in the attic.',
        },
      ],
      steps: [
        {
          title: 'Gather 12 months of electric bills and schedule your audit',
          body: `Your billing history helps the auditor understand your home's performance compared to similar houses in your area. Bring notes about any comfort issues too (hot rooms, drafts, humidity) so testing focuses on what matters most.`,
        },
        {
          title: 'Blower door depressurization, infrared scan, and duct leakage test',
          body: `The blower door pulls air out of the house to measure total leakage in CFM50. An infrared camera maps temperature differences on every wall and ceiling -- exposing missing insulation, moisture, and thermal bridges you'd never spot visually. Duct testing measures how much conditioned air leaks before it reaches your rooms.`,
        },
        {
          title: 'Receive a dollar-ranked fix list with payback timelines',
          body: 'Each recommendation shows you the cost, annual savings, and payback period. Air sealing might pay back in 8 months. A duct repair might save $600 per year. You choose what to tackle first based on real numbers.',
        },
      ],
      faq: [
        {
          question: 'Do I need an energy audit before solar?',
          answer: `Not always, but it's smart when bills are high and the house has obvious comfort issues. Fixing waste first means you can size a smaller, cheaper solar system -- and stop overpaying in the meantime.`,
        },
        {
          question: 'Will an audit actually save me money?',
          answer:
            'Homeowners who follow the top 2-3 recommendations usually see energy bill reductions of 15-30%. Most audits pay for themselves within the first year through the savings you get from making fixes.',
        },
      ],
    },
  },
  {
    slug: 'insulation-and-air-sealing',
    title: 'Insulation and Air Sealing',
    icon: 'insulation',
    menuDescription: 'Close the air leaks that drive up your electric bill.',
    eyebrow: 'Keep conditioned air inside',
    subtitleLabel: 'Best when',
    subtitleValue: 'Rooms run hot, your AC never stops, or your attic is underinsulated',
    body: 'Most high electric bills come from air leaks and thin insulation, not a bad AC. Sealing gaps and adding insulation lets your system work less for the same comfort.',
    image: {
      urls: { regular: '/assets/services/photos/insulation-air-sealing.jpg' },
      alt: 'Residential attic space with reflective insulation installed',
    },
    detail: {
      heroEyebrow: 'Efficiency upgrades',
      heroBody: `Texas heat wins if your attic insulation is thin or settled, and your house has air leaks at every gap. You'll be paying to cool the outdoors. Proper insulation and air sealing change that equation directly.`,
      storyTitle: 'Your AC works fine, but your house envelope is the problem.',
      storyBody:
        'Hot attic air leaks down through gaps around light fixtures, plumbing stacks, and the attic hatch. Outside air leaks in around outlets, windows, and where framing meets the foundation. Your AC runs constantly to compensate. Air sealing closes these leaks first. Then blown-in insulation fills around wires, pipes, and joists for even coverage. The result: rooms stay more consistent, your system runs less, and the thermostat stays where you set it.',
      highlights: [
        {
          title: 'Attic air sealing plugs the biggest leaks first',
          body: 'Before any insulation goes in, every hole in your attic floor gets sealed: wiring holes, plumbing stacks, recessed lights, top plates. These are the main routes where hot attic air leaks into your living space.',
        },
        {
          title: 'Blown-in insulation fills every gap evenly',
          body: `Blown-in insulation fills around wires, pipes, and joists completely. Batts leave gaps and sag over time. Blown-in handles the tight spots batts can't reach.`,
        },
        {
          title: 'Rooms stay more consistent in temperature',
          body: 'Rooms that were five to ten degrees hotter or cooler than the rest of the house even out. Your system runs less, your bill drops, and you stop making constant thermostat adjustments.',
        },
      ],
      steps: [
        {
          title: 'Measure existing R-value and map every air leakage path',
          body: 'We measure your current insulation depth and condition, then use a blower door to find where air escapes: top plates, wiring holes, plumbing chases, recessed lights, the attic hatch. Comparing what you have to what your climate zone needs (R-38 to R-60) tells us what work is necessary.',
        },
        {
          title: 'Seal the attic floor before any insulation goes in',
          body: `Every hole gets sealed with fire-rated caulk or spray foam: wiring holes, plumbing stacks, HVAC chases, top plates, recessed lights. Most contractors skip this step because it's slow and unseen. But it's the critical step. Insulation doesn't block air movement; it only slows heat. You have to seal the holes first.`,
        },
        {
          title: 'Blow insulation to target depth and retest with a blower door',
          body: 'Blown-in cellulose or fiberglass fills around every wire, pipe, and joist completely. Depth markers confirm the thickness. A final blower door test shows whether the air sealing reached its target. You see the before and after numbers side by side.',
        },
      ],
      faq: [
        {
          question: 'Can insulation lower my bill without replacing HVAC?',
          answer:
            'In many homes the building envelope makes the system work harder than necessary. Tightening the shell reduces how hard the system has to work and often improves comfort before you consider any equipment changes.',
        },
        {
          question: 'How much will this actually save?',
          answer:
            'Most homeowners see 15-25% lower heating and cooling costs after proper insulation and air sealing. In a Texas summer with $300+ electric bills, that matters.',
        },
      ],
    },
  },
  {
    slug: 'duct-sealing',
    title: 'Duct Sealing',
    icon: 'ducts',
    menuDescription: 'Stop losing cooled air before it reaches your rooms.',
    eyebrow: 'Fix hidden HVAC losses',
    subtitleLabel: 'Best when',
    subtitleValue: 'Some rooms never cool down or the system runs constantly',
    body: `If your ducts leak in a 140-degree attic, you're paying to cool space you never use. Duct sealing closes those gaps so the air reaches your rooms.`,
    image: {
      urls: { regular: '/assets/services/photos/duct-sealing.jpg' },
      alt: 'Architectural vent detail representing HVAC airflow and duct performance',
    },
    detail: {
      heroEyebrow: 'HVAC performance',
      heroBody: `Up to 30% of the air your system produces never reaches your rooms. It leaks at joints, connections, and gaps, usually into your attic where it doesn't help your comfort but definitely affects your bill.`,
      storyTitle: `The cold air you're paying for is going into your attic.`,
      storyBody: `You set the thermostat to 72, but the bedroom reads 78. The kitchen is fine, but the living room won't cool down. Before you blame the AC, look at the delivery system. Every loose joint, torn flex duct, and disconnected boot is a hole where cold air escapes into 140-degree heat. Those leaks also pull hot attic air and dust into your supply. Duct sealing with mastic and metallic tape closes those gaps. A before and after pressure test proves the improvement.`,
      highlights: [
        {
          title: `Pressurized testing shows exactly how much air you're losing`,
          body: 'A duct blaster test measures total leakage. Most homes test at 20-30% leakage. After sealing, that drops below 10%. You see the before and after numbers side by side.',
        },
        {
          title: 'Joint and connection sealing targets the worst leaks',
          body: 'The biggest losses happen where duct sections meet boots, plenums, and branch lines. Mastic sealant and metallic tape at these connections stop the majority of air loss in one pass.',
        },
        {
          title: 'Better airflow means more even temperatures',
          body: 'That back bedroom that never cools down is probably at the end of a duct run with leaks upstream stealing its air. Seal those leaks and airflow rebalances. No new equipment needed.',
        },
      ],
      steps: [
        {
          title: 'Pressurize the duct system and measure total leakage in CFM',
          body: 'A duct blaster test seals your registers and pressurizes the duct system to measure how much air escapes before reaching your rooms. Most Texas homes test at 20-30% leakage. This baseline tells us how bad the problem is and where to focus.',
        },
        {
          title: 'Seal every joint, boot, and connection with mastic -- not duct tape',
          body: `Mastic sealant and UL-rated metallic tape seal every joint where duct sections meet boots, plenums, and branch lines. Crushed flex gets reshaped or replaced. Disconnected runs get reconnected. Standard duct tape dries out and fails in 140-degree Texas attics within two years, which is why we don't use it.`,
        },
        {
          title: 'Retest to confirm leakage dropped below 10% and check every register',
          body: 'The duct blaster runs again so you see the improvement in numbers. Then we measure airflow at each register to confirm air reaches every room. That back bedroom should be getting its full CFM now.',
        },
      ],
      faq: [
        {
          question: 'Can duct sealing really lower energy use?',
          answer:
            'Yes. If conditioned air is lost before it reaches your rooms, the system runs longer to compensate. Sealing cuts that waste and often makes the house noticeably more comfortable the same day.',
        },
        {
          question: `Is this worth doing if I'm replacing my AC soon?`,
          answer: `Sealed ducts let you buy a smaller, less expensive system because it doesn't have to overcome duct losses. It's one of the best things to do before a new HVAC install.`,
        },
      ],
    },
  },
  {
    slug: 'window-replacement',
    title: 'Window & Door Replacement',
    icon: 'windows',
    menuDescription: 'Replace the windows that are letting Texas heat pour in.',
    eyebrow: 'Reduce heat gain and loss',
    subtitleLabel: 'Best when',
    subtitleValue: 'You feel the heat radiating through the glass every afternoon',
    body: `Single-pane and aging windows let Texas heat pour in and make your AC work overtime. Low-E, double-pane replacements cut heat gain and reduce UV damage.`,
    image: {
      urls: { regular: '/assets/services/photos/window-replacement.jpg' },
      alt: 'Crew installing new residential windows on a house exterior',
    },
    detail: {
      heroEyebrow: 'Envelope upgrades',
      heroBody: `Windows are the weakest link in your home's thermal envelope. Single-pane and aging double-pane windows let heat pour in and UV rays damage your floors and furniture. Your AC runs extra hard to compensate. The right replacements change all that.`,
      storyTitle: 'Your old windows are working against your AC.',
      storyBody:
        'Every BTU of heat through your windows is a BTU your AC has to remove. Older double-pane windows with failed seals (fog between the glass) have lost most of their insulation. Low-E coated, argon-filled replacements cut heat gain significantly. Proper installation eliminates the drafts old windows are known for. Your rooms stay cooler, your system runs less, and your floors stop fading from UV.',
      highlights: [
        {
          title: 'Low-E coating blocks heat without blocking light',
          body: 'Low-emissivity coatings reflect infrared heat back outside while letting visible light through. Bright rooms without the greenhouse effect.',
        },
        {
          title: 'Proper installation eliminates air leaks around frames',
          body: 'A good window installed badly still leaks. Professional installation includes shimming, insulation, and sealing around every frame to eliminate drafts.',
        },
        {
          title: `Noise reduction that's obvious immediately`,
          body: `Double-pane windows with gas fill reduce exterior noise. If you live near a busy road, you'll notice the difference the first night.`,
        },
      ],
      steps: [
        {
          title: 'Measure every opening and check framing for rot or damage',
          body: 'Width, height, depth, and squareness determine whether you need an insert (pocket) install or a full-frame replacement. Insert windows fit inside an existing sound frame. Full-frame goes to the studs for a tighter seal but costs more. We check your framing condition and recommend what makes sense.',
        },
        {
          title: `Match glass specs to each wall's sun exposure`,
          body: 'South and west-facing windows in Texas take intense afternoon heat. They need a lower solar heat gain coefficient (SHGC) than north-facing windows. We specify Low-E coatings, gas fill, and frame materials based on which direction each window faces, how much shade it gets, and your actual cooling load.',
        },
        {
          title: 'Install with proper flashing, insulate the rough opening, and test',
          body: 'Old windows come out, new ones are shimmed level. The rough opening gets sealed with low-expansion foam. Full-frame replacements use flashing tape for proper water management (head and jambs sealed, sill left to drain). Every window gets operation-checked before we leave.',
        },
      ],
      faq: [
        {
          question: 'Will new windows solve high energy bills by themselves?',
          answer: `They help, but they're just one part of the envelope. Most homeowners see 12-25% cooling savings. The biggest payoff comes when windows are done with insulation and air sealing.`,
        },
        {
          question: 'Can I replace windows one room at a time?',
          answer:
            'Yes. Many homeowners start with the rooms that get the most sun or have the worst comfort problems. We help you prioritize which windows give you the biggest return first.',
        },
      ],
    },
  },
  {
    slug: 'heat-pump-upgrades',
    title: 'Heat Pump Upgrades',
    icon: 'heatpump',
    menuDescription: 'One system heats and cools, using much less energy.',
    eyebrow: 'Modernize heating and cooling',
    subtitleLabel: 'Best when',
    subtitleValue: `Your AC and furnace are old, expensive, or can't keep up`,
    body: 'A heat pump replaces both your AC and furnace by moving heat instead of generating it, so it uses 2-3x less energy. Texas winters are mild enough that heat pumps handle them easily.',
    image: {
      urls: { regular: '/assets/services/photos/heat-pump-upgrades.jpg' },
      alt: 'Residential outdoor heat pump unit mounted beside a home',
    },
    detail: {
      heroEyebrow: 'Equipment planning',
      heroBody: `A heat pump handles heating and cooling but uses significantly less energy. For Texas homeowners with high summer bills and mild winters, it's one of the best comfort investments you can make.`,
      storyTitle: `One system does both, for a fraction of what you're paying now.`,
      storyBody:
        'You probably have a furnace for winter and an AC for summer: two separate systems, neither very efficient. A heat pump replaces both. In summer it removes heat; in winter it adds heat from outside. Because it moves heat instead of generating it, it uses 2-3x less energy. With federal tax credits and utility rebates, the payback time is quick.',
      highlights: [
        {
          title: '2-3x more efficient than traditional furnaces',
          body: `A gas furnace burns fuel to make heat. A heat pump moves heat with electricity, so it's much more efficient. The difference shows on every bill.`,
        },
        {
          title: 'Federal tax credits and utility rebates available',
          body: 'The Inflation Reduction Act offers up to $2,000 in tax credits for qualifying installations. Texas utilities often add rebates on top. We help you identify every incentive you qualify for.',
        },
        {
          title: 'Variable-speed models reduce temperature swings',
          body: 'Modern variable-speed heat pumps adjust output continuously instead of cycling on and off, so temperatures stay more consistent and humidity is better managed.',
        },
      ],
      steps: [
        {
          title: 'Run a Manual J load calculation to size the system to your actual house',
          body: `Square footage alone doesn't determine the right system. Insulation, window area, orientation, duct condition, and occupancy all matter. A Manual J calculation accounts for all of it and gives a precise BTU load. An oversized system short-cycles and wears out early.`,
        },
        {
          title: 'Remove old furnace and AC, install heat pump with proper refrigerant line sizing',
          body: 'Old equipment comes out. The new heat pump outdoor unit and air handler go in per manufacturer spec. Refrigerant lines are properly brazed, ductwork adjusted, and wiring done to code.',
        },
        {
          title: 'Commission the system: verify charge, measure static pressure, check every register',
          body: 'Refrigerant charge is verified using superheat and subcooling, not just pressure. Static pressure is measured to confirm the duct system works with the new equipment. Airflow is checked at every register. We program the thermostat and walk you through the tax credit process.',
        },
      ],
      faq: [
        {
          question: 'Do heat pumps work in Texas winters?',
          answer:
            'Texas is actually the ideal climate for heat pumps. Modern models work well in cold weather, and Texas rarely gets very cold. No backup heat is needed.',
        },
        {
          question: 'How much will I save on energy bills?',
          answer: `Most Texas homeowners switching from a standard AC/furnace combo see 20-40% savings on heating and 10-15% on cooling. The exact number depends on your current system's age.`,
        },
      ],
    },
  },
  {
    slug: 'solar-and-battery-installations',
    title: 'Solar and Battery Installations',
    icon: 'solarbattery',
    menuDescription: 'Generate your own power and take control of your electric bill.',
    eyebrow: 'Generate and store power',
    subtitleLabel: 'Best when',
    subtitleValue: `You're ready to control your energy bill long-term`,
    body: 'Solar panels turn your roof into a power source, and a battery keeps critical systems running when the grid goes down. The 30% federal tax credit covers about a third of the installed cost.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
      },
      alt: 'Solar array installation under a bright sky',
    },
    detail: {
      heroEyebrow: 'Solar planning',
      heroBody: `After grid failures in 2021 and blackouts since, Texas homeowners learned the grid isn't always reliable. Solar and battery storage let you generate your own power, lower your bill, and keep critical systems running during outages.`,
      storyTitle: `Your roof is already collecting energy. You're just not using it.`,
      storyBody:
        'That sunlight turns into heat your AC has to fight. Solar panels convert it into electricity instead. Add a battery for backup power with no fuel, noise, or maintenance. Panels cost 70% less than ten years ago. The federal tax credit covers 30%. We design your system around your real bills, not estimates.',
      highlights: [
        {
          title: 'Custom system design based on your actual usage',
          body: 'Panel count, battery size, and inverter capacity match how your household actually uses energy. No generic designs.',
        },
        {
          title: '30% federal tax credit on total installed cost',
          body: 'The credit covers 30% of everything: panels, batteries, inverter, wiring, labor, and permits. Dollar-for-dollar federal tax credit.',
        },
        {
          title: 'Battery backup keeps critical systems running',
          body: 'When the grid goes down, your battery powers critical systems automatically. No switch to flip, no generator to start.',
        },
      ],
      steps: [
        {
          title: 'Pull your utility data, run a shade analysis, and assess roof condition',
          body: 'We analyze 12 months of usage to size the system to your actual consumption -- not a generic estimate. A shade study maps shadow patterns from trees, chimneys, and neighboring structures across every hour and season. Roof age, material, orientation, pitch, and structural condition all have to check out before we design anything.',
        },
        {
          title: 'Custom system design, financing options, permits, and utility interconnection',
          body: `Your proposal includes panel count, inverter type, battery sizing (if applicable), projected savings, and payback timeline with and without the 30% federal tax credit. We handle building permits, electrical permits, and the utility interconnection application -- that's typically 2-4 weeks of paperwork you never have to touch.`,
        },
        {
          title: 'Install in 1-2 days, pass city inspection, and activate with live monitoring',
          body: `Panels, racking, inverter, and battery go on your roof and wall. After city inspection and utility permission to operate (PTO), the system goes live. We set up your monitoring app so you see production in real time -- and we verify the first week's output against the design model to make sure everything performs as promised.`,
        },
      ],
      faq: [
        {
          question: 'How do solar panels actually generate electricity?',
          answer: 'Solar cells convert sunlight into DC electricity. An inverter converts that to AC, which is what your home uses. Whatever you produce offsets what you pull from the grid, and your meter tracks the difference.',
        },
        {
          question: 'How long do solar panels last?',
          answer: 'Most panels are warrantied for 25 years and continue producing past that. Production drops slowly over time -- expect about 85-90% of original output at year 25. Inverters typically need replacing once in that span.',
        },
        {
          question: 'Do panels still produce on cloudy days?',
          answer: 'Yes. Output drops on overcast days but panels still generate. Your system is sized based on annual production, which accounts for weather patterns across the year.',
        },
        {
          question: 'How much does a solar system cost in Texas?',
          answer: 'A typical residential system runs $15,000-30,000 before the 30% federal tax credit. After the credit, most systems land at $10,500-21,000. Battery adds $8,000-15,000 depending on capacity. Your proposal breaks down every line item.',
        },
        {
          question: 'Can I finance solar with no money down?',
          answer: 'Yes. Most solar loans start at $0 down. But watch the dealer fee -- some lenders bake 15-30% into the loan balance. We show you the total cost of each financing option so you can compare.',
        },
        {
          question: 'Does a solar loan put a lien on my home?',
          answer: 'No. Solar lenders file a UCC-1 fixture filing on the panels, not a lien on your property. If you sell, the loan transfers or gets paid off at closing.',
        },
        {
          question: 'What does the install process look like?',
          answer: 'Consultation, site survey, system design, permitting, installation (1-2 days), city inspection, then utility permission to operate. Start to finish is typically 6-10 weeks, with most of that waiting on permits and utility paperwork.',
        },
        {
          question: 'How long from signing to system on?',
          answer: 'Usually 6-10 weeks. The install itself takes 1-2 days. The rest is permits, engineering, and waiting for your utility to approve interconnection. We handle all of it.',
        },
        {
          question: 'I have an HOA -- can I still go solar?',
          answer: 'Texas law protects your right to install solar. HOAs can set reasonable rules about placement but cannot prohibit it. We handle the paperwork and architectural review submissions.',
        },
        {
          question: 'What does a battery actually do during an outage?',
          answer: 'When the grid goes down, your battery automatically disconnects from the grid and powers critical circuits -- typically refrigerator, lights, Wi-Fi, and a few outlets. How long it lasts depends on battery size and what you run.',
        },
        {
          question: 'Do I need a battery for solar to work?',
          answer: 'No. Most residential systems are grid-tied and work without a battery. You export excess power during the day and pull from the grid at night. A battery adds backup power and can improve economics depending on your rate plan.',
        },
        {
          question: 'What are critter guards and do I need them?',
          answer: 'Critter guards are mesh screens that seal the gap between your panels and roof. Rats, squirrels, and birds nest under panels and chew wiring. If you have tree cover or wildlife in the area, they pay for themselves fast.',
        },
        {
          question: 'How often should panels be inspected?',
          answer: 'Once or twice a year. Most issues show up in your monitoring app as production drops. A visual check for debris, cracked glass, or critter damage takes care of the rest.',
        },
        {
          question: 'What can actually damage solar panels?',
          answer: 'Hail (large enough to crack the glass), fallen branches, rodents chewing wiring, and in rare cases, installer error. Panels are tougher than they look -- rated for 1-inch hail at 50+ mph -- but Texas storms can exceed that.',
        },
        {
          question: 'Do I need a new roof before going solar?',
          answer: `If your roof has less than 10 years of life left, do the roof first. Putting panels on a roof that needs replacing soon means paying to remove and reinstall them later. We'll give you an honest answer on timing.`,
        },
        {
          question: 'What is the federal solar tax credit?',
          answer: 'A 30% dollar-for-dollar federal tax credit on total installed cost -- panels, battery, inverter, wiring, labor, and permits. You claim it when you file taxes for the year the system was installed.',
        },
        {
          question: 'Do I get incentives if I lease instead of buy?',
          answer: 'No. The federal tax credit and other incentives go to the system owner. If you lease, the leasing company gets them. Ownership is almost always better financially if you can finance or pay cash.',
        },
        {
          question: 'What are solar buyback programs?',
          answer: 'Many Texas utilities buy excess electricity your system sends to the grid. Rates and terms vary by provider -- some pay retail, some pay wholesale, some give bill credits. We help you understand what your specific utility offers before you sign.',
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
    menuDescription: 'The most common Texas roof, done correctly.',
    body: 'Architectural shingles handle Texas heat, hail, and wind when installed correctly. Full tear-off, deck inspection, ice-and-water shield, and correct nail patterns mean the difference between 30 years and leaks in 5.',
    image: {
      urls: {
        regular:
          '/images/closeup-shingle-roof-bright-sky-showcasing-texture-alignment-shingles-symbolizing-durability-protection.jpg',
      },
      alt: 'Close-up of weathered roof shingles and eaves',
    },
    detail: {
      heroEyebrow: 'Roofing',
      heroBody:
        'A shingle roof is only as good as the crew that installs it. Proper deck prep, correct nail patterns, sealed valleys, and correct underlayment mean the difference between decades of service and early failure.',
      actions: [
        { label: 'Request a consultation', href: '#consultation', variant: 'default' },
        { label: 'View all services', href: '/services', variant: 'ghost' },
      ],
      storyTitle: `Your roof is your home's first defense. Shortcuts cut its life short.`,
      storyBody: `Texas throws everything at your roof: heat, hail, straight-line winds, and rain. Architectural shingles handle it all when installed correctly. That means full tear-off, damaged decking replaced (not covered), ice-and-water shield in valleys and eaves, and starter strips per spec. We don't layer over old roofs.`,
      highlights: [
        {
          title: 'Full tear-off with deck inspection (no layovers)',
          body: 'We remove the old roof to inspect the entire deck. Damaged or rotted plywood gets replaced first. Layering over old shingles hides problems and voids warranties.',
        },
        {
          title: 'Ice-and-water shield in critical areas',
          body: `Self-adhering membrane goes at eaves, valleys, and penetrations (where water damage starts). Most contractors skip it. We don't.`,
        },
        {
          title: 'Manufacturer-certified installation protects your warranty',
          body: `Shingle warranties have installation requirements. If your contractor doesn't follow them, the warranty is worthless. Certified installation means the manufacturer backs both materials and labor.`,
        },
      ],
      steps: [
        {
          title: 'Inspect existing layers, choose your shingles, and pull permits',
          body: 'We check for existing layers (Texas code limits them), assess deck condition, and document damage. You pick the shingle style, color, wind rating, and impact resistance. We pull permits and schedule your install.',
        },
        {
          title: 'Full tear-off, replace damaged decking, then underlayment and flashing',
          body: 'Every old shingle comes off (no layovers). We inspect the deck piece by piece. Rotten OSB gets replaced. Ice-and-water shield goes at eaves, valleys, and penetrations. Synthetic underlayment covers everything. Drip edge and step flashing get installed before any shingles.',
        },
        {
          title: 'Install to manufacturer nail pattern, finish ridge ventilation, and magnetic sweep',
          body: `Shingles go on with the manufacturer's required nail count and spacing. Starter strips at eaves and rakes. Ridge cap with ventilation to manage attic heat. We inspect every section, use a rolling magnet for stray nails, haul debris, and walk the job with you.`,
        },
      ],
      faq: [
        {
          question: 'How long does a shingle roof last in Texas?',
          answer:
            'Architectural shingles typically last 25-30 years with proper installation and attic ventilation. Texas heat and hail shorten that life if the install is poor or ventilation is bad.',
        },
        {
          question: 'What about the nails in my yard?',
          answer:
            'We use tarps during tear-off and run a rolling magnet across your entire yard and driveway after the job. We take nail cleanup seriously.',
        },
      ],
    },
  },
  {
    slug: 'metal-roofing',
    title: 'Metal Roofing',
    icon: 'metalroofing',
    menuDescription: 'A 50-year roof that handles Texas weather better than anything else.',
    body: 'Metal roofs last 2-3x longer than shingles, reflect solar heat to lower cooling, and stand up to wind and hail that would destroy a standard roof. Higher upfront cost, but much lower over the life of your home.',
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
        'A metal roof is often the last roof a Texas homeowner ever installs. It handles 140 mph winds, sheds hail that would destroy shingles, reflects heat to cut cooling costs, and lasts 40-70 years with minimal upkeep.',
      storyTitle: 'Install once, be done.',
      storyBody: `You can replace your shingle roof every 20-25 years and spend $30K+ over your home's life. Or install metal once and be done. Standing seam panels interlock to resist wind, and metal handles hail that cracks shingles. A reflective coating reduces surface temperature by up to 100 degrees versus dark asphalt, which means 10-25% cooling savings. The upfront cost is higher. The lifetime cost isn't even close.`,
      highlights: [
        {
          title: '40-70 year lifespan versus 25 for shingles',
          body: `Metal doesn't crack, curl, or lose granules. It doesn't rot or grow algae. One metal roof outlasts two or three shingle roofs.`,
        },
        {
          title: 'Reflects solar heat to lower cooling costs',
          body: 'A metal roof with reflective coating reduces surface temperature by up to 100 degrees versus dark asphalt shingles. That means 10-25% cooling savings in Texas summers.',
        },
        {
          title: 'Wind rated for 140+ mph',
          body: 'Standing seam panels interlock and are mechanically attached to resist extreme wind. Shingle tabs tear off in storms. Metal stays locked.',
        },
      ],
      steps: [
        {
          title: 'Verify roof structure for the weight, take measurements for custom panel fabrication',
          body: 'Metal panels are fabricated to the exact length of your roof (no field splices). We verify your framing and decking can handle the weight, take precise measurements, and discuss profiles, gauges, and coatings that resist fading for decades.',
        },
        {
          title: 'Tear off, install high-temp underlayment, and bend custom flashing for every detail',
          body: 'Old roof comes off. High-temp synthetic underlayment rated for metal covers the entire deck. Custom-bent flashing goes at eaves, rakes, valleys, walls, and penetrations. Metal roofing depends on its flashing. A bad valley or wall tie-in will leak no matter how good the panels are.',
        },
        {
          title: 'Install panels eave-to-ridge with thermal expansion clips and test every seam',
          body: 'Standing seam panels attach with concealed clips that allow thermal movement (metal expands and contracts in Texas heat). Panels run full length to minimize seams. Ridge caps, gable trim, and transition flashing complete the system. Every clip, seam, and fastener gets inspected.',
        },
      ],
      faq: [
        {
          question: 'Is a metal roof loud when it rains?',
          answer:
            'No -- not with proper installation. Metal over solid decking with underlayment is no louder than shingles. The "loud metal roof" reputation comes from barns and sheds with no decking underneath.',
        },
        {
          question: 'How much more does metal cost than shingles?',
          answer:
            'Typically 2-3x more upfront. But it lasts 2-3x longer and saves on cooling every year. When you calculate cost per year of service, metal is usually cheaper over time.',
        },
      ],
    },
  },
  {
    slug: 'storm-damage-restoration',
    title: 'Storm Damage Restoration',
    icon: 'stormdamage',
    menuDescription: 'Navigate insurance and restore your roof correctly after a storm.',
    body: `When a storm hits, you need someone who documents damage the way insurance expects, meets the adjuster on your roof, and makes sure the estimate reflects the work your home actually needs.`,
    image: {
      urls: {
        regular: '/images/storm-damage.jpg',
      },
      alt: 'Storm-damaged structure with torn metal roofing',
    },
    detail: {
      heroEyebrow: 'Storm response',
      heroBody:
        'Storm damage starts a process most homeowners have never done: documentation, claims, adjuster meetings, and restoration. We handle all of it from first inspection through final paperwork so you get the full restoration your policy covers.',
      storyTitle: 'Your insurance covers it, but only if you do it right.',
      storyBody: `A hailstorm hits. You see shingles in the yard. You call insurance. That's where most homeowners get stuck. The adjuster writes an estimate. The roofer says it is not enough. You're caught in the middle. We document damage the way adjusters expect, meet them on your roof, and make sure the estimate reflects what is actually damaged. You choose your contractor. We don't ask you to pay out of pocket for covered work.`,
      highlights: [
        {
          title: 'Free inspection within 48 hours',
          body: 'After a storm, timing matters. We get on your roof fast to assess and document before damage worsens. The inspection is free and comes with a report you can use whether you hire us or not.',
        },
        {
          title: 'Insurance documentation that holds up',
          body: 'We photograph and document every point of damage using the same methods and terminology adjusters use. Fewer disputes, faster approvals, and a claim that reflects the full repair needs.',
        },
        {
          title: 'We meet your adjuster on the roof',
          body: `Most homeowners don't know what to look for, and adjusters sometimes miss damage. We walk the roof with your adjuster to make sure nothing gets overlooked.`,
        },
      ],
      steps: [
        {
          title: 'We inspect within 48 hours and build documentation that matches what adjusters need',
          body: 'We photograph every impact point, damaged component, and secondary damage (soft metals, AC fins, gutters, siding) with close-ups, reference shots, and measurements. We compile it into a report using the terminology adjusters use. Strong documentation means fewer disputes and faster approvals.',
        },
        {
          title: 'File your claim, and we walk the roof with your adjuster to align the estimate',
          body: `You file the claim with our documentation. When the adjuster comes out, we're on the roof pointing out every damaged item because adjusters sometimes miss damage. If their estimate doesn't cover what's actually damaged, we help identify it so you can request a supplement.`,
        },
        {
          title: 'Restore the approved work, file supplements for hidden damage, and close out the claim',
          body: `Work proceeds per the approved items. If tear-off reveals damage the adjuster couldn't see (rotted decking, wet underlayment, damaged flashing), we document it and file a supplement. Completion photos and receipts go to your carrier so they release the recoverable depreciation. You get a clean close-out.`,
        },
      ],
      faq: [
        {
          question: 'Should I call insurance or a roofer first?',
          answer:
            'Call us first. A professional inspection gives you documented evidence before calling your carrier. Documentation makes the process faster and more likely to cover the full repair work.',
        },
        {
          question: 'Do I have to pay anything out of pocket?',
          answer: `You're responsible for your deductible (that's set by your policy). Any contractor who offers to cover your deductible is breaking the law. We're honest about costs from the start.`,
        },
      ],
    },
  },
  {
    slug: 'detach-and-reset',
    title: 'Detach and Reset',
    icon: 'detachreset',
    menuDescription: 'Remove and reinstall solar when your roof needs work.',
    body: 'Have solar but need a new roof? We remove, label, store, and reinstall your system with fresh flashings and verified production so your equipment and warranty stay intact.',
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1624397640148-949b1732bb0a?q=80&w=3174&auto=format&fit=crop',
      },
      alt: 'Solar panels installed on a residential roof before roofing coordination work',
    },
    detail: {
      heroEyebrow: 'Solar coordination',
      heroBody:
        'Reroofing with solar on top requires specialized handling. Improper removal and reinstall voids warranties, damages equipment, and creates safety hazards. We coordinate the process so the roof, panels, and insurance claim stay aligned.',
      storyTitle: `The real risk isn't removing panels. It's letting the roofing, solar, and insurance plan drift apart.`,
      storyBody:
        'Homeowners get stuck when the roofer, solar company, and carrier all assume someone else handles the solar. A proper detach-and-reset clarifies sequencing: certified technicians remove the system, document condition, store it safely, and reinstall with fresh flashings and verified connections. Your panels and warranty stay intact.',
      highlights: [
        {
          title: 'Certified solar removal protects your warranty',
          body: 'Most panel warranties require authorized handling. Using unqualified crew voids coverage. Our technicians are manufacturer-certified.',
        },
        {
          title: 'Insurance coordination from day one',
          body: `Detach-and-reset costs, roofing work, and storm documentation should be aligned early. We make sure the solar side isn't left out of the claim.`,
        },
        {
          title: 'Equipment condition documented before and after',
          body: 'Racking, wiring, and panel condition are checked during removal so any damaged components are identified before reinstall, not after the system goes back up.',
        },
      ],
      steps: [
        {
          title: 'Coordinate roof work and solar removal timing so both crews stay aligned',
          body: 'Before anything comes off, we settle whether the roof needs patch or full replacement, confirm insurance covers detach-and-reset if applicable, and lock in timing. Panels come off before roofing starts.',
        },
        {
          title:
            'De-energize using proper shutdown sequence, remove panels one at a time, label and map every position',
          body: 'Inverter shuts down first, then wiring disconnects at the inverter, then the grid interconnect, then each panel. Every panel is labeled with its position, orientation, and serial number. Wiring diagrams and racking layout are photographed. Panels are stored flat and protected.',
        },
        {
          title:
            'Reinstall on new flashings, test every circuit, and verify production matches the pre-removal baseline',
          body: `Old flashing boots never get reused on a new roof. Every penetration gets fresh flashings, new bolts torqued to spec, and proper sealant. Panels go back in original positions. We test every string and compare first week's production against the baseline.`,
        },
      ],
      faq: [
        {
          question: 'Can my roofer just work around the panels?',
          answer: `No, not if you want the roof done right. Roofers can't properly install underlayment, flashing, or shingles around mounted panels. Panels have to come off.`,
        },
        {
          question: 'Does insurance ever cover detach and reset?',
          answer:
            'Sometimes, especially with storm damage. But coverage depends on your policy and claim estimate, which is why the solar side should be discussed early, not after the roof work starts.',
        },
        {
          question: 'What if a panel or component is damaged?',
          answer:
            'That gets identified during removal and inspection. If equipment is damaged, you get a clear recommendation on repair or replacement before reinstall -- not a surprise after the system goes back up.',
        },
      ],
    },
  },
  {
    slug: 'commercial-roofing',
    title: 'Commercial Roofing',
    icon: 'commercialroofing',
    menuDescription: 'Flat and low-slope roof systems for Texas businesses.',
    body: 'Commercial roofs face different challenges: larger spans, flat designs, rooftop equipment, and the need to keep your business running during work. We handle it with phased scheduling, permits, and warranties.',
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
        'A leaking commercial roof disrupts operations, threatens inventory, and puts employees at risk. We handle it from inspection through warranty with phased scheduling that keeps your doors open.',
      storyTitle: 'Commercial roofs need a different approach than residential.',
      storyBody:
        'Flat and low-slope systems need proper drainage, careful detailing around rooftop equipment, and phased scheduling. We work with TPO, EPDM, modified bitumen, and metal depending on what your building needs. We coordinate around your business hours.',
      highlights: [
        {
          title: 'Drainage and ponding designed out',
          body: 'Ponding water is the enemy of commercial roofs. We design systems with proper slope, drains, and scupper details that move water off.',
        },
        {
          title: 'Phased installation keeps your business open',
          body: `We don't tear off the entire roof at once. Work gets phased in sections so your building stays protected and operations keep running.`,
        },
        {
          title: 'Manufacturer warranties up to 30 years',
          body: 'Certified installation means your warranty covers both materials and labor, not just materials from uncertified installers.',
        },
      ],
      steps: [
        {
          title: 'Infrared scan for moisture, core cuts to confirm, and a full condition report',
          body: 'Infrared survey identifies wet zones on the roof. Core cuts physically confirm moisture levels. You get a condition report with CAD drawings showing where the membrane, insulation, flashings, and drainage are failing, plus a clear repair or replace recommendation.',
        },
        {
          title: 'Spec the right membrane system and build a phased schedule around your operations',
          body: 'We choose TPO, EPDM, modified bitumen, or metal based on your roof slope, traffic, equipment loads, and budget. We detail every penetration and phase the work so your building stays protected. Noisy work gets scheduled around your hours.',
        },
        {
          title:
            'Install with welded seams, test every seam, and deliver manufacturer warranty documentation',
          body: 'TPO seams are heat-welded at 500-600 degrees and probed for voids the same day. Test welds verify proper width and adhesion. Everything goes in per spec. City inspection and manufacturer verification confirm the work. You get full warranty documentation and a maintenance schedule to keep coverage valid.',
        },
      ],
      faq: [
        {
          question: 'Can the work be done while my business is open?',
          answer:
            'In most cases, yes. We phase the work around your operations. Some noise is unavoidable, but we schedule the loudest work during off-hours.',
        },
        {
          question: 'How often should a commercial roof be inspected?',
          answer:
            'Twice a year (spring and fall) plus after major storms. Regular inspections catch small problems before they get expensive. Most warranties require documented maintenance.',
        },
      ],
    },
  },
  {
    slug: 'hail-and-wind-damage-roof-inspection',
    title: 'Hail & Wind Damage Roof Inspection',
    icon: 'hailinspection',
    menuDescription: 'Find out if the last storm damaged your roof before leaks start.',
    body: `Hail damage isn't visible from the ground and gets worse over time. A professional inspection documents what happened before it turns into water damage.`,
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1656646549671-000665d8d8bc?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000',
      },
      alt: 'Aerial view of a residential roof for inspection',
    },
    detail: {
      heroEyebrow: 'Storm inspection',
      heroBody: `Hail doesn't have to punch through your roof to cause serious problems. It cracks shingles, strips granules, and dents flashing, creating entry points for water. A professional inspection catches it early while insurance still covers it.`,
      storyTitle: `The damage you can't see from the ground gets expensive.`,
      storyBody: `Over months after a storm, small hail impacts turn into leaks, rot, mold, and insulation damage that cost far more than the original repair. We inspect your roof, gutters, siding, and exterior, document everything with photos and measurements formatted for adjusters. If it's fine, we tell you. If it needs work, we show you where and why.`,
      highlights: [
        {
          title: 'Ground-to-roof inspection covers everything the storm touched',
          body: 'We check gutters, downspouts, siding, window screens, AC units, and vents because hail hits everything, and collateral damage strengthens your claim.',
        },
        {
          title: 'Close-up documentation formatted for insurance',
          body: 'Every point of damage gets photographed with close-ups and reference shots. Timestamps, measurements, and descriptions included, formatted the way adjusters expect.',
        },
        {
          title: 'Honest assessment, no pressure',
          body: `If your roof is fine, we tell you. If it needs work, we show you where and why. We don't create damage or pressure unnecessary repairs.`,
        },
      ],
      steps: [
        {
          title: 'We confirm storm activity in your area and get on your roof within 48 hours',
          body: 'We check local storm reports to verify hail size and wind speeds before coming out. This context helps the inspection and strengthens any claim. The inspection is free, no obligation.',
        },
        {
          title: 'Ground-to-roof inspection: soft metals first, then test squares on every slope',
          body: 'We start on the ground checking gutters, AC fins, vents, and downspouts for dents. Soft metals show hail impact even when shingles look fine from below. On the roof, we mark test squares on each slope and count every hit: granule displacement, mat bruising, lifted tabs, and crease marks. Eight or more hits per test square usually means replacement.',
        },
        {
          title: 'Detailed photo report with a clear recommendation: file, monitor, or no action',
          body: 'Every damage point is photographed with close-ups and reference shots, timestamped and described using adjuster language. The report distinguishes functional damage (compromised waterproofing) from cosmetic damage. If filing makes sense, we walk you through calling your carrier and meet the adjuster on your roof.',
        },
      ],
      faq: [
        {
          question: 'Is the inspection really free?',
          answer:
            'Completely free, no obligation. We inspect, document, and give you the report. If you file a claim and use us, great. If not, you still have the documentation.',
        },
        {
          question: 'How soon after a storm should I get inspected?',
          answer:
            'As soon as possible. Most Texas policies have a time limit for weather claims, typically one to two years. Waiting lets secondary damage develop.',
        },
      ],
    },
  },
]

export const specialtyServices = [
  {
    slug: 'rodent-deterrent',
    title: 'Rodent Deterrent',
    icon: 'rodent',
    menuDescription: 'Protect solar wiring from pests that chew through it.',
    body: `Rats and squirrels nest under solar arrays and chew through wiring that costs hundreds to replace. Critter guard screening seals the perimeter so pests can't get underneath, preventing repeat service calls.`,
    image: {
      urls: {
        regular:
          'https://images.unsplash.com/photo-1550845621-36e814edfae8?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      alt: 'Close-up of rooftop solar panels',
    },
    detail: {
      heroEyebrow: 'Solar protection',
      heroBody:
        'The gap between your solar panels and roof is the perfect nesting spot for rats, squirrels, and birds. Once in, they chew wiring and create repeat service problems. Critter guard screening stops them before it starts.',
      storyTitle: 'Prevention costs far less than repeat wiring damage.',
      storyBody: `Rodent damage under an array isn't always obvious. Chewed wiring causes intermittent production drops that are expensive to diagnose. Nesting material creates fire risk. Droppings corrode connections. One screening installation prevents all of it and costs far less than one service call for wiring repair.`,
      highlights: [
        {
          title: 'Protect wiring from chewing and nesting damage',
          body: 'The main goal is preventing rodents from reaching the wiring, connectors, and optimizers under your panels. One chewed wire can knock out an entire string.',
        },
        {
          title: 'Eliminate repeat service calls',
          body: 'Proactive screening is a one-time install. Without it, rodent damage becomes a recurring problem, each service call costing more than screening.',
        },
        {
          title: 'Preserve system performance long-term',
          body: 'A clean, sealed array perimeter keeps debris and nesting material from accumulating underneath, protecting both production and roof condition.',
        },
      ],
      steps: [
        {
          title: 'Check for existing nesting, chewed wiring, and measure the panel-to-roof gap',
          body: 'We inspect under the array for droppings, nesting material, chewed wire, and corroded connectors. The gap between your panels and roof (typically 4-8 inches) determines mesh size. If panels need to come up for cleaning or repair, that happens before screening.',
        },
        {
          title: 'Install 19-gauge galvanized mesh using rail-mounted clips -- no screws into panels',
          body: 'PVC-coated galvanized steel mesh gets bent into an L-channel or C-channel shape and clips directly to the mounting rails, never screwed into panel frames (which voids warranty). Corners are bent continuous. Penetrations get cut and stitched. The goal is zero gaps larger than half an inch around the entire perimeter.',
        },
        {
          title: 'Remove any existing nests and debris, verify complete coverage',
          body: 'All nesting material, droppings, and debris are cleaned out before screening seals the perimeter. Every linear foot is checked for attachment and coverage. A typical residential array runs 60-100 linear feet of perimeter. Any opening defeats the purpose.',
        },
      ],
      faq: [
        {
          question: `Is critter guard worth doing if I haven't had problems yet?`,
          answer: `Yes, especially if your area has tree cover or you've seen squirrels or rats on your roof. Prevention is far cheaper than diagnosing wiring damage after it happens.`,
        },
        {
          question: 'Can rodents really damage solar wiring?',
          answer: `Absolutely. Chewed wiring and nesting under panels cause production drops, arc faults, and recurring service calls. It's one of the most common and most preventable solar maintenance issues.`,
        },
      ],
    },
  },
  {
    slug: 'electrical-services',
    title: 'Electrical Services',
    icon: 'electrical',
    menuDescription: 'Electrical panel upgrades and wiring for modern Texas homes.',
    body: `Your home's electrical system wasn't built for heat pumps, EV chargers, and solar. If your panel is maxed out or wiring can't handle modern loads, an upgrade brings your electrical system up to 200 or 400 amps, safely and to code.`,
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
        'Adding solar, a heat pump, or an EV charger to a 100-amp panel creates fire risk and tripped breakers. We bring your electrical system up to code and capacity so your home handles what you need, safely.',
      storyTitle: 'Many upgrades stall because the electrical side was never planned.',
      storyBody: `When your house was built, no one planned for electric cars, heat pumps, or solar. Your 100 or 150-amp panel made sense then. It doesn't now. We replace it with 200A or 400A service, label every circuit, and add arc-fault and ground-fault protection. We handle permits and utility coordination. It's typically one day without power.`,
      highlights: [
        {
          title: 'Panel upgrades from 100A to 200A or 400A',
          body: 'We replace your outdated panel with modern service that gives you capacity for heat pumps, EV chargers, solar, and future upgrades.',
        },
        {
          title: 'Proper permitting and utility coordination',
          body: 'Panel upgrades require permits and city/utility inspections. We handle the entire process and coordinate the power shutoff and reconnection.',
        },
        {
          title: 'Safety upgrades included',
          body: 'Modern panels include arc-fault and ground-fault protection. If your home has a Federal Pacific or Zinsco panel (both fire hazards), replacement is urgent.',
        },
      ],
      steps: [
        {
          title:
            'Evaluate your current panel, calculate total load including planned upgrades, and size the new service',
          body: 'We look at your existing panel capacity (most older Texas homes are 100A or 150A), wiring condition, and all planned loads (solar, EV charger, heat pump). The total determines whether you need 200A or 400A service. Federal Pacific and Zinsco panels are fire hazards regardless of capacity.',
        },
        {
          title: 'Pull permits, coordinate the utility disconnect, and swap the panel in a day',
          body: 'We file permits and coordinate the utility meter pull. The old panel comes out, a new panel goes in with proper grounding and labeling. Arc-fault breakers go on bedrooms and living areas. Ground-fault protection goes on wet locations. The swap typically takes 5-6 hours with power off.',
        },
        {
          title: 'City inspection, utility reconnection, and a full walkthrough of your new panel',
          body: 'The city electrical inspector verifies breaker sizing, grounding, and code compliance. Once approved, the utility reconnects power. We test voltage at every circuit and walk you through the panel: what each breaker controls, how protection works, and what to do if one trips.',
        },
      ],
      faq: [
        {
          question: 'How do I know if I need a panel upgrade?',
          answer: `If you're adding solar, a heat pump, or an EV charger and your panel is 100 amps, you need an upgrade. Other signs: frequent breaker trips, fuses instead of breakers, or a Federal Pacific or Zinsco panel.`,
        },
        {
          question: 'Can I upgrade the panel and add solar at the same time?',
          answer: `Yes, and it's the most efficient. We size the panel for solar from the start so you avoid two separate permitting processes.`,
        },
      ],
    },
  },
  {
    slug: 'car-chargers',
    title: 'Car Chargers',
    icon: 'evcharger',
    menuDescription: 'Charge at home instead of at public stations.',
    body: 'A Level 2 home charger gives you a full battery every morning at a fraction of the cost of public charging. We handle the wiring, permit, and install.',
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
        'Public charging is slow, expensive, and inconvenient. A Level 2 home charger lets you plug in and wake up full. We handle the electrical work, permit, and installation.',
      storyTitle: 'Charge at home like you charge your phone.',
      storyBody: `You don't drive to a gas station to charge your phone. A Level 2 charger uses a 240-volt circuit (like your dryer) and adds 25-30 miles per hour. Plug in after dinner, wake up full. Home electricity in Texas averages 12-14 cents per kWh versus 30-50 cents at public chargers. That's hundreds saved per year. The 30% federal tax credit covers up to $1,000 of installation.`,
      highlights: [
        {
          title: 'Full charge overnight, every night',
          body: 'A Level 2 charger refills a depleted battery overnight. No planning around public stations, no waiting.',
        },
        {
          title: 'Fraction of the cost of public charging',
          body: 'Home electricity runs 12-14 cents per kWh in Texas. Public fast chargers charge 30-50 cents. Charging at home, especially off-peak, saves hundreds per year.',
        },
        {
          title: '30% federal tax credit on installation',
          body: 'The federal government offers a 30% credit (up to $1,000) on residential EV charger installation: labor, parts, and permits.',
        },
      ],
      steps: [
        {
          title:
            'Check panel capacity, calculate the wire run, and determine if a panel upgrade is needed first',
          body: `A Level 2 charger needs a dedicated 240V, 40-50 amp circuit (same voltage as your dryer). We check if your panel has capacity and open breaker slots. For long runs, we upsize wire to prevent voltage drop. If your panel is full or undersized, we'll tell you before any work starts.`,
        },
        {
          title: 'Pull the permit, run a dedicated 240V circuit, and install hardwired or NEMA 14-50',
          body: 'We file the permit, run a dedicated circuit in conduit from your panel to the charger location, install the breaker, and mount the charger. You choose hardwired (more stable) or a NEMA 14-50 outlet (more flexible). Either way, the circuit is dedicated.',
        },
        {
          title:
            'Test charging rate with your actual vehicle, pass city inspection, and set up off-peak scheduling',
          body: 'We plug in your car and verify the expected amperage and 25-30 miles per hour. The city inspector checks the circuit and installation. We walk you through the app, set up off-peak charging, and show you how to file the tax credit.',
        },
      ],
      faq: [
        {
          question: 'Do I need a panel upgrade for an EV charger?',
          answer: `If you have a 200-amp panel with available slots, probably not. If you have a 100-amp panel or it's full, you likely need an upgrade first. We assess it on the first visit.`,
        },
        {
          question: 'What if I want to add solar later?',
          answer: `Great idea: charging your EV with solar means virtually free fuel. We can size the panel for future solar now so you don't redo electrical work later.`,
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
      heroGradient: service.detail.heroGradient,
      heroTextColor: service.detail.heroTextColor,
      heroOverlayColor: service.detail.heroOverlayColor,
      heroOverlayStartColor: service.detail.heroOverlayStartColor,
      heroOverlayEndColor: service.detail.heroOverlayEndColor,
      heroOverlayDirection: service.detail.heroOverlayDirection,
      heroOverlayStartOpacity: service.detail.heroOverlayStartOpacity,
      heroOverlayEndOpacity: service.detail.heroOverlayEndOpacity,
      heroOverlayOpacity: service.detail.heroOverlayOpacity,
      actions: service.detail.actions || [
        { label: 'Request a consultation', href: '#consultation' },
        { label: 'View all services', href: '/services' },
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
      title: `What to expect with ${service.title.toLowerCase()}`,
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
      title: `Talk with our team about ${service.title.toLowerCase()}.`,
      body: 'We will help you figure out the right next step for your home.',
      ctaLabel: 'Request a consultation',
      ctaHref: '#consultation',
    },
  ],
}))
