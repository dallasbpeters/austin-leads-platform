'use client'

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSignature,
  LoaderCircle,
  GripVertical,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import Link from 'next/link'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { useEffect, useMemo, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import PdfPreviewSurface from '@/components/admin/PdfPreviewSurface'
import Logo from '@/components/Logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

const initialSubmitters = []

const builderToolSpecs = [
  { type: 'signature', label: 'Signature', role: 'Signer 1', required: true },
  { type: 'initials', label: 'Initials', role: 'Signer 1', required: true },
  { type: 'text', label: 'Text', defaultValue: '', required: true },
  { type: 'checkbox', label: 'Checkbox', required: false },
  { type: 'date', label: 'Date', required: true },
  { type: 'name', label: 'Name', required: true },
  { type: 'email', label: 'Email', required: true },
  { type: 'company', label: 'Company', required: false },
  { type: 'title', label: 'Title', required: false },
  { type: 'label', label: 'Label', required: false },
]

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      const result = String(reader.result || '')
      resolve(result.includes(',') ? result.split(',').pop() : result)
    })
    reader.addEventListener('error', reject)
    reader.readAsDataURL(file)
  })
}

function createFieldId() {
  return crypto.randomUUID()
}

function getBuilderToolSpec(type = 'signature') {
  return (
    builderToolSpecs.find((item) => item.type === type) || {
      type,
      label: 'Text',
      required: false,
    }
  )
}

function defaultBuilderField(type = 'signature') {
  const spec = getBuilderToolSpec(type)
  const isWideField = ['signature', 'text', 'company', 'title', 'label', 'email', 'name'].includes(type)
  const isTinyField = ['initials', 'checkbox', 'date'].includes(type)

  return {
    id: createFieldId(),
    type,
    label: type === 'text' ? '' : spec.label,
    role: spec.role || '',
    defaultValue: spec.defaultValue || '',
    required: spec.required !== false,
    x: type === 'signature' ? 0.16 : 0.12,
    y: 0.12,
    w: isWideField ? 0.34 : isTinyField ? 0.18 : 0.28,
    h: type === 'signature' ? 0.09 : isTinyField ? 0.05 : 0.06,
    page: 1,
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function createBuilderFieldAtPoint(type, rect, point) {
  const x = clamp((point.x - rect.left) / rect.width, 0.02, 0.92)
  const y = clamp((point.y - rect.top) / rect.height, 0.02, 0.92)
  return {
    ...defaultBuilderField(type),
    x,
    y,
  }
}

function renderBuilderFieldCard(field, isSelected = false) {
  const isSignature = field.type === 'signature'
  const isInitials = field.type === 'initials'
  const isCheckbox = field.type === 'checkbox'
  const isDate = field.type === 'date'
  const isName = field.type === 'name'
  const isEmail = field.type === 'email'
  const isCompany = field.type === 'company'
  const isTitle = field.type === 'title'
  const labelText = field.label?.trim() || ''
  const defaultText = field.defaultValue?.trim() || ''
  const displayLabel = isSignature
    ? 'Sign Here'
    : isInitials
      ? labelText || 'Initials'
      : isCheckbox
        ? labelText
        : isDate
          ? defaultText || labelText
          : isName
            ? defaultText || labelText
            : isEmail
              ? defaultText || labelText
              : isCompany
                ? defaultText || labelText
                : isTitle
                  ? defaultText || labelText
                  : defaultText || labelText

  return (
    <div
      className={`flex h-full flex-col justify-between px-2 py-1 text-left ${
        isSelected ? 'drop-shadow-[0_0_0_2px_rgba(59,130,246,0.35)]' : ''
      }`}
    >
      <div className="flex items-start gap-1.5">
        {isCheckbox ? (
          <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-slate-900 bg-white">
            <Check className="h-3 w-3 text-slate-900" />
          </span>
        ) : null}
        <span
          className={`tracking-normal ${
            isSignature
              ? 'inline-block bg-amber-100 px-1 py-0.5 text-[22px] font-normal text-slate-950'
              : isInitials
                ? 'text-[20px] font-normal text-slate-950'
                : isCheckbox
                  ? 'text-[18px] font-medium text-slate-950'
                  : isDate
                    ? 'text-sm font-medium text-slate-950 underline decoration-slate-300 underline-offset-4'
                    : 'text-sm font-medium text-slate-950'
          }`}
        >
          {displayLabel}
        </span>
        {field.required !== false && displayLabel ? <span className="mt-0.5 text-red-500">*</span> : null}
      </div>
    </div>
  )
}

function buildDocusealFields(fields, pageSize = { width: 612, height: 792 }) {
  const pageWidth = Number(pageSize.width) || 612
  const pageHeight = Number(pageSize.height) || 792

  return fields.map((field, index) => {
    const isSignature = field.type === 'signature' || field.type === 'initials'
    const isTextLike = ['text', 'name', 'email', 'company', 'title', 'label', 'date'].includes(field.type)
    const isCheckbox = field.type === 'checkbox'
    const fieldType = isCheckbox ? 'checkbox' : isSignature ? 'signature' : 'text'
    const name = field.label?.trim() || `${field.type || 'field'} ${index + 1}`
    return {
      name,
      type: fieldType,
      role: isSignature ? field.role?.trim() || 'Signer 1' : undefined,
      required: field.required !== false,
      title: field.label?.trim() || name,
      areas: [
        {
          x: Math.round(clamp(field.x, 0, 1) * pageWidth),
          y: Math.round((1 - clamp(field.y, 0, 1) - clamp(field.h || 0.06, 0.02, 0.2)) * pageHeight),
          w: Math.round(clamp(field.w || 0.34, 0.08, 0.8) * pageWidth),
          h: Math.round(clamp(field.h || 0.06, 0.03, 0.18) * pageHeight),
          page: field.page || 1,
        },
      ],
      ...(isTextLike && field.defaultValue ? { default_value: field.defaultValue } : {}),
    }
  })
}

async function getPdfPageSizeFromFile(file) {
  if (!file) return { width: 612, height: 792 }
  const pdfDoc = await PDFDocument.load(await file.arrayBuffer())
  const firstPage = pdfDoc.getPages()[0]
  if (!firstPage) return { width: 612, height: 792 }
  const { width, height } = firstPage.getSize()
  return { width, height }
}

async function getPdfPageCountFromBytes(bytes) {
  const pdfDoc = await PDFDocument.load(bytes)
  return pdfDoc.getPageCount() || 1
}

async function getPdfPageCountFromFile(file) {
  if (!file) return 1
  return getPdfPageCountFromBytes(await file.arrayBuffer())
}

async function getPdfPageCountFromBase64(fileBase64) {
  const clean = String(fileBase64 || '').replace(/\s+/g, '')
  if (!clean) return 1

  const binary = atob(clean)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return getPdfPageCountFromBytes(bytes)
}

async function createGeneratedPdfFile({ title, client, summary, notes }) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const logo = await (async () => {
    try {
      const response = await fetch('/images/tx-solar-logo.png')
      if (!response.ok) {
        throw new Error('Brand logo asset not available.')
      }

      const logoBytes = await response.arrayBuffer()
      return await pdfDoc.embedPng(logoBytes)
    } catch {
      const logoMarkup = renderToStaticMarkup(<Logo height={96} width={118} />)
      const logoSvgUrl = URL.createObjectURL(new Blob([logoMarkup], { type: 'image/svg+xml;charset=utf-8' }))

      try {
        const image = new Image()
        image.decoding = 'async'
        image.src = logoSvgUrl
        await image.decode()

        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth || 118
        canvas.height = image.naturalHeight || 96
        const context = canvas.getContext('2d')
        if (!context) {
          throw new Error('Canvas context not available.')
        }
        context.drawImage(image, 0, 0)

        return await pdfDoc.embedPng(canvas.toDataURL('image/png'))
      } finally {
        URL.revokeObjectURL(logoSvgUrl)
      }
    }
  })()
  const { width, height } = page.getSize()
  const margin = 38
  const accent = rgb(0.06, 0.21, 0.29)
  const accentLight = rgb(0.94, 0.97, 1)
  const muted = rgb(0.38, 0.43, 0.48)
  const border = rgb(0.82, 0.87, 0.92)
  const panel = rgb(1, 1, 1)
  const docTitle = title?.trim() || 'Signature packet'
  const preparedFor = client?.name || 'Client'
  const preparedEmail = client?.email || 'client@example.com'

  function drawParagraph(text, x, y, maxWidth, size, fontFace, color) {
    const words = String(text || '')
      .split(/\s+/)
      .filter(Boolean)
    const lines = []
    let line = ''

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (fontFace.widthOfTextAtSize(candidate, size) > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }

    if (line) {
      lines.push(line)
    }

    let currentY = y
    for (const item of lines) {
      page.drawText(item, { x, y: currentY, size, font: fontFace, color })
      currentY -= size + 4
    }
    return currentY
  }

  function drawKeyValue(label, value, x, y, valueSize = 11, valueFont = font) {
    page.drawText(label, {
      x,
      y,
      size: 8.5,
      font: boldFont,
      color: muted,
    })
    page.drawText(value, {
      x,
      y: y - 15,
      size: valueSize,
      font: valueFont,
      color: accent,
    })
  }

  function drawSectionTitle(sectionTitle, x, y) {
    page.drawText(sectionTitle.toUpperCase(), {
      x,
      y,
      size: 8.5,
      font: boldFont,
      color: muted,
    })
  }

  function drawPanel(x, y, w, h, fillColor = panel) {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderWidth: 1,
      borderColor: border,
      color: fillColor,
    })
  }

  page.drawRectangle({
    x: 0,
    y: height - 128,
    width,
    height: 12,
    color: rgb(0.11, 0.4, 0.67),
  })
  const logoDims = logo.scaleToFit(176, 64)
  page.drawImage(logo, {
    x: margin,
    y: height - 96,
    width: logoDims.width,
    height: logoDims.height,
  })
  page.drawText(docTitle, {
    x: margin,
    y: height - 174,
    size: 22,
    font: boldFont,
    color: accent,
  })
  page.drawText('Prepared for electronic signature', {
    x: margin,
    y: height - 152,
    size: 8.5,
    font,
    color: muted,
  })

  let y = height - 214
  drawPanel(margin, y - 84, width - margin * 2, 84, accentLight)
  drawKeyValue('Prepared for', preparedFor, margin + 14, y - 20, 12, boldFont)
  drawKeyValue('Email', preparedEmail, margin + 250, y - 20, 11, font)
  drawKeyValue('Document type', 'Signature packet', margin + 14, y - 52, 11, font)
  drawKeyValue('Request date', new Date().toLocaleDateString(), margin + 250, y - 52, 11, font)

  y -= 110
  drawSectionTitle('Document summary', margin, y)
  y -= 14
  drawPanel(margin, y - 104, width - margin * 2, 104, panel)
  drawParagraph(
    summary || 'No summary provided.',
    margin + 14,
    y - 16,
    width - margin * 2 - 28,
    11.5,
    font,
    accent,
  )

  y -= 126
  drawSectionTitle('Review notes', margin, y)
  y -= 14
  drawPanel(margin, y - 110, width - margin * 2, 110, panel)
  drawParagraph(
    notes || 'No additional notes provided.',
    margin + 14,
    y - 16,
    width - margin * 2 - 28,
    11.5,
    font,
    muted,
  )

  y -= 138
  drawSectionTitle('Signature', margin, y)
  y -= 14
  drawPanel(margin, y - 84, width - margin * 2, 84, rgb(0.99, 0.99, 0.995))
  page.drawText('Sign here', {
    x: margin + 16,
    y: y - 20,
    size: 11,
    font: boldFont,
    color: accent,
  })
  page.drawLine({
    start: { x: margin + 16, y: y - 46 },
    end: { x: margin + 238, y: y - 46 },
    thickness: 1.5,
    color: accent,
  })
  page.drawText('Signature', {
    x: margin + 16,
    y: y - 58,
    size: 8,
    font: boldFont,
    color: muted,
  })
  page.drawLine({
    start: { x: margin + 292, y: y - 46 },
    end: { x: margin + 420, y: y - 46 },
    thickness: 1,
    color: border,
  })
  page.drawText('Date', {
    x: margin + 292,
    y: y - 58,
    size: 8,
    font: boldFont,
    color: muted,
  })

  page.drawText('Generated for Texas Solar & Roofing Pros.', {
    x: margin,
    y: 34,
    size: 8.5,
    font,
    color: muted,
  })

  const bytes = await pdfDoc.save()
  return new File(
    [bytes],
    `${(title || 'signature-request').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`,
    {
      type: 'application/pdf',
    },
  )
}

function ResultPanel({ result }) {
  if (!result) return null

  const recipients = Array.isArray(result.recipients) ? result.recipients : []
  const emailStatus = result.email?.status || 'unknown'
  const emailReason = result.email?.reason || ''
  const documentAsset = result.documentAsset || null

  return (
    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Request sent</AlertTitle>
      <AlertDescription>
        <p>
          Request was saved. Email status: <span className="font-medium">{emailStatus}</span>
          {emailReason ? ` · ${emailReason}` : ''}.
        </p>
        {recipients.length ? (
          <div className="border-border overflow-hidden rounded-md border bg-white">
            {recipients.map((recipient, index) => (
              <div
                className="border-border flex flex-col gap-2 border-b p-3 text-sm last:border-b-0 md:flex-row md:items-center md:justify-between"
                key={recipient.id || recipient.email || index}
              >
                <div>
                  <div className="font-medium">
                    {recipient.name || recipient.email || `Signer ${index + 1}`}
                  </div>
                  <div className="text-muted-foreground">
                    {recipient.email}
                    {recipient.status ? ` · ${recipient.status}` : ''}
                  </div>
                </div>
                {recipient.signing_url ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard?.writeText(recipient.signing_url)}
                    >
                      <Copy className="h-4 w-4" />
                      Copy link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      href={recipient.signing_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </Button>
                    {documentAsset ? (
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/api/documents/library/${documentAsset.id}/file`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open file
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}

export default function DocumentsClient({
  docusealConfigured,
  docusealBaseUrl,
  resendConfigured,
  documentDbReady,
  dbConfigured,
  dbError,
  initialClients,
  initialRequests,
  initialDocuments,
  showHistory = false,
}) {
  const [mode, setMode] = useState('pdf')
  const [sourceMode, setSourceMode] = useState('upload')
  const [name, setName] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [file, setFile] = useState(null)
  const [clients, setClients] = useState(initialClients)
  const [_requests, setRequests] = useState(initialRequests)
  const [documents, setDocuments] = useState(initialDocuments || [])
  const [clientId, setClientId] = useState(initialClients[0]?.id || '')
  const [documentAssetId, setDocumentAssetId] = useState(initialDocuments[0]?.id || '')
  const [quickClientName, setQuickClientName] = useState('')
  const [quickClientEmail, setQuickClientEmail] = useState('')
  const [additionalRecipients, setAdditionalRecipients] = useState(initialSubmitters)
  const [sendEmail, setSendEmail] = useState(true)
  const [requireEmail2fa, setRequireEmail2fa] = useState(false)
  const [legalDisclosureAccepted, setLegalDisclosureAccepted] = useState(false)
  const [order, setOrder] = useState('preserved')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [creatingClient, setCreatingClient] = useState(false)
  const [generatedPdfTitle, _setGeneratedPdfTitle] = useState('')
  const [generatedPdfSummary, _setGeneratedPdfSummary] = useState('')
  const [generatedPdfNotes, _setGeneratedPdfNotes] = useState('')
  const [savedDocumentQuery, setSavedDocumentQuery] = useState('')
  const [filePreviewUrl, setFilePreviewUrl] = useState('')
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState('')
  const [builderOpen, setBuilderOpen] = useState(false)
  const [builderTool, setBuilderTool] = useState('signature')
  const [builderFields, setBuilderFields] = useState([defaultBuilderField('signature')])
  const [selectedBuilderFieldId, setSelectedBuilderFieldId] = useState('')
  const [builderPage, setBuilderPage] = useState(1)
  const [builderPageCount, setBuilderPageCount] = useState(1)
  const [builderSaving, setBuilderSaving] = useState(false)
  const [builderStatus, setBuilderStatus] = useState('')
  const dragStateRef = useRef(null)
  const message = {
    subject: 'Signature requested: {{submission.name}}',
    body: 'Please review and sign this document using the secure link below.',
  }
  const fieldIds = {
    clientSelect: 'documents-client-select',
    quickClientName: 'documents-quick-client-name',
    quickClientEmail: 'documents-quick-client-email',
    requestTitle: 'documents-request-title',
    documentName: 'documents-document-name',
    generatedTitle: 'documents-generated-title',
    generatedSummary: 'documents-generated-summary',
    generatedNotes: 'documents-generated-notes',
    uploadFile: 'documents-upload-file',
    savedDocument: 'documents-saved-document',
    savedDocumentSearch: 'documents-saved-document-search',
    sendEmail: 'documents-send-email',
    require2fa: 'documents-require-2fa',
    order: 'documents-order',
    consent: 'documents-consent',
  }

  const selectedClient = clients.find((client) => client.id === clientId)
  const selectedDocument = documents.find((document) => document.id === documentAssetId)
  const filteredDocuments = useMemo(() => {
    const query = savedDocumentQuery.trim().toLowerCase()
    if (!query) return documents

    return documents.filter((document) => {
      const haystack = [
        document.title,
        document.file_name,
        document.client_name,
        document.request_title,
        document.source_type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [documents, savedDocumentQuery])
  const primaryRecipient = selectedClient
    ? {
        name: selectedClient.name,
        email: selectedClient.email,
        role: 'Signer 1',
        requireEmail2fa: false,
      }
    : null
  const recipients = primaryRecipient ? [primaryRecipient, ...additionalRecipients] : []
  const documentSourceReady =
    sourceMode === 'generated'
      ? Boolean(generatedPdfTitle.trim())
      : sourceMode === 'reuse'
        ? Boolean(selectedDocument)
        : Boolean(file)
  useEffect(() => {
    if (!file) {
      setFilePreviewUrl('')
      return undefined
    }

    const nextUrl = URL.createObjectURL(file)
    setFilePreviewUrl(nextUrl)

    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [file])

  useEffect(() => {
    if (sourceMode !== 'generated') {
      setGeneratedPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return ''
      })
      return undefined
    }

    let cancelled = false
    let nextUrl = ''

    async function buildPreview() {
      try {
        const previewFile = await createGeneratedPdfFile({
          title: documentName.trim() || generatedPdfTitle || name,
          client: selectedClient,
          summary: generatedPdfSummary,
          notes: generatedPdfNotes,
        })

        if (cancelled) return

        nextUrl = URL.createObjectURL(previewFile)
        setGeneratedPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current)
          return nextUrl
        })
      } catch {
        if (!cancelled) {
          setGeneratedPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current)
            return ''
          })
        }
      }
    }

    buildPreview()

    return () => {
      cancelled = true
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl)
      }
    }
  }, [
    documentName,
    generatedPdfNotes,
    generatedPdfSummary,
    generatedPdfTitle,
    name,
    selectedClient,
    sourceMode,
  ])

  useEffect(() => {
    if (!builderFields.length) {
      setSelectedBuilderFieldId('')
      return
    }

    if (!selectedBuilderFieldId || !builderFields.some((field) => field.id === selectedBuilderFieldId)) {
      setSelectedBuilderFieldId(builderFields[0].id)
    }
  }, [builderFields, selectedBuilderFieldId])

  useEffect(() => {
    if (sourceMode === 'generated' || sourceMode === 'upload') {
      setBuilderOpen(true)
    }
  }, [sourceMode])

  useEffect(() => {
    if (sourceMode === 'upload' && file) {
      setBuilderOpen(true)
    }
  }, [file, sourceMode])

  useEffect(() => {
    let cancelled = false

    async function resolvePageCount() {
      try {
        if (sourceMode === 'generated') {
          if (!cancelled) setBuilderPageCount(1)
          return
        }

        if (sourceMode === 'upload' && file) {
          const nextCount = await getPdfPageCountFromFile(file)
          if (!cancelled) setBuilderPageCount(nextCount)
          return
        }

        if (sourceMode === 'reuse' && selectedDocument) {
          const metadataPageCount = Number(selectedDocument.metadata?.pageCount)
          if (Number.isFinite(metadataPageCount) && metadataPageCount > 0) {
            if (!cancelled) setBuilderPageCount(Math.max(1, Math.round(metadataPageCount)))
            return
          }

          if (selectedDocument.file_base64) {
            const nextCount = await getPdfPageCountFromBase64(selectedDocument.file_base64)
            if (!cancelled) setBuilderPageCount(nextCount)
            return
          }
        }

        if (!cancelled) setBuilderPageCount(1)
      } catch {
        if (!cancelled) setBuilderPageCount(1)
      }
    }

    resolvePageCount()

    return () => {
      cancelled = true
    }
  }, [file, selectedDocument, sourceMode])

  useEffect(() => {
    setBuilderPage((current) => clamp(current, 1, Math.max(1, builderPageCount)))
  }, [builderPageCount])

  useEffect(() => {
    if (sourceMode === 'generated' && generatedPdfTitle.trim()) {
      setDocumentName((current) => (current.trim() ? current : generatedPdfTitle.trim()))
    }
  }, [generatedPdfTitle, sourceMode])

  useEffect(() => {
    if (sourceMode === 'reuse' && selectedDocument && !documentName.trim()) {
      setDocumentName(selectedDocument.title || selectedDocument.file_name || '')
    }
  }, [documentName, selectedDocument, sourceMode])

  useEffect(() => {
    function stopDragging() {
      dragStateRef.current = null
    }

    function moveDraggingField(event) {
      const dragState = dragStateRef.current
      if (!dragState || event.pointerId !== dragState.pointerId) return

      const field = builderFields.find((item) => item.id === dragState.fieldId)
      if (!field) return

      const previewRect = dragState.pageElement?.getBoundingClientRect()
      if (!previewRect) return
      const fieldWidth = clamp(field.w || 0.34, 0.08, 0.8)
      const fieldHeight = clamp(field.h || 0.06, 0.03, 0.18)
      const nextX = clamp(
        (event.clientX - previewRect.left - dragState.offsetX) / previewRect.width,
        0,
        1 - fieldWidth,
      )
      const nextY = clamp(
        (event.clientY - previewRect.top - dragState.offsetY) / previewRect.height,
        0,
        1 - fieldHeight,
      )

      setBuilderFields((current) =>
        current.map((item) => (item.id === dragState.fieldId ? { ...item, x: nextX, y: nextY } : item)),
      )
    }

    window.addEventListener('pointermove', moveDraggingField)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)
    window.addEventListener('blur', stopDragging)

    return () => {
      window.removeEventListener('pointermove', moveDraggingField)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
      window.removeEventListener('blur', stopDragging)
    }
  }, [builderFields])

  function addBuilderFieldAtPoint(type, event, pageNumber = builderPage) {
    const rect = event.currentTarget.getBoundingClientRect()
    const nextField = createBuilderFieldAtPoint(type, rect, {
      x: event.clientX,
      y: event.clientY,
    })
    setBuilderFields((current) => [...current, { ...nextField, page: pageNumber }])
    setSelectedBuilderFieldId(nextField.id)
  }

  function updateBuilderField(fieldId, updates) {
    setBuilderFields((current) =>
      current.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
    )
  }

  function removeBuilderField(fieldId) {
    setBuilderFields((current) => current.filter((field) => field.id !== fieldId))
    setSelectedBuilderFieldId((current) => (current === fieldId ? '' : current))
  }

  function startDraggingBuilderField(fieldId, event) {
    const fieldElement = event.currentTarget
    const fieldRect = fieldElement.getBoundingClientRect()
    const pageElement = fieldElement.closest('[data-builder-page]')

    dragStateRef.current = {
      fieldId,
      pointerId: event.pointerId,
      offsetX: event.clientX - fieldRect.left,
      offsetY: event.clientY - fieldRect.top,
      pageElement,
    }

    fieldElement.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const selectedBuilderField = builderFields.find((field) => field.id === selectedBuilderFieldId) || null

  useEffect(() => {
    if (selectedBuilderField?.page) {
      setBuilderPage(selectedBuilderField.page)
    }
  }, [selectedBuilderField?.page])

  const builderPreviewSourceUrl =
    sourceMode === 'upload'
      ? filePreviewUrl
      : sourceMode === 'generated'
        ? generatedPreviewUrl
        : sourceMode === 'reuse' && selectedDocument
          ? `/api/documents/library/${selectedDocument.id}/file`
          : ''

  function startDraggingTool(type, event) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/x-alp-builder-tool', type)
    event.dataTransfer.setData('text/plain', type)
    setBuilderTool(type)
  }

  function handleBuilderToolDrop(pageNumber, event) {
    event.preventDefault()
    const type =
      event.dataTransfer.getData('application/x-alp-builder-tool') ||
      event.dataTransfer.getData('text/plain') ||
      builderTool
    if (!type) return
    addBuilderFieldAtPoint(type, event, pageNumber)
  }

  function renderBuilderPageOverlay(pageNumber) {
    const pageFields = builderFields.filter((field) => (field.page || 1) === pageNumber)

    return (
      <div
        data-builder-page
        data-builder-page-number={pageNumber}
        className="absolute inset-0 z-20"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleBuilderToolDrop(pageNumber, event)}
      >
        <button
          type="button"
          className="absolute inset-0 z-0 cursor-crosshair bg-transparent"
          aria-label={`Place ${builderTool} field on PDF page ${pageNumber}`}
          onClick={(event) => addBuilderFieldAtPoint(builderTool, event, pageNumber)}
        />
        {pageFields.map((field, index) => (
          <button
            key={field.id}
            type="button"
            aria-label={`Drag ${field.type === 'signature' ? 'signature' : 'text'} field ${
              index + 1
            } on page ${pageNumber}`}
            className={`absolute cursor-move rounded-md bg-white/95 px-0 py-0 text-left shadow-sm ${
              selectedBuilderFieldId === field.id ? 'border-blue-700' : 'border-slate-300'
            }`}
            onPointerDown={(event) => {
              setSelectedBuilderFieldId(field.id)
              startDraggingBuilderField(field.id, event)
            }}
            onClick={() => setSelectedBuilderFieldId(field.id)}
            style={{
              zIndex: selectedBuilderFieldId === field.id ? 11 : 10,
              left: `${clamp(field.x, 0, 0.95) * 100}%`,
              top: `${clamp(field.y, 0, 0.95) * 100}%`,
              width: `${clamp(field.w, 0.08, 0.8) * 100}%`,
              minHeight: `${clamp(field.h, 0.03, 0.18) * 100}%`,
              touchAction: 'none',
            }}
          >
            {renderBuilderFieldCard(field, selectedBuilderFieldId === field.id)}
          </button>
        ))}
      </div>
    )
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (!selectedBuilderFieldId) return
      if (event.defaultPrevented) return
      if (event.key !== 'Delete' && event.key !== 'Backspace') return

      const target = event.target
      if (target instanceof HTMLElement) {
        const tagName = target.tagName
        if (
          target.isContentEditable ||
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT'
        ) {
          return
        }
      }

      event.preventDefault()
      removeBuilderField(selectedBuilderFieldId)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedBuilderFieldId])

  function updateRecipient(index, updates) {
    setAdditionalRecipients((current) =>
      current.map((submitter, submitterIndex) =>
        submitterIndex === index ? { ...submitter, ...updates } : submitter,
      ),
    )
  }

  function addRecipient() {
    setAdditionalRecipients((current) => [
      ...current,
      { name: '', email: '', role: `Signer ${current.length + 2}`, requireEmail2fa },
    ])
  }

  function removeRecipient(index) {
    setAdditionalRecipients((current) => current.filter((_, submitterIndex) => submitterIndex !== index))
  }

  async function refreshDocumentData() {
    setRefreshing(true)
    setError('')

    try {
      const [clientsResponse, requestsResponse, libraryResponse] = await Promise.all([
        fetch('/api/clients?limit=200'),
        fetch('/api/documents/signature-requests?limit=100'),
        fetch('/api/documents/library?limit=50'),
      ])
      const clientsData = await clientsResponse.json()
      const requestsData = await requestsResponse.json()
      const libraryData = await libraryResponse.json()

      if (!clientsResponse.ok) throw new Error(clientsData?.error || 'Unable to load clients.')
      if (!requestsResponse.ok) throw new Error(requestsData?.error || 'Unable to load document requests.')
      if (!libraryResponse.ok) throw new Error(libraryData?.error || 'Unable to load document library.')

      setClients(clientsData.clients || [])
      setRequests(requestsData.requests || [])
      setDocuments(libraryData.documents || [])
      setDocumentAssetId((current) => current || libraryData.documents?.[0]?.id || '')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to refresh document data.')
    } finally {
      setRefreshing(false)
    }
  }

  async function createQuickClient() {
    setCreatingClient(true)
    setError('')

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickClientName,
          email: quickClientEmail,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to create client.')
      }

      setClients((current) => [data.client, ...current.filter((client) => client.id !== data.client.id)])
      setClientId(data.client.id)
      setQuickClientName('')
      setQuickClientEmail('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create client.')
    } finally {
      setCreatingClient(false)
    }
  }

  function selectClient(nextClientId) {
    setClientId(nextClientId)
  }

  function clearClient() {
    setClientId('')
    setAdditionalRecipients(initialSubmitters)
  }

  function selectDocument(nextDocumentId) {
    setDocumentAssetId(nextDocumentId)
    setSourceMode('reuse')
    const nextDocument = documents.find((document) => document.id === nextDocumentId)
    if (nextDocument) {
      setDocumentName(nextDocument.title || nextDocument.file_name || '')
      setSavedDocumentQuery(nextDocument.title || nextDocument.file_name || '')
    }
  }

  async function getCurrentPdfFile() {
    if (sourceMode === 'generated') {
      return createGeneratedPdfFile({
        title: documentName.trim() || generatedPdfTitle || name,
        client: selectedClient,
        summary: generatedPdfSummary,
        notes: generatedPdfNotes,
      })
    }

    if (sourceMode === 'reuse' && selectedDocument) {
      const response = await fetch(`/api/documents/library/${selectedDocument.id}/file`)
      if (!response.ok) {
        throw new Error('Unable to load the saved PDF.')
      }
      const blob = await response.blob()
      return new File([blob], selectedDocument.file_name || 'document.pdf', {
        type: blob.type || 'application/pdf',
      })
    }

    if (file) {
      return file
    }

    throw new Error('No PDF source is available to save.')
  }

  async function saveCurrentPdf() {
    setBuilderSaving(true)
    setBuilderStatus('')
    setError('')

    try {
      const currentFile = await getCurrentPdfFile()
      const fileBase64 = await readFileAsBase64(currentFile)
      const response = await fetch('/api/documents/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: documentName.trim() || generatedPdfTitle || name || selectedDocument?.title || 'Branded PDF',
          fileName: currentFile.name,
          fileBase64,
          clientId: selectedClient?.id || clientId || null,
          sourceType: sourceMode === 'generated' ? 'generated' : sourceMode === 'reuse' ? 'reuse' : 'upload',
          metadata: {
            builderFields,
            sourceMode,
            pageCount: builderPageCount,
            createdAt: new Date().toISOString(),
          },
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save the PDF.')
      }

      if (data.document) {
        setDocuments((current) => [
          data.document,
          ...current.filter((document) => document.id !== data.document.id),
        ])
        setDocumentAssetId(data.document.id)
        setSourceMode('reuse')
      }

      setBuilderStatus('PDF saved to the document library.')
    } catch (saveError) {
      setBuilderStatus('')
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the PDF.')
    } finally {
      setBuilderSaving(false)
    }
  }

  function getSendBlockingReasons() {
    const reasons = []
    if (!documentDbReady) reasons.push('the document database is not ready')
    if (!docusealConfigured) reasons.push('signing service is not configured')
    if (!clientId) reasons.push('select or create a client')
    if (!primaryRecipient) reasons.push('select a client recipient')
    if (!documentSourceReady) {
      reasons.push(sourceMode === 'reuse' ? 'choose a saved document source' : 'add a PDF source')
    }
    if (sendEmail && !resendConfigured) reasons.push('configure Resend or disable email delivery')
    if (!legalDisclosureAccepted) reasons.push('accept the disclosure')
    return reasons
  }

  function submitDocument(event) {
    event.preventDefault()
    setError('')
    setResult(null)

    const blockingReasons = getSendBlockingReasons()
    if (blockingReasons.length) {
      setError(`Cannot send yet: ${blockingReasons.join(', ')}.`)
      return
    }

    setSubmitting(true)

    async function sendDocument() {
      let fileBase64 = ''
      let fileName = file?.name || null
      let pageSize = { width: 612, height: 792 }

      if (mode === 'pdf') {
        if (sourceMode === 'generated') {
          const generatedFile = await createGeneratedPdfFile({
            title: documentName.trim() || generatedPdfTitle || name,
            client: selectedClient,
            summary: generatedPdfSummary,
            notes: generatedPdfNotes,
          })
          fileName = generatedFile.name
          fileBase64 = await readFileAsBase64(generatedFile)
        } else if (sourceMode === 'reuse' && selectedDocument) {
          fileName = selectedDocument.file_name
          fileBase64 = selectedDocument.file_base64
          pageSize =
            selectedDocument.metadata?.pageSize &&
            Number.isFinite(Number(selectedDocument.metadata.pageSize.width)) &&
            Number.isFinite(Number(selectedDocument.metadata.pageSize.height))
              ? {
                  width: Number(selectedDocument.metadata.pageSize.width),
                  height: Number(selectedDocument.metadata.pageSize.height),
                }
              : pageSize
        } else if (sourceMode === 'upload') {
          pageSize = await getPdfPageSizeFromFile(file)
          fileBase64 = file ? await readFileAsBase64(file) : ''
        }
      }

      const documentFields = mode === 'pdf' ? buildDocusealFields(builderFields, pageSize) : []

      const response = await fetch('/api/docuseal/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          sourceMode,
          name,
          clientId,
          fileName,
          fileBase64,
          documentAssetId,
          builderFields,
          documentFields,
          sendEmail,
          order,
          submitters: recipients.map((recipient, index) => ({
            ...recipient,
            order: index,
            requireEmail2fa: requireEmail2fa || recipient.requireEmail2fa,
          })),
          message,
          pageSize,
          legalDisclosureAccepted,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to create the signature request.')
      }

      setResult(data)
      setRequests((current) => [data.request, ...current.filter((request) => request.id !== data.request.id)])
      if (data.documentAsset) {
        setDocuments((current) => [
          data.documentAsset,
          ...current.filter((document) => document.id !== data.documentAsset.id),
        ])
        setDocumentAssetId(data.documentAsset.id)
      }
    }

    sendDocument()
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to send the document.')
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Document signing</p>
          <h1 className="text-foreground mt-2 text-3xl tracking-normal">
            Create and send signature requests
          </h1>
          <p className="text-muted-foreground mt-3 max-w-3xl text-base leading-7">
            Store client records, send signing links through Resend, and keep audit metadata attached to each
            request.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={docusealConfigured ? 'default' : 'outline'} className="h-fit">
            {docusealConfigured ? 'Signing service configured' : 'Signing service missing'}
          </Badge>
          <Badge variant={resendConfigured ? 'default' : 'outline'} className="h-fit">
            {resendConfigured ? 'Resend configured' : 'Resend missing'}
          </Badge>
        </div>
      </div>

      {!documentDbReady ? (
        <Alert>
          <AlertTriangle className="absolute top-3.5 left-4 h-4 w-4" />
          <AlertTitle>Database not ready</AlertTitle>
          <AlertDescription>
            {dbConfigured
              ? 'The database is configured, but document tables did not load.'
              : 'Set up the platform database before sending documents.'}
            {dbError ? (
              <pre className="bg-muted text-foreground/80 mt-3 overflow-x-auto rounded border p-3 text-xs">
                {JSON.stringify(dbError, null, 2)}
              </pre>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      {!docusealConfigured ? (
        <Alert>
          <AlertTriangle className="absolute top-3.5 left-4 h-4 w-4" />
          <AlertTitle>Signing service not connected</AlertTitle>
          <AlertDescription>
            Configure the signing service connection. Target:{' '}
            <span className="font-medium">{docusealBaseUrl}</span>.
          </AlertDescription>
        </Alert>
      ) : null}

      {documentDbReady && !resendConfigured ? (
        <Alert>
          <AlertTriangle className="absolute top-3.5 left-4 h-4 w-4" />
          <AlertTitle>Resend not ready</AlertTitle>
          <AlertDescription>
            Add <span className="font-medium">RESEND_API_KEY</span> and{' '}
            <span className="font-medium">RESEND_FROM_EMAIL</span>.
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="absolute top-3.5 left-4 h-4 w-4" />
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <ResultPanel result={result} />

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" onSubmit={submitDocument}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Client and recipients</CardTitle>
                  <CardDescription>Client is signer 1.</CardDescription>
                </div>
                <Button variant="outline" size="sm" href="/clients">
                  Manage clients
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid gap-2">
                  <label className="text-foreground text-sm font-medium" htmlFor={fieldIds.clientSelect}>
                    Client
                  </label>
                  <select
                    id={fieldIds.clientSelect}
                    name="clientId"
                    className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-sm border px-3 text-sm outline-none focus-visible:ring-[3px]"
                    value={clientId}
                    onChange={(event) => selectClient(event.target.value)}
                    disabled={!clients.length}
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="button" variant="outline" onClick={clearClient} disabled={!clientId}>
                  Clear
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <Input
                  id={fieldIds.quickClientName}
                  name="quickClientName"
                  value={quickClientName}
                  onChange={(event) => setQuickClientName(event.target.value)}
                  placeholder="Jane Customer"
                />
                <Input
                  id={fieldIds.quickClientEmail}
                  name="quickClientEmail"
                  type="email"
                  value={quickClientEmail}
                  onChange={(event) => setQuickClientEmail(event.target.value)}
                  placeholder="jane@example.com"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={createQuickClient}
                  disabled={creatingClient || !quickClientName.trim() || !quickClientEmail.trim()}
                >
                  {creatingClient ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add
                </Button>
              </div>

              {selectedClient ? (
                <div className="border-border rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{selectedClient.name}</div>
                      <div className="text-muted-foreground">
                        {selectedClient.email}
                        {selectedClient.phone ? ` · ${selectedClient.phone}` : ''}
                      </div>
                    </div>
                    <Badge variant="outline">Signer 1</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground border-border rounded-md border border-dashed p-3 text-sm">
                  Pick a client to fill signer 1.
                </div>
              )}

              {selectedClient ? (
                <div className="space-y-3">
                  {additionalRecipients.map((recipient, index) => (
                    <div key={index} className="border-border rounded-md border p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-medium">Signer {index + 2}</div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeRecipient(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="grid gap-2">
                          <label
                            className="text-foreground text-xs font-medium"
                            htmlFor={`recipient-name-${index}`}
                          >
                            Name
                          </label>
                          <Input
                            id={`recipient-name-${index}`}
                            name={`recipientName${index + 2}`}
                            value={recipient.name}
                            onChange={(event) => updateRecipient(index, { name: event.target.value })}
                            placeholder="Jane Customer"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label
                            className="text-foreground text-xs font-medium"
                            htmlFor={`recipient-email-${index}`}
                          >
                            Email
                          </label>
                          <Input
                            id={`recipient-email-${index}`}
                            name={`recipientEmail${index + 2}`}
                            type="email"
                            value={recipient.email}
                            onChange={(event) => updateRecipient(index, { email: event.target.value })}
                            placeholder="jane@example.com"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <label
                            className="text-foreground text-xs font-medium"
                            htmlFor={`recipient-role-${index}`}
                          >
                            Role
                          </label>
                          <Input
                            id={`recipient-role-${index}`}
                            name={`recipientRole${index + 2}`}
                            value={recipient.role}
                            onChange={(event) => updateRecipient(index, { role: event.target.value })}
                            placeholder={`Signer ${index + 2}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addRecipient}>
                    <Plus className="h-4 w-4" />
                    Add recipient
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSignature className="h-4 w-4" />
                Document source
              </CardTitle>
              <CardDescription>Upload, build, or reuse.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  className={`border-border bg-background text-foreground rounded-md border p-3 text-left transition-colors ${
                    mode === 'pdf' ? 'ring-ring ring-2' : 'hover:bg-muted/50'
                  }`}
                  type="button"
                  onClick={() => setMode('pdf')}
                >
                  <div className="font-medium">PDF</div>
                  <div className="text-muted-foreground mt-1 text-xs">Upload or reuse.</div>
                </button>
                <button
                  className={`border-border bg-background text-foreground rounded-md border p-3 text-left transition-colors ${
                    mode === 'pdf' ? 'ring-ring ring-2' : 'hover:bg-muted/50'
                  }`}
                  type="button"
                  onClick={() => setBuilderOpen(true)}
                >
                  <div className="font-medium">Builder</div>
                  <div className="text-muted-foreground mt-1 text-xs">Open page editor.</div>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto p-3"
                  onClick={() => setBuilderOpen(true)}
                >
                  Edit fields
                </Button>
              </div>

              {mode === 'pdf' ? (
                <div className="space-y-3">
                  <Input
                    id={fieldIds.requestTitle}
                    name="requestTitle"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Proposal"
                  />

                  <div className="grid gap-2">
                    <label className="text-foreground text-sm font-medium" htmlFor={fieldIds.documentName}>
                      Document name
                    </label>
                    <Input
                      id={fieldIds.documentName}
                      name="documentName"
                      value={documentName}
                      onChange={(event) => setDocumentName(event.target.value)}
                      placeholder="Branded PDF"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      className={`border-border bg-background text-foreground rounded-md border p-3 text-left transition-colors ${
                        sourceMode === 'upload' ? 'ring-ring ring-2' : 'hover:bg-muted/50'
                      }`}
                      type="button"
                      onClick={() => {
                        setSourceMode('upload')
                        setDocumentAssetId('')
                      }}
                    >
                      <div className="font-medium">Upload</div>
                      <div className="text-muted-foreground mt-1 text-xs">New file.</div>
                    </button>
                    <button
                      className={`border-border bg-background text-foreground rounded-md border p-3 text-left transition-colors ${
                        sourceMode === 'reuse' ? 'ring-ring ring-2' : 'hover:bg-muted/50'
                      }`}
                      type="button"
                      onClick={() => setSourceMode('reuse')}
                    >
                      <div className="font-medium">Saved</div>
                      <div className="text-muted-foreground mt-1 text-xs">Stored file.</div>
                    </button>
                  </div>

                  {sourceMode === 'upload' ? (
                    <div className="space-y-3">
                      <label
                        className="border-border bg-muted/20 hover:bg-muted/40 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors"
                        htmlFor={fieldIds.uploadFile}
                      >
                        <UploadCloud className="text-muted-foreground h-7 w-7" />
                        <span className="text-foreground mt-2 text-sm font-medium">
                          {file ? file.name : 'Upload PDF'}
                        </span>
                        <span className="text-muted-foreground mt-1 text-xs">Include field tags.</span>
                        <Input
                          id={fieldIds.uploadFile}
                          name="uploadFile"
                          className="sr-only"
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={(event) => setFile(event.target.files?.[0] || null)}
                        />
                      </label>
                      {filePreviewUrl ? (
                        <div className="overflow-hidden rounded-md border">
                          <PdfPreviewSurface
                            sourceUrl={filePreviewUrl}
                            title="Uploaded PDF preview"
                            emptyLabel="Upload a PDF to preview it here."
                          />
                        </div>
                      ) : null}
                      <Button type="button" variant="outline" onClick={() => setBuilderOpen(true)}>
                        Edit fields
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <label
                          className="text-foreground text-sm font-medium"
                          htmlFor={fieldIds.savedDocumentSearch}
                        >
                          Saved document
                        </label>
                        <Input
                          id={fieldIds.savedDocumentSearch}
                          name="savedDocumentSearch"
                          value={savedDocumentQuery}
                          onChange={(event) => setSavedDocumentQuery(event.target.value)}
                          placeholder="Search saved PDFs"
                          disabled={!documents.length}
                        />
                        <div className="text-muted-foreground text-xs">
                          Showing {filteredDocuments.length} of {documents.length} saved documents.
                        </div>
                        <div className="border-border bg-background max-h-72 overflow-auto rounded-md border">
                          {filteredDocuments.length ? (
                            filteredDocuments.map((document) => {
                              const isSelected = document.id === documentAssetId
                              return (
                                <button
                                  key={document.id}
                                  id={isSelected ? fieldIds.savedDocument : undefined}
                                  type="button"
                                  className={`border-border/70 block w-full border-b px-3 py-3 text-left last:border-b-0 ${
                                    isSelected ? 'bg-blue-50' : 'hover:bg-muted/40'
                                  }`}
                                  onClick={() => selectDocument(document.id)}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-medium">{document.title}</div>
                                      <div className="text-muted-foreground truncate text-xs">
                                        {document.file_name}
                                      </div>
                                    </div>
                                    <div className="text-muted-foreground shrink-0 text-[10px] tracking-[0.18em] uppercase">
                                      {document.source_type || 'document'}
                                    </div>
                                  </div>
                                  <div className="text-muted-foreground mt-1 truncate text-[11px]">
                                    {document.client_name || 'Unknown client'}
                                    {document.request_title ? ` | ${document.request_title}` : ''}
                                  </div>
                                </button>
                              )
                            })
                          ) : (
                            <div className="text-muted-foreground px-3 py-4 text-sm">
                              No saved documents match this search.
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedDocument ? (
                        <div className="overflow-hidden rounded-md border">
                          <PdfPreviewSurface
                            sourceUrl={`/api/documents/library/${selectedDocument.id}/file`}
                            title={selectedDocument.title}
                            emptyLabel="Choose a saved PDF to reuse."
                            maxRenderWidth={520}
                          />
                        </div>
                      ) : (
                        <div className="text-muted-foreground border-border rounded-md border border-dashed p-3 text-sm">
                          Choose a saved PDF to reuse.
                        </div>
                      )}
                      <Button type="button" variant="outline" onClick={() => setBuilderOpen(true)}>
                        Edit fields
                      </Button>
                    </div>
                  )}
                  {sourceMode === 'upload' || sourceMode === 'reuse' ? (
                    <div className="border-border bg-muted/10 text-muted-foreground rounded-md border p-3 text-xs">
                      Open the PDF builder to place signatures and text fields directly on this document.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send</CardTitle>
              <CardDescription>Delivery and order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  id={fieldIds.sendEmail}
                  name="sendEmail"
                  className="border-input text-primary mt-1 h-4 w-4 rounded"
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(event) => setSendEmail(event.target.checked)}
                />
                <span>
                  <span className="text-foreground block text-sm font-medium">Email</span>
                  <span className="text-muted-foreground text-sm">Use Resend.</span>
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  id={fieldIds.require2fa}
                  name="requireEmail2fa"
                  className="border-input text-primary mt-1 h-4 w-4 rounded"
                  type="checkbox"
                  checked={requireEmail2fa}
                  onChange={(event) => setRequireEmail2fa(event.target.checked)}
                />
                <span>
                  <span className="text-foreground block text-sm font-medium">Email 2FA</span>
                  <span className="text-muted-foreground text-sm">Verify by code.</span>
                </span>
              </label>

              <div className="grid gap-2">
                <label className="text-foreground text-sm font-medium" htmlFor={fieldIds.order}>
                  Order
                </label>
                <select
                  id={fieldIds.order}
                  name="order"
                  className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-sm border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  value={order}
                  onChange={(event) => setOrder(event.target.value)}
                >
                  <option value="preserved">Preserved</option>
                  <option value="random">All at once</option>
                </select>
              </div>

              <label className="border-border bg-muted/20 flex items-start gap-3 rounded-md border p-3">
                <input
                  id={fieldIds.consent}
                  name="legalDisclosureAccepted"
                  className="border-input text-primary mt-1 h-4 w-4 rounded"
                  type="checkbox"
                  checked={legalDisclosureAccepted}
                  onChange={(event) => setLegalDisclosureAccepted(event.target.checked)}
                />
                <span>
                  <span className="text-foreground block text-sm font-medium">Consent</span>
                  <span className="text-muted-foreground text-sm">Store audit records.</span>
                </span>
              </label>

              <Button type="submit" disabled={submitting} fullWidth>
                {submitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? 'Sending...' : 'Send'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm leading-6">
              <p>Saved documents show up after send.</p>
              <p>Statuses update from webhook sync.</p>
            </CardContent>
          </Card>
        </div>
      </form>

      <Sheet open={builderOpen} onOpenChange={setBuilderOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="h-dvh w-screen max-w-none rounded-none border-t p-0"
        >
          <SheetHeader className="border-border/70 border-b px-6 pt-6 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <SheetTitle>PDF builder</SheetTitle>
                <SheetDescription>Add signature and text fields on the page.</SheetDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setBuilderOpen(false)}>
                  Close
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={saveCurrentPdf}
                  disabled={builderSaving || (!file && !selectedDocument && sourceMode !== 'generated')}
                >
                  {builderSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {builderSaving ? 'Saving...' : 'Generate & save PDF'}
                </Button>
              </div>
            </div>
            {builderStatus ? <div className="mt-3 text-sm text-emerald-700">{builderStatus}</div> : null}
          </SheetHeader>
          <div className="grid h-[calc(100dvh-4.75rem)] min-h-0 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)_320px]">
            <div className="border-border space-y-4 overflow-y-auto border-r px-5 py-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Tools</div>
                  <div className="text-muted-foreground text-xs">Drag one onto the page.</div>
                </div>
                <div className="space-y-2">
                  {builderToolSpecs.map((tool) => (
                    <button
                      key={tool.type}
                      type="button"
                      draggable
                      onDragStart={(event) => startDraggingTool(tool.type, event)}
                      onClick={() => setBuilderTool(tool.type)}
                      className={`border-border bg-background flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                        builderTool === tool.type ? 'border-blue-500 bg-blue-50/60' : 'hover:bg-muted/30'
                      }`}
                    >
                      <GripVertical className="text-muted-foreground h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{tool.label}</div>
                        <div className="text-muted-foreground text-xs">Drag to page</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col bg-slate-100/60">
              <div className="border-border/70 flex items-center justify-between gap-3 border-b px-6 py-3">
                <div>
                  <div className="text-sm font-medium">Document editor</div>
                  <div className="text-muted-foreground text-xs">Drop tools onto the paper.</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground text-xs">
                    {sourceMode === 'generated'
                      ? 'Generated PDF'
                      : sourceMode === 'reuse'
                        ? 'Saved PDF'
                        : 'Uploaded PDF'}
                  </div>
                  {builderPageCount > 1 ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setBuilderPage((current) => clamp(current - 1, 1, builderPageCount))}
                        disabled={builderPage <= 1}
                      >
                        Prev
                      </Button>
                      <div className="text-muted-foreground text-xs">
                        Page {builderPage} of {builderPageCount}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setBuilderPage((current) => clamp(current + 1, 1, builderPageCount))}
                        disabled={builderPage >= builderPageCount}
                      >
                        Next
                      </Button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-xs">Page 1</div>
                  )}
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-6 py-6">
                <div className="relative flex h-full min-h-170 w-full max-w-225 items-center justify-center rounded-2xl bg-slate-200/70 p-6 shadow-inner">
                  <div className="relative h-full w-full max-w-180 overflow-hidden rounded-sm bg-white ring-1 ring-slate-200">
                    {builderPreviewSourceUrl ? (
                      <PdfPreviewSurface
                        sourceUrl={builderPreviewSourceUrl}
                        pageNumber={builderPage}
                        title={
                          sourceMode === 'generated'
                            ? 'Generated PDF preview'
                            : sourceMode === 'reuse'
                              ? selectedDocument?.title || 'Saved PDF preview'
                              : 'Uploaded PDF preview'
                        }
                        emptyLabel={
                          sourceMode === 'generated'
                            ? 'Create a branded PDF to preview it here.'
                            : sourceMode === 'reuse'
                              ? 'Choose a saved PDF to reuse.'
                              : 'Upload a PDF to preview it here.'
                        }
                        overlay={renderBuilderPageOverlay(builderPage)}
                        maxRenderWidth={700}
                        maxRenderHeight={900}
                      />
                    ) : (
                      <div
                        className="relative flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleBuilderToolDrop(builderPage, event)}
                      >
                        <div className="absolute inset-x-0 top-0 h-14 border-b bg-slate-50/80" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.14)_1px,transparent_0)] bg-size-[16px_16px] opacity-60" />
                        <div className="relative z-10 max-w-sm rounded-md border border-dashed border-slate-300 bg-white/90 px-6 py-5 text-center shadow-sm">
                          <div className="text-sm font-medium text-slate-900">Drop a tool here</div>
                          <div className="text-muted-foreground mt-1 text-xs">
                            Build the PDF by dragging items from the left panel.
                          </div>
                        </div>
                        {renderBuilderPageOverlay(builderPage)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-muted-foreground mt-3 px-1 text-xs leading-5">
                  These markers are stored with the request as field coordinates for uploaded, reused, and
                  generated PDFs.
                </div>
              </div>
            </div>

            <div className="border-border overflow-y-auto border-l px-5 py-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Field settings</div>
                  <div className="text-muted-foreground text-xs">Edit the selected field here.</div>
                </div>
                {selectedBuilderField ? (
                  <div className="space-y-3">
                    <div className="rounded-md border bg-white p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium">{selectedBuilderField.label}</div>
                          <div className="text-muted-foreground text-xs">
                            {selectedBuilderField.type} field
                          </div>
                        </div>
                        <Badge variant="outline">{selectedBuilderField.page || 1}</Badge>
                      </div>
                      <div className="grid gap-3">
                        <div className="grid gap-2">
                          <label
                            className="text-foreground text-xs font-medium"
                            htmlFor={`selected-${selectedBuilderField.id}-label`}
                          >
                            Label
                          </label>
                          <Input
                            id={`selected-${selectedBuilderField.id}-label`}
                            name={`selected-${selectedBuilderField.id}-label`}
                            value={selectedBuilderField.label}
                            onChange={(event) =>
                              updateBuilderField(selectedBuilderField.id, { label: event.target.value })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <label
                            className="text-foreground text-xs font-medium"
                            htmlFor={`selected-${selectedBuilderField.id}-type`}
                          >
                            Type
                          </label>
                          <select
                            id={`selected-${selectedBuilderField.id}-type`}
                            name={`selected-${selectedBuilderField.id}-type`}
                            className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-sm border px-3 text-sm outline-none focus-visible:ring-[3px]"
                            value={selectedBuilderField.type}
                            onChange={(event) =>
                              updateBuilderField(selectedBuilderField.id, {
                                type: event.target.value,
                                ...getBuilderToolSpec(event.target.value),
                              })
                            }
                          >
                            {builderToolSpecs.map((tool) => (
                              <option key={tool.type} value={tool.type}>
                                {tool.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <label
                            className="text-foreground text-xs font-medium"
                            htmlFor={`selected-${selectedBuilderField.id}-page`}
                          >
                            Page
                          </label>
                          <select
                            id={`selected-${selectedBuilderField.id}-page`}
                            name={`selected-${selectedBuilderField.id}-page`}
                            className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-sm border px-3 text-sm outline-none focus-visible:ring-[3px]"
                            value={selectedBuilderField.page || 1}
                            onChange={(event) =>
                              updateBuilderField(selectedBuilderField.id, {
                                page: Number(event.target.value) || 1,
                              })
                            }
                          >
                            {Array.from({ length: Math.max(1, builderPageCount) }, (_, index) => (
                              <option key={index + 1} value={index + 1}>
                                Page {index + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedBuilderField.type === 'signature' ||
                        selectedBuilderField.type === 'initials' ? (
                          <div className="grid gap-2">
                            <label
                              className="text-foreground text-xs font-medium"
                              htmlFor={`selected-${selectedBuilderField.id}-role`}
                            >
                              Role
                            </label>
                            <Input
                              id={`selected-${selectedBuilderField.id}-role`}
                              name={`selected-${selectedBuilderField.id}-role`}
                              value={selectedBuilderField.role}
                              onChange={(event) =>
                                updateBuilderField(selectedBuilderField.id, {
                                  role: event.target.value,
                                })
                              }
                            />
                          </div>
                        ) : selectedBuilderField.type !== 'checkbox' ? (
                          <div className="grid gap-2">
                            <label
                              className="text-foreground text-xs font-medium"
                              htmlFor={`selected-${selectedBuilderField.id}-default`}
                            >
                              Default value
                            </label>
                            <Input
                              id={`selected-${selectedBuilderField.id}-default`}
                              name={`selected-${selectedBuilderField.id}-default`}
                              value={selectedBuilderField.defaultValue}
                              onChange={(event) =>
                                updateBuilderField(selectedBuilderField.id, {
                                  defaultValue: event.target.value,
                                })
                              }
                            />
                          </div>
                        ) : null}
                        <label className="flex items-center gap-3 text-sm">
                          <input
                            id={`selected-${selectedBuilderField.id}-required`}
                            name={`selected-${selectedBuilderField.id}-required`}
                            type="checkbox"
                            className="border-input text-primary h-4 w-4 rounded"
                            checked={selectedBuilderField.required !== false}
                            onChange={(event) =>
                              updateBuilderField(selectedBuilderField.id, {
                                required: event.target.checked,
                              })
                            }
                          />
                          <span>
                            <span className="text-foreground block text-sm font-medium">Required</span>
                            <span className="text-muted-foreground text-xs">
                              Show the red star in the preview.
                            </span>
                          </span>
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBuilderField(selectedBuilderField.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove field
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
                    Select a field on the page to edit it here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {showHistory ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base">Documents</CardTitle>
                <CardDescription>Stored PDFs and reused files.</CardDescription>
              </div>
              <Button variant="outline" onClick={refreshDocumentData} disabled={refreshing}>
                <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 xl:grid-cols-2">
              {documents.map((document) => (
                <Card key={document.id} className="overflow-hidden">
                  <CardHeader className="border-b">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{document.title}</CardTitle>
                          <CardDescription>{document.file_name}</CardDescription>
                        </div>
                        <Badge variant="outline">{document.source_type || 'document'}</Badge>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {document.client_name || 'Unknown client'}
                        {document.request_title ? ` · ${document.request_title}` : ''}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-0">
                    <div className="h-136 border-b">
                      <PdfPreviewSurface
                        sourceUrl={`/api/documents/library/${document.id}/file`}
                        title={document.title}
                        emptyLabel="No PDF preview available."
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 px-6 pb-6">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/api/documents/library/${document.id}/file`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open file
                        </Link>
                      </Button>
                      {document.request_id ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/documents/${document.request_id}`}>View request</Link>
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {!documents.length ? (
              <div className="text-muted-foreground border-border mt-4 rounded-md border p-4 text-sm">
                No stored documents yet.{' '}
                <Link href="/documents" className="underline">
                  Send or save a PDF
                </Link>{' '}
                to populate this list.
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
