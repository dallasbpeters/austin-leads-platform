'use client'

import { useEffect, useState } from 'react'

import {
  buildDefaultDomainForm,
  buildDefaultSiteForm,
  createDomainRecord,
  createSiteRecord,
  deleteDomainRecordRequest,
  fetchDomains,
  updateDomainRecordRequest,
  verifyDomainRecord,
} from '@/services/admin/domains'

export const useDomainsManager = ({ initialDomains, vercelEnabled }) => {
  const [domains, setDomains] = useState(initialDomains)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  // redirect-only add form
  const [redirectForm, setRedirectForm] = useState(buildDefaultDomainForm())

  // landing page creation form
  const [siteForm, setSiteForm] = useState(buildDefaultSiteForm())

  // inline per-row edit state
  const [editingDomain, setEditingDomain] = useState(null)
  const [editForm, setEditForm] = useState({
    siteSlug: '',
    tier: 'landing',
    redirectTarget: '',
    createSite: false,
    siteName: '',
    siteCategory: 'general',
  })

  // which row has DNS instructions expanded
  const [expandedDns, setExpandedDns] = useState(null)

  // last successfully created site (for success banner)
  const [lastCreatedSite, setLastCreatedSite] = useState(null)

  useEffect(() => {
    setDomains(initialDomains)
  }, [initialDomains])

  const refreshDomains = async () => {
    setError('')
    setLoading(true)
    try {
      const data = await fetchDomains()
      setDomains(data.domains)
      if (data.syncError) {
        setError(data.syncError)
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to refresh domains.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!vercelEnabled) {
      return
    }
    refreshDomains()
  }, [vercelEnabled])

  const addRedirectDomain = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createDomainRecord(redirectForm)
      setRedirectForm(buildDefaultDomainForm())
      await refreshDomains()
    } catch (requestError) {
      setError(requestError.message || 'Unable to add redirect domain.')
    } finally {
      setLoading(false)
    }
  }

  const addLandingPage = async (event) => {
    event.preventDefault()
    setError('')
    setLastCreatedSite(null)
    setLoading(true)
    try {
      const result = await createSiteRecord(siteForm)
      setLastCreatedSite(result)
      setSiteForm(buildDefaultSiteForm())
      await refreshDomains()
    } catch (requestError) {
      setError(requestError.message || 'Unable to create landing page.')
    } finally {
      setLoading(false)
    }
  }

  const verifyDomain = async (domain) => {
    setError('')
    setLoading(true)
    try {
      await verifyDomainRecord(domain)
      await refreshDomains()
    } catch (requestError) {
      setError(requestError.message || 'Unable to verify domain.')
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (domainRecord) => {
    setEditingDomain(domainRecord.domain)
    setEditForm({
      siteSlug: domainRecord.siteSlug || '',
      tier: domainRecord.tier || 'landing',
      redirectTarget: domainRecord.redirectTarget || '',
      createSite: false,
      siteName: '',
      siteCategory: 'general',
    })
    setExpandedDns(null)
  }

  const cancelEditing = () => {
    setEditingDomain(null)
    setEditForm({
      siteSlug: '',
      tier: 'landing',
      redirectTarget: '',
      createSite: false,
      siteName: '',
      siteCategory: 'general',
    })
  }

  const saveDomain = async (domain) => {
    setError('')
    setLoading(true)
    try {
      await (editForm.createSite && editForm.siteSlug && editForm.siteName
        ? createSiteRecord({
            domain,
            name: editForm.siteName,
            slug: editForm.siteSlug,
            category: editForm.siteCategory,
          })
        : updateDomainRecordRequest(domain, {
            siteSlug: editForm.siteSlug,
            tier: editForm.tier,
            redirectTarget: editForm.redirectTarget,
          }))
      await refreshDomains()
      cancelEditing()
    } catch (requestError) {
      setError(requestError.message || 'Unable to save domain.')
    } finally {
      setLoading(false)
    }
  }

  const removeDomain = async (domain) => {
    setError('')
    setLoading(true)
    try {
      await deleteDomainRecordRequest(domain)
      await refreshDomains()
      if (editingDomain === domain) {
        cancelEditing()
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete domain.')
    } finally {
      setLoading(false)
    }
  }

  const toggleDns = (domain) => {
    setExpandedDns((current) => (current === domain ? null : domain))
    if (editingDomain === domain) {
      cancelEditing()
    }
  }

  return {
    domains,
    editForm,
    editingDomain,
    error,
    expandedDns,
    lastCreatedSite,
    loading,
    query,
    redirectForm,
    siteForm,
    addLandingPage,
    addRedirectDomain,
    cancelEditing,
    refreshDomains,
    removeDomain,
    saveDomain,
    setEditForm,
    setLastCreatedSite,
    setQuery,
    setRedirectForm,
    setSiteForm,
    startEditing,
    toggleDns,
    verifyDomain,
  }
}
