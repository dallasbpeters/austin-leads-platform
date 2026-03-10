'use client'

import Link from 'next/link'
import { ExternalLink, ImagePlus, LoaderCircle, Search } from 'lucide-react'
import ColorPicker from 'react-best-gradient-color-picker'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useHeroPagesManager } from '@/hooks/useHeroPagesManager'
import { getImageAlt, getImageUrl, hasImageSource } from '@/lib/platform/imageSource'
import { cn } from '@/lib/utils'

function ResultCard({ photo, onSelect, saving, canSelect }) {
  return (
    <Card className="overflow-hidden border-border/70 bg-background">
      <div className="aspect-[4/3] bg-muted">
        <img alt={photo.alt} className="h-full w-full object-cover" src={photo.urls.small || photo.urls.regular || photo.urls.thumb} />
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="line-clamp-2 text-sm font-medium text-foreground">{photo.alt}</p>
          <p className="text-xs text-muted-foreground">{photo.user?.name ? `Photo by ${photo.user.name}` : 'Unsplash contributor'}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <a className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" href={photo.links.html} rel="noreferrer" target="_blank">
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
  } = useHeroPagesManager({ initialPages, heroSites })

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Hero pages</p>
          <h1 className="mt-2 text-3xl tracking-tight text-foreground">Search Unsplash and attach hero images</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">Choose a hero-tier page, search Unsplash from the admin, then store the selected image metadata directly on the hero section in Sanity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={canCreatePages ? 'default' : 'outline'}>{canCreatePages ? 'Sanity write enabled' : 'Sanity write not configured'}</Badge>
          <Badge variant={unsplashEnabled ? 'default' : 'outline'}>{unsplashEnabled ? 'Unsplash connected' : 'Unsplash not configured'}</Badge>
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
                {!canCreatePages ? <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-4 text-sm leading-7 text-muted-foreground">Add `SANITY_API_WRITE_TOKEN` to create pages from this admin.</div> : null}

                {!heroSites.length ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-4 text-sm leading-7 text-muted-foreground">No hero-tier site documents exist in Sanity yet. Create or import site documents first, then you can add pages here.</div>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="hero-page-site">Hero site</Label>
                      <Select value={createForm.siteId} onValueChange={(value) => setCreateForm((current) => ({ ...current, siteId: value }))}>
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
                      <Input id="hero-page-title" value={createForm.title} onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))} placeholder="Austin Solar Cost Guide" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hero-page-type">Page type</Label>
                      <Select value={createForm.pageType} onValueChange={(value) => setCreateForm((current) => ({ ...current, pageType: value }))}>
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
                      <Input id="hero-page-slug" value={createForm.slug} onChange={(event) => setCreateForm((current) => ({ ...current, slug: event.target.value }))} placeholder={createForm.pageType === 'home' ? 'Uses / for home pages' : 'solar-cost-austin'} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hero-page-description">Description</Label>
                      <Textarea id="hero-page-description" value={createForm.description} onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))} placeholder="Short description and initial hero body." />
                    </div>

                    <Button disabled={!canCreatePages || !heroSites.length || !createForm.siteId || !createForm.title || creating} type="submit">
                      {creating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create page
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hero site inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {heroSites.length ? (
                heroSites.map((site) => {
                  const page = pages.find((entry) => entry.site?.id === site.id)
                  const active = site.id === selectedSiteId
                  const hasHeroMedia = hasImageSource(page?.heroSection?.heroAsset, page?.heroSection?.heroImage)

                  return (
                    <button className={cn('w-full rounded-xl border px-4 py-4 text-left transition-colors', active ? 'shadow-theme-sm border-primary bg-primary/8 ring-1 ring-primary/15' : 'border-border bg-background hover:border-border/90 hover:bg-muted/40')} key={site.id} onClick={() => selectSite(site)} type="button">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-foreground">{site.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{site.primaryDomain}</div>
                        </div>
                        <Badge variant={active ? 'default' : 'outline'}>{active ? 'Editing' : 'Select'}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant={page ? 'secondary' : 'outline'}>{page ? 'Homepage created' : 'Needs homepage'}</Badge>
                        <Badge variant={hasHeroMedia ? 'secondary' : 'outline'}>{hasHeroMedia ? 'Image set' : 'No image'}</Badge>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-sm leading-7 text-muted-foreground">No hero sites are available yet. Create or import hero-tier site records first.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editing context</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{selectedSite?.name || 'No site selected'}</div>
                  <h2 className="text-2xl tracking-tight text-foreground">{selectedPage?.heroSection?.title || selectedPage?.title || (selectedSite ? `${selectedSite.name} homepage` : 'No hero site selected')}</h2>
                  <p className="text-sm leading-7 text-muted-foreground">{selectedPage?.heroSection?.body || (selectedPage ? 'This homepage is ready for a hero image.' : selectedSite ? 'This site is active, but it does not have a homepage record yet. Create it from the form on the left.' : 'Select a hero site to start editing.')}</p>
                  {selectedSite ? (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{selectedSite.primaryDomain}</Badge>
                      <Badge variant={selectedPage ? 'secondary' : 'outline'}>{selectedPage ? 'Homepage loaded' : 'Homepage missing'}</Badge>
                      {selectedSite ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={launchHref} target="_blank">
                            Launch site
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <form className="flex flex-col gap-3 md:flex-row" onSubmit={searchPhotos}>
                  <Input disabled={!unsplashEnabled} onChange={(event) => setQuery(event.target.value)} placeholder="Search for Austin exterior, roofing close-up, wedding venue..." value={query} />
                  <Button disabled={!unsplashEnabled || !query || loading} type="submit">
                    {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search Unsplash
                  </Button>
                </form>

                {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</div> : null}

                {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

                {!unsplashEnabled ? <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-4 text-sm leading-7 text-muted-foreground">Add `UNSPLASH_ACCESS_KEY` to your local env and Vercel envs to enable image search here.</div> : null}

                {!selectedPage ? <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-4 text-sm leading-7 text-muted-foreground">Search is enabled, but you need to create a homepage for the active site before you can save an image to Sanity.</div> : null}

                {selectedPage ? (
                  <form className="space-y-4 rounded-xl border border-border bg-muted/20 p-4" onSubmit={saveAppearance}>
                    <div>
                      <div className="text-sm font-medium text-foreground">Hero appearance</div>
                      <div className="mt-1 text-xs leading-6 text-muted-foreground">Use these controls when the hero image needs darker or lighter text treatment.</div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="hero-text-color">Text color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            className="h-10 w-16 p-1"
                            id="hero-text-color"
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
                        <div className="h-10 min-w-0 flex-1 rounded-lg border border-border" style={{ backgroundImage: overlayGradient }} />
                        <Popover open={gradientPickerOpen} onOpenChange={setGradientPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                              Edit gradient
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-[21rem] p-4">
                            <div className="mb-3"></div>
                            <ColorPicker disableDarkMode hideColorGuide hideColorTypeBtns hideEyeDrop hideGradientType hidePresets value={overlayGradient} onChange={handleOverlayGradientChange} />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="hero-overlay-start-opacity">Start opacity: {appearanceForm.heroOverlayStartOpacity}</Label>
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
                        <Label htmlFor="hero-overlay-end-opacity">End opacity: {appearanceForm.heroOverlayEndOpacity}</Label>
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
                      {savingAppearance ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save appearance
                    </Button>
                  </form>
                ) : null}
              </div>

              <Card className="overflow-hidden border-border/70 bg-background">
                {hasImageSource(selectedPage?.heroSection?.heroAsset, selectedPage?.heroSection?.heroImage) ? (
                  <>
                    <div className="aspect-[4/3] bg-muted">
                      <img
                        alt={getImageAlt(
                          selectedPage?.heroSection?.heroAsset,
                          selectedPage?.heroSection?.heroImage,
                          selectedPage?.title || selectedSite?.name || 'Hero image',
                        )}
                        className="h-full w-full object-cover"
                        src={getImageUrl(selectedPage?.heroSection?.heroAsset, selectedPage?.heroSection?.heroImage)}
                      />
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">Current hero image</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedPage?.heroSection?.heroAsset?.asset?.url
                            ? 'Using uploaded Sanity asset'
                            : selectedPage?.heroSection?.heroImage?.creditName
                              ? `Photo by ${selectedPage.heroSection.heroImage.creditName} on Unsplash`
                              : 'Using external image'}
                        </div>
                      </div>
                      {selectedPage?.heroSection?.heroImage?.unsplashUrl ? (
                        <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" href={selectedPage.heroSection.heroImage.unsplashUrl} rel="noreferrer" target="_blank">
                          View source
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">No image selected yet</div>
                      <div className="mt-1 text-xs leading-6 text-muted-foreground">{selectedPage ? "Search Unsplash and save a photo to this page's hero section." : 'Create or select a hero page to start searching.'}</div>
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
                      <ResultCard canSelect={Boolean(selectedPage)} key={photo.id} onSelect={savePhoto} photo={photo} saving={savingImageId === photo.id} />
                    ))}
                  </div>

                  {searchPage < totalPages ? (
                    <div className="flex justify-center">
                      <Button disabled={loadingMore} onClick={loadMorePhotos} type="button" variant="outline">
                        {loadingMore ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Load more
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-sm leading-7 text-muted-foreground">{loading ? 'Searching Unsplash...' : selectedPage ? 'Run a search to see image results for the selected hero page.' : 'Select a hero page to search for images.'}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
