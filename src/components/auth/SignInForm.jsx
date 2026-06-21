'use client'

import { AlertCircle, LockKeyhole } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { useState, useTransition } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  )
}

export default function SignInForm({ callbackUrl = '/dashboard', googleAuthEnabled = false }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')

    startTransition(async () => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('The admin credentials were not accepted.')
        posthog.capture('admin_sign_in_failed', { email })
        return
      }

      posthog.identify(String(email), { email: String(email) })
      posthog.capture('admin_sign_in_success', { email })
      router.push(result?.url || callbackUrl)
      router.refresh()
    })
  }

  async function handleGoogleSignIn() {
    setError('')
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch {
      setError('Could not start Google sign-in.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="border-border/80 shadow-theme-glass-soft w-full max-w-md">
      <CardHeader className="space-y-4">
        <div className="text-primary-foreground bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Admin access</p>
          <CardTitle className="mt-2 text-3xl tracking-normal">Sign in to the admin</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {googleAuthEnabled ? (
          <>
            <Button
              className="w-full"
              disabled={isPending || isGoogleLoading}
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon />
              {isGoogleLoading ? 'Redirecting…' : 'Continue with Google'}
            </Button>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="bg-border h-px min-w-0 flex-1" aria-hidden />
              <span className="shrink-0">or use email and password</span>
              <span className="bg-border h-px min-w-0 flex-1" aria-hidden />
            </div>
          </>
        ) : null}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button disabled={isPending} type="submit">
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
