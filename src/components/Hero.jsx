import Button from './Button'
import Card from './Card'
import Gradient from './Gradient'

export default function Hero() {
  return (
    <section
      className="type-accent text-solar-body border-solar-grid relative min-h-[80vh] overflow-x-hidden border-b bg-[#FFFCF5]"
      style={{
        backgroundImage: 'radial-gradient(var(--color-grid) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <Gradient />
      <div
        className="absolute inset-0 z-[2] mix-blend-multiply"
        style={{
          backgroundImage: 'radial-gradient(var(--color-grid) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="mx-auto flex min-h-[80vh] w-[min(80rem,calc(100%-3rem))] items-center p-6">
        <div className="relative z-10 grid w-full items-end gap-12 pb-12 lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]">
          <div className="solar-fade-up">
            <div className="mb-8 inline-flex items-center gap-4">
              <div className="relative flex h-3 w-3">
                <span className="bg-solar-primary-300 absolute inset-0 animate-ping rounded-full opacity-75"></span>
                <span className="bg-solar-primary relative h-3 w-3 rounded-full"></span>
              </div>
              <span className="text-solar-primary text-[12px] font-bold uppercase tracking-[0.4em]">Austin averages 228 sunny days a year</span>
            </div>

            <h1 className="type-display mb-10 text-[clamp(3.5rem,12vw,10rem)] font-semibold leading-[0.85] tracking-[-0.04em] text-black">
              Solar,
              <br />
              <span className="text-transparent [-webkit-text-stroke-color:black] [-webkit-text-stroke-width:1px]">simplified.</span>
            </h1>

            <div className="flex flex-wrap items-center gap-10 max-md:flex-col max-md:items-start">
              <Button href="#consultation" size="lg" pill>
                Talk to a Solar Pro
              </Button>

              <div className="flex items-center gap-6">
                <div className="hidden h-12 w-px bg-white/10 md:block"></div>
                <div>
                  <span className="text-solar-slate-500 mb-1 block text-[10px] font-bold uppercase tracking-[0.2em]">Typical Austin Payback</span>
                  <span className="text-solar-slate-800 block text-sm font-medium">7–9 years</span>
                </div>
              </div>
            </div>
          </div>

          <div className="solar-fade-up solar-fade-up-delay">
            <Card className="p-8 backdrop-blur-[12px]" radius="lg">
              <p className="text-solar-strong m-0 text-lg font-light leading-7">Straight answers on Austin solar costs, incentives, and whether the math works for your home.</p>
              <div className="mt-6 flex gap-2">
                <div className="bg-solar-primary h-1 w-8 rounded-full"></div>
                <div className="bg-solar-primary h-1 w-2 rounded-full"></div>
                <div className="bg-solar-primary h-1 w-2 rounded-full"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
