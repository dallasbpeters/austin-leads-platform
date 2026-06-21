export default {
  name: 'site',
  title: 'Site',
  type: 'document',
  options: {
    canvasApp: {
      exclude: true,
    },
  },
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'shortName', title: 'Short name', type: 'string' },
    { name: 'category', title: 'Category', type: 'string', validation: (Rule) => Rule.required() },
    { name: 'categoryLabel', title: 'Category label', type: 'string' },
    {
      name: 'tier',
      title: 'Tier',
      type: 'string',
      options: { list: ['hero', 'landing', 'redirect'] },
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'primaryDomain',
      title: 'Primary domain',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    { name: 'aliases', title: 'Aliases', type: 'array', of: [{ type: 'string' }] },
    { name: 'redirectTarget', title: 'Redirect target', type: 'string' },
    {
      name: 'navigation',
      title: 'Navigation',
      type: 'array',
      description: 'Header navigation items in display order. Leave empty to auto-list top-level pages.',
      of: [
        {
          type: 'object',
          name: 'navItem',
          title: 'Nav item',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'href',
              title: 'Link',
              type: 'string',
              description: 'Internal path (e.g. /services), anchor (e.g. #consultation), or full URL.',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'isExternal',
              title: 'Open in new tab',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
          },
        },
      ],
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'object',
      fields: [
        { name: 'logo', title: 'Logo', type: 'image' },
        { name: 'eyebrow', title: 'Eyebrow', type: 'string' },
      ],
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'title', title: 'Default title', type: 'string' },
        { name: 'description', title: 'Default description', type: 'text' },
        { name: 'canonicalUrl', title: 'Canonical URL', type: 'url' },
        { name: 'ogImage', title: 'Default Open Graph image URL', type: 'url' },
        { name: 'noIndex', title: 'No index entire site', type: 'boolean', initialValue: false },
      ],
    },
    {
      name: 'leadForm',
      title: 'Lead form',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        { name: 'ctaLabel', title: 'CTA label', type: 'string' },
      ],
    },
    {
      name: 'organization',
      title: 'Organization',
      type: 'object',
      fields: [
        { name: 'name', title: 'Name', type: 'string' },
        { name: 'type', title: 'Schema type', type: 'string' },
        { name: 'phone', title: 'Phone', type: 'string' },
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'serviceArea', title: 'Service area', type: 'array', of: [{ type: 'string' }] },
      ],
    },
  ],
}
