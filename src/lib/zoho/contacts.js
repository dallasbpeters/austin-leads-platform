/*
 * Zoho CRM Contacts search — live typeahead only.
 * Does not persist contacts locally.
 */

import { zohoAuthHeader } from './auth.js'

const pickString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function mapContactRecord(record) {
  if (!record) {
    return null
  }
  const first = pickString(record.First_Name)
  const last = pickString(record.Last_Name)
  const fullName = pickString(record.Full_Name, [first, last].filter(Boolean).join(' '))
  const street = pickString(record.Mailing_Street, record.Other_Street, record.Home_Street)
  const city = pickString(record.Mailing_City, record.Other_City, record.Home_City)
  const state = pickString(record.Mailing_State, record.Other_State, record.Home_State) || 'TX'
  const zip = pickString(record.Mailing_Zip, record.Other_Zip, record.Home_Zip)

  return {
    id: String(record.id || ''),
    name: fullName,
    firstName: first,
    lastName: last,
    email: pickString(record.Email, record.Secondary_Email),
    phone: pickString(record.Phone, record.Mobile, record.Home_Phone),
    propertyAddress: street,
    propertyCity: city,
    propertyState: state,
    propertyZip: zip,
  }
}

/**
 * @param {{ accessToken: string, apiDomain?: string, query: string, limit?: number }} params
 */
export async function searchZohoContacts({ accessToken, apiDomain, query, limit = 8 }) {
  const q = String(query || '').trim()
  if (q.length < 2) {
    return []
  }

  const base = (apiDomain || 'https://www.zohoapis.com').replace(/\/$/, '')
  const url = new URL(`${base}/crm/v2/Contacts/search`)
  url.searchParams.set('word', q)
  url.searchParams.set('per_page', String(Math.min(Math.max(limit, 1), 20)))

  const response = await fetch(url, {
    headers: {
      ...zohoAuthHeader(accessToken),
      Accept: 'application/json',
    },
  })

  const payload = await response.json().catch(() => ({}))

  // Zoho returns 204 / empty when no matches
  if (response.status === 204) {
    return []
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.code ||
      (Array.isArray(payload?.details) ? JSON.stringify(payload.details) : null) ||
      JSON.stringify(payload)
    const error = new Error(`Zoho contact search failed (${response.status}): ${message}`)
    error.status = response.status
    error.code = payload?.code
    throw error
  }

  const rows = Array.isArray(payload.data) ? payload.data : []
  return rows.map(mapContactRecord).filter((row) => row?.name || row?.email)
}
