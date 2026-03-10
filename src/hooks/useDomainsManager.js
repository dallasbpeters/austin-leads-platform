"use client"

import { useEffect, useState } from "react"

import {
  buildDefaultDomainForm,
  createDomainRecord,
  fetchDomains,
  verifyDomainRecord,
} from "@/services/admin/domains"

export function useDomainsManager({ initialDomains, sites, vercelEnabled }) {
  const [domains, setDomains] = useState(initialDomains)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [form, setForm] = useState(buildDefaultDomainForm(sites))

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

  return {
    domains,
    form,
    loading,
    query,
    addDomain,
    refreshDomains,
    setQuery,
    setForm,
    verifyDomain,
  }
}
