import { describe, expect, it } from 'vitest'

import { buildJobberEmbedUrl, parseJobberRequestFormUrl } from '@/lib/platform/jobber-request-form'

const HUB = 'e25e6086-5e48-4c5d-8588-8aa08968b7d6'
const SHARE_LINK = `https://clienthub.getjobber.com/hubs/${HUB}/public/requests/4895670/new`
const EMBED_LINK = `https://clienthub.getjobber.com/client_hubs/${HUB}/public/work_request/embedded_work_request_form?form_id=4904121`

describe(parseJobberRequestFormUrl, () => {
  it('reads the hub and form ids from a share link', () => {
    expect(parseJobberRequestFormUrl(SHARE_LINK)).toStrictEqual({ hubId: HUB, formId: '4895670' })
    expect(parseJobberRequestFormUrl(`${SHARE_LINK}/`)).toStrictEqual({ hubId: HUB, formId: '4895670' })
    expect(parseJobberRequestFormUrl(`  ${SHARE_LINK}?source=social_media `)).toStrictEqual({
      hubId: HUB,
      formId: '4895670',
    })
  })

  it('reads the hub and form ids from an embed link', () => {
    expect(parseJobberRequestFormUrl(EMBED_LINK)).toStrictEqual({ hubId: HUB, formId: '4904121' })
  })

  it('rejects links that are not a Jobber request form', () => {
    expect(parseJobberRequestFormUrl('')).toBeNull()
    expect(parseJobberRequestFormUrl(null)).toBeNull()
    expect(parseJobberRequestFormUrl('not a url')).toBeNull()
    expect(
      parseJobberRequestFormUrl(`http://clienthub.getjobber.com/hubs/${HUB}/public/requests/1/new`),
    ).toBeNull()
    expect(
      parseJobberRequestFormUrl(`https://example.com/hubs/${HUB}/public/requests/4895670/new`),
    ).toBeNull()
  })

  it('rejects a Jobber link without a form id', () => {
    expect(
      parseJobberRequestFormUrl(`https://clienthub.getjobber.com/client_hubs/${HUB}/public/work_request/new`),
    ).toBeNull()
    expect(
      parseJobberRequestFormUrl(`https://clienthub.getjobber.com/hubs/${HUB}/public/requests/abc/new`),
    ).toBeNull()
  })
})

describe(buildJobberEmbedUrl, () => {
  it('builds the embed link the Jobber snippet loads', () => {
    expect(buildJobberEmbedUrl(parseJobberRequestFormUrl(SHARE_LINK))).toBe(
      `https://clienthub.getjobber.com/client_hubs/${HUB}/public/work_request/embedded_work_request_form?form_id=4895670`,
    )
  })
})
