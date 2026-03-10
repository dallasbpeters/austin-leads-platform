function buildRequestHeaders(headers = {}) {
  return {
    "Content-Type": "application/json",
    ...headers,
  }
}

export async function requestJson(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: buildRequestHeaders(init?.headers),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Request failed.")
  }

  return response.json()
}

export function buildDefaultHeroQuery(page) {
  if (!page) {
    return ""
  }

  const domain = page.site?.primaryDomain?.split(".")[0]?.replace(/-/g, " ")
  return `${domain || page.site?.name || page.title} home exterior`
}

export function buildSiteHeroQuery(site) {
  if (!site) {
    return ""
  }

  const domain = site.primaryDomain?.split(".")[0]?.replace(/-/g, " ")
  return `${domain || site.name} home exterior`
}

export function mergeUniquePhotos(existing, incoming) {
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

export async function fetchHeroPagesAdmin() {
  return requestJson("/api/hero-pages")
}

export async function searchUnsplashPhotos(query, page) {
  return requestJson(`/api/unsplash/search?query=${encodeURIComponent(query)}&page=${page}`)
}

export async function saveHeroPageImage(pageId, photo) {
  return requestJson(`/api/hero-pages/${pageId}/image`, {
    method: "POST",
    body: JSON.stringify({ photo }),
  })
}

export async function saveHeroPageAppearance(pageId, appearance) {
  return requestJson(`/api/hero-pages/${pageId}/appearance`, {
    method: "PATCH",
    body: JSON.stringify(appearance),
  })
}

export async function createHeroPageDocument(payload) {
  return requestJson("/api/hero-pages", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
