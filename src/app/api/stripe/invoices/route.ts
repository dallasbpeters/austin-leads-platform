import { auth } from '@/auth'
import { stripe } from '@/lib/stripe/stripe'
import { PRODUCTS } from '@/lib/stripe/products'
import { getJobById, setJobInvoiceId, ensureChristmasTables } from '@/lib/christmas/db'

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

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  let body: { jobId?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { jobId } = body
  if (!jobId) {
    return Response.json({ error: 'jobId is required.' }, { status: 400 })
  }

  try {
    await ensureChristmasTables()
    const job = await getJobById(jobId)

    if (!job) {
      return Response.json({ error: 'Job not found.' }, { status: 404 })
    }

    if (job.stripe_invoice_id) {
      return Response.json({ error: 'An invoice already exists for this job.' }, { status: 409 })
    }

    // Determine remaining balance
    const product = PRODUCTS.find((p) => p.id === job.package_slug)
    const totalCents = product?.priceInCents ?? null
    const depositCents = job.deposit_amount_cents ?? 15000
    const remainingCents =
      typeof job.balance_amount_cents === 'number' && job.balance_amount_cents > 0
        ? job.balance_amount_cents
        : totalCents != null
          ? Math.max(0, totalCents - depositCents)
          : null

    if (!remainingCents || remainingCents <= 0) {
      return Response.json(
        { error: 'Cannot determine remaining balance. Set balance_amount_cents on the job first.' },
        { status: 422 },
      )
    }

    const packageName = product?.name ?? job.package_slug ?? 'Installation'

    // Find or create Stripe Customer
    const existingCustomers = await stripe.customers.list({ email: job.email, limit: 1 })
    const customer =
      existingCustomers.data.length > 0
        ? existingCustomers.data[0]
        : await stripe.customers.create({
            name: job.full_name,
            email: job.email,
            metadata: { site_slug: 'txchristmaslights' },
          })

    // Add invoice line item
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: remainingCents,
      currency: 'usd',
      description: `Remaining balance — ${packageName} · ${job.address}`,
    })

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      auto_advance: true,
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: {
        job_id: jobId,
        site_slug: 'txchristmaslights',
        install_date: job.install_date ?? '',
      },
    })

    // Finalize to generate hosted_invoice_url
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id)

    // Persist invoice ID on the job row
    await setJobInvoiceId(jobId, finalized.id)

    return Response.json({
      invoiceId: finalized.id,
      status: finalized.status,
      hostedUrl: finalized.hosted_invoice_url,
      dashboardUrl: stripeDashboardUrl(finalized.id),
      amountDueCents: finalized.amount_due,
    })
  } catch (err) {
    console.error('[api/stripe/invoices POST]', err)
    return Response.json({ error: 'Failed to create invoice.' }, { status: 500 })
  }
}
