import { ViewTransition } from 'react'
import DevTrace from '@/components/dev/DevTrace'

export default function SiteLayout({ children }) {
  return (
    <>
      <DevTrace
        markup="src/app/(site)/layout.jsx"
        content="site route shell"
        note="ViewTransition boundary for public-site route changes"
      />
      <ViewTransition>{children}</ViewTransition>
    </>
  )
}
