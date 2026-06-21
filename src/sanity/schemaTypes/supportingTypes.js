import aiContextType from './aiContextType'

export default [
  aiContextType,
  {
    name: 'launchChecklist',
    title: 'Launch Checklist',
    type: 'document',
    options: {
      canvasApp: {
        exclude: true,
      },
    },
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: (Rule) => Rule.required(),
      },
      {
        name: 'summary',
        title: 'Summary',
        type: 'text',
      },
      {
        name: 'sections',
        title: 'Sections',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              {
                name: 'title',
                title: 'Section title',
                type: 'string',
                validation: (Rule) => Rule.required(),
              },
              {
                name: 'description',
                title: 'Description',
                type: 'text',
              },
              {
                name: 'tasks',
                title: 'Tasks',
                type: 'array',
                of: [
                  {
                    type: 'object',
                    fields: [
                      {
                        name: 'title',
                        title: 'Task',
                        type: 'string',
                        validation: (Rule) => Rule.required(),
                      },
                      {
                        name: 'notes',
                        title: 'Notes',
                        type: 'text',
                      },
                      {
                        name: 'status',
                        title: 'Status',
                        type: 'string',
                        initialValue: 'todo',
                        options: {
                          list: [
                            { title: 'Todo', value: 'todo' },
                            { title: 'In progress', value: 'in_progress' },
                            { title: 'Blocked', value: 'blocked' },
                            { title: 'Done', value: 'done' },
                          ],
                        },
                      },
                      {
                        name: 'owner',
                        title: 'Owner',
                        type: 'string',
                      },
                      {
                        name: 'priority',
                        title: 'Priority',
                        type: 'string',
                        initialValue: 'medium',
                        options: {
                          list: [
                            { title: 'High', value: 'high' },
                            { title: 'Medium', value: 'medium' },
                            { title: 'Low', value: 'low' },
                          ],
                        },
                      },
                    ],
                    preview: {
                      select: {
                        title: 'title',
                        subtitle: 'status',
                      },
                      prepare({ title, subtitle }) {
                        return {
                          title: title || 'Untitled task',
                          subtitle: subtitle ? subtitle.replace(/_/g, ' ') : 'todo',
                        }
                      },
                    },
                  },
                ],
              },
            ],
            preview: {
              select: {
                title: 'title',
              },
            },
          },
        ],
      },
    ],
  },
  {
    name: 'faqItem',
    title: 'FAQ Item',
    type: 'document',
    options: {
      canvasApp: {
        exclude: true,
      },
    },
    fields: [
      {
        name: 'question',
        title: 'Question',
        type: 'string',
        validation: (Rule) => Rule.required(),
      },
      { name: 'answer', title: 'Answer', type: 'text', validation: (Rule) => Rule.required() },
      { name: 'site', title: 'Site', type: 'reference', to: [{ type: 'site' }] },
    ],
  },
  {
    name: 'review',
    title: 'Review',
    type: 'document',
    options: {
      canvasApp: {
        exclude: true,
      },
    },
    fields: [
      {
        name: 'author',
        title: 'Reviewer name',
        type: 'string',
        validation: (Rule) => Rule.required(),
      },
      {
        name: 'stars',
        title: 'Stars',
        type: 'number',
        initialValue: 5,
        validation: (Rule) =>
          Rule.required()
            .min(1)
            .max(5)
            .custom((value) => {
              if (typeof value !== 'number') return true
              const isHalfStep = Math.abs(value * 2 - Math.round(value * 2)) < 0.001
              return isHalfStep || 'Use whole or half stars (for example 4, 4.5, 5).'
            }),
      },
      {
        name: 'rating',
        title: 'Rating (legacy)',
        type: 'number',
        hidden: true,
      },
      {
        name: 'reviewerLocation',
        title: 'Reviewer location',
        type: 'string',
      },
      {
        name: 'reviewerPhoto',
        title: 'Reviewer photo',
        type: 'image',
        options: {
          hotspot: {
            previews: [
              { title: 'Square', aspectRatio: 1 },
              { title: 'Portrait', aspectRatio: 3 / 4 },
              { title: 'Wide', aspectRatio: 16 / 9 },
            ],
          },
        },
        fields: [
          {
            name: 'alt',
            title: 'Alt text',
            type: 'string',
          },
        ],
      },
      { name: 'body', title: 'Review body', type: 'text', validation: (Rule) => Rule.required() },
      { name: 'site', title: 'Site', type: 'reference', to: [{ type: 'site' }] },
    ],
    preview: {
      select: {
        title: 'author',
        subtitle: 'reviewerLocation',
        stars: 'stars',
        legacyRating: 'rating',
        media: 'reviewerPhoto',
      },
      prepare({ title, subtitle, stars, legacyRating, media }) {
        const resolvedStars = stars ?? legacyRating ?? null
        return {
          title: title || 'Unnamed reviewer',
          subtitle: [resolvedStars ? `${resolvedStars} stars` : null, subtitle].filter(Boolean).join(' • '),
          media,
        }
      },
    },
  },
  {
    name: 'leadForm',
    title: 'Lead Form',
    type: 'document',
    options: {
      canvasApp: {
        exclude: true,
      },
    },
    fields: [
      { name: 'title', title: 'Title', type: 'string' },
      { name: 'description', title: 'Description', type: 'text' },
      { name: 'ctaLabel', title: 'CTA Label', type: 'string' },
    ],
  },
  {
    name: 'seoSettings',
    title: 'SEO Settings',
    type: 'document',
    options: {
      canvasApp: {
        exclude: true,
      },
    },
    fields: [
      { name: 'title', title: 'Title', type: 'string' },
      { name: 'description', title: 'Description', type: 'text' },
      { name: 'canonicalUrl', title: 'Canonical URL', type: 'url' },
    ],
  },
  {
    name: 'redirectRule',
    title: 'Redirect Rule',
    type: 'document',
    options: {
      canvasApp: {
        exclude: true,
      },
    },
    fields: [
      {
        name: 'source',
        title: 'Source host',
        type: 'string',
        validation: (Rule) => Rule.required(),
      },
      {
        name: 'destination',
        title: 'Destination URL',
        type: 'string',
        validation: (Rule) => Rule.required(),
      },
      { name: 'permanent', title: 'Permanent redirect', type: 'boolean', initialValue: true },
      // Legacy fields kept for backward compatibility with existing drafts.
      { name: 'domain', title: 'Domain (legacy)', type: 'string', hidden: true },
      { name: 'target', title: 'Target (legacy)', type: 'string', hidden: true },
      { name: 'statusCode', title: 'Status code (legacy)', type: 'number', hidden: true },
    ],
  },
]
