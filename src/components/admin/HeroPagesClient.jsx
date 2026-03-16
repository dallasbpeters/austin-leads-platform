'use client'

import Link from 'next/link'
import { ExternalLink, ImagePlus, LoaderCircle, Search, Trash2 } from 'lucide-react'
import ColorPicker from 'react-best-gradient-color-picker'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useHeroPagesManager } from '@/hooks/useHeroPagesManager'
import { getImageAlt, getImageUrl, hasImageSource } from '@/lib/platform/imageSource'
import { cn } from '@/lib/utils'

function ResultCard({ photo, onSelect, saving, canSelect }) {
  return (
    <Card className="bg-background border-border/70 overflow-hidden">
      <div className="bg-muted aspect-square">
        <img
          alt={photo.alt}
          className="h-full w-full object-cover"
          src={photo.urls.small || photo.urls.regular || photo.urls.thumb}
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground text-sm line-clamp-2">{photo.alt}</p>
          <p className="text-muted-foreground text-sm">
            {photo.user?.name ? `Photo by ${photo.user.name}` : 'Unsplash contributor'}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <a
            className="items-center gap-1 text-muted-foreground text-sm hover:text-foreground inline-flex"
            href={photo.links.html}
            rel="noreferrer"
            target="_blank"
          >
            View on Unsplash
            <ExternalLink className="h-3 w-3" />
          </a>
          <Button disabled={saving || !canSelect} onClick={() => onSelect(photo)} size="sm">
            {canSelect ? 'Use image' : 'Select page first'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HeroPagesClient({ initialPages, heroSites, unsplashEnabled, canCreatePages }) {
  const {
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
  } = useHeroPagesManager({ initialPages, heroSites })

  async function handleDeletePage() {
    if (!selectedPage) {
      return
    }

    const confirmed = window.confirm(
      `Delete "${selectedPage.title}"? This removes the hero page from Sanity.`,
    )

    if (!confirmed) {
      return
    }

    await deletePage(selectedPage)
  }

  return (
    <div className="p-6 space-y-8 lg:p-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm tracking-[0.22em] uppercase">Hero pages</p>
          <h1 className="mt-2 text-3xl text-foreground tracking-tight">
            Search Unsplash and attach hero images
          </h1>
          <p className="max-w-3xl mt-3 leading-7 text-base text-muted-foreground">
            Choose a hero-tier page, search Unsplash from the admin, then store the selected image metadata
            directly on the hero section in Sanity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={canCreatePages ? 'default' : 'outline'}>
            {canCreatePages ? 'Sanity write enabled' : 'Sanity write not configured'}
          </Badge>
          <Badge variant={unsplashEnabled ? 'default' : 'outline'}>
            {unsplashEnabled ? 'Unsplash connected' : 'Unsplash not configured'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create hero page</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={createPage}>
                {!canCreatePages ? (
                  <div className="px-4 py-4 leading-7 text-muted-foreground text-sm bg-muted/20 border border-border border-dashed rounded-xl">
                    Add `SANITY_API_WRITE_TOKEN` to create pages from this admin.
                  </div>
                ) : null}

                {!heroSites.length ? (
                  <div className="px-4 py-4 leading-7 text-muted-foreground text-sm bg-muted/20 border border-border border-dashed rounded-xl">
                    No hero-tier site documents exist in Sanity yet. Create or import site documents first,
                    then you can add pages here.
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="hero-page-site">Hero site</Label>
                      <Select
                        value={createForm.siteId}
                        onValueChange={(value) => setCreateForm((current) => ({ ...current, siteId: value }))}
                      >
                        <SelectTrigger id="hero-page-site">
                          <SelectValue placeholder="Select hero site" />
                        </SelectTrigger>
                        <SelectContent>
                          {heroSites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hero-page-title">Page title</Label>
                      <Input
                        id="hero-page-title"
                        value={createForm.title}
                        onChange={(event) =>
                          setCreateForm((current) => ({ ...current, title: event.target.value }))
                        }
                        placeholder="Austin Solar Cost Guide"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hero-page-type">Page type</Label>
                      <Select
                        value={createForm.pageType}
                        onValueChange={(value) =>
                          setCreateForm((current) => ({ ...current, pageType: value }))
                        }
                      >
                        <SelectTrigger id="hero-page-type">
                          <SelectValue placeholder="Select page type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hero-page-slug">Slug</Label>
                      <Input
                        id="hero-page-slug"
                        value={createForm.slug}
                        onChange={(event) =>
                          setCreateForm((current) => ({ ...current, slug: event.target.value }))
                        }
                        placeholder={
                          createForm.pageType === 'home' ? 'Uses / for home pages' : 'solar-cost-austin'
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hero-page-description">Description</Label>
                      <Textarea
                        id="hero-page-description"
                        value={createForm.description}
                        onChange={(event) =>
                          setCreateForm((current) => ({ ...current, description: event.target.value }))
                        }
                        placeholder="Short description and initial hero body."
                      />
                    </div>

                    <Button
                      disabled={
                        !canCreatePages ||
                        !heroSites.length ||
                        !createForm.siteId ||
                        !createForm.title ||
                        creating
                      }
                      type="submit"
                    >
                      {creating ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Create page
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          {heroSites.length ? (
            heroSites.map((site) => {
              const sitePages = pages.filter((entry) => entry.site?.id === site.id)
              const page = sitePages[0]
              const active = site.id === selectedSiteId
              const hasHeroMedia = hasImageSource(page?.heroSection?.heroAsset, page?.heroSection?.heroImage)

              return (
                <Card key={site.id} onClick={() => selectSite(site)}>
                  <CardHeader>
                    <CardTitle>{site.name}</CardTitle>
                    <CardDescription>{site.primaryDomain}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant={active ? 'secondary' : 'default'}>{active ? 'Editing' : 'Select'}</Badge>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant={sitePages.length ? 'outline' : 'outline'}>
                        {sitePages.length
                          ? `${sitePages.length} hero page${sitePages.length === 1 ? '' : 's'}`
                          : 'No hero pages'}
                      </Badge>
                      <Badge variant={hasHeroMedia ? 'outline' : 'outline'}>
                        {hasHeroMedia ? 'Image set' : 'No image'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="px-4 py-8 leading-7 text-muted-foreground text-sm bg-muted/20 border border-border border-dashed rounded-xl">
              No hero sites are available yet. Create or import hero-tier site records first.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editing context</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm tracking-[0.18em] uppercase">
                    {selectedSite?.name || 'No site selected'}
                  </div>
                  <h2 className="text-2xl text-foreground tracking-tight">
                    {selectedPage?.heroSection?.title ||
                      selectedPage?.title ||
                      (selectedSite ? `${selectedSite.name} homepage` : 'No hero site selected')}
                  </h2>
                  <p className="leading-7 text-muted-foreground text-sm">
                    {selectedPage?.heroSection?.body ||
                      (selectedPage
                        ? 'This homepage is ready for a hero image.'
                        : selectedSite
                          ? 'This site is active, but it does not have a homepage record yet. Create it from the form on the left.'
                          : 'Select a hero site to start editing.')}
                  </p>
                  {selectedSite ? (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{selectedSite.primaryDomain}</Badge>
                      <Badge variant={selectedPage ? 'secondary' : 'outline'}>
                        {selectedPage ? 'Homepage loaded' : 'Homepage missing'}
                      </Badge>
                      {selectedSite ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={launchHref} target="_blank">
                            Launch site
                          </Link>
                        </Button>
                      ) : null}
                      {selectedPage ? (
                        <Button
                          disabled={deletingPageId === selectedPage.id}
                          onClick={handleDeletePage}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          {deletingPageId === selectedPage.id ? (
                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete page
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {selectedSite ? (
                  <div className="p-4 space-y-3 bg-muted/20 border border-border rounded-xl">
                    <div>
                      <div className="font-medium text-foreground text-sm">Pages for this site</div>
                      <div className="mt-1 leading-6 text-muted-foreground text-sm">
                        Switch between hero pages attached to {selectedSite.name}.
                      </div>
                    </div>

                    {sitePages.length ? (
                      <div className="grid gap-3">
                        {sitePages.map((page) => {
                          const active = page.id === selectedPage?.id
                          const pageHasHeroMedia = hasImageSource(
                            page?.heroSection?.heroAsset,
                            page?.heroSection?.heroImage,
                          )

                          return (
                            <button
                              className={cn(
                                "w-full px-4 py-4 text-left border rounded-xl transition-colors",
                                active
                                  ? "bg-primary/8 border-primary shadow-theme-sm ring-1 ring-primary/15"
                                  : "bg-background border-border hover:bg-background hover:border-border/90",
                              )}
                              key={page.id}
                              onClick={() => selectPage(page)}
                              type="button"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium text-foreground text-sm truncate">
                                    {page.title}
                                  </div>
                                  <div className="mt-1 text-muted-foreground text-sm">
                                    {page.slug ? `/${page.slug}` : '/'}
                                  </div>
                                </div>
                                <Badge variant={active ? 'default' : 'outline'}>
                                  {active ? 'Editing' : 'Open'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <Badge variant="outline">
                                  {page.pageType === 'home'
                                    ? 'Home'
                                    : page.pageType === 'service'
                                      ? 'Service'
                                      : page.pageType === 'location'
                                        ? 'Location'
                                        : 'Page'}
                                </Badge>
                                <Badge variant={pageHasHeroMedia ? 'secondary' : 'outline'}>
                                  {pageHasHeroMedia ? 'Image set' : 'No image'}
                                </Badge>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-4 leading-7 text-muted-foreground text-sm bg-background border border-border border-dashed rounded-xl">
                        This site has no hero pages yet. Create one from the form on the left.
                      </div>
                    )}
                  </div>
                ) : null}

                <form className="flex flex-col md:flex-row gap-3" onSubmit={searchPhotos}>
                  <Input
                    disabled={!unsplashEnabled}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search for Austin exterior, roofing close-up, wedding venue..."
                    value={query}
                  />
                  <Button disabled={!unsplashEnabled || !query || loading} type="submit">
                    {loading ? (
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search Unsplash
                  </Button>
                </form>

                {message ? (
                  <div className="px-4 py-3 text-emerald-900 text-sm bg-emerald-50 border border-emerald-200 rounded-xl">
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="px-4 py-3 text-rose-900 text-sm bg-rose-50 border border-rose-200 rounded-xl">
                    {error}
                  </div>
                ) : null}

                {!unsplashEnabled ? (
                  <div className="px-4 py-4 leading-7 text-muted-foreground text-sm bg-muted/20 border border-border border-dashed rounded-xl">
                    Add `UNSPLASH_ACCESS_KEY` to your local env and Vercel envs to enable image search here.
                  </div>
                ) : null}

                {!selectedPage ? (
                  <div className="px-4 py-4 leading-7 text-muted-foreground text-sm bg-muted/20 border border-border border-dashed rounded-xl">
                    Search is enabled, but you need to create a homepage for the active site before you can
                    save an image to Sanity.
                  </div>
                ) : null}

                {selectedPage ? (
                  <form
                    className="p-4 space-y-4 bg-muted/20 border border-border rounded-xl"
                    onSubmit={saveAppearance}
                  >
                    <div>
                      <div className="font-medium text-foreground text-sm">Hero appearance</div>
                      <div className="mt-1 leading-6 text-muted-foreground text-sm">
                        Use these controls when the hero image needs darker or lighter text treatment.
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="hero-text">Text color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            className="h-10 w-16 p-1"
                            id="hero-text"
                            onChange={(event) =>
                              setAppearanceForm((current) => ({
                                ...current,
                                heroTextColor: event.target.value,
                              }))
                            }
                            type="color"
                            value={appearanceForm.heroTextColor}
                          />
                          <Input
                            onChange={(event) =>
                              setAppearanceForm((current) => ({
                                ...current,
                                heroTextColor: event.target.value,
                              }))
                            }
                            value={appearanceForm.heroTextColor}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="hero-overlay-angle">Gradient angle</Label>
                        <Input id="hero-overlay-angle" readOnly value={appearanceForm.heroOverlayDirection} />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Overlay gradient</Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 min-w-0 border border-border rounded-lg flex-1"
                          style={{ backgroundImage: overlayGradient }}
                        />
                        <Popover open={gradientPickerOpen} onOpenChange={setGradientPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                              Edit gradient
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-84 p-4">
                            <div className="mb-3"></div>
                            <ColorPicker
                              disableDarkMode
                              hideColorGuide
                              hideColorTypeBtns
                              hideEyeDrop
                              hideGradientType
                              hidePresets
                              value={overlayGradient}
                              onChange={handleOverlayGradientChange}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="hero-overlay-start-opacity">
                          Start opacity: {appearanceForm.heroOverlayStartOpacity}
                        </Label>
                        <input
                          className="w-full accent-primary"
                          id="hero-overlay-start-opacity"
                          max="1"
                          min="0"
                          onChange={(event) =>
                            setAppearanceForm((current) => ({
                              ...current,
                              heroOverlayStartOpacity: event.target.value,
                            }))
                          }
                          step="0.05"
                          type="range"
                          value={appearanceForm.heroOverlayStartOpacity}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="hero-overlay-end-opacity">
                          End opacity: {appearanceForm.heroOverlayEndOpacity}
                        </Label>
                        <input
                          className="w-full accent-primary"
                          id="hero-overlay-end-opacity"
                          max="1"
                          min="0"
                          onChange={(event) =>
                            setAppearanceForm((current) => ({
                              ...current,
                              heroOverlayEndOpacity: event.target.value,
                            }))
                          }
                          step="0.05"
                          type="range"
                          value={appearanceForm.heroOverlayEndOpacity}
                        />
                      </div>
                    </div>

                    <Button disabled={savingAppearance} type="submit" variant="outline">
                      {savingAppearance ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Save appearance
                    </Button>
                  </form>
                ) : null}
              </div>

              <Card className="bg-background border-border/70 overflow-hidden">
                {hasImageSource(
                  selectedPage?.heroSection?.heroAsset,
                  selectedPage?.heroSection?.heroImage,
                ) ? (
                  <>
                    <div className="bg-muted aspect-4/3">
                      <img
                        alt={getImageAlt(
                          selectedPage?.heroSection?.heroAsset,
                          selectedPage?.heroSection?.heroImage,
                          selectedPage?.title || selectedSite?.name || 'Hero image',
                        )}
                        className="h-full w-full object-cover"
                        src={getImageUrl(
                          selectedPage?.heroSection?.heroAsset,
                          selectedPage?.heroSection?.heroImage,
                        )}
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <div className="font-medium text-foreground text-sm">Current hero image</div>
                        <div className="mt-1 text-muted-foreground text-sm">
                          {selectedPage?.heroSection?.heroAsset?.asset?.url
                            ? 'Using uploaded Sanity asset'
                            : selectedPage?.heroSection?.heroImage?.creditName
                              ? `Photo by ${selectedPage.heroSection.heroImage.creditName} on Unsplash`
                              : 'Using external image'}
                        </div>
                      </div>
                      {selectedPage?.heroSection?.heroImage?.unsplashUrl ? (
                        <a
                          className="items-center gap-1 text-muted-foreground text-sm hover:text-foreground inline-flex"
                          href={selectedPage.heroSection.heroImage.unsplashUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          View source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex flex-col items-center justify-center min-h-60 gap-3 p-6 text-center">
                    <div className="flex items-center justify-center h-12 w-12 bg-muted rounded-full">
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">No image selected yet</div>
                      <div className="mt-1 leading-6 text-muted-foreground text-sm">
                        {selectedPage
                          ? "Search Unsplash and save a photo to this page's hero section."
                          : 'Create or select a hero page to start searching.'}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search results</CardTitle>
            </CardHeader>
            <CardContent>
              {results.length ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {results.map((photo) => (
                      <ResultCard
                        canSelect={Boolean(selectedPage)}
                        key={photo.id}
                        onSelect={savePhoto}
                        photo={photo}
                        saving={savingImageId === photo.id}
                      />
                    ))}
                  </div>

                  {searchPage < totalPages ? (
                    <div className="flex justify-center">
                      <Button disabled={loadingMore} onClick={loadMorePhotos} type="button" variant="outline">
                        {loadingMore ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Load more
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="px-3 md:px-6 py-10 leading-7 text-center text-muted-foreground text-sm bg-muted/20 border border-border border-dashed rounded-xl">
                  {loading
                    ? 'Searching Unsplash...'
                    : selectedPage
                      ? 'Run a search to see image results for the selected hero page.'
                      : 'Select a hero page to search for images.'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
