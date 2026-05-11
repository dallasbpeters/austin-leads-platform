'use server'

import { stripe } from '@/lib/stripe/stripe'
import { PRODUCTS } from '@/lib/stripe/products'

export interface BookingMetadata {
  name: string
  email: string
  address: string
  installDate: string
  packageSlug?: string
}

export async function startCheckoutSession(
  productId: string,
  metadata: BookingMetadata
) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  if (!product.stripePriceId) {
    throw new Error(`Product "${productId}" has no Stripe price ID configured`)
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    redirect_on_completion: 'never',
    customer_email: metadata.email,
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      customerName: metadata.name,
      propertyAddress: metadata.address,
      installDate: metadata.installDate,
      packageSlug: metadata.packageSlug ?? 'unknown',
      payment_type: 'deposit',
      site_slug: 'txchristmaslights',
    },
  })

  if (!session.client_secret) {
    throw new Error('Stripe did not return a client secret')
  }

  return session.client_secret
}
