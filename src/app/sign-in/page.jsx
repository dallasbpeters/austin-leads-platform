import { redirect } from 'next/navigation'

import SignInForm from '@/components/auth/sign-in-form'
import { safeAuth } from '@/lib/auth/session'

export const metadata = {
  title: 'Sign In | Austin Leads Platform',
}

const resolveCallbackUrl = (raw) => {
  const candidate = typeof raw === 'string' ? raw : '/dashboard'
  return candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/dashboard'
}

const resolveOAuthErrorMessage = (authError) => {
  if (authError === 'AccessDenied') {
    return 'OAuth sign-in is only available for admin accounts already registered in this platform. Sign in with email and password, or ask an owner to add your Google or Zoho email under Users.'
  }
  if (authError) {
    return 'Sign-in was cancelled or failed. Try again.'
  }
  return ''
}

const isOAuthProviderEnabled = (idKey, altIdKey, secretKey, altSecretKey) =>
  Boolean(
    (process.env[idKey] || process.env[altIdKey]) && (process.env[secretKey] || process.env[altSecretKey]),
  )

export default async function SignInPage({ searchParams }) {
  const session = await safeAuth()

  if (session?.user) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const callbackUrl = resolveCallbackUrl(params?.callbackUrl)
  const googleAuthEnabled = isOAuthProviderEnabled(
    'AUTH_GOOGLE_ID',
    'GOOGLE_CLIENT_ID',
    'AUTH_GOOGLE_SECRET',
    'GOOGLE_CLIENT_SECRET',
  )
  const zohoAuthEnabled = isOAuthProviderEnabled(
    'AUTH_ZOHO_ID',
    'ZOHO_CLIENT_ID',
    'AUTH_ZOHO_SECRET',
    'ZOHO_CLIENT_SECRET',
  )
  const authError = typeof params?.error === 'string' ? params.error : ''
  const oauthErrorMessage = resolveOAuthErrorMessage(authError)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,1))] px-3 py-20 md:px-6">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Platform security</p>
          <h1 className="text-foreground max-w-2xl text-4xl tracking-normal md:text-5xl">
            Texas Solar and Roofing admin sign-in.
          </h1>
          <p className="text-muted-foreground max-w-2xl text-[1rem] leading-8">
            Sign in with{' '}
            {[googleAuthEnabled && 'Google', zohoAuthEnabled && 'Zoho'].filter(Boolean).join(' or ') ||
              'your provider'}{' '}
            (enabled for registered admins) or your admin email and password.
          </p>
          {oauthErrorMessage ? (
            <p className="text-destructive max-w-2xl text-sm leading-6">{oauthErrorMessage}</p>
          ) : null}
        </div>
        <SignInForm
          callbackUrl={callbackUrl}
          googleAuthEnabled={googleAuthEnabled}
          zohoAuthEnabled={zohoAuthEnabled}
        />
      </div>
    </main>
  )
}
