'use client'

import { AlertTriangle, CheckCircle2, Copy, PenLine, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import PdfPreviewSurface from '@/components/admin/PdfPreviewSurface'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

function formatDate(value) {
  if (!value) return 'Not sent yet'
  return new Date(value).toLocaleString()
}

function clearCanvas(canvas) {
  const context = canvas?.getContext('2d')
  if (!context || !canvas) return
  context.clearRect(0, 0, canvas.width, canvas.height)
}

export default function DocumentSigningClient({ request, recipient, client, previewUrl }) {
  const [completed, setCompleted] = useState(recipient.status === 'completed')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [signerName, setSignerName] = useState(recipient.name || client?.name || '')
  const [signatureText, setSignatureText] = useState(recipient.name || client?.name || '')
  const [mode, setMode] = useState('type')
  const [comment, setComment] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [requestLink, setRequestLink] = useState('')
  const [activePreviewUrl, setActivePreviewUrl] = useState(previewUrl || '')
  const canvasRef = useRef(null)
  const drawingStateRef = useRef({ drawing: false })

  useEffect(() => {
    setRequestLink(window.location.href)
  }, [])

  useEffect(() => {
    setSignerName(recipient.name || client?.name || recipient.email || '')
    setSignatureText(recipient.name || client?.name || recipient.email || '')
  }, [client?.name, recipient.email, recipient.name])

  useEffect(() => {
    setActivePreviewUrl(previewUrl || '')
  }, [previewUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || mode !== 'draw') return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const width = parent.clientWidth || 0
      const height = Math.max(160, Math.min(240, Math.round(width * 0.32)))
      const ratio = window.devicePixelRatio || 1

      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.lineWidth = 2.5
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = '#1f2937'
      context.clearRect(0, 0, width, height)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement)

    return () => observer.disconnect()
  }, [mode])

  function getCanvasPoint(event) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function startDrawing(event) {
    if (mode !== 'draw') return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const point = getCanvasPoint(event)
    if (!canvas || !context || !point) return

    drawingStateRef.current = { drawing: true, lastPoint: point }
    context.beginPath()
    context.moveTo(point.x, point.y)
    canvas.setPointerCapture(event.pointerId)
  }

  function drawPoint(event) {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const state = drawingStateRef.current
    const point = getCanvasPoint(event)
    if (!canvas || !context || !state.drawing || !point) return

    context.lineTo(point.x, point.y)
    context.stroke()
    state.lastPoint = point
  }

  function stopDrawing(event) {
    const canvas = canvasRef.current
    if (!canvas) return
    drawingStateRef.current = { drawing: false }
    try {
      canvas.releasePointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
  }

  function resetDrawing() {
    const canvas = canvasRef.current
    if (!canvas) return
    clearCanvas(canvas)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(requestLink || window.location.href)
    setLinkCopied(true)
    window.setTimeout(() => setLinkCopied(false), 1500)
  }

  async function completeSigning() {
    setSubmitting(true)
    setError('')

    try {
      const signatureImage =
        mode === 'draw' && canvasRef.current ? canvasRef.current.toDataURL('image/png') : null

      const response = await fetch(`/api/documents/signatures/${request.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: recipient.id,
          signerName,
          signatureText: mode === 'type' ? signatureText : null,
          signatureImage,
          comment,
          completedAt: new Date().toISOString(),
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to complete signing.')
      }

      setCompleted(true)
      setActivePreviewUrl(
        data?.signedDocument?.fileUrl ||
          (data?.request?.document_asset_id
            ? `/api/documents/library/${data.request.document_asset_id}/file`
            : previewUrl || ''),
      )
    } catch (signingError) {
      setError(signingError instanceof Error ? signingError.message : 'Unable to complete signing.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-400 px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Sign document</p>
            <h1 className="text-foreground mt-2 text-3xl tracking-normal">{request.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
              Review the document, add your signature, and complete it here without leaving the app.
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              For {client?.name || request.client_name || 'the client'}
              {recipient.name || recipient.email ? ` · Recipient ${recipient.name || recipient.email}` : ''}
            </p>
          </div>
          <Badge variant={completed ? 'default' : 'outline'}>
            {completed ? 'Completed' : 'Ready to sign'}
          </Badge>
        </div>

        {completed ? (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-950">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Signed</AlertTitle>
            <AlertDescription>The request was completed and recorded.</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-[1rem]">Document</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activePreviewUrl ? (
                <div className="h-[74vh] min-h-180 overflow-hidden">
                  <PdfPreviewSurface
                    sourceUrl={activePreviewUrl}
                    title={request.title}
                    emptyLabel="No preview available."
                    maxRenderWidth={560}
                  />
                </div>
              ) : (
                <div className="text-muted-foreground flex min-h-105 items-center justify-center p-6 text-sm">
                  No preview available for this request.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[1rem]">Signer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs tracking-[0.18em] uppercase">Name</div>
                  <Input
                    id="documents-signer-name"
                    value={signerName}
                    onChange={(event) => setSignerName(event.target.value)}
                    placeholder="Type your full name"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-muted-foreground text-xs tracking-[0.18em] uppercase">Signature</div>
                    <div className="bg-background inline-flex rounded-md border p-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={mode === 'type' ? 'default' : 'ghost'}
                        className="h-8 gap-2"
                        onClick={() => setMode('type')}
                      >
                        <PenLine className="h-4 w-4" />
                        Type
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={mode === 'draw' ? 'default' : 'ghost'}
                        className="h-8 gap-2"
                        onClick={() => setMode('draw')}
                      >
                        Draw
                      </Button>
                    </div>
                  </div>

                  {mode === 'type' ? (
                    <div className="space-y-2">
                      <Input
                        id="documents-signature-text"
                        value={signatureText}
                        onChange={(event) => setSignatureText(event.target.value)}
                        placeholder="Type your signature"
                      />
                      <div className="rounded-lg border bg-white px-4 py-5">
                        <div className="text-[13px] text-slate-500">Preview</div>
                        <div className="mt-2 text-3xl font-[540] text-slate-950 italic">
                          {signatureText || 'Signature'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="rounded-lg border bg-white p-2">
                        <canvas
                          ref={canvasRef}
                          role="img"
                          aria-label="Draw your signature here"
                          className="block h-50 w-full touch-none rounded-md bg-white"
                          onPointerDown={startDrawing}
                          onPointerMove={drawPoint}
                          onPointerUp={stopDrawing}
                          onPointerCancel={stopDrawing}
                          onPointerLeave={stopDrawing}
                        />
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={resetDrawing}>
                        <Trash2 className="h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs tracking-[0.18em] uppercase">Note</div>
                  <Textarea
                    id="documents-signing-note"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Optional note"
                    rows={3}
                  />
                </div>

                <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                  <input
                    id="documents-consent"
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={consentAccepted}
                    onChange={(event) => setConsentAccepted(event.target.checked)}
                  />
                  <span className="leading-6 text-slate-700">
                    I confirm this signature is my legal signature and I agree to sign this document
                    electronically.
                  </span>
                </label>

                {error ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Unable to sign</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="button"
                  className="w-full"
                  disabled={completed || submitting || !consentAccepted || !signerName.trim()}
                  onClick={completeSigning}
                >
                  {submitting ? 'Signing...' : completed ? 'Signed' : 'Sign and complete'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[1rem]">Request</CardTitle>
                <CardDescription>Stored record.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6">
                <div>
                  <div className="text-muted-foreground">Client</div>
                  <div className="font-medium">{client?.name || request.client_name || 'Unknown client'}</div>
                  <div className="text-muted-foreground">
                    {client?.email || request.client_email || 'No email'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Recipient</div>
                  <div className="font-medium">{recipient.name || recipient.email}</div>
                  <div className="text-muted-foreground">
                    {recipient.email}
                    {recipient.role ? ` · ${recipient.role}` : ''}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sent</div>
                  <div className="font-medium">{formatDate(request.sent_at || request.created_at)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[1rem]">Link</CardTitle>
                <CardDescription>Use this page later if needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/40 overflow-x-auto rounded-md border p-3 text-xs break-all">
                  {requestLink || 'Copy after the page loads.'}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                    {linkCopied ? 'Copied' : 'Copy link'}
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/documents/${request.id}`}>Open request</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
