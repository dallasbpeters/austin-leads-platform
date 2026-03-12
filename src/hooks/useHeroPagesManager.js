'use client'

import { useEffect, useState } from 'react'
import { useColorPicker } from 'react-best-gradient-color-picker'

import { buildHeroOverlayGradientValue, parseRgbString } from '@/lib/platform/heroAppearance'
import {
  buildDefaultHeroQuery,
  buildSiteHeroQuery,
  createHeroPageDocument,
  fetchHeroPagesAdmin,
  mergeUniquePhotos,
  saveHeroPageAppearance,
  saveHeroPageImage,
  searchUnsplashPhotos,
} from '@/services/admin/hero-pages'

function buildDefaultAppearance(selectedPage) {
  return {
    heroTextColor: selectedPage?.heroSection?.heroTextColor || '#ffffff',
    heroOverlayStartColor:
      selectedPage?.heroSection?.heroOverlayStartColor ||
      selectedPage?.heroSection?.heroOverlayColor ||
      '#0f172a',
    heroOverlayEndColor:
      selectedPage?.heroSection?.heroOverlayEndColor ||
      selectedPage?.heroSection?.heroOverlayColor ||
      '#0f172a',
    heroOverlayDirection: selectedPage?.heroSection?.heroOverlayDirection || '180deg',
    heroOverlayStartOpacity: String(
      selectedPage?.heroSection?.heroOverlayStartOpacity ??
        selectedPage?.heroSection?.heroOverlayOpacity ??
        0.6,
    ),
    heroOverlayEndOpacity: String(
      selectedPage?.heroSection?.heroOverlayEndOpacity ??
        selectedPage?.heroSection?.heroOverlayOpacity ??
        0.15,
    ),
    heroOverlayOpacity: String(selectedPage?.heroSection?.heroOverlayOpacity ?? 0.42),
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
  const [appearanceForm, setAppearanceForm] = useState({
    heroTextColor: '#ffffff',
    heroOverlayStartColor: '#0f172a',
    heroOverlayEndColor: '#0f172a',
    heroOverlayDirection: '180deg',
    heroOverlayStartOpacity: '0.6',
    heroOverlayEndOpacity: '0.15',
    heroOverlayOpacity: '0.42',
  })
  const [overlayGradient, setOverlayGradient] = useState(
    'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.15) 100%)',
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
                  ...(page.heroSection || {}),
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
                  ...(page.heroSection || {}),
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
    const last = stops[stops.length - 1]
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
      if (!nextPages.find((page) => page.id === data.page.id)) {
        setPages((current) => [data.page, ...current])
      }
      setMessage(`Created ${data.page.title}.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setCreating(false)
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

  return {
    appearanceForm,
    createForm,
    creating,
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
    selectedPage,
    selectedSite,
    selectedSiteId,
    totalPages,
    createPage,
    handleOverlayGradientChange,
    loadMorePhotos,
    saveAppearance,
    savePhoto,
    searchPhotos,
    selectSite,
    setAppearanceForm,
    setCreateForm,
    setGradientPickerOpen,
    setQuery,
  }
}
