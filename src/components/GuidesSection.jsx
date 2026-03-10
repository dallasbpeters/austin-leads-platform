import Card from './Card'

const guides = [
  {
    number: '01',
    title: 'How Solar Works in Austin',
    copy: 'Panels, inverters, grid connection — explained in plain English. Plus Austin-specific details like buyback rates and system sizing.',
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/7c81dc6c-677b-458c-9c27-a3d6ff08395d_1600w.png',
    cardClass: 'bg-solar-primary',
  },
  {
    number: '02',
    title: 'Costs & Savings',
    copy: "Real numbers behind solar costs in Austin, how financing works, and when you're likely to break even.",
    image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1619b254-4925-4861-ae23-ae515f16291f_1600w.png',
    cardClass: 'bg-solar-amber-400',
  },
  {
    number: '03',
    title: 'Austin Solar Incentives',
    copy: 'Federal tax credit, Austin Energy rebates, property tax exemptions — and how to stack them all.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop',
    cardClass: 'bg-solar-blue-400',
  },
]

export default function GuidesSection() {
  return (
    <section
      className="bg-solar-warm   py-24"
      id="go-deeper"
      style={{
        backgroundImage: 'linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="mx-auto w-[min(80rem,calc(100%-3rem))]">
        <div className="mb-8">
          <h2 className="type-accent text-solar-secondary m-0 text-[clamp(1.875rem,4vw,2.25rem)]">Go Deeper</h2>
        </div>
        <div className="grid gap-3 max-[900px]:grid-cols-1 md:grid-cols-3">
          {guides.map((guide) => (
            <Card as="article" key={guide.title} className={`flex min-h-[380px] flex-col p-5 ${guide.cardClass}`} variant="color">
              <div className="flex items-center justify-between text-white/90">
                <ArrowIcon />
                <span className="text-[2rem] font-semibold">{guide.number}</span>
              </div>
              <h3 className="mt-4 text-[2rem]">{guide.title}</h3>
              <p className="mt-2 text-[0.95rem] font-semibold leading-6 text-white/90">{guide.copy}</p>
              <div className="mt-6 overflow-hidden rounded-lg">
                <img src={guide.image} alt={guide.title} className="h-56 w-full object-cover" />
              </div>
              <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-white/90">
                <SunIcon />
                <span>Read the Guide</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h10v10"></path>
      <path d="M7 17 17 7"></path>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  )
}
