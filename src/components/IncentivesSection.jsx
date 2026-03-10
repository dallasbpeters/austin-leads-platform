import Button from './Button'

export default function IncentivesSection() {
  return (
    <section className="bg-solar-warm px-6 py-24" id="incentives">
      <div className="mx-auto grid w-[min(80rem,calc(100%-3rem))] items-center gap-16 max-[900px]:grid-cols-1 md:grid-cols-2">
        <div className="grid place-items-start gap-4">
          <h2 className="type-accent text-solar-secondary m-0 text-[clamp(1.875rem,4vw,2.25rem)] font-semibold leading-[1.1]">
            Understanding Solar Incentives in Texas
          </h2>
          <div className="type-accent text-solar-slate-500 text-base font-semibold leading-7">
            <p>Beyond the federal tax credit, Texas offers one meaningful long-term perk for solar homeowners: a property tax exemption on the added home value. Solar can increase what your home is worth without automatically increasing your property tax bill.</p>
            <p>Local rebates, interconnection requirements, and net metering rules can still be confusing. The details change over time, so it is worth confirming the current Austin Energy requirements and incentive amounts before you make a decision.</p>
          </div>
          <Button pill variant="primary" size="md" type="button">
            Review incentive basics
          </Button>
        </div>

        <div className="h-[400px] overflow-hidden rounded-3xl">
          <img src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop" alt="Austin Neighborhood" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  )
}
