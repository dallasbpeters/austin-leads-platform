import { auth } from '@/auth'
import { stripe } from '@/lib/stripe/stripe'
import { PRODUCTS } from '@/lib/stripe/products'
import { getJobById, setJobInvoiceId, clearJobInvoiceId, ensureChristmasTables } from '@/lib/christmas/db'
import { sendInvoiceEmail } from '@/lib/christmas/email'

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

    // Create invoice.
    // auto_advance: false prevents Stripe from automatically charging the customer's
    // stored payment method. The invoice stays open until the customer pays via the
    // hosted_invoice_url that the admin shares manually.
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      auto_advance: false,
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

    // Stripe auto-pays $0 invoices (e.g. when customer credit is applied).
    // Void and reject so the admin can adjust the balance and try again.
    if (finalized.amount_due === 0 || finalized.status === 'paid') {
      try {
        if (finalized.status !== 'void') {
          await stripe.invoices.voidInvoice(finalized.id)
        }
      } catch {
        // best-effort void
      }
      return Response.json(
        {
          error:
            'Invoice amount resolved to $0 (customer credits may have been applied). Set balance_amount_cents on the job and try again.',
        },
        { status: 422 },
      )
    }

    // Persist invoice ID on the job row
    await setJobInvoiceId(jobId, finalized.id)

    // Send branded invoice email to the customer (non-fatal)
    const emailResult = await sendInvoiceEmail({
      job,
      amountDueCents: finalized.amount_due,
      hostedUrl: finalized.hosted_invoice_url ?? '',
      dueDate: finalized.due_date ? new Date(finalized.due_date * 1000).toISOString() : null,
    })

    return Response.json({
      invoiceId: finalized.id,
      status: finalized.status,
      hostedUrl: finalized.hosted_invoice_url,
      dashboardUrl: stripeDashboardUrl(finalized.id),
      amountDueCents: finalized.amount_due,
      emailStatus: emailResult.status,
    })
  } catch (err) {
    console.error('[api/stripe/invoices POST]', err)
    return Response.json({ error: 'Failed to create invoice.' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  let body: { jobId?: string; invoiceId?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { jobId, invoiceId } = body
  if (!jobId || !invoiceId) {
    return Response.json({ error: 'jobId and invoiceId are required.' }, { status: 400 })
  }

  try {
    // Attempt to void or delete the invoice in Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId)

    if (invoice.status === 'draft') {
      await stripe.invoices.del(invoiceId)
    } else if (invoice.status === 'open') {
      await stripe.invoices.voidInvoice(invoiceId)
    }
    // paid/void/uncollectible: leave in Stripe as a record, just unlink from the job

    // Clear the invoice ID from the job so a new one can be created
    await clearJobInvoiceId(jobId)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[api/stripe/invoices DELETE]', err)
    return Response.json({ error: 'Failed to void/delete invoice.' }, { status: 500 })
  }
}
