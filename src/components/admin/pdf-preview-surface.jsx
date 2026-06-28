'use client'

import { useEffect, useRef, useState } from 'react'

let pdfjsModulePromise = null

function loadPdfjs() {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import('pdfjs-dist/build/pdf.mjs')
  }
  return pdfjsModulePromise
}

export default function PdfPreviewSurface({
  sourceUrl,
  title,
  emptyLabel,
  overlay = null,
  pageNumber = 1,
  maxRenderWidth = null,
  maxRenderHeight = null,
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [renderSize, setRenderSize] = useState({ width: 0, height: 0 })
  const [renderState, setRenderState] = useState('idle')
  const [renderError, setRenderError] = useState('')

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') {
      setContainerSize({
        width: container?.clientWidth || 0,
        height: container?.clientHeight || 0,
      })
      return
    }

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth || 0,
        height: container.clientHeight || 0,
      })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    let loadingTask = null
    let renderTask = null

    async function renderPreview() {
      const canvas = canvasRef.current
      if (!canvas || !sourceUrl || !containerSize.width) {
        setRenderState(sourceUrl ? 'loading' : 'idle')
        setRenderError('')
        setRenderSize({ width: 0, height: 0 })
        return
      }

      setRenderState('loading')
      setRenderError('')

      try {
        const pdfjsLib = await loadPdfjs()
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        loadingTask = pdfjsLib.getDocument({ url: sourceUrl })
        const pdf = await loadingTask.promise
        if (cancelled) {
          return
        }

        const page = await pdf.getPage(Math.max(1, pageNumber))
        if (cancelled) {
          return
        }

        const viewport = page.getViewport({ scale: 1 })
        const widthLimit = Number.isFinite(maxRenderWidth) ? maxRenderWidth : Infinity
        const heightLimit = Number.isFinite(maxRenderHeight) ? maxRenderHeight : Infinity
        const availableWidth = Math.max(Math.min(containerSize.width - 32, widthLimit), 240)
        const availableHeight = containerSize.height
          ? Math.max(Math.min(containerSize.height - 32, heightLimit), 240)
          : viewport.height
        const scale = Math.min(availableWidth / viewport.width, availableHeight / viewport.height)
        const scaledViewport = page.getViewport({ scale })
        const outputScale = window.devicePixelRatio || 1
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Canvas context not available.')
        }

        canvas.width = Math.floor(scaledViewport.width * outputScale)
        canvas.height = Math.floor(scaledViewport.height * outputScale)
        canvas.style.width = `${Math.floor(scaledViewport.width)}px`
        canvas.style.height = `${Math.floor(scaledViewport.height)}px`
        setRenderSize({
          width: Math.floor(scaledViewport.width),
          height: Math.floor(scaledViewport.height),
        })
        context.setTransform(outputScale, 0, 0, outputScale, 0, 0)

        renderTask = page.render({
          canvasContext: context,
          viewport: scaledViewport,
        })

        await renderTask.promise
        if (!cancelled) {
          setRenderState('ready')
        }
      } catch (error) {
        if (!cancelled) {
          setRenderState('error')
          setRenderError(error instanceof Error ? error.message : 'Unable to render PDF preview.')
          setRenderSize({ width: 0, height: 0 })
        }
      }
    }

    renderPreview()

    return () => {
      cancelled = true
      if (renderTask) {
        renderTask.cancel()
      }
      if (loadingTask) {
        loadingTask.destroy()
      }
    }
  }, [containerSize.height, containerSize.width, pageNumber, sourceUrl])

  return (
    <div ref={containerRef} className="relative flex h-full w-full justify-center overflow-auto">
      {!sourceUrl ? (
        <div className="bg-muted/20 text-muted-foreground flex min-h-120 w-full items-center justify-center text-sm">
          {emptyLabel}
        </div>
      ) : null}
      {sourceUrl ? (
        <div
          className="relative mx-auto my-4"
          style={{
            width: renderSize.width ? `${renderSize.width}px` : '100%',
            height: renderSize.height ? `${renderSize.height}px` : '100%',
            minHeight: renderSize.height ? undefined : '100%',
          }}
        >
          <canvas ref={canvasRef} className="block h-full w-full shadow-xl" />
          {renderState !== 'ready' ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/72 text-sm text-slate-600">
              {renderState === 'error'
                ? renderError || 'Unable to render PDF preview.'
                : 'Rendering PDF preview...'}
            </div>
          ) : null}
          {title ? (
            <div className="pointer-events-none absolute top-4 left-4 rounded-full bg-white/88 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
              {title}
            </div>
          ) : null}
          {overlay}
        </div>
      ) : null}
    </div>
  )
}
