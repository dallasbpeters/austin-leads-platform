import { requestJson } from '@/services/admin/hero-pages'

export function buildDefaultDomainForm() {
  return {
    domain: '',
    siteSlug: '',
    redirectTarget: '',
  }
}

export function buildDefaultSiteForm() {
  return {
    domain: '',
    name: '',
    slug: '',
    category: 'general',
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

export async function updateDomainRecordRequest(domain, form) {
  return requestJson(`/api/domains/${encodeURIComponent(domain)}`, {
    method: 'PATCH',
    body: JSON.stringify(form),
  })
}

export async function deleteDomainRecordRequest(domain) {
  return requestJson(`/api/domains/${encodeURIComponent(domain)}`, {
    method: 'DELETE',
  })
}

export async function createSiteRecord(form) {
  return requestJson('/api/sites', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}
