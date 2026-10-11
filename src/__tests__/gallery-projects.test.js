import { describe, expect, it } from 'vitest'

import {
  buildLegacyAltText,
  countGalleryPhotos,
  getGalleryProjects,
  getProjectMetaLine,
} from '@/lib/platform/gallery-projects'

const asset = (id, width = 2048, height = 1536) => ({
  _id: id,
  _ref: id,
  url: `https://cdn.sanity.io/images/x/y/${id}.jpg`,
  metadata: { dimensions: { width, height } },
})

const legacyImage = (key, overrides = {}) => ({
  _key: key,
  _type: 'galleryImage',
  asset: asset(`image-${key}`),
  neighborhood: 'West Lake',
  package: 'Roofline',
  ...overrides,
})

const crop = { top: 0.1, bottom: 0, left: 0, right: 0 }
const hotspot = { x: 0.5, y: 0.4, width: 1, height: 1 }

const legacySection = {
  title: 'Work from around Austin',
  images: [
    legacyImage('a', { crop, hotspot, year: 2025 }),
    legacyImage('b', { neighborhood: 'Hutto', package: 'Full Property' }),
    legacyImage('c', { neighborhood: '', package: '' }),
  ],
}

describe('getGalleryProjects with legacy images[]', () => {
  it('turns every legacy image into a one-photo project, in the original order', () => {
    const projects = getGalleryProjects(legacySection)
    expect(projects.map((project) => project.photos.length)).toStrictEqual([1, 1, 1])
    expect(projects.map((project) => project.key)).toStrictEqual([
      'gallery-image::a::image-a::0',
      'gallery-image::b::image-b::1',
      'gallery-image::c::image-c::2',
    ])
  })

  it('keeps the asset, crop, hotspot, and stored dimensions of each legacy image', () => {
    const [first] = getGalleryProjects(legacySection)
    expect(first.cover.image).toBe(legacySection.images[0])
    expect(first.cover.image.crop).toBe(crop)
    expect(first.cover.image.hotspot).toBe(hotspot)
    expect(first.cover.width).toBe(2048)
    expect(first.cover.height).toBe(1536)
  })

  it('copies the metadata and uses the neighborhood as the tile title', () => {
    const projects = getGalleryProjects(legacySection)
    expect(projects[0]).toMatchObject({
      title: 'West Lake',
      name: 'West Lake',
      neighborhood: 'West Lake',
      year: '2025',
      packageName: 'Roofline',
    })
    expect(projects[1].title).toBe('Hutto')
  })

  it('leaves the caption empty without a neighborhood but still names the project', () => {
    const projects = getGalleryProjects(legacySection)
    // Matches the pre-project tile: no neighborhood meant no caption.
    expect(projects[2].title).toBe('')
    expect(projects[2].name).toBe('Work from around Austin photo 3')
  })

  it('builds alt text from altText, then legacy alt, then a plain fallback', () => {
    const projects = getGalleryProjects({
      images: [
        legacyImage('a', { altText: 'Roofline lights on a two-story home' }),
        legacyImage('b', { alt: 'Old alt copy' }),
        legacyImage('c', { year: 2024 }),
      ],
    })
    expect(projects.map((project) => project.cover.alt)).toStrictEqual([
      'Roofline lights on a two-story home',
      'Old alt copy',
      'Roofline install in West Lake 2024',
    ])
  })

  it('skips images without an asset', () => {
    const projects = getGalleryProjects({
      images: [{ _key: 'x', neighborhood: 'No asset' }, legacyImage('a')],
    })
    expect(projects).toHaveLength(1)
    expect(projects[0].neighborhood).toBe('West Lake')
  })
})

const projectSection = {
  title: 'Recent installs',
  projects: [
    {
      _key: 'p1',
      title: 'The Johnson home',
      neighborhood: 'Round Rock',
      year: 2025,
      package: 'Full Property',
      photos: [
        { _key: 'p1a', asset: asset('image-p1a', 2752, 1536), altText: 'Front of the Johnson home' },
        { _key: 'p1b', asset: asset('image-p1b'), altText: 'Back yard', caption: 'Back yard tree wrap' },
        { _key: 'p1c', altText: 'Missing asset' },
      ],
    },
    { _key: 'p2', title: 'Empty project', photos: [] },
    { _key: 'p3', neighborhood: 'Hutto', photos: [{ _key: 'p3a', asset: asset('image-p3a') }] },
  ],
  images: [legacyImage('ignored')],
}

describe('getGalleryProjects with projects[]', () => {
  it('prefers projects[] over legacy images[] and drops empty projects', () => {
    const projects = getGalleryProjects(projectSection)
    expect(projects.map((project) => project.name)).toStrictEqual(['The Johnson home', 'Hutto'])
    expect(countGalleryPhotos(projects)).toBe(3)
  })

  it('keeps only photos with assets, in order, with captions and dimensions', () => {
    const [johnson] = getGalleryProjects(projectSection)
    expect(johnson.photos.map((photo) => photo.alt)).toStrictEqual(['Front of the Johnson home', 'Back yard'])
    expect(johnson.photos[1].caption).toBe('Back yard tree wrap')
    expect(johnson.cover).toBe(johnson.photos[0])
    expect(johnson.cover.width).toBe(2752)
  })

  it('falls back to a generated alt and the neighborhood as the name', () => {
    const [, hutto] = getGalleryProjects(projectSection)
    expect(hutto.title).toBe('Hutto')
    expect(hutto.photos[0].alt).toBe('Hutto photo 1')
    expect(hutto.photos[0].key).toContain('p3a')
  })

  it('does not repeat the neighborhood in the meta line when it is the title', () => {
    const [johnson, hutto] = getGalleryProjects(projectSection)
    expect(getProjectMetaLine(johnson)).toBe('Round Rock · 2025 · Full Property')
    expect(getProjectMetaLine(hutto)).toBe('')
  })

  it('returns an empty list for a section with nothing to show', () => {
    expect(getGalleryProjects(null)).toStrictEqual([])
    expect(getGalleryProjects({ projects: [], images: [] })).toStrictEqual([])
  })
})

describe(buildLegacyAltText, () => {
  it('reads plainly for every combination of metadata', () => {
    expect(buildLegacyAltText({ neighborhood: 'Hutto', packageName: 'Roofline', year: '', index: 0 })).toBe(
      'Roofline install in Hutto',
    )
    expect(buildLegacyAltText({ neighborhood: 'Hutto', packageName: '', year: '2024', index: 0 })).toBe(
      'Install in Hutto 2024',
    )
    expect(buildLegacyAltText({ neighborhood: '', packageName: 'Roofline', year: '', index: 0 })).toBe(
      'Roofline install',
    )
    expect(
      buildLegacyAltText({ neighborhood: '', packageName: '', year: '', index: 4, sectionTitle: 'Gallery' }),
    ).toBe('Gallery photo 5')
    expect(buildLegacyAltText({ neighborhood: '', packageName: '', year: '', index: 1 })).toBe(
      'Gallery photo 2',
    )
  })
})
