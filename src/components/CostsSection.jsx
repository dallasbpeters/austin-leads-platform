export default function CostsSection() {
  return (
    <section className="bg-color-gradient grid place-content-center border-t border-stone-100   py-24" id="costs">
      <div className="mx-auto w-[min(80rem,calc(100%-3rem))]">
        <p className="type-accent text-color-cyan-900 mb-8 text-sm font-semibold uppercase tracking-[0.2em]">Solar Costs</p>
        <h2 className="text-color-slate-900 mb-6 text-[clamp(2.25rem,5vw,3.5rem)]">
          What Does Solar
          <br />
          Actually Cost?
        </h2>
        <p className="text-color-neutral-500 text-[1.125rem] font-semibold leading-7">
          A residential solar installation in Texas often lands between <span className="text-color-neutral-900">$18,000 and $28,000</span> before incentives. The final number depends on system size, equipment, electrical scope, and how much energy the home actually uses.
        </p>
        <p className="text-color-neutral-500 mt-3 text-[1.125rem] font-semibold leading-7">If you are trying to decide whether solar is worth it, start with the numbers that matter most: total project cost, incentives, expected production, and realistic payback.</p>

        <div className="my-16 grid gap-12 lg:grid-cols-3">
          <div>
            <p className="text-color-neutral-900 mb-3 text-5xl font-semibold">30%</p>
            <p className="text-color-cyan-800 mb-3 text-sm font-semibold uppercase tracking-[0.2em]">Federal Tax Credit</p>
            <p className="text-color-neutral-500 text-[0.9375rem] font-semibold leading-7">
              The federal Investment Tax Credit lets you claim 30% of your total solar cost against your federal taxes. On a $22,000 system, that&apos;s <span className="text-color-neutral-900">$6,600 back</span>.
            </p>
          </div>
          <div>
            <p className="text-color-neutral-900 mb-3 text-5xl font-semibold">$$$</p>
            <p className="text-color-cyan-800 mb-3 text-sm font-semibold uppercase tracking-[0.2em]">Texas Utility Context</p>
            <p className="text-color-neutral-500 text-[0.9375rem] font-semibold leading-7">Savings depend on your actual utility, electric rate, usage pattern, and whether the system is sized to offset the right amount of annual consumption.</p>
          </div>
          <div>
            <p className="text-color-neutral-900 mb-3 text-5xl font-semibold">$0</p>
            <p className="text-color-cyan-800 mb-3 text-sm font-semibold uppercase tracking-[0.2em]">Property Tax Increase</p>
            <p className="text-color-neutral-500 text-[0.9375rem] font-semibold leading-7">Solar panels can increase your home&apos;s value, but Texas law exempts that added value from property taxes. Your tax bill does not automatically go up just because the home appraises higher.</p>
          </div>
        </div>

        <div className="mb-12 border-t border-blue-300"></div>

        <div className="flex items-baseline gap-8 max-[900px]:flex-col">
          <p className="text-blue-900 shrink-0 text-sm font-semibold uppercase tracking-[0.2em]">Realistic Payback</p>
          <div>
            <p className="text-color-neutral-900 text-[clamp(1.5rem,4vw,1.875rem)] font-semibold leading-[1.35]">Most homeowners still see solar break even in roughly 7–9 years.</p>
            <p className="text-color-neutral-500 mt-3 text-base font-semibold leading-7">The strongest quotes clearly separate contract cost, incentives, and expected production so you can compare options without guessing where the savings are supposed to come from.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
