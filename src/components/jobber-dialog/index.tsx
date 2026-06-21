'use client'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface JobberDialogProps {
  buttonLabel?: string
}

const JOBBER_ID = 'e25e6086-5e48-4c5d-8588-8aa08968b7d6-4904121'

export function JobberDialog({ buttonLabel = 'Book a Service' }: JobberDialogProps) {
  const [open, setOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (open && !isReady) {
      const timer = setTimeout(() => setIsReady(true), 50)
      return () => clearTimeout(timer)
    }
  }, [open, isReady])

  useEffect(() => {
    if (!isReady) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js'
    script.async = true
    document.body.appendChild(script)
    scriptRef.current = script

    return () => {
      document.head.removeChild(link)
      if (script.parentNode) document.body.removeChild(script)
      scriptRef.current = null
    }
  }, [isReady])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-h-[80vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold">Book a Service</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Use the form below to request a service. We will get back to you as soon as possible to confirm
            the details and schedule your appointment.
          </DialogDescription>
        </DialogHeader>
        {isReady && <div id={JOBBER_ID} />}
      </DialogContent>
    </Dialog>
  )
}
