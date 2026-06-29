export const fetchCrmLeads = async (filters = {}) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.set(key, String(value))
    }
  })

  const response = await fetch(`/api/crm/leads?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Unable to load CRM leads.')
  }

  return response.json()
}

export const updateCrmLead = async (leadId, updates) => {
  const response = await fetch(`/api/crm/leads/${leadId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Unable to update lead.')
  }

  return response.json()
}
