const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

const colorField = (name, title, initialValue) => ({
  name,
  title,
  type: 'string',
  initialValue,
  description: 'Hex color, e.g. #01064A',
  validation: (Rule) => Rule.regex(HEX_COLOR, { name: 'hex color' }).error('Use a hex color like #01064A'),
})

/**
 * Digital business card — a standalone, Sanity-backed vCard page served at
 * /cards/<slug>. Modeled after the original static "kathie" microsite so the
 * org can spin up a card for any team member from the Studio.
 */
export default {
  name: 'card',
  title: 'Digital Business Card',
  type: 'document',
  groups: [
    { name: 'profile', title: 'Profile', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'media', title: 'Images' },
    { name: 'style', title: 'Colors' },
  ],
  fields: [
    {
      name: 'fullName',
      title: 'Full name',
      type: 'string',
      group: 'profile',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'profile',
      description: 'Page URL: /cards/<slug>',
      options: { source: 'fullName', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    { name: 'pronouns', title: 'Pronouns', type: 'string', group: 'profile' },
    { name: 'jobTitle', title: 'Job title', type: 'string', group: 'profile' },
    { name: 'business', title: 'Business', type: 'string', group: 'profile' },
    { name: 'bio', title: 'Bio', type: 'text', rows: 4, group: 'profile' },

    { name: 'phone', title: 'Phone', type: 'string', group: 'contact' },
    { name: 'email', title: 'Email', type: 'string', group: 'contact' },
    { name: 'website', title: 'Website URL', type: 'url', group: 'contact' },
    {
      name: 'address',
      title: 'Address',
      type: 'object',
      group: 'contact',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'street', title: 'Street', type: 'string' },
        { name: 'city', title: 'City', type: 'string' },
        { name: 'state', title: 'State', type: 'string' },
        { name: 'postal', title: 'Postal code', type: 'string' },
        { name: 'country', title: 'Country', type: 'string' },
      ],
    },
    {
      name: 'links',
      title: 'Additional links',
      type: 'array',
      group: 'contact',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required() },
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        },
      ],
    },

    {
      name: 'photo',
      title: 'Profile photo',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    },
    { name: 'logo', title: 'Logo', type: 'image', group: 'media', options: { hotspot: true } },
    {
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    },

    {
      name: 'colors',
      title: 'Colors',
      type: 'object',
      group: 'style',
      options: { columns: 2 },
      fields: [
        colorField('logoBg', 'Header background', '#01064A'),
        colorField('mainBg', 'Page background', '#F9FAFB'),
        colorField('buttonBg', 'Button background', '#000033'),
        colorField('cardBg', 'Card background', '#E5E7EB'),
      ],
    },
  ],
  preview: {
    select: { title: 'fullName', business: 'business', jobTitle: 'jobTitle', media: 'photo' },
    prepare: ({ title, business, jobTitle, media }) => ({
      title: title || 'Untitled card',
      subtitle: [jobTitle, business].filter(Boolean).join(' · '),
      media,
    }),
  },
}
