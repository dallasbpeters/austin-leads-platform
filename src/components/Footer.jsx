import Logo from './Logo'

export default function Footer() {
  return (
    <footer id="contact" className="bg-color-cyan-950   py-8 text-xs font-medium text-white/60">
      <div className="mx-auto flex w-[min(80rem,calc(100%-3rem))] items-center justify-between gap-4 max-sm:flex-col">
        <div className="flex sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <Logo />
            <div className="type-accent text-base font-semibold leading-none">Texas Solar and Roofing Pros</div>
          </div>
        </div>
        <p className="type-accent font-semibold">
          © <span id="year">2026</span> Texas Solar and Roofing Pros
        </p>
      </div>
    </footer>
  )
}
