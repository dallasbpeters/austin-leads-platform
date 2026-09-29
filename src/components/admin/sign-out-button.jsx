'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import posthog from 'posthog-js'

import { Button } from '@/components/ui/button'

export default function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="text-white"
      style={{ color: '#FFFFFF' }}
      onClick={() => {
        posthog.reset()
        return signOut({
          callbackUrl: '/sign-in',
        })
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  )
}
