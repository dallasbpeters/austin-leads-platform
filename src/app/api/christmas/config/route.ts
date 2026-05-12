import { stripe } from '@/lib/stripe/stripe'
import { PRODUCTS } from '@/lib/stripe/products'

export const revalidate = 3600

export async function GET() {
  try {
    const packageIds = ['xmas-roofline', 'xmas-full-front', 'xmas-full-property']
    const allIds = ['deposit', ...packageIds]

    const priceResults = await Promise.allSettled(
      allIds.map((id) => {
        const product = PRODUCTS.find((p) => p.id === id)
        return product?.stripePriceId
          ? stripe.prices.retrieve(product.stripePriceId)
          : Promise.reject(new Error('no price id'))
      }),
    )

    const [depositResult, ...packageResults] = priceResults

    const depositAmountCents =
      depositResult.status === 'fulfilled' ? (depositResult.value.unit_amount ?? 15000) : 15000
    const currency = depositResult.status === 'fulfilled' ? depositResult.value.currency : 'usd'

    const packages = packageIds.map((id, i) => {
      const product = PRODUCTS.find((p) => p.id === id)
      const result = packageResults[i]
      const amountCents =
        result.status === 'fulfilled'
          ? (result.value.unit_amount ?? product?.priceInCents ?? 0)
          : (product?.priceInCents ?? 0)
      return { id, amountCents }
    })

    return Response.json({ depositAmountCents, currency, packages })
  } catch {
    return Response.json({
      depositAmountCents: 15000,
      currency: 'usd',
      packages: [
        { id: 'xmas-roofline', amountCents: 30000 },
        { id: 'xmas-full-front', amountCents: 50000 },
        { id: 'xmas-full-property', amountCents: 100000 },
      ],
    })
  }
}
