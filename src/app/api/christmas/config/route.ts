export const revalidate = 3600

export async function GET() {
  return Response.json({
    depositAmountCents: 15_000,
    currency: 'usd',
    packages: [
      { id: 'xmas-roofline', amountCents: 30_000 },
      { id: 'xmas-full-front', amountCents: 50_000 },
      { id: 'xmas-full-property', amountCents: 100_000 },
    ],
  })
}
