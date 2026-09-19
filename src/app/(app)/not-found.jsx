import ContextualNotFound from '@/components/contextual-not-found'

export default function NotFound() {
  return (
    <main className="bg-background relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,88,12,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(15,23,42,0.24),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,1))]"
      />

      <div
        aria-hidden="true"
        className="border-border/60 absolute top-16 right-[8%] h-40 w-40 rounded-full border bg-white/45 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-20 left-[10%] h-56 w-56 rounded-full bg-[rgba(15,23,42,0.08)] blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-20">
        <ContextualNotFound />
      </div>
    </main>
  )
}
