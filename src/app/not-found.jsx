import ContextualNotFound from '@/components/ContextualNotFound'

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute bg-[radial-gradient(circle_at_top,rgba(234,88,12,0.16),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(15,23,42,0.24),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,1))] inset-0 pointer-events-none"
      />

      <div
        aria-hidden="true"
        className="absolute h-40 w-40 bg-white/45 border border-border/60 rounded-full blur-2xl right-[8%] top-16"
      />
      <div
        aria-hidden="true"
        className="absolute h-56 w-56 bg-[rgba(15,23,42,0.08)] rounded-full blur-3xl bottom-20 left-[10%]"
      />

      <div className="flex relative items-center max-w-6xl min-h-screen mx-auto px-6 py-20">
        <ContextualNotFound />
      </div>
    </main>
  )
}
