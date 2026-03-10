import Button from './Button'
import Card from './Card'
import Gradient from './Gradient'

export default function ConsultationSection() {
  return (
    <section
      className="border-solar-grid relative overflow-hidden border-t py-24"
      id="estimate"
      style={{
        backgroundImage: 'linear-gradient(to right, hsl(var(--color-secondary-h) 22% 78% / 0.12), hsl(var(--color-secondary-h) 40% 70% / 0), hsl(calc(var(--color-primary-h) + 10) 72% 72% / 0.12))',
      }}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-5">
        <div className="border-solar-secondary absolute right-[-5rem] top-20 h-[800px] w-[800px] rounded-full border"></div>
        <div className="border-solar-secondary absolute right-[-2.5rem] top-40 h-[600px] w-[600px] rounded-full border"></div>
      </div>

      <div className="mx-auto z-5 grid w-[min(80rem,calc(100%-3rem))] items-center gap-16 max-[900px]:grid-cols-1 md:grid-cols-2">
        <div>
          <h2 className="type-display text-solar-secondary mb-4 text-[clamp(2.875rem,6vw,3.75rem)]">
            Talk to a
            <br />
            Austin Solar Pro
          </h2>
          <p className="type-accent text-solar-slate-500 max-w-[26rem] text-base font-semibold">If you want to talk through your roof, electric usage, or expected savings, request a free, no-pressure consultation with a local solar pro.</p>
        </div>

        <Card className="relative z-10 p-8" id="consultation" radius="lg">
          <form className="flex flex-col gap-6">
            <div>
              <label className="text-solar-slate-500 mb-2 block text-xs font-semibold">Full Name</label>
              <input type="text" placeholder="e.g. Jane Doe" className="border-solar-grid placeholder:text-solar-slate-700 focus:border-primary w-full border-0 border-b bg-transparent px-0 py-2 text-sm text-foreground outline-none" />
            </div>

            <div className="grid gap-6 max-[900px]:grid-cols-1 md:grid-cols-2">
              <div>
                <label className="text-solar-slate-500 mb-2 block text-xs font-semibold">Email Address</label>
                <input type="email" placeholder="jane@example.com" className="border-solar-grid placeholder:text-solar-slate-700 focus:border-primary w-full border-0 border-b bg-transparent px-0 py-2 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-solar-slate-500 mb-2 block text-xs font-semibold">Phone Number</label>
                <input type="tel" placeholder="(512) 000-0000" className="border-solar-grid placeholder:text-solar-slate-700 focus:border-primary w-full border-0 border-b bg-transparent px-0 py-2 text-sm text-foreground outline-none" />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input type="checkbox" id="privacy" className="accent-primary mt-1 h-4 w-4" />
              <label htmlFor="privacy" className="text-solar-slate-500 text-xs font-semibold">
                I agree to be contacted by Austin Solar Pros about my inquiry. We do not sell your information.
              </label>
            </div>

            <Button pill type="button" size="lg" fullWidth>
              Request a Free Consultation
            </Button>
          </form>
        </Card>
      </div>
      <Gradient />
    </section>
  )
}
