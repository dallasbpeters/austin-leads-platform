import { describe, expect, it } from 'vitest'

import { convertSection, filledFields } from '@/lib/sanity/convert-section'

/* Minimal stand-ins for Sanity's compiled schema types. */
const string = { name: 'string', jsonType: 'string' }
const text = { name: 'text', jsonType: 'string' }
const block = { name: 'block', jsonType: 'object' }
const portableText = { name: 'portableTextSimple', jsonType: 'array', of: [block] }
const image = { name: 'image', jsonType: 'object', fields: [{ name: 'alt', type: string }] }
const color = { name: 'color', jsonType: 'object', fields: [{ name: 'hex', type: string }] }
const field = (name, type) => ({ name, type })
const objectType = (name, fields) => ({ name, jsonType: 'object', fields })
const arrayOf = (...of) => ({ name: 'array', jsonType: 'array', of })

const faqItem = objectType('pageFaqItem', [field('question', string), field('answer', portableText)])

const faq = objectType('faqSection', [
  field('type', string),
  field('title', string),
  field('items', arrayOf(faqItem)),
  field('sectionBackgroundColor', color),
])
const storyGrid = objectType('storyGridSection', [
  field('type', string),
  field('title', string),
  field('body', portableText),
  field('statement', text),
  field('storyPhotos', arrayOf(image)),
])

const blocks = (words) => [
  {
    _type: 'block',
    _key: 'b1',
    markDefs: [],
    children: [{ _type: 'span', _key: 's1', text: words, marks: [] }],
  },
]

const section = {
  _key: 'sec1',
  _type: 'highlightsSection',
  type: 'highlights',
  title: 'What we repair',
  subtitle: blocks('Most problems are small.'),
  sectionBackgroundColor: { _type: 'color', hex: '#082f43' },
  items: [
    {
      _key: 'i1',
      _type: 'sectionContentItem',
      title: 'Inverters',
      body: blocks('Error codes.'),
      icon: 'Flash',
    },
    {
      _key: 'i2',
      _type: 'sectionContentItem',
      title: 'Wiring',
      body: blocks('Loose connectors.'),
      icon: 'Plug',
    },
  ],
}

describe(convertSection, () => {
  it('keeps the key, sets the new type and carries matching fields across', () => {
    const { value } = convertSection(section, faq)
    expect(value).toMatchObject({
      _key: 'sec1',
      _type: 'faqSection',
      type: 'faq',
      title: 'What we repair',
      sectionBackgroundColor: { hex: '#082f43' },
    })
  })

  it('converts list items by meaning: title becomes question, body becomes answer', () => {
    const { value, dropped } = convertSection(section, faq)
    expect(value.items).toStrictEqual([
      { _key: 'i1', _type: 'pageFaqItem', question: 'Inverters', answer: blocks('Error codes.') },
      { _key: 'i2', _type: 'pageFaqItem', question: 'Wiring', answer: blocks('Loose connectors.') },
    ])
    expect(dropped).toStrictEqual(
      expect.arrayContaining([
        { field: 'icon', where: 'items' },
        { field: 'subtitle', where: '' },
      ]),
    )
    expect(dropped).toHaveLength(2)
  })

  it('moves a subtitle into body, and leaves a plain text field empty when nothing is left for it', () => {
    const { value } = convertSection({ ...section, items: [] }, storyGrid)
    expect(value.body).toStrictEqual(section.subtitle)
    expect(value.statement).toBeUndefined()
  })

  it('uses the type initial values, with converted content on top', () => {
    const { value } = convertSection(section, storyGrid, {
      type: 'storyGrid',
      layout: 'introLeft',
      title: 'x',
    })
    expect(value).toMatchObject({ type: 'storyGrid', layout: 'introLeft', title: 'What we repair' })
  })

  it('turns items with an image into plain images, using the title as alt text', () => {
    const withImages = {
      ...section,
      items: [
        {
          _key: 'p1',
          _type: 'pageItem',
          title: 'Connectors',
          imageAsset: { _type: 'image', asset: { _ref: 'image-abc-10x10-jpg', _type: 'reference' } },
        },
      ],
    }
    const { value } = convertSection(withImages, storyGrid)
    expect(value.storyPhotos).toStrictEqual([
      {
        _type: 'image',
        _key: 'p1',
        asset: { _ref: 'image-abc-10x10-jpg', _type: 'reference' },
        alt: 'Connectors',
      },
    ])
  })

  it('turns plain text into rich text', () => {
    const quote = objectType('quoteSection', [field('title', string), field('body', portableText)])
    const { value } = convertSection(
      { _key: 'q', _type: 'storyGridSection', statement: 'One.\n\nTwo.' },
      quote,
    )
    expect(value.body.map((paragraph) => paragraph.children[0].text)).toStrictEqual(['One.', 'Two.'])
  })

  it('flattens rich text into a string field', () => {
    const plain = objectType('plainSection', [field('title', string)])
    const { value } = convertSection({ _key: 'p', _type: 'x', title: blocks('Hello') }, plain)
    expect(value.title).toBe('Hello')
  })

  it('reports list items that cannot be placed', () => {
    const { value, dropped } = convertSection(
      { _key: 'k', _type: 'x', title: 'T', items: ['Plain bullet', { _key: 'a', _type: 'y', title: 'Q' }] },
      faq,
    )
    expect(value.items).toHaveLength(1)
    expect(dropped).toContainEqual({ field: 'items', lost: 1, of: 2 })
  })

  it('only carries a choice the target field allows', () => {
    const choices = (...values) => ({ name: 'string', jsonType: 'string', options: { list: values } })
    const target = objectType('gridSection', [field('layout', choices({ value: 'grid' }, 'featured'))])
    expect(convertSection({ _key: 'a', layout: 'introLeft' }, target).dropped).toContainEqual({
      field: 'layout',
      where: '',
    })
    expect(convertSection({ _key: 'b', layout: 'grid' }, target).value.layout).toBe('grid')
  })

  it('fills same-named fields before fields of the same meaning', () => {
    const calculator = objectType('calculatorSection', [
      field('subtitle', portableText),
      field('body', portableText),
    ])
    const { value } = convertSection(
      { _key: 'h', body: blocks('Body copy'), cardCopy: blocks('Card copy') },
      calculator,
    )
    expect(value.body).toStrictEqual(blocks('Body copy'))
    expect(value.subtitle).toStrictEqual(blocks('Card copy'))
  })

  it('keeps alt text under the name the target image uses', () => {
    const imageWithAltText = {
      name: 'image',
      jsonType: 'object',
      fields: [{ name: 'altText', type: string }],
    }
    const target = objectType('panelSection', [field('image', imageWithAltText)])
    const photo = { _type: 'image', asset: { _ref: 'image-abc-10x10-jpg' }, alt: 'Roof', caption: 'Spring' }
    const { value, dropped } = convertSection({ _key: 'i', imageAsset: photo }, target)
    expect(value.image).toStrictEqual({
      _type: 'image',
      asset: { _ref: 'image-abc-10x10-jpg' },
      altText: 'Roof',
    })
    expect(dropped).toContainEqual({ field: 'caption', where: 'image' })
  })

  it('does not put a color into an unrelated object field', () => {
    const hero = { name: 'heroImage', jsonType: 'object', fields: [{ name: 'url', type: string }] }
    const target = objectType('heroSection', [field('sectionBackgroundColor', hero)])
    const { value, dropped } = convertSection(
      { _key: 'c', sectionBackgroundColor: { _type: 'color', hex: '#082f43' } },
      target,
    )
    expect(value.sectionBackgroundColor).toBeUndefined()
    expect(dropped).toContainEqual({ field: 'sectionBackgroundColor', where: '' })
  })

  it('keeps string items in a list of strings', () => {
    const notes = objectType('notesSection', [field('items', arrayOf(string))])
    expect(convertSection({ _key: 'n', items: ['a', 'b'] }, notes).value.items).toStrictEqual(['a', 'b'])
  })
})

describe(filledFields, () => {
  it('lists fields with content, skipping system keys, the type and empty values', () => {
    expect(
      filledFields({
        _key: 'k',
        _type: 't',
        type: 'x',
        title: 'T',
        body: '',
        items: [],
        color: { _type: 'c' },
        eyebrow: 'E',
      }),
    ).toStrictEqual(['title', 'eyebrow'])
  })
})

describe('convertSection reports', () => {
  it('only reports lost items from the list attempt that is kept', () => {
    const card = objectType('card', [field('title', string)])
    const target = objectType('listSection', [
      field('items', arrayOf(string)),
      field('reasons', arrayOf(card)),
    ])
    const { value, dropped } = convertSection(
      {
        _key: 'r',
        items: [
          { _key: 'a', _type: 'x', title: 'One' },
          { _key: 'b', _type: 'x', title: 'Two' },
        ],
      },
      target,
    )
    expect(value.reasons).toHaveLength(2)
    expect(dropped).toStrictEqual([])
  })

  it('reports alt text when the new image has nowhere to keep it', () => {
    const bare = { name: 'image', jsonType: 'object', fields: [] }
    const target = objectType('logoSection', [field('logo', bare)])
    const { dropped } = convertSection(
      { _key: 'l', imageAsset: { _type: 'image', asset: { _ref: 'image-a-1x1-png' }, alt: 'Logo' } },
      target,
    )
    expect(dropped).toContainEqual({ field: 'alt', where: 'logo' })
  })
})
