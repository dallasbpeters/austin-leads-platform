import { requestJson } from '@/services/admin/hero-pages'

export function buildDefaultDomainForm(sites) {
  return {
    domain: '',
    siteSlug: sites[0]?.slug || '',
    redirectTarget: '',
  }
}

export async function fetchDomains() {
  return requestJson('/api/domains')
}

export async function createDomainRecord(form) {
  return requestJson('/api/domains', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}

export async function verifyDomainRecord(domain) {
  return requestJson(`/api/domains/${domain}/verify`, {
    method: 'POST',
  })
}
