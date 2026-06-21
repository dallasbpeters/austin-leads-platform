import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ensureDocumentTables,
  getSignatureRequestById,
  hasDocumentDatabase,
  listDocumentRecipients,
} from '@/lib/documents/db'
import { renderDocumentSignatureEmailHtml } from '@/lib/documents/email'

export const metadata = {
  title: 'Email preview | Austin Leads Admin',
}

export default async function DocumentEmailPreviewPage({ params }) {
  if (!hasDocumentDatabase()) {
    notFound()
  }

  await ensureDocumentTables()
  const { requestId } = await params
  const request = await getSignatureRequestById(requestId)
  if (!request) {
    notFound()
  }

  const recipients = await listDocumentRecipients(request.id)
  const html = await renderDocumentSignatureEmailHtml({
    client: {
      name: request.client_name,
      email: request.client_email,
    },
    request,
    recipients,
    message: {
      subject: `Signature requested: ${request.title}`,
      body: 'Please review and sign the document using the secure link in this message.',
    },
  })

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Email preview</p>
          <h1 className="text-foreground mt-2 text-3xl tracking-normal">{request.title}</h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
            React Email rendering for the signature request.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={`/documents/${request.id}`}>Back to request</a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rendered email</CardTitle>
          <CardDescription>What the recipient will receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <iframe
              title="Email preview"
              className="min-h-[900px] w-full bg-white"
              sandbox=""
              srcDoc={html}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
