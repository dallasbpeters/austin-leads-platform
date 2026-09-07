import { notFound } from 'next/navigation'

import Footer from '@/components/footer'
import Header from '@/components/header'
import JobberWorkRequestEmbed from '@/components/jobber-work-request-embed'
import { resolveCurrentSite, resolveNavigationForSite } from '@/lib/platform/content'
import { buildMetadataForCurrentSite } from '@/lib/platform/site-page'

/** @returns {Promise<import('next').Metadata>} Metadata for the service request page. */
export const generateMetadata = () => buildMetadataForCurrentSite(['service-request'])

const ServiceRequestPage = async () => {
  const site = await resolveCurrentSite().catch(() => null)
  if (!site) {
    notFound()
  }
  const navigation = resolveNavigationForSite(site)

  return (
    <>
      <Header navigation={navigation} />
      <main className="mx-auto w-full max-w-4xl px-4 pt-36">
        {/* The request form is a third-party embed with no heading of its own,
            so the page needs one to be navigable. */}
        <h1 className="text-size-500">Request service</h1>
        <JobberWorkRequestEmbed />
      </main>
      <Footer />
    </>
  )
}

export default ServiceRequestPage
