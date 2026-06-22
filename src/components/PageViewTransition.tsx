'use client'

import { ViewTransition } from 'react'

export default function PageViewTransition({
  pathname,
  children,
}: {
  pathname: string
  children: React.ReactNode
}) {
  return (
    <ViewTransition key={pathname} exit="page-exit" enter="page-enter">
      {children}
    </ViewTransition>
  )
}
