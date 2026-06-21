import { Button } from '@/components/ui/button'
import Script from 'next/script'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function DialogScrollableContent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Book a Service</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-h-[80vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold">Book a Service</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Use the form below to request a service. We will get back to you as soon as possible to confirm
            the details and schedule your appointment.
          </DialogDescription>
        </DialogHeader>
        <div id="e25e6086-5e48-4c5d-8588-8aa08968b7d6-4904121"></div>
        <link
          rel="stylesheet"
          href="https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css"
          media="screen"
        />
        <Script
          src="https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js"
          strategy="afterInteractive"
          data-clienthub-id="e25e6086-5e48-4c5d-8588-8aa08968b7d6-4904121"
          data-form-url="https://clienthub.getjobber.com/client_hubs/e25e6086-5e48-4c5d-8588-8aa08968b7d6/public/work_request/embedded_work_request_form?form_id=4904121"
        />
      </DialogContent>
    </Dialog>
  )
}
