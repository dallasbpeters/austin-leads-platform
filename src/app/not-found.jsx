import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">404</p>
        <h1 className="text-foreground mt-4 text-4xl tracking-tight">
          This page does not exist on the current domain.
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-8">
          The request reached the platform, but there is no page mapped for that path on this site yet.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
