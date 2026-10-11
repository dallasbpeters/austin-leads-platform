// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GallerySection } from '@/components/platform/sections/gallery-section'

// next/image needs the Next runtime config for remote hosts; a plain <img> is enough here.
vi.mock(import('next/image'), () => ({
  default: ({ src, alt, width, height, className }) =>
    createElement('img', {
      src: typeof src === 'string' ? src : '',
      alt,
      width,
      height,
      className,
    }),
}))

const asset = (id, width = 2752, height = 1536) => ({
  _id: id,
  _ref: id,
  url: `https://cdn.sanity.io/images/x/y/${id}.jpg`,
  metadata: { dimensions: { width, height } },
})

const section = {
  title: 'Work from around Austin',
  eyebrow: 'Recent installs',
  projects: [
    {
      _key: 'johnson',
      title: 'The Johnson home',
      neighborhood: 'Round Rock',
      year: 2025,
      package: 'Full Property',
      photos: [
        { _key: 'j1', asset: asset('image-j1'), altText: 'Front of the Johnson home' },
        { _key: 'j2', asset: asset('image-j2', 1536, 2752), altText: 'Side yard', caption: 'Side yard wrap' },
        { _key: 'j3', asset: asset('image-j3'), altText: 'Back patio' },
      ],
    },
    {
      _key: 'hutto',
      title: 'Hutto roofline',
      photos: [{ _key: 'h1', asset: asset('image-h1'), altText: 'Roofline in Hutto' }],
    },
  ],
}

const JOHNSON = 'Open The Johnson home, 3 photos'
const HUTTO = 'Open Hutto roofline'

const renderGallery = (value = section) => render(createElement(GallerySection, { section: value }))

const tiles = () => screen.getAllByRole('button', { name: /^Open / })

const openProject = (name) => {
  const tile = screen.getByRole('button', { name })
  tile.focus()
  fireEvent.click(tile)
  return { tile, dialog: screen.getByRole('dialog') }
}

const activeImage = (dialog) => within(dialog).getByRole('img')
const activeAlt = (dialog) => activeImage(dialog).getAttribute('alt')

describe(GallerySection, () => {
  afterEach(() => {
    cleanup()
  })

  describe('grid', () => {
    it('renders one tile per project with an accessible name that includes the photo count', () => {
      renderGallery()
      expect(tiles().map((tile) => tile.getAttribute('aria-label'))).toStrictEqual([JOHNSON, HUTTO])
    })

    it('uses the first photo of each project as the cover', () => {
      renderGallery()
      const cover = within(tiles()[0]).getByRole('img')
      expect(cover.getAttribute('alt')).toBe('Front of the Johnson home')
      expect(cover.getAttribute('src')).toContain('image-j1')
    })

    it('shows a photo count only on multi-photo projects', () => {
      renderGallery()
      const [johnson, hutto] = tiles()
      expect(johnson.querySelector('.gallery__count').textContent).toBe('3')
      expect(hutto.querySelector('.gallery__count')).toBeNull()
    })

    it('prints the project title and metadata caption and keeps the lightbox closed', () => {
      renderGallery()
      const [johnson] = tiles()
      expect(within(johnson).getByText('The Johnson home')).toBeTruthy()
      expect(within(johnson).getByText('Round Rock · 2025 · Full Property')).toBeTruthy()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('still renders legacy flat images as one-photo projects', () => {
      renderGallery({
        title: 'Legacy',
        images: [
          { _key: 'a', asset: asset('image-a'), neighborhood: 'West Lake', package: 'Roofline' },
          { _key: 'b', asset: asset('image-b') },
        ],
      })
      const [westLake, unnamed] = tiles()
      expect(tiles()).toHaveLength(2)
      expect(westLake.getAttribute('aria-label')).toBe('Open West Lake')
      expect(within(westLake).getByText('Roofline')).toBeTruthy()
      expect(within(unnamed).getByRole('img').getAttribute('alt')).toBe('Legacy photo 2')
      expect(document.querySelector('.gallery__count')).toBeNull()
    })

    it('renders nothing when there are no projects or images', () => {
      const { container } = renderGallery({ title: 'Empty', projects: [], images: [] })
      expect(container.innerHTML).toBe('')
    })
  })

  describe('lightbox', () => {
    it('opens the clicked project on its first photo, at that photo’s own size', () => {
      renderGallery()
      const { dialog } = openProject(JOHNSON)
      expect(
        within(dialog).getByText('The Johnson home', { selector: '.gallery-lightbox__title' }),
      ).toBeTruthy()
      expect(within(dialog).getByText('Photo 1 of 3')).toBeTruthy()
      expect(activeAlt(dialog)).toBe('Front of the Johnson home')
      expect(activeImage(dialog).getAttribute('width')).toBe('2752')
      expect(activeImage(dialog).getAttribute('height')).toBe('1536')
    })

    it('steps forward with the next button and shows that photo’s caption and size', () => {
      renderGallery()
      const { dialog } = openProject(JOHNSON)
      fireEvent.click(within(dialog).getByRole('button', { name: 'Next photo' }))
      expect(within(dialog).getByText('Photo 2 of 3')).toBeTruthy()
      expect(activeAlt(dialog)).toBe('Side yard')
      expect(activeImage(dialog).getAttribute('width')).toBe('1536')
      expect(activeImage(dialog).getAttribute('height')).toBe('2752')
      expect(within(dialog).getByText('Side yard wrap')).toBeTruthy()
    })

    it('wraps around with the arrow keys and the previous button, inside this project only', () => {
      renderGallery()
      const { dialog } = openProject(JOHNSON)
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      expect(activeAlt(dialog)).toBe('Back patio')
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      expect(activeAlt(dialog)).toBe('Front of the Johnson home')
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
      expect(activeAlt(dialog)).toBe('Back patio')
      fireEvent.click(within(dialog).getByRole('button', { name: 'Previous photo' }))
      expect(activeAlt(dialog)).toBe('Side yard')
      expect(within(dialog).queryByAltText('Roofline in Hutto')).toBeNull()
    })

    it('hides the previous/next controls for a single-photo project', () => {
      renderGallery()
      const { dialog } = openProject(HUTTO)
      expect(activeAlt(dialog)).toBe('Roofline in Hutto')
      expect(within(dialog).queryByRole('button', { name: 'Next photo' })).toBeNull()
      expect(within(dialog).queryByRole('button', { name: 'Previous photo' })).toBeNull()
      expect(within(dialog).getByText('Photo 1 of 1')).toBeTruthy()
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      expect(activeAlt(dialog)).toBe('Roofline in Hutto')
    })

    it('closes with the close button and with Escape, and returns focus to the tile', async () => {
      renderGallery()
      const { tile, dialog } = openProject(HUTTO)
      expect(dialog.contains(document.activeElement)).toBeTruthy()

      fireEvent.click(within(dialog).getByRole('button', { name: 'Close gallery' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      // Radix hands focus back on the next tick.
      await waitFor(() => expect(document.activeElement).toBe(tile))

      const reopened = openProject(HUTTO)
      fireEvent.keyDown(reopened.dialog, { key: 'Escape' })
      await waitFor(() => expect(document.activeElement).toBe(reopened.tile))
    })

    it('swipes between photos on touch and ignores short taps and mouse drags', () => {
      renderGallery()
      const { dialog } = openProject(JOHNSON)

      fireEvent.pointerDown(dialog, { pointerType: 'touch', clientX: 300 })
      fireEvent.pointerUp(dialog, { pointerType: 'touch', clientX: 120 })
      expect(activeAlt(dialog)).toBe('Side yard')

      fireEvent.pointerDown(dialog, { pointerType: 'touch', clientX: 100 })
      fireEvent.pointerUp(dialog, { pointerType: 'touch', clientX: 110 })
      expect(activeAlt(dialog)).toBe('Side yard')

      fireEvent.pointerDown(dialog, { pointerType: 'touch', clientX: 100 })
      fireEvent.pointerUp(dialog, { pointerType: 'touch', clientX: 260 })
      expect(activeAlt(dialog)).toBe('Front of the Johnson home')

      fireEvent.pointerDown(dialog, { pointerType: 'mouse', clientX: 300 })
      fireEvent.pointerUp(dialog, { pointerType: 'mouse', clientX: 100 })
      expect(activeAlt(dialog)).toBe('Front of the Johnson home')
    })
  })
})
