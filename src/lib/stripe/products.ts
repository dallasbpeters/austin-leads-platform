export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  stripePriceId: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'deposit',
    name: 'Installation Deposit',
    description: 'Deposit to secure your holiday light installation window',
    priceInCents: 15000,
    stripePriceId: process.env.STRIPE_PRICE_DEPOSIT ?? '',
  },
  {
    id: 'xmas-roofline',
    name: 'Roofline Installation',
    description: 'Roofline, gutter runs, and front entry',
    priceInCents: 30000,
    stripePriceId: process.env.STRIPE_PRICE_XMAS_ROOFLINE ?? '',
  },
  {
    id: 'xmas-full-front',
    name: 'Full Front Installation',
    description: 'Roofline plus trees, bushes, and walkways',
    priceInCents: 50000,
    stripePriceId: process.env.STRIPE_PRICE_XMAS_FULL_FRONT ?? '',
  },
  {
    id: 'xmas-full-property',
    name: 'Full Property Installation',
    description: 'Full front and rear — quoted on walkthrough',
    priceInCents: 100000,
    stripePriceId: process.env.STRIPE_PRICE_XMAS_FULL_PROPERTY ?? '',
  },
]
