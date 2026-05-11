import type { Metadata } from 'next'
import { SchedulingForm } from '@/components/StripeCheckout'

export const metadata: Metadata = {
  title: 'Reserve your install date | Texas Christmas Lights',
  description:
    'Secure your Christmas light installation window with a $150 deposit. We install, service, and remove — you just enjoy.',
  robots: { index: false },
}

export default function BookPage() {
  return <SchedulingForm />
}
