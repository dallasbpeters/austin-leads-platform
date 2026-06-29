import { requestJson } from '@/services/admin/hero-pages'

export const buildDefaultDomainForm = () => {
  return {
    domain: '',
    siteSlug: '',
    redirectTarget: '',
  }
}

export const buildDefaultSiteForm = () => {
  return {
    domain: '',
    name: '',
    slug: '',
    category: 'general',
  }
}

export const fetchDomains = async () => {
  return requestJson('/api/domains')
}

export const createDomainRecord = async (form) => {
  return requestJson('/api/domains', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}

export const verifyDomainRecord = async (domain) => {
  return requestJson(`/api/domains/${domain}/verify`, {
    method: 'POST',
  })
}

export const updateDomainRecordRequest = async (domain, form) => {
  return requestJson(`/api/domains/${encodeURIComponent(domain)}`, {
    method: 'PATCH',
    body: JSON.stringify(form),
  })
}

export const deleteDomainRecordRequest = async (domain) => {
  return requestJson(`/api/domains/${encodeURIComponent(domain)}`, {
    method: 'DELETE',
  })
}

export const createSiteRecord = async (form) => {
  return requestJson('/api/sites', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}
