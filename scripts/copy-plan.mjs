// Each entry: { doc, section (type), key (optional _key), item (optional item _key), set: { field: value } }
// String values for portable-text fields are converted to one block by the apply script.
const svc = (slug, title, body, ctaLabel) => ({
  doc: `page-service-${slug}`,
  section: 'ctaSection',
  set: { title, body, ctaLabel },
})
export const PLAN = [
  // Homepage
  {
    doc: 'EIUGL2ggZiTenNpjp4Ai8z',
    section: 'ctaSection',
    set: {
      title: "Tell us what's going on with your house",
      body: "Tell us about your roof, your bill, or the storm that just came through. We'll tell you what's worth doing, what isn't, and what it would cost. No script, no pressure.",
      ctaLabel: 'Set up a free call',
    },
  },
  {
    doc: 'EIUGL2ggZiTenNpjp4Ai8z',
    section: 'calculatorSection',
    set: { ctaLabel: 'Go over these numbers with us' },
  },
  {
    doc: 'EIUGL2ggZiTenNpjp4Ai8z',
    section: 'bannerCtaSection',
    set: {
      title: 'Christmas lights, hung and taken down for you',
      body: 'Our Texas Christmas Lights crew hangs, maintains, and takes down displays across Austin, from rooflines to trees to the whole property.',
      ctaLabel: 'Reserve an install date',
    },
  },
  {
    doc: 'EIUGL2ggZiTenNpjp4Ai8z',
    section: 'solarDifferenceSection',
    item: '028357817d5b',
    set: { eyebrow: 'Installation', title: 'We handle the permits, the utility, and the paperwork' },
  },
  {
    doc: 'EIUGL2ggZiTenNpjp4Ai8z',
    section: 'solarDifferenceSection',
    item: '419ca77ca637',
    set: { title: 'A layout designed around your roof, not a template' },
  },

  // Hubs
  {
    doc: 'page-services',
    section: 'ctaSection',
    set: {
      title: 'Not sure which service you need?',
      body: "Tell us what's happening at the house: a leak, a high bill, hail, or a solar project. We'll point you to the right fix and give you a number.",
      ctaLabel: "Tell us what's going on",
    },
  },
  {
    doc: 'page-roofing',
    section: 'ctaSection',
    set: {
      title: 'Tell us what your roof is doing',
      body: "Leak, missing shingles, hail, or a roof that's just old. We'll come look, take photos, and give you a straight answer on repair versus replacement.",
      ctaLabel: 'Get a free estimate',
    },
  },
  {
    doc: 'page-roofing',
    section: 'serviceGridSection',
    set: {
      body: "Shingle, metal, and commercial roofs. We match the system to your roof and your budget, install it to the manufacturer's spec, and stand behind the work.",
    },
  },
  {
    doc: 'page-solar',
    section: 'ctaSection',
    set: {
      title: 'See if solar pencils out for your house',
      body: "New install, battery backup, panel removal for a re-roof, or the electrical work that goes with it. Send us a recent bill and we'll run the numbers.",
      ctaLabel: 'Get a solar estimate',
    },
  },
  {
    doc: 'page-solar',
    section: 'bannerCtaSection',
    set: { title: 'See what solar could save on your bill', ctaLabel: 'Run your numbers' },
  },
  {
    doc: 'page-solar-guides',
    section: 'bannerCtaSection',
    set: { title: 'See what solar could save on your bill', ctaLabel: 'Run your numbers' },
  },
  {
    doc: 'page-solar-guides',
    section: 'ctaSection',
    set: {
      title: "Questions the guides didn't answer?",
      body: "Tell us about your house and your bill. We'll tell you which of this applies to you.",
      ctaLabel: 'Ask us a question',
    },
  },
  {
    doc: '4889073e-933d-4b47-9df4-906d4e802747',
    section: 'bannerCtaSection',
    set: {
      body: 'Plug in your monthly bill. The calculator shows system size, year-one savings, and 25-year savings at a 2.5% annual rate increase.',
      ctaLabel: 'Run your numbers',
    },
  },
  {
    doc: 'page-solar-increasing-your-home-value',
    section: 'ctaSection',
    set: {
      title: "Want to know what solar would do for your home's value?",
      body: "We'll inspect your roof, look at your last 12 months of bills, and tell you what's worth doing now and what can wait.",
    },
  },

  // Insurance and storm
  {
    doc: 'page-hail-damage',
    section: 'ctaBannerSection',
    set: {
      title: 'Not sure if the storm damaged your roof?',
      body: "We'll inspect it for free and photograph what we find. If it's a claim, we'll walk you through filing it and meet the adjuster on the roof. If it isn't, we'll tell you that too.",
      ctaLabel: 'Request a free inspection',
    },
  },
  { doc: 'page-hail-damage', section: 'stepsSection', set: { title: 'What happens after you call' } },
  {
    doc: 'page-hail-damage',
    section: 'stepsSection',
    item: 'item-1-start-with-photos-notes-and-storm-timing',
    set: {
      title: 'We inspect the roof',
      body: 'A short phone call first, then a free inspection. We check the overall condition, look for hail and wind damage, and find what is causing any leaks.',
    },
  },
  {
    doc: 'page-hail-damage',
    section: 'stepsSection',
    item: 'item-2-get-a-real-roof-inspection-not-just-a-we',
    set: {
      title: 'You get a written estimate',
      body: 'We show you what we found and what it costs to fix. If the damage is a claim, we walk you through filing it and meet the adjuster on the roof.',
    },
  },
  {
    doc: 'page-hail-damage',
    section: 'stepsSection',
    item: 'item-3-review-the-policy-and-plan-before-appro',
    set: {
      title: 'We repair or replace it',
      body: 'We install it right the first time, then clean the yard. Nails, wrappers, and old shingles leave with us.',
    },
  },
  {
    doc: 'page-insurance-basics',
    section: 'ctaSection',
    set: {
      title: 'Adjuster says one thing, roofer says another?',
      body: "Send us the adjuster summary and your roof quote. We'll read both and tell you where the gap is and what to push back on.",
      ctaLabel: 'Talk through your claim',
    },
  },
  {
    doc: 'e61e319c-5453-457c-8bbd-2bea3cc784c2',
    section: 'ctaSection',
    set: {
      title: 'Have a claim on your desk?',
      body: 'Before you sign anything, let us read the scope. Twenty minutes usually clears up who pays for what, when, and whether the numbers cover the roof.',
      ctaLabel: 'Get a second look at your claim',
    },
  },
  {
    doc: 'e61e319c-5453-457c-8bbd-2bea3cc784c2',
    section: 'storySection',
    set: {
      subtitle: "The process is simple once you know the terms. It gets expensive fast when you don't.",
    },
  },

  // About
  {
    doc: 'page-about',
    section: 'heroSection',
    set: { actions: [{ label: 'How solar works here' }, { label: 'Estimate your savings' }] },
  },
  {
    doc: 'page-about',
    section: 'highlightsSection',
    key: 'section-5-our-vision',
    set: {
      title: 'One crew handles the whole job',
      subtitle:
        'Going solar takes permits, inspections, and utility approval. We run all of it and tell you where things stand along the way.',
    },
  },
  {
    doc: 'page-about',
    section: 'highlightsSection',
    key: 'section-5-our-vision',
    item: 'item-1-mission-and-values',
    set: {
      eyebrow: 'One team',
      title: 'The same people from site visit to final inspection.',
    },
  },
  {
    doc: 'page-about',
    section: 'logosSection',
    set: {
      title: 'The equipment we put on your roof',
      body: 'We install panels and inverters from a short list of makers with 25-year warranties and a track record of honoring them. We can show you which brands and why.',
    },
  },
  {
    doc: 'c52c97f4-967c-4de4-9145-4f2d71996968',
    section: 'solarDifferenceSection',
    item: 'b723bcd4954a',
    set: { eyebrow: 'Service' },
  },

  // Thank you
  {
    doc: 'b25393f4-b363-4ab0-9646-2385bd028c75',
    section: 'storySection',
    set: {
      subtitle: "We'll reach out to set up a time to talk.",
    },
  },

  // Service pages (15)
  svc(
    'car-chargers',
    'Adding an EV charger?',
    "Tell us your panel size, where the car parks, and what you drive. We'll tell you if your electrical panel can take a Level 2 charger as-is or needs work first.",
    'Ask about a charger install',
  ),
  svc(
    'commercial-roofing',
    "Got a commercial roof that's leaking or aging out?",
    "Send us the address and what you're seeing. We'll walk it, photograph it, and tell you whether it's a repair, a recoat, or a replacement, with numbers for each.",
    'Schedule a roof walk',
  ),
  svc(
    'detach-and-reset',
    'Roof work with panels on it?',
    "Tell us who's doing the roof and when. We'll pull the panels, store them safely, and put them back so your warranty and production stay intact.",
    'Schedule the detach',
  ),
  svc(
    'duct-sealing',
    'Rooms that never cool down?',
    "That's usually leaky ducts in the attic, not a bad AC. We test the ducts, show you the leakage number, and seal what's losing air.",
    'Book a duct test',
  ),
  svc(
    'electrical-services',
    'Need an electrician who knows solar?',
    "Panel upgrades, new circuits, EV chargers, battery hookups. Tell us what you're adding and we'll tell you what the panel can handle.",
    'Ask an electrician',
  ),
  svc(
    'energy-audits',
    'Wondering where the bill is going?',
    'We check insulation, ducts, air leaks, and your last 12 months of usage. You get a short list of fixes, ranked by what pays back first.',
    'Book an energy audit',
  ),
  svc(
    'hail-and-wind-damage-roof-inspection',
    'Did hail just come through?',
    "Call us before you call your insurer. We'll get on the roof, photograph the damage, and tell you honestly whether it's worth a claim.",
    'Request a storm inspection',
  ),
  svc(
    'heat-pump-upgrades',
    'Old AC or furnace on its last summer?',
    "Tell us the age of the system and the size of the house. We'll tell you if a heat pump makes sense here, what it costs, and what it saves on your bill.",
    'Ask about a heat pump',
  ),
  svc(
    'insulation-and-air-sealing',
    'Attic too hot to stand in?',
    "That heat is leaking into your house. We measure what's up there, seal the gaps, and bring the insulation up to what a Central Texas summer calls for.",
    'Get an attic check',
  ),
  svc(
    'metal-roofing',
    'Thinking about metal?',
    "Tell us your roof size and how long you plan to stay. We'll price standing seam next to Class 4 shingles so you can see the 30-year math side by side.",
    'Get a metal roof quote',
  ),
  svc(
    'rodent-deterrent',
    'Hearing squirrels under the panels?',
    'They chew wiring and nest in the gap. We install steel mesh around the array, clipped to the rails, never screwed into the panel frames.',
    'Ask about critter guard',
  ),
  svc(
    'shingle-roofing',
    'Roof leaking, or just getting old?',
    "Tell us what you're seeing. We'll inspect it, show you photos, and say plainly whether it needs a repair or a full replacement.",
    'Schedule a roof inspection',
  ),
  svc(
    'solar-and-battery-installations',
    'Ready to see if solar pencils out?',
    "Send us a recent electric bill. We'll size a system for your roof, run the payback at current Austin Energy rates, and tell you if it makes sense.",
    'Get a solar estimate',
  ),
  svc(
    'storm-damage-restoration',
    'Storm damage and a claim to deal with?',
    "We inspect, document, and meet the adjuster on the roof with you. Then we do the work the claim covers, and tell you plainly if it doesn't.",
    'Start with an inspection',
  ),
  svc(
    'window-replacement',
    'Windows fogging or letting the heat in?',
    "Tell us how many and which side of the house they face. We'll price double- and triple-pane options and show you what each does to your summer bill.",
    'Get a window quote',
  ),
]
