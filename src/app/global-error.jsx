'use client'

import NextError from 'next/error'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    posthog.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <head>
        {/* This page has no RootDocument. Without the opt-in, arriving here rejects the transition. */}
        {/* oxlint-disable-next-line shadcn/no-inline-styles -- must be in place before first paint */}
        <style>{'@view-transition{navigation:auto}'}</style>
      </head>
      <body>
        <NextError statusCode={0} />
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  )
}
