const canvasExclude = { canvasApp: { exclude: true } }
const canvasPurpose = (purpose) => ({ canvasApp: { purpose } })

const heroImageUrlsType = {
  name: 'heroImageUrls',
  title: 'Hero Image URLs',
  type: 'object',
  options: canvasExclude,
  fields: [
    { name: 'raw', title: 'Raw', type: 'url', options: canvasExclude },
    { name: 'full', title: 'Full', type: 'url', options: canvasExclude },
    { name: 'regular', title: 'Regular', type: 'url', options: canvasExclude },
    { name: 'small', title: 'Small', type: 'url', options: canvasExclude },
    { name: 'thumb', title: 'Thumb', type: 'url', options: canvasExclude },
  ],
}

const heroImageType = {
  name: 'heroImage',
  title: 'Hero Image',
  type: 'object',
  options: canvasExclude,
  fields: [
    { name: 'source', title: 'Source', type: 'string', options: canvasExclude },
    { name: 'unsplashId', title: 'Unsplash ID', type: 'string', options: canvasExclude },
    { name: 'alt', title: 'Alt text', type: 'string', options: canvasExclude },
    { name: 'description', title: 'Description', type: 'text', options: canvasExclude },
    { name: 'color', title: 'Color', type: 'string', options: canvasExclude },
    { name: 'blurHash', title: 'BlurHash', type: 'string', options: canvasExclude },
    { name: 'width', title: 'Width', type: 'number', options: canvasExclude },
    { name: 'height', title: 'Height', type: 'number', options: canvasExclude },
    { name: 'creditName', title: 'Photographer name', type: 'string', options: canvasExclude },
    { name: 'creditUsername', title: 'Photographer username', type: 'string', options: canvasExclude },
    { name: 'creditUrl', title: 'Photographer URL', type: 'url', options: canvasExclude },
    { name: 'unsplashUrl', title: 'Unsplash photo URL', type: 'url', options: canvasExclude },
    { name: 'downloadLocation', title: 'Download location', type: 'url', options: canvasExclude },
    { name: 'urls', title: 'Image URLs', type: 'heroImageUrls', options: canvasExclude },
  ],
  preview: {
    select: {
      title: 'alt',
      subtitle: 'creditName',
      media: 'urls.thumb',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Hero image',
        subtitle: subtitle ? `Photo by ${subtitle}` : 'Image metadata',
      }
    },
  },
}

const uploadedImageType = {
  name: 'uploadedImage',
  title: 'Uploaded Image',
  type: 'image',
  options: {
    hotspot: true,
    ...canvasExclude,
  },
  fields: [
    {
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      options: canvasExclude,
    },
  ],
}

const pageMetricType = {
  name: 'pageMetric',
  title: 'Metric',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      options: canvasPurpose('Metric label.'),
    },
    {
      name: 'value',
      title: 'Value',
      type: 'string',
      options: canvasPurpose('Metric value.'),
    },
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'value',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Metric',
        subtitle: subtitle || 'No value',
      }
    },
  },
}

const pageItemType = {
  name: 'pageItem',
  title: 'Content Item',
  type: 'object',
  fields: [
    {
      name: 'number',
      title: 'Number',
      type: 'string',
      options: canvasPurpose('Optional short index label such as 01, 02, or 03.'),
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Optional short overline or supporting label for the item.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Item title or card heading.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      options: canvasPurpose('Supporting text for the item.'),
    },
    {
      name: 'question',
      title: 'Question',
      type: 'string',
      options: canvasPurpose('Question text for FAQ-style items.'),
    },
    {
      name: 'answer',
      title: 'Answer',
      type: 'text',
      options: canvasPurpose('Answer text for FAQ-style items.'),
    },
    {
      name: 'href',
      title: 'Href',
      type: 'string',
      options: canvasPurpose('Optional link target for this item when it should open another page.'),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'heroImage',
      options: canvasExclude,
    },
    {
      name: 'imageAsset',
      title: 'Uploaded image',
      type: 'uploadedImage',
      options: canvasExclude,
    },
  ],
  preview: {
    select: {
      title: 'title',
      question: 'question',
      subtitle: 'body',
      answer: 'answer',
    },
    prepare({ title, question, subtitle, answer }) {
      return {
        title: title || question || 'Content item',
        subtitle: subtitle || answer || 'Supporting content',
      }
    },
  },
}

const pageSectionType = {
  name: 'pageSection',
  title: 'Page Section',
  type: 'object',
  fields: [
    { name: 'type', title: 'Section type', type: 'string', options: canvasExclude },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      options: canvasPurpose('Short overline or kicker text that introduces the section.'),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      options: canvasPurpose('Primary heading for this section.'),
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      options: canvasPurpose('Main body copy for this section.'),
    },
    { name: 'heroTextColor', title: 'Hero text color', type: 'string', options: canvasExclude },
    { name: 'heroOverlayColor', title: 'Hero overlay color', type: 'string', options: canvasExclude },
    { name: 'heroOverlayStartColor', title: 'Hero overlay start color', type: 'string', options: canvasExclude },
    { name: 'heroOverlayEndColor', title: 'Hero overlay end color', type: 'string', options: canvasExclude },
    { name: 'heroOverlayDirection', title: 'Hero overlay direction', type: 'string', options: canvasExclude },
    { name: 'heroOverlayStartOpacity', title: 'Hero overlay start opacity', type: 'number', options: canvasExclude },
    { name: 'heroOverlayEndOpacity', title: 'Hero overlay end opacity', type: 'number', options: canvasExclude },
    { name: 'heroOverlayOpacity', title: 'Hero overlay opacity', type: 'number', options: canvasExclude },
    { name: 'heroImage', title: 'Hero image', type: 'heroImage', options: canvasExclude },
    { name: 'heroAsset', title: 'Uploaded hero image', type: 'uploadedImage', options: canvasExclude },
    {
      name: 'metrics',
      title: 'Metrics',
      type: 'array',
      options: canvasPurpose('Short proof-point pairs like payback period, tax credit, or savings.'),
      of: [{ type: 'pageMetric' }],
    },
    {
      name: 'items',
      title: 'Items',
      type: 'array',
      options: canvasPurpose('Repeatable content items like cards, FAQs, or supporting bullets for the section.'),
      of: [{ type: 'pageItem' }],
    },
    {
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      options: canvasPurpose('Label for the main call-to-action button or link.'),
    },
    {
      name: 'ctaHref',
      title: 'CTA href',
      type: 'string',
      options: canvasPurpose('Link target or anchor for the call-to-action.'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type',
      eyebrow: 'eyebrow',
    },
    prepare({ title, subtitle, eyebrow }) {
      return {
        title: title || eyebrow || 'Untitled section',
        subtitle: subtitle || 'section',
      }
    },
  },
}

const baseFields = [
  {
    name: 'title',
    title: 'Title',
    type: 'string',
    validation: (Rule) => Rule.required(),
    options: canvasPurpose('Page title or primary title for this document.'),
  },
  {
    name: 'description',
    title: 'Description',
    type: 'text',
    options: canvasPurpose('Short summary or supporting description for the page.'),
  },
  {
    name: 'site',
    title: 'Site',
    type: 'reference',
    to: [{ type: 'site' }],
    validation: (Rule) => Rule.required(),
    options: canvasExclude,
  },
  { name: 'pageType', title: 'Page type', type: 'string', options: canvasExclude },
  {
    name: 'templateLevel',
    title: 'Template level',
    type: 'string',
    options: { list: ['hero', 'landing'], ...canvasExclude },
  },
  {
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    options: {
      source: 'title',
      ...canvasPurpose("URL path segment for this page. For a homepage, use '/'."),
    },
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'sections',
    title: 'Sections',
    type: 'array',
    options: canvasPurpose('Structured page sections. Map headings, body copy, calls to action, proof points, and FAQ items into the relevant section.'),
    of: [{ type: 'pageSection' }],
  },
]

const pageDocuments = [
  {
    name: 'page',
    title: 'Page',
    type: 'document',
    options: {
      canvasApp: {
        purpose: 'General website page for a domain, including homepage and evergreen landing pages.',
      },
    },
    fields: baseFields,
  },
  {
    name: 'servicePage',
    title: 'Service Page',
    type: 'document',
    options: {
      canvasApp: {
        purpose: 'Service-specific page focused on one offering for a domain.',
      },
    },
    fields: baseFields,
  },
  {
    name: 'locationPage',
    title: 'Location Page',
    type: 'document',
    options: {
      canvasApp: {
        purpose: 'Location-targeted page focused on one city, neighborhood, or service area.',
      },
    },
    fields: baseFields,
  },
  {
    name: 'post',
    title: 'Post',
    type: 'document',
    options: {
      canvasApp: {
        purpose: 'Editorial or blog content for a domain, including guides, comparisons, and educational posts.',
      },
    },
    fields: baseFields,
  },
]

export default [heroImageUrlsType, heroImageType, uploadedImageType, pageMetricType, pageItemType, pageSectionType, ...pageDocuments]
