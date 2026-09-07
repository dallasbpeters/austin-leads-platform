import type { Metadata } from 'next'

import { SchedulingForm } from '@/components/booking-form'

export const metadata: Metadata = {
  description:
    'Secure your Christmas light installation window with a 30% deposit. We install, service, and remove — you just enjoy.',
  robots: { index: false },
  title: 'Reserve your install date | Texas Christmas Lights',
}

export default function BookPage() {
  /* The form is the whole page here, so it needs the page's main landmark and
   * its headline has to be the h1. */
  return (
    <main>
      <SchedulingForm headingLevel="h1" />
    </main>
  )
}
