import Logo from './Logo'

export default function Footer() {
  return (
    <footer id="contact" className="bg-solar-cyan-950   py-8 text-xs font-medium text-white/60">
      <div className="mx-auto flex w-[min(80rem,calc(100%-3rem))] items-center justify-between gap-4 max-sm:flex-col">
        <div className="flex sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <Logo />
            <div className="type-accent text-base font-semibold leading-none">Austin Solar Pros</div>
          </div>
        </div>
        <p className="type-accent font-semibold">
          © <span id="year">2026</span> Austin Solar Pros
        </p>
      </div>
    </footer>
  )
}
