'use client'

import { useEffect, useState } from 'react'

import {
  buildDefaultDomainForm,
  createDomainRecord,
  deleteDomainRecordRequest,
  fetchDomains,
  updateDomainRecordRequest,
  verifyDomainRecord,
} from '@/services/admin/domains'

export function useDomainsManager({ initialDomains, sites, vercelEnabled }) {
  const [domains, setDomains] = useState(initialDomains)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(buildDefaultDomainForm(sites))
  const [editingDomain, setEditingDomain] = useState(null)
  const [editForm, setEditForm] = useState({
    siteSlug: '',
    redirectTarget: '',
    tier: 'landing',
  })

  useEffect(() => {
    setDomains(initialDomains)
  }, [initialDomains])

  useEffect(() => {
    if (!vercelEnabled) {
      return
    }

    refreshDomains()
  }, [vercelEnabled])

  async function refreshDomains() {
    setLoading(true)

    try {
      const data = await fetchDomains()
      setDomains(data.domains)
    } finally {
      setLoading(false)
    }
  }

  async function addDomain(event) {
    event.preventDefault()
    setLoading(true)

    try {
      await createDomainRecord(form)
      setForm(buildDefaultDomainForm(sites))
      await refreshDomains()
    } finally {
      setLoading(false)
    }
  }

  async function verifyDomain(domain) {
    setLoading(true)

    try {
      await verifyDomainRecord(domain)
      await refreshDomains()
    } finally {
      setLoading(false)
    }
  }

  function startEditing(domainRecord) {
    setEditingDomain(domainRecord.domain)
    setEditForm({
      siteSlug: domainRecord.siteSlug || sites[0]?.slug || '',
      redirectTarget: domainRecord.redirectTarget || '',
      tier: domainRecord.tier || (domainRecord.redirectTarget ? 'redirect' : 'landing'),
    })
  }

  function cancelEditing() {
    setEditingDomain(null)
    setEditForm({
      siteSlug: '',
      redirectTarget: '',
      tier: 'landing',
    })
  }

  async function saveDomain(domain) {
    setLoading(true)

    try {
      await updateDomainRecordRequest(domain, editForm)
      await refreshDomains()
      cancelEditing()
    } finally {
      setLoading(false)
    }
  }

  async function removeDomain(domain) {
    setLoading(true)

    try {
      await deleteDomainRecordRequest(domain)
      await refreshDomains()
      if (editingDomain === domain) {
        cancelEditing()
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    domains,
    editForm,
    editingDomain,
    form,
    loading,
    query,
    addDomain,
    cancelEditing,
    refreshDomains,
    removeDomain,
    saveDomain,
    setQuery,
    setEditForm,
    setForm,
    startEditing,
    verifyDomain,
  }
}
