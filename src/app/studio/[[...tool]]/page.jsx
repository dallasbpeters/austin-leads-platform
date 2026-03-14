import { redirect } from 'next/navigation'

import { runtimeStudioUrl } from '@/sanity/env'

export default async function StudioPage({ params }) {
  const resolvedParams = await params
  const toolPath = Array.isArray(resolvedParams?.tool) ? resolvedParams.tool.join('/') : ''
  const target = toolPath ? `${runtimeStudioUrl}/${toolPath}` : runtimeStudioUrl

  redirect(target)
}
