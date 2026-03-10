export default function CostsSection() {
  return (
    <section className="bg-solar-gradient grid place-content-center border-t border-stone-100 px-6 py-24" id="costs">
      <div className="mx-auto w-[min(80rem,calc(100%-3rem))]">
        <p className="type-accent text-solar-cyan-900 mb-8 text-sm font-semibold uppercase tracking-[0.2em]">Costs &amp; Incentives</p>
        <h2 className="text-solar-slate-900 mb-6 text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.1]">
          What Does Solar
          <br />
          Actually Cost in Austin?
        </h2>
        <p className="text-solar-neutral-500 text-[1.125rem] font-semibold leading-7">
          The average residential solar installation in Austin runs between <span className="text-solar-neutral-900">$18,000 and $28,000</span> before incentives. That range depends on your roof size, equipment choice, and how much energy your home uses.
        </p>
        <p className="text-solar-neutral-500 mt-3 text-[1.125rem] font-semibold leading-7">The good news: incentives bring that number down significantly.</p>

        <div className="my-16 grid gap-12 lg:grid-cols-3">
          <div>
            <p className="text-solar-neutral-900 mb-3 text-5xl font-semibold">30%</p>
            <p className="text-solar-cyan-800 mb-3 text-sm font-semibold uppercase tracking-[0.2em]">Federal Tax Credit</p>
            <p className="text-solar-neutral-500 text-[0.9375rem] font-semibold leading-7">
              The federal Investment Tax Credit lets you claim 30% of your total solar cost against your federal taxes. On a $22,000 system, that&apos;s <span className="text-solar-neutral-900">$6,600 back</span>.
            </p>
          </div>
          <div>
            <p className="text-solar-neutral-900 mb-3 text-5xl font-semibold">$$$</p>
            <p className="text-solar-cyan-800 mb-3 text-sm font-semibold uppercase tracking-[0.2em]">Austin Energy Rebate</p>
            <p className="text-solar-neutral-500 text-[0.9375rem] font-semibold leading-7">Austin Energy offers a rebate for residential solar installations. The amount can vary by year and system size, so check current incentive amounts on its site.</p>
          </div>
          <div>
            <p className="text-solar-neutral-900 mb-3 text-5xl font-semibold">$0</p>
            <p className="text-solar-cyan-800 mb-3 text-sm font-semibold uppercase tracking-[0.2em]">Property Tax Increase</p>
            <p className="text-solar-neutral-500 text-[0.9375rem] font-semibold leading-7">Solar panels can increase your home&apos;s value, but Texas law exempts that added value from property taxes. Your home may be worth more, but your tax bill does not automatically go up with it.</p>
          </div>
        </div>

        <div className="mb-12 border-t border-[#e5e5e5]"></div>

        <div className="flex items-baseline gap-8 max-[900px]:flex-col">
          <p className="text-solar-neutral-400 shrink-0 pt-1 text-sm font-semibold uppercase tracking-[0.2em]">Realistic Payback</p>
          <div>
            <p className="text-solar-neutral-900 text-[clamp(1.5rem,4vw,1.875rem)] font-semibold leading-[1.35]">Most Austin homeowners break even in 7–9 years.</p>
            <p className="text-solar-neutral-500 mt-3 text-base font-semibold leading-7">After that, the value shifts to long-term bill reduction for the remaining 15–20 years of a typical panel warranty.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
