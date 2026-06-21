import { headers } from 'next/headers'

import { createJob, ensureChristmasTables, getJobByStripeSessionId } from '@/lib/christmas/db'
import { getPostHogClient } from '@/lib/posthog-server'
import { stripe } from '@/lib/stripe/stripe'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return new Response('Webhook signature or secret missing', { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe/webhook] signature verification failed:', message)
    return new Response(`Webhook error: ${message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = event.data.object

    // Only handle deposit payments for Christmas lights
    if (session.metadata?.payment_type !== 'deposit' || session.metadata?.site_slug !== 'txchristmaslights') {
      return new Response('OK', { status: 200 })
    }

    // Idempotency guard — don't create duplicate jobs
    const existing = await getJobByStripeSessionId(session.id)
    if (existing) {
      return new Response('OK', { status: 200 })
    }

    try {
      await ensureChristmasTables()

      await createJob({
        fullName: session.metadata.customerName ?? session.customer_details?.name ?? 'Unknown',
        email: session.customer_email ?? session.customer_details?.email ?? '',
        address: session.metadata.propertyAddress ?? '',
        installDate: session.metadata.installDate ?? '',
        packageSlug: session.metadata.packageSlug ?? 'unknown',
        stripeSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        depositAmountCents: session.amount_total ?? 15000,
        siteSlug: 'txchristmaslights',
      })

      console.log('[stripe/webhook] job created for session', session.id)

      const email = session.customer_email ?? session.customer_details?.email ?? ''
      const posthog = getPostHogClient('txchristmaslights')
      posthog?.capture({
        distinctId: email || session.id,
        event: 'deposit_payment_confirmed',
        properties: {
          stripe_session_id: session.id,
          package_slug: session.metadata.packageSlug ?? 'unknown',
          install_date: session.metadata.installDate ?? '',
          deposit_amount_cents: session.amount_total ?? 15000,
          site_slug: 'txchristmaslights',
        },
      })
    } catch (err) {
      console.error('[stripe/webhook] failed to create job:', err)
      getPostHogClient('txchristmaslights')?.captureException(err)
      return new Response('Internal error creating job', { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
}
