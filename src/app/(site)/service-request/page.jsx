import { notFound } from 'next/navigation'

import { buildMetadataForCurrentSite } from '@/lib/platform/site-page'
import { resolveCurrentSite } from '@/lib/platform/content'
import Footer from '@/components/footer'
import Header from '@/components/header'
import JobberWorkRequestEmbed from '@/components/jobber-work-request-embed'

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
        <JobberWorkRequestEmbed />
      </main>
      <Footer />
    </>
  )
}
