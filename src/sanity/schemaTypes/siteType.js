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
      name: 'googleBusiness',
      title: 'Google Business Profile',
      type: 'object',
      description:
        'Identifies which Google profile the review sync pulls from for this tenant. Without both ids the sync skips this site rather than filing its reviews under the wrong one.',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'accountId',
          title: 'Account id',
          type: 'string',
          description: 'The digits from "accounts/123456789". Same for every location you own.',
        },
        {
          name: 'locationId',
          title: 'Location id',
          type: 'string',
          description: 'The digits from "locations/987654321". Different per storefront.',
        },
      ],
    },
    {
      name: 'projectsIndex',
      title: 'Projects page header',
      type: 'object',
      description:
        'The heading block at the top of /projects, above the case study cards. Edit the copy here — it is not set in code.',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: 'eyebrow',
          title: 'Eyebrow',
          type: 'string',
          description: 'Small overline above the heading.',
          initialValue: 'Our work',
        },
        {
          name: 'title',
          title: 'Heading',
          type: 'string',
          initialValue: 'Every job, written up the same way.',
        },
        {
          name: 'intro',
          title: 'Intro paragraph',
          type: 'text',
          rows: 3,
          initialValue:
            'What we saw from the driveway, what the crew found once they were on the roof, what went on it, and what the electric bill did afterward.',
        },
        {
          name: 'emptyMessage',
          title: 'Message when no case studies are published',
          type: 'text',
          rows: 2,
          description: 'Shown in place of the cards while this site has no published case studies.',
          initialValue:
            'Write-ups from recent roofing and solar jobs are on the way. In the meantime, reach out and we will walk you through comparable work in your area.',
        },
      ],
    },
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
            {
              name: 'variant',
              title: 'Display style',
              type: 'string',
              initialValue: 'link',
              options: {
                layout: 'radio',
                list: [
                  { title: 'Link', value: 'link' },
                  { title: 'Button', value: 'button' },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: { title: 'label', href: 'href', variant: 'variant' },
            prepare({ title, href, variant }) {
              return {
                title,
                subtitle: [variant === 'button' ? 'Button' : 'Link', href].filter(Boolean).join(' - '),
              }
            },
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
