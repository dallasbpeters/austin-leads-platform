'use client'

import { useEffect, useState } from 'react'
import { useColorPicker } from 'react-best-gradient-color-picker'

import { buildHeroOverlayGradientValue, parseRgbString } from '@/lib/platform/heroAppearance'
import {
  buildDefaultHeroQuery,
  buildSiteHeroQuery,
  createHeroPageDocument,
  deleteHeroPageDocument,
  fetchHeroPagesAdmin,
  mergeUniquePhotos,
  saveHeroPageAppearance,
  saveHeroPageImage,
  searchUnsplashPhotos,
} from '@/services/admin/hero-pages'

function overlayColor(section, primary, fallbackKey, defaultValue) {
  return section?.[primary] || section?.[fallbackKey] || defaultValue
}

function overlayOpacity(section, primary, fallbackKey, defaultValue) {
  return String(section?.[primary] ?? section?.[fallbackKey] ?? defaultValue)
}

function buildDefaultAppearance(selectedPage) {
  const section = selectedPage?.heroSection
  return {
    heroTextColor: section?.heroTextColor || '#ffffff',
    heroOverlayStartColor: overlayColor(section, 'heroOverlayStartColor', 'heroOverlayColor', '#0f172a'),
    heroOverlayEndColor: overlayColor(section, 'heroOverlayEndColor', 'heroOverlayColor', '#0f172a'),
    heroOverlayDirection: section?.heroOverlayDirection || '180deg',
    heroOverlayStartOpacity: overlayOpacity(section, 'heroOverlayStartOpacity', 'heroOverlayOpacity', 0.15),
    heroOverlayEndOpacity: overlayOpacity(section, 'heroOverlayEndOpacity', 'heroOverlayOpacity', 0.6),
    heroOverlayOpacity: String(section?.heroOverlayOpacity ?? 0.42),
  }
}

export function useHeroPagesManager({ initialPages, heroSites }) {
  const [pages, setPages] = useState(initialPages)
  const [selectedPageId, setSelectedPageId] = useState(initialPages[0]?.id || '')
  const [query, setQuery] = useState(initialPages[0] ? buildDefaultHeroQuery(initialPages[0]) : '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [savingImageId, setSavingImageId] = useState('')
  const [savingAppearance, setSavingAppearance] = useState(false)
  const [gradientPickerOpen, setGradientPickerOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingPageId, setDeletingPageId] = useState('')
  const [appearanceForm, setAppearanceForm] = useState({
    heroTextColor: '#ffffff',
    heroOverlayStartColor: '#0f172a',
    heroOverlayEndColor: '#0f172a',
    heroOverlayDirection: '180deg',
    heroOverlayStartOpacity: '0.6',
    heroOverlayEndOpacity: '1',
    heroOverlayOpacity: '0.42',
  })
  const [overlayGradient, setOverlayGradient] = useState(
    'linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.35) 100%)',
  )
  const [createForm, setCreateForm] = useState({
    title: '',
    siteId: heroSites[0]?.id || '',
    pageType: 'home',
    slug: '',
    description: '',
  })

  const selectedPage = pages.find((page) => page.id === selectedPageId) || pages[0] || null
  const { getGradientObject } = useColorPicker(overlayGradient, setOverlayGradient)
  const selectedSiteId = selectedPage?.site?.id || createForm.siteId || heroSites[0]?.id || ''
  const selectedSite = heroSites.find((site) => site.id === selectedSiteId) || null
  const sitePages = pages.filter((page) => page.site?.id === selectedSiteId)
  const launchHref = selectedPage?.slug ? `/${selectedPage.slug}` : '/'

  useEffect(() => {
    if (!selectedPageId && initialPages[0]?.id) {
      setSelectedPageId(initialPages[0].id)
    }
  }, [initialPages, selectedPageId])

  useEffect(() => {
    if (!selectedPage) {
      return
    }

    setQuery((current) => current || buildDefaultHeroQuery(selectedPage))
  }, [selectedPage])

  useEffect(() => {
    const nextAppearance = buildDefaultAppearance(selectedPage)
    setAppearanceForm(nextAppearance)
  }, [selectedPage])

  useEffect(() => {
    setOverlayGradient(buildHeroOverlayGradientValue(appearanceForm))
  }, [
    appearanceForm.heroOverlayDirection,
    appearanceForm.heroOverlayEndColor,
    appearanceForm.heroOverlayEndOpacity,
    appearanceForm.heroOverlayStartColor,
    appearanceForm.heroOverlayStartOpacity,
  ])

  async function refreshHeroPages() {
    const data = await fetchHeroPagesAdmin()
    setPages(data.pages || [])
    return data.pages || []
  }

  async function fetchPhotos(page, mode = 'replace') {
    if (!query) {
      return
    }

    try {
      const data = await searchUnsplashPhotos(query, page)

      setSearchPage(page)
      setTotalPages(data.totalPages || 1)
      setResults((current) =>
        mode === 'append'
          ? mergeUniquePhotos(current, data.results || [])
          : mergeUniquePhotos([], data.results || []),
      )
    } catch (nextError) {
      setError(nextError.message)
      if (mode === 'replace') {
        setResults([])
      }
    }
  }

  async function searchPhotos(event) {
    event?.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await fetchPhotos(1, 'replace')
    } finally {
      setLoading(false)
    }
  }

  async function loadMorePhotos() {
    setError('')
    setLoadingMore(true)

    try {
      await fetchPhotos(searchPage + 1, 'append')
    } finally {
      setLoadingMore(false)
    }
  }

  async function savePhoto(photo) {
    if (!selectedPage) {
      return
    }

    setError('')
    setMessage('')
    setSavingImageId(photo.id)

    try {
      const data = await saveHeroPageImage(selectedPage.id, photo)

      setPages((current) =>
        current.map((page) =>
          page.id === selectedPage.id
            ? {
                ...page,
                heroSection: {
                  ...page.heroSection,
                  heroImage: data.heroImage,
                },
              }
            : page,
        ),
      )
      await refreshHeroPages()
      setMessage(`Saved image to ${selectedPage.title}.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSavingImageId('')
    }
  }

  async function saveAppearance(event) {
    event.preventDefault()

    if (!selectedPage) {
      return
    }

    setError('')
    setMessage('')
    setSavingAppearance(true)

    try {
      const data = await saveHeroPageAppearance(selectedPage.id, appearanceForm)

      setPages((current) =>
        current.map((page) =>
          page.id === selectedPage.id
            ? {
                ...page,
                heroSection: {
                  ...page.heroSection,
                  ...data.heroAppearance,
                },
              }
            : page,
        ),
      )
      await refreshHeroPages()
      setMessage(`Updated hero appearance for ${selectedPage.title}.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSavingAppearance(false)
    }
  }

  function handleOverlayGradientChange(nextGradient) {
    setOverlayGradient(nextGradient)

    const gradientObject = getGradientObject(nextGradient)

    if (!gradientObject?.isGradient || gradientObject.gradientType !== 'linear-gradient') {
      return
    }

    const stops = gradientObject.colors || []
    const first = stops[0]
    const last = stops.at(-1)
    const start = parseRgbString(first?.value)
    const end = parseRgbString(last?.value)

    setAppearanceForm((current) => {
      const nextStartOpacity = start?.alpha ?? Number.parseFloat(current.heroOverlayStartOpacity)
      const nextEndOpacity = end?.alpha ?? Number.parseFloat(current.heroOverlayEndOpacity)

      return {
        ...current,
        heroOverlayDirection: gradientObject.degrees || current.heroOverlayDirection,
        heroOverlayStartColor: start?.hex || current.heroOverlayStartColor,
        heroOverlayEndColor: end?.hex || current.heroOverlayEndColor,
        heroOverlayStartOpacity: String(nextStartOpacity),
        heroOverlayEndOpacity: String(nextEndOpacity),
        heroOverlayOpacity: String(((nextStartOpacity + nextEndOpacity) / 2).toFixed(2)),
      }
    })
  }

  async function createPage(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setCreating(true)

    try {
      const data = await createHeroPageDocument(createForm)

      const nextPages = await refreshHeroPages()
      setSelectedPageId(data.page.id)
      setQuery(buildDefaultHeroQuery(data.page))
      setCreateForm((current) => ({
        ...current,
        title: '',
        slug: '',
        description: '',
      }))
      if (!nextPages.some((page) => page.id === data.page.id)) {
        setPages((current) => [data.page, ...current])
      }
      setMessage(`Created ${data.page.title}.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setCreating(false)
    }
  }

  async function deletePage(page) {
    if (!page?.id) {
      return
    }

    setError('')
    setMessage('')
    setDeletingPageId(page.id)

    try {
      const data = await deleteHeroPageDocument(page.id)
      const nextPages = await refreshHeroPages()
      const remainingSitePages = nextPages.filter((entry) => entry.site?.id === page.site?.id)
      const fallbackPage = remainingSitePages[0] || nextPages[0] || null

      setSelectedPageId(fallbackPage?.id || '')
      setQuery(
        fallbackPage ? buildDefaultHeroQuery(fallbackPage) : page.site ? buildSiteHeroQuery(page.site) : '',
      )
      setResults([])
      setSearchPage(1)
      setTotalPages(1)
      setMessage(`Deleted ${data.title || page.title}.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setDeletingPageId('')
    }
  }

  function selectSite(site) {
    const page = pages.find((entry) => entry.site?.id === site.id)

    setCreateForm((current) => ({ ...current, siteId: site.id }))
    setSelectedPageId(page?.id || '')
    setMessage('')
    setError('')
    setQuery(page ? buildDefaultHeroQuery(page) : buildSiteHeroQuery(site))
  }

  function selectPage(page) {
    setSelectedPageId(page.id)
    setCreateForm((current) => ({ ...current, siteId: page.site?.id || current.siteId }))
    setMessage('')
    setError('')
    setQuery(buildDefaultHeroQuery(page))
  }

  return {
    appearanceForm,
    createForm,
    creating,
    deletingPageId,
    error,
    gradientPickerOpen,
    launchHref,
    loading,
    loadingMore,
    message,
    overlayGradient,
    pages,
    query,
    results,
    savingAppearance,
    savingImageId,
    searchPage,
    sitePages,
    selectedPage,
    selectedSite,
    selectedSiteId,
    totalPages,
    createPage,
    deletePage,
    handleOverlayGradientChange,
    loadMorePhotos,
    saveAppearance,
    savePhoto,
    searchPhotos,
    selectPage,
    selectSite,
    setAppearanceForm,
    setCreateForm,
    setGradientPickerOpen,
    setQuery,
  }
}
