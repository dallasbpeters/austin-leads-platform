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
    <main className="flex items-center justify-center min-h-screen px-6 py-20 bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,1))]">
      <div className="grid lg:items-center max-w-5xl w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Platform security</p>
          <h1 className="max-w-2xl text-4xl text-foreground tracking-tight md:text-5xl">
            Keep the operator side private while the public domains stay indexable.
          </h1>
          <p className="max-w-2xl leading-8 text-base text-muted-foreground">
            Login with your email address.
          </p>
        </div>
        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </main>
  )
}
