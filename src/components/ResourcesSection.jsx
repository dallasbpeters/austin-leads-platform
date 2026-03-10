import Card from "./Card";

const items = [
  {
    icon: "solar:map-point-linear",
    title: "Austin Energy Solar Rebate Program",
    copy: "Current amounts and eligibility",
    image: "https://images.unsplash.com/photo-1673140511598-2f23d9fec5dd?w=800&q=80",
    alt: "Austin Skyline",
  },
  {
    icon: "solar:home-linear",
    title: "Federal Investment Tax Credit",
    copy: "What it is, who qualifies, how to claim",
    image: "https://images.unsplash.com/photo-1668097613572-40b7c11c8727?w=800&q=80",
    alt: "Solar Panels Close Up",
  },
  {
    icon: "solar:wad-of-money-linear",
    title: "Net Metering in Austin",
    copy: "How credits work on your bill",
    image: "https://images.unsplash.com/photo-1604177420682-0c840feb01de?w=800&q=80",
    alt: "Happy Family",
  },
];

export default function ResourcesSection() {
  return (
    <section
      className="bg-solar-warm px-6 py-24"
      id="resources"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="mx-auto w-[min(80rem,calc(100%-3rem))]">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="type-accent text-solar-secondary m-0 text-[clamp(1.875rem,4vw,2.25rem)] font-semibold">
            Key Austin solar resources
          </h2>
        </div>

        <div className="grid gap-6 max-[900px]:grid-cols-1 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.title} className="relative aspect-[4/3]" variant="media" radius="lg">
              <img src={item.image} alt={item.alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,59,66,0.9),rgba(11,59,66,0.2),transparent)]"></div>
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-[8px]">
                  <iconify-icon icon={item.icon} class="text-lg"></iconify-icon>
                </div>
                <div className="type-accent text-[1.875rem] font-semibold leading-[1.1]">{item.title}</div>
                <div className="mt-1 text-sm font-semibold text-white/70">{item.copy}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
