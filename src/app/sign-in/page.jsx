import { redirect } from 'next/navigation'

import SignInForm from '@/components/auth/SignInForm'
import { safeAuth } from '@/lib/auth/session'

export const metadata = {
  title: 'Sign In | Austin Leads Platform',
}

export default async function SignInPage({ searchParams }) {
  const session = await safeAuth()

  if (session?.user) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const callbackUrl = params?.callbackUrl || '/dashboard'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,1))] px-6 py-20">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Platform security</p>
          <h1 className="text-foreground max-w-2xl text-4xl tracking-tight md:text-5xl">
            Keep the operator side private while the public domains stay indexable.
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-8">
            Login with your email address.
          </p>
        </div>
        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </main>
  )
}
