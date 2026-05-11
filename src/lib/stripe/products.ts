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
    stripePriceId: 'price_1TVbAOF2OBzUX92SrsR0ZEC8',
  },
  {
    id: 'xmas-roofline',
    name: 'Roofline Installation',
    description: 'Roofline, gutter runs, and front entry',
    priceInCents: 30000,
    stripePriceId: 'price_1TVay2F2OBzUX92SPQEWM2hZ',
  },
  {
    id: 'xmas-full-front',
    name: 'Full Front Installation',
    description: 'Roofline plus trees, bushes, and walkways',
    priceInCents: 50000,
    stripePriceId: 'price_1TVawuF2OBzUX92SwcfBYgmc',
  },
  {
    id: 'xmas-full-property',
    name: 'Full Property Installation',
    description: 'Full front and rear — quoted on walkthrough',
    priceInCents: 100000,
    stripePriceId: 'price_1TVavlF2OBzUX92SuAIbshCM',
  },
]
