import { describe, expect, it } from 'vitest'

import { convertSection } from '@/lib/sanity/convert-section'

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
    expect(dropped.toSorted()).toStrictEqual(['icon (in items)', 'subtitle'])
  })

  it('moves a subtitle into body, and rich text into a plain text field', () => {
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
})
