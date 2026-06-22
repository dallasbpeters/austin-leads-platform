'use client'

import { LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import PdfPreviewSurface from '@/components/admin/PdfPreviewSurface'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function formatDate(value) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleString()
}

function DocumentMeta({ document }) {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <span>{document.client_name || 'Unknown client'}</span>
      {document.request_title ? <span>| {document.request_title}</span> : null}
      {document.created_at ? <span>| {formatDate(document.created_at)}</span> : null}
    </div>
  )
}

function DocumentPreview({
  document,
  className,
  overlay = null,
  maxRenderWidth = null,
  maxRenderHeight = null,
}) {
  return (
    <div className={className}>
      <PdfPreviewSurface
        sourceUrl={`/api/documents/library/${document.id}/file`}
        title={document.title}
        emptyLabel="No PDF preview available."
        overlay={overlay}
        maxRenderWidth={maxRenderWidth}
        maxRenderHeight={maxRenderHeight}
      />
    </div>
  )
}

function GridCard({ document }) {
  return (
    <Link
      href={`/api/documents/library/${document.id}/file`}
      target="_blank"
      rel="noreferrer"
      className="group block"
    >
      <Card className="border-border/70 bg-background overflow-hidden transition-shadow group-hover:shadow-md">
        <CardContent className="space-y-3 p-3">
          <DocumentPreview
            document={document}
            className="bg-muted/10 h-36 overflow-hidden rounded-md border"
            maxRenderWidth={120}
            maxRenderHeight={90}
          />
          <div className="space-y-1.5">
            <div className="min-w-0">
              <CardTitle className="[display:-webkit-box] overflow-hidden text-[13px] leading-4 [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {document.title}
              </CardTitle>
              <CardDescription className="truncate text-[11px]">{document.file_name}</CardDescription>
            </div>
            <DocumentMeta document={document} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ListRow({ document }) {
  return (
    <Link
      href={`/api/documents/library/${document.id}/file`}
      target="_blank"
      rel="noreferrer"
      className="group block"
    >
      <Card>
        <CardContent className="grid gap-3 p-3 lg:grid-cols-[120px_minmax(0,1fr)]">
          <DocumentPreview
            document={document}
            className="bg-muted/10 h-32 overflow-hidden rounded-md border"
            maxRenderWidth={80}
            maxRenderHeight={40}
          />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="min-w-0">
              <CardTitle className="[display:-webkit-box] overflow-hidden text-sm leading-5 [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {document.title}
              </CardTitle>
              <CardDescription className="truncate text-[11px]">{document.file_name}</CardDescription>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
              <span>{document.client_name || 'Unknown client'}</span>
              {document.request_title ? <span>| {document.request_title}</span> : null}
              {document.created_at ? <span>| {formatDate(document.created_at)}</span> : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DocumentsHistoryBrowser({ documents }) {
  const [view, setView] = useState('grid')
  const visibleDocuments = useMemo(() => documents || [], [documents])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-muted-foreground text-sm">
          {visibleDocuments.length} saved document{visibleDocuments.length === 1 ? '' : 's'}
        </div>
        <div className="bg-background inline-flex rounded-md border p-1 shadow-sm">
          <Button
            type="button"
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <List className="h-4 w-4" />
            List
          </Button>
          <Button
            type="button"
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </Button>
        </div>
      </div>

      {visibleDocuments.length ? (
        view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visibleDocuments.map((document) => (
              <GridCard key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleDocuments.map((document) => (
              <ListRow key={document.id} document={document} />
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-[1rem]">No documents yet</CardTitle>
            <CardDescription>Save or send a PDF to populate the library.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
