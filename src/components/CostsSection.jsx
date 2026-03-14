import { getDevSectionAttributes } from './dev/DevTrace'

export default function CostsSection({ sectionId = 'costs' }) {
  return (
    <section
      className="bg-gradient grid place-content-center border-t border-stone-100 py-24"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/CostsSection.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="mx-auto w-[min(80rem,calc(100%-3rem))]">
        <p className="type-accent mb-8 text-sm font-semibold tracking-[0.2em] text-cyan-900 uppercase">
          Solar Costs
        </p>
        <h2 className="mb-6 text-[clamp(2.25rem,5vw,3.5rem)] text-slate-900">
          What Does Solar
          <br />
          Actually Cost?
        </h2>
        <p className="text-[1.125rem] leading-7 font-semibold text-neutral-500">
          A residential solar installation in Texas often lands between{' '}
          <span className="text-neutral-900">$18,000 and $28,000</span> before incentives. The final number
          depends on system size, equipment, electrical scope, and how much energy the home actually uses.
        </p>
        <p className="mt-3 text-[1.125rem] leading-7 font-semibold text-neutral-500">
          If you are trying to decide whether solar is worth it, start with the numbers that matter most:
          total project cost, incentives, expected production, and realistic payback.
        </p>

        <div className="my-16 grid gap-12 lg:grid-cols-3">
          <div>
            <p className="mb-3 text-5xl font-semibold text-neutral-900">30%</p>
            <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-cyan-800 uppercase">
              Federal Tax Credit
            </p>
            <p className="text-[0.9375rem] leading-7 font-semibold text-neutral-500">
              The federal Investment Tax Credit lets you claim 30% of your total solar cost against your
              federal taxes. On a $22,000 system, that&apos;s{' '}
              <span className="text-neutral-900">$6,600 back</span>.
            </p>
          </div>
          <div>
            <p className="mb-3 text-5xl font-semibold text-neutral-900">$$$</p>
            <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-cyan-800 uppercase">
              Texas Utility Context
            </p>
            <p className="text-[0.9375rem] leading-7 font-semibold text-neutral-500">
              Savings depend on your actual utility, electric rate, usage pattern, and whether the system is
              sized to offset the right amount of annual consumption.
            </p>
          </div>
          <div>
            <p className="mb-3 text-5xl font-semibold text-neutral-900">$0</p>
            <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-cyan-800 uppercase">
              Property Tax Increase
            </p>
            <p className="text-[0.9375rem] leading-7 font-semibold text-neutral-500">
              Solar panels can increase your home&apos;s value, but Texas law exempts that added value from
              property taxes. Your tax bill does not automatically go up just because the home appraises
              higher.
            </p>
          </div>
        </div>

        <div className="mb-12 border-t border-blue-300"></div>

        <div className="flex items-baseline gap-8 max-[900px]:flex-col">
          <p className="shrink-0 text-sm font-semibold tracking-[0.2em] text-blue-900 uppercase">
            Realistic Payback
          </p>
          <div>
            <p className="text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.35] font-semibold text-neutral-900">
              Most homeowners still see solar break even in roughly 7–9 years.
            </p>
            <p className="mt-3 text-base leading-7 font-semibold text-neutral-500">
              The strongest quotes clearly separate contract cost, incentives, and expected production so you
              can compare options without guessing where the savings are supposed to come from.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
