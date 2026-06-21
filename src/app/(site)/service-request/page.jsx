import { notFound } from 'next/navigation'
import Script from 'next/script'

import { buildMetadataForCurrentSite } from '@/lib/platform/site-page'
import { resolveCurrentSite } from '@/lib/platform/content'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

/** @returns {Promise<import('next').Metadata>} */
export async function generateMetadata() {
  return buildMetadataForCurrentSite(['service-request'])
}

export default async function ServiceRequestPage() {
  const site = await resolveCurrentSite().catch(() => null)
  if (!site) notFound()

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 pt-36">
        <div id="e25e6086-5e48-4c5d-8588-8aa08968b7d6-4904121"></div>
        <link
          rel="stylesheet"
          href="https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css"
          media="screen"
        />
        <Script
          src="https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js"
          clienthub_id="e25e6086-5e48-4c5d-8588-8aa08968b7d6-4904121"
          form_url="https://clienthub.getjobber.com/client_hubs/e25e6086-5e48-4c5d-8588-8aa08968b7d6/public/work_request/embedded_work_request_form?form_id=4904121"
        ></Script>
      </main>
      <Footer />
    </>
  )
}
