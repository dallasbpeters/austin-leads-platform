import Card from './Card'

const items = [
  { icon: 'solar:wallet-money-linear', value: '$18k-$28k', copy: 'Typical residential solar range before credits and roof-related adders' },
  { icon: 'solar:chart-square-linear', value: '10+ years', copy: 'Roof age is where insurance and timing questions usually start' },
  { icon: 'solar:leaf-linear', value: '2 years', copy: 'A common claim window for detach-and-reset conversations after roof work' },
  { icon: 'solar:history-linear', value: '7–9 years', copy: 'Typical solar payback range once the roof plan is already solid' },
]

export default function SnapshotSection() {
  return (
    <section className="bg-color-cyan-950 relative overflow-hidden   py-24 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" className="absolute left-[10%] top-10 h-[400px] w-[400px]">
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="6"></circle>
            <path strokeLinecap="round" d="M12 2v1m0 18v1m10-10h-1M3 12H2m17.07-7.07l-.392.393M5.322 18.678l-.393.393m14.141-.001l-.392-.393M5.322 5.322l-.393-.393"></path>
          </g>
        </svg>
      </div>

      <div className="relative z-[1] mx-auto w-[min(80rem,calc(100%-3rem))]">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="type-accent text-color-primary mb-4 text-sm font-semibold uppercase tracking-[0.2em]">Texas Snapshot</p>
          <h2 className="mb-4 text-[clamp(1.875rem,4vw,2.25rem)]">The numbers people usually ask for.</h2>
          <p className="type-accent m-0 text-base font-semibold text-white/70">These are directional homeowner benchmarks, not a substitute for a roof inspection, claim review, or project-specific production model.</p>
        </div>

        <div className="grid gap-6 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1 md:grid-cols-4">
          {items.map((item) => (
            <Card key={item.value} className="p-8" variant="darkGlass">
              <div className="bg-white/10 text-color-primary mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full">
                <iconify-icon icon={item.icon} class="text-xl"></iconify-icon>
              </div>
              <div className="type-accent mb-2 text-[1.875rem] font-bold">{item.value}</div>
              <div className="type-accent text-sm font-semibold leading-6 text-white/60">{item.copy}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
