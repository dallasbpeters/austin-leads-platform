/*
 * Jobber request form links come in two shapes:
 *   share link: https://clienthub.getjobber.com/hubs/<hub id>/public/requests/<form id>/new
 *   embed link: https://clienthub.getjobber.com/client_hubs/<hub id>/public/work_request/embedded_work_request_form?form_id=<form id>
 * Both name the same client hub and form. The embed snippet only takes the
 * second shape, so the site stores whichever link Jobber shows and we build
 * the embed link from it here.
 */

const JOBBER_HOST = 'clienthub.getjobber.com'
const HUB_PATTERN = /^\/(?:hubs|client_hubs)\/([0-9a-f-]{36})\//i
const SHARE_FORM_PATTERN = /\/public\/requests\/(\d+)\/new\/?$/i

/**
 * @param {string | null | undefined} url A Jobber request form link.
 * @returns {{ hubId: string, formId: string } | null} The hub and form ids, or null when the link is not a Jobber request form.
 */
export const parseJobberRequestFormUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) {
    return null
  }
  let parsed
  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== JOBBER_HOST) {
    return null
  }
  const hubId = HUB_PATTERN.exec(parsed.pathname)?.[1]
  const formId = SHARE_FORM_PATTERN.exec(parsed.pathname)?.[1] ?? parsed.searchParams.get('form_id')
  if (!hubId || !formId || !/^\d+$/.test(formId)) {
    return null
  }
  return { hubId: hubId.toLowerCase(), formId }
}

/**
 * @param {{ hubId: string, formId: string }} form The hub and form ids.
 * @returns {string} The link the Jobber embed snippet loads.
 */
export const buildJobberEmbedUrl = ({ hubId, formId }) =>
  `https://${JOBBER_HOST}/client_hubs/${hubId}/public/work_request/embedded_work_request_form?form_id=${formId}`
