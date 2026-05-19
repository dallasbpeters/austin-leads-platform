import { auth } from '@/auth'
import { stripe } from '@/lib/stripe/stripe'

export const runtime = 'nodejs'

async function requireAdmin() {
  const session = await auth().catch(() => null)
  if (!session?.user || session.user.role !== 'admin') {
    return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}

function isTestMode() {
  return (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_')
}

function stripeDashboardUrl(invoiceId: string) {
  return `https://dashboard.stripe.com/${isTestMode() ? 'test/' : ''}invoices/${invoiceId}`
}

export async function GET(_req: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error

  const { invoiceId } = await params

  if (!invoiceId) {
    return Response.json({ error: 'invoiceId is required.' }, { status: 400 })
  }

  try {
    const invoice = await stripe.invoices.retrieve(invoiceId)

    return Response.json({
      invoiceId: invoice.id,
      status: invoice.status,
      hostedUrl: invoice.hosted_invoice_url,
      dashboardUrl: stripeDashboardUrl(invoice.id),
      amountDueCents: invoice.amount_due,
      amountPaidCents: invoice.amount_paid,
      dueDate: invoice.due_date,
    })
  } catch (err) {
    console.error('[api/stripe/invoices GET]', err)
    return Response.json({ error: 'Failed to retrieve invoice.' }, { status: 500 })
  }
}
