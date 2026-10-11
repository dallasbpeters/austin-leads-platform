import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import pageTypes from '@/sanity/schemaTypes/page-type'

const byName = (name) => pageTypes.find((type) => type.name === name)
const fieldOf = (type, name) => type.fields.find((field) => field.name === name)

/** Minimal stand-in for Sanity's chainable validation Rule that records what was asked of it. */
const makeRule = () => {
  const calls = []
  const rule = new Proxy(
    {},
    {
      get: (_target, method) => {
        if (method === 'calls') {
          return calls
        }
        return (...args) => {
          calls.push([method, ...args])
          return rule
        }
      },
    },
  )
  return rule
}

const validationCalls = (field) => {
  const rule = makeRule()
  field.validation(rule)
  return rule.calls.map(([method]) => method)
}

const projectsCustomValidator = () => {
  let custom = null
  fieldOf(byName('gallerySection'), 'projects').validation({
    custom: (fn) => {
      custom = fn
    },
  })
  return custom
}

describe('gallery schema types', () => {
  it('registers the project and photo types next to the legacy image type', () => {
    expect(byName('galleryProject')?.type).toBe('object')
    expect(byName('galleryPhoto')?.type).toBe('image')
    expect(byName('galleryImage')?.type).toBe('image')
  })

  it('gives each project a required title, metadata, and an ordered photos array', () => {
    const project = byName('galleryProject')
    expect(project.fields.map((field) => field.name)).toStrictEqual([
      'title',
      'neighborhood',
      'year',
      'package',
      'photos',
    ])
    expect(validationCalls(fieldOf(project, 'title'))).toContain('required')
    const photos = fieldOf(project, 'photos')
    expect(photos.of).toStrictEqual([{ type: 'galleryPhoto' }])
    expect(validationCalls(photos)).toStrictEqual(['required', 'min', 'error'])
  })

  it('requires alt text on every photo and allows an optional caption', () => {
    const photo = byName('galleryPhoto')
    expect(photo.options.hotspot).toBeTruthy()
    expect(validationCalls(fieldOf(photo, 'altText'))).toContain('required')
    expect(fieldOf(photo, 'caption').validation).toBeUndefined()
  })
})

describe('gallery Studio previews', () => {
  it('shows the project title, metadata, photo count, and cover in the array row', () => {
    const project = byName('galleryProject')
    expect(project.preview.select.media).toBe('photos.0')
    expect(
      project.preview.prepare({
        title: 'The Johnson home',
        neighborhood: 'Round Rock',
        year: 2025,
        package: 'Full Property',
        photos: [{}, {}, {}],
        media: 'cover',
      }),
    ).toStrictEqual({
      title: 'The Johnson home',
      subtitle: 'Round Rock · 2025 · Full Property · 3 photos',
      media: 'cover',
    })
    expect(project.preview.prepare({ neighborhood: 'Hutto', photos: [{}] })).toMatchObject({
      title: 'Hutto',
      subtitle: 'Hutto · 1 photo',
    })
  })

  it('keeps the section type visible and counts projects and photos, legacy images included', () => {
    const section = byName('gallerySection')
    expect(
      section.preview.prepare({
        title: 'Work from around Austin',
        eyebrow: 'Recent installs',
        projects: [{ photos: [{}, {}] }, { photos: [{}] }],
        images: [{}],
      }),
    ).toStrictEqual({
      title: 'Work from around Austin',
      subtitle: 'Gallery section · Recent installs · 3 projects · 4 photos',
    })
  })
})

describe('gallery section fields', () => {
  it('accepts a section with projects or legacy images, but not an empty one', () => {
    expect(fieldOf(byName('gallerySection'), 'projects').of).toStrictEqual([{ type: 'galleryProject' }])
    const custom = projectsCustomValidator()
    expect(custom([{ _key: 'p' }], { parent: {} })).toBeTruthy()
    expect(custom(undefined, { parent: { images: [{ _key: 'i' }] } })).toBeTruthy()
    expect(custom([], { parent: { images: [] } })).toBe('Add at least one project.')
  })

  it('keeps legacy images optional and hides the list once it is empty', () => {
    const images = fieldOf(byName('gallerySection'), 'images')
    expect(images.of).toStrictEqual([{ type: 'galleryImage' }])
    expect(images.validation).toBeUndefined()
    expect(images.hidden({ parent: { images: [] } })).toBeTruthy()
    expect(images.hidden({ parent: { images: [{}] } })).toBeFalsy()
  })

  it('makes legacy images read-only once projects exist', () => {
    const images = fieldOf(byName('gallerySection'), 'images')
    expect(images.readOnly({ parent: { projects: [{}] } })).toBeTruthy()
    expect(images.readOnly({ parent: { projects: [] } })).toBeFalsy()
  })
})

describe('gallery GROQ projection', () => {
  const source = readFileSync(new URL('../lib/platform/content.js', import.meta.url), 'utf8')

  const block = (name) => {
    const start = source.indexOf(`  ${name}[]{`)
    const end = source.indexOf('\n  },\n', start)
    return start === -1 ? '' : source.slice(start, end)
  }

  it('projects every project field the renderer reads', () => {
    const projects = block('projects')
    for (const field of ['_key', '_type', 'title', 'neighborhood', 'year', 'package', 'photos[]{']) {
      expect(projects).toContain(field)
    }
  })

  it('projects every nested photo field the renderer reads', () => {
    const projects = block('projects')
    const photos = projects.slice(projects.indexOf('photos[]{'))
    for (const field of ['_key', 'crop', 'hotspot', 'altText', 'caption', 'asset->{', 'url', 'dimensions{']) {
      expect(photos).toContain(field)
    }
  })

  it('still projects the legacy images[] fields', () => {
    const images = block('images')
    for (const field of [
      '_key',
      'crop',
      'hotspot',
      'altText',
      'alt',
      'neighborhood',
      'year',
      'package',
      'asset->{',
    ]) {
      expect(images).toContain(field)
    }
  })
})
