export const revalidate = 3600

export async function GET() {
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
