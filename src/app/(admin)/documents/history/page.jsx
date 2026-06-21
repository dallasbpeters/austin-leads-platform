import DocumentsHistoryBrowser from '@/components/admin/DocumentsHistoryBrowser'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ensureDocumentTables, hasDocumentDatabase, listDocumentLibraryItems } from '@/lib/documents/db'

export const metadata = {
  title: 'Documents | Austin Leads Admin',
}

export default async function DocumentsHistoryPage() {
  if (!hasDocumentDatabase()) {
    return (
      <div className="p-6 lg:p-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents</CardTitle>
            <CardDescription>Document database is not configured.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  await ensureDocumentTables()
  const documents = await listDocumentLibraryItems({ limit: 100 })

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Documents</p>
          <h1 className="text-foreground mt-2 text-3xl tracking-normal">Stored PDFs</h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
            Browse saved files with list and grid previews sized for scanning, not editing.
          </p>
        </div>
      </div>

      <DocumentsHistoryBrowser documents={documents} />
    </div>
  )
}
