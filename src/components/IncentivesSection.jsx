import Button from './Button'
import { getDevSectionAttributes } from './dev/DevTrace'

export default function IncentivesSection({ sectionId = 'incentives' }) {
  return (
    <section
      className="bg-warm py-24"
      {...getDevSectionAttributes({
        id: sectionId,
        markup: 'src/components/IncentivesSection.jsx',
        content: 'local JSX copy',
      })}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-16 max-[900px]:grid-cols-1 md:grid-cols-2">
        <div className="grid place-items-start gap-4">
          <h2 className="type-accent text-secondary m-0 text-[clamp(1.875rem,4vw,2.25rem)]">
            Roof insurance and claim realities
          </h2>
          <div className="type-accent text-base leading-7 font-semibold text-slate-500">
            <p>
              Roof claims get expensive when the details are misunderstood. This section is here to explain
              hail damage, aging roofs, RCV vs ACV policies, claim timing, and when detach and reset becomes
              part of the job.
            </p>
            <p>
              The goal is simple: help you understand whether you are looking at normal roof wear, storm
              damage with an insurance angle, or a roofing project that needs to be planned correctly before
              solar enters the picture.
            </p>
          </div>
          <Button pill variant="primary" size="md" type="button">
            Review roofing + insurance basics
          </Button>
        </div>

        <div className="h-[400px] overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop"
            alt="Austin Neighborhood"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
