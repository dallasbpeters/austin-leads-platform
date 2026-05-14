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
  const rawCallback = typeof params?.callbackUrl === 'string' ? params.callbackUrl : '/dashboard'
  const callbackUrl =
    rawCallback.startsWith('/') && !rawCallback.startsWith('//') ? rawCallback : '/dashboard'
  const googleAuthEnabled = Boolean(
    (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
    (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET),
  )
  const authError = typeof params?.error === 'string' ? params.error : ''
  const oauthErrorMessage =
    authError === 'AccessDenied'
      ? 'Google sign-in is only available for admin accounts already registered in this platform. Sign in with email and password, or ask an owner to add your Google email under Users.'
      : authError
        ? 'Sign-in was cancelled or failed. Try again.'
        : ''

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,1))] px-3 py-20 md:px-6">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Platform security</p>
          <h1 className="text-foreground max-w-2xl text-4xl tracking-normal md:text-5xl">
            Keep the operator side private while the public domains stay indexable.
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-8">
            Sign in with Google {googleAuthEnabled ? '(enabled for registered admins) ' : ''}or your admin
            email and password.
          </p>
          {oauthErrorMessage ? (
            <p className="text-destructive max-w-2xl text-sm leading-6">{oauthErrorMessage}</p>
          ) : null}
        </div>
        <SignInForm callbackUrl={callbackUrl} googleAuthEnabled={googleAuthEnabled} />
      </div>
    </main>
  )
}
