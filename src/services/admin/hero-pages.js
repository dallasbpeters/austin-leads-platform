const buildRequestHeaders = (headers = {}) => {
  return {
    'Content-Type': 'application/json',
    ...headers,
  }
}

export const requestJson = async (url, init) => {
  const response = await fetch(url, {
    ...init,
    headers: buildRequestHeaders(init?.headers),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message =
      payload?.error ||
      payload?.message ||
      (response.status ? `Request failed (${response.status}).` : 'Request failed.')
    throw new Error(message)
  }

  return response.json()
}

export const buildDefaultHeroQuery = (page) => {
  if (!page) {
    return ''
  }

  const domain = page.site?.primaryDomain?.split('.')[0]?.replaceAll('-', ' ')
  return `${domain || page.site?.name || page.title} home exterior`
}

export const buildSiteHeroQuery = (site) => {
  if (!site) {
    return ''
  }

  const domain = site.primaryDomain?.split('.')[0]?.replaceAll('-', ' ')
  return `${domain || site.name} home exterior`
}

export const mergeUniquePhotos = (existing, incoming) => {
  const seen = new Set()
  const merged = []

  ;[...existing, ...incoming].forEach((photo) => {
    if (!photo?.id || seen.has(photo.id)) {
      return
    }

    seen.add(photo.id)
    merged.push(photo)
  })

  return merged
}

export const fetchHeroPagesAdmin = async () => {
  return requestJson('/api/hero-pages')
}

export const searchUnsplashPhotos = async (query, page) => {
  return requestJson(`/api/unsplash/search?query=${encodeURIComponent(query)}&page=${page}`)
}

export const saveHeroPageImage = async (pageId, photo) => {
  return requestJson(`/api/hero-pages/${pageId}/image`, {
    method: 'POST',
    body: JSON.stringify({ photo }),
  })
}

export const saveHeroPageAppearance = async (pageId, appearance) => {
  return requestJson(`/api/hero-pages/${pageId}/appearance`, {
    method: 'PATCH',
    body: JSON.stringify(appearance),
  })
}

export const createHeroPageDocument = async (payload) => {
  return requestJson('/api/hero-pages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const deleteHeroPageDocument = async (pageId) => {
  return requestJson(`/api/hero-pages/${pageId}`, {
    method: 'DELETE',
  })
}
