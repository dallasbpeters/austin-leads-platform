// oxlint-disable func-style require-unicode-regexp
'use client'

import { useEffect, useId, useRef } from 'react'

import { buildJobberEmbedUrl, parseJobberRequestFormUrl } from '@/lib/platform/jobber-request-form'

const JOBBER_CLIENT_HUB_ID = 'e25e6086-5e48-4c5d-8588-8aa08968b7d6'
const JOBBER_SCRIPT_URL =
  'https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js'
const JOBBER_STYLESHEET_ID = 'jobber-work-request-stylesheet'
const JOBBER_STYLESHEET_URL = 'https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css'

export const JOBBER_FORM_IDS = {
  default: '4904121',
  txchristmaslights: '4905459',
  customLights: '4925324',
}

/**
 * The form to embed. A request form link from the site's Sanity settings wins;
 * otherwise the form id built into the code.
 * @param {string | null | undefined} requestFormUrl Jobber share or embed link.
 * @param {string} formId Fallback form id.
 * @returns {{ hubId: string, formId: string }} The hub and form to load.
 */
export function resolveJobberForm(requestFormUrl, formId = JOBBER_FORM_IDS.default) {
  return parseJobberRequestFormUrl(requestFormUrl) ?? { hubId: JOBBER_CLIENT_HUB_ID, formId }
}

export default function JobberWorkRequestEmbed({
  className = '',
  formId = JOBBER_FORM_IDS.default,
  requestFormUrl = null,
}) {
  const containerRef = useRef(null)
  const hasLoadedRef = useRef(false)
  const uniqueId = useId().replaceAll(/[^a-zA-Z0-9_-]/g, '')
  const form = resolveJobberForm(requestFormUrl, formId)
  const targetId = `${form.hubId}-${form.formId}-${uniqueId}`
  const formUrl = buildJobberEmbedUrl(form)

  useEffect(() => {
    const container = containerRef.current
    if (!container || hasLoadedRef.current) {
      return
    }

    hasLoadedRef.current = true

    if (!document.querySelector(`#${JOBBER_STYLESHEET_ID}`)) {
      const link = document.createElement('link')
      link.id = JOBBER_STYLESHEET_ID
      link.rel = 'stylesheet'
      link.href = JOBBER_STYLESHEET_URL
      link.media = 'screen'
      document.head.append(link)
    }

    const script = document.createElement('script')
    script.src = JOBBER_SCRIPT_URL
    script.async = true
    script.setAttribute('clienthub_id', targetId)
    script.setAttribute('form_url', formUrl)
    document.body.append(script)
  }, [formUrl, targetId])

  return (
    <div
      ref={containerRef}
      className={`jobber-inline-work-request max-w-4 overflow-hidden rounded-md bg-white ${className}`}
      id={targetId}
    />
  )
}
