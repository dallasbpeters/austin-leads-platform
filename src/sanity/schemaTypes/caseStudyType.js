import { DocumentTextIcon } from '@sanity/icons'

import { pageSectionTypes } from './page-type'

/**
 * Case study — a finished job written up the same way every time:
 * what we saw from the driveway, what the crew found once they were on the
 * roof, what went on it, and what the electric bill did afterward.
 *
 * Served at /projects/<slug>, scoped to a site the same way `card` and
 * `faqItem` are, so each tenant only ever sees its own jobs.
 */
export default {
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'notes', title: 'Driveway & field notes' },
    { name: 'specs', title: 'Equipment & code' },
    { name: 'numbers', title: 'Timeline & bill' },
    { name: 'photos', title: 'Photos' },
    { name: 'related', title: 'Related' },
    { name: 'sections', title: 'Extra sections' },
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'overview',
      description:
        'Sentence case. Names the place and the work, e.g. "Pflugerville Class 4 re-roof and 9.6 kW solar".',
      validation: (Rule) =>
        Rule.required()
          .max(70)
          .custom((value) => {
            if (typeof value !== 'string') {
              return true
            }
            if (value.includes('—')) {
              return 'No em dashes in headlines. Em dashes are fine in body copy.'
            }
            return true
          }),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      description: 'Page URL: /projects/<slug>',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'site',
      title: 'Site',
      type: 'reference',
      group: 'overview',
      to: [{ type: 'site' }],
      description: 'The tenant this job belongs to. Scopes the projects index and the /projects route.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'overview',
      description: 'Orders the projects index. Newest becomes the featured lead.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'location',
      title: 'Location',
      type: 'object',
      group: 'overview',
      options: { columns: 3 },
      description: 'Real Texas places and real utility names. No invented subdivisions.',
      fields: [
        { name: 'city', title: 'City', type: 'string' },
        { name: 'neighborhood', title: 'Neighborhood', type: 'string' },
        {
          name: 'utility',
          title: 'Utility',
          type: 'string',
          description: 'Delivery or co-op, e.g. "Oncor delivery", "Pedernales Electric Cooperative".',
        },
      ],
    },
    {
      name: 'crew',
      title: 'Crew',
      type: 'array',
      group: 'overview',
      of: [{ type: 'crewCredit' }],
      description: 'Who worked this job. Shows as the byline row under the headline.',
    },
    {
      name: 'dek',
      title: 'Dek',
      type: 'text',
      rows: 3,
      group: 'overview',
      description: 'The paragraph under the headline. Lead with the situation, not the service.',
    },
    {
      name: 'keyStats',
      title: 'Key stats',
      type: 'array',
      group: 'overview',
      description: 'Capped at three so the header never turns into a brochure.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Value', type: 'string' },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Name the measure. Never "Key stat".',
            },
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
    },

    {
      name: 'drivewayNotes',
      title: 'Driveway notes',
      type: 'array',
      group: 'notes',
      description: 'The same roof read twice: once from the street, once from the deck.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'seenFromGround',
              title: 'From the driveway',
              type: 'text',
              rows: 2,
            },
            {
              name: 'foundOnRoof',
              title: 'On the roof',
              type: 'text',
              rows: 2,
            },
          ],
          preview: {
            select: { title: 'seenFromGround', subtitle: 'foundOnRoof' },
          },
        },
      ],
    },
    {
      name: 'fieldNotes',
      title: 'Crew field notes',
      type: 'array',
      group: 'notes',
      description: 'Written while the work was happening. An entry without an outcome is not publishable.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'day',
              title: 'Day',
              type: 'string',
              description: 'e.g. "Day 1", "Day 12".',
            },
            { name: 'time', title: 'Time', type: 'string', description: 'e.g. "6:40 a.m."' },
            { name: 'author', title: 'Author', type: 'crewCredit' },
            { name: 'note', title: 'Note', type: 'text', rows: 3 },
            {
              name: 'outcome',
              title: 'What it changed',
              type: 'text',
              rows: 2,
              description:
                'What the crew did differently because of this. Required — it is what makes the note worth publishing.',
            },
          ],
          preview: {
            select: { day: 'day', time: 'time', note: 'note' },
            prepare: ({ day, time, note }) => ({
              title: [day, time].filter(Boolean).join(' · ') || 'Field note',
              subtitle: note,
            }),
          },
        },
      ],
    },

    {
      name: 'specGroups',
      title: 'Equipment and code',
      type: 'array',
      group: 'specs',
      description: 'Grouped the way the work happened: roof assembly, then array, then electrical.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'group',
              title: 'Group',
              type: 'string',
              description: 'e.g. "Roof assembly", "Solar array", "Electrical and interconnection".',
            },
            {
              name: 'summary',
              title: 'Group summary',
              type: 'string',
              description: 'Short count shown beside the group heading, e.g. "34 squares".',
            },
            {
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'component',
                      title: 'Component',
                      type: 'string',
                    },
                    {
                      name: 'specification',
                      title: 'Specification',
                      type: 'string',
                    },
                    {
                      name: 'codeRef',
                      title: 'Code or standard',
                      type: 'string',
                      description:
                        'e.g. "UL 2218 Class 4", "NEC 690.12". Leave empty when it is manufacturer spec only.',
                    },
                    {
                      name: 'rationale',
                      title: 'Why it is here',
                      type: 'text',
                      rows: 2,
                    },
                  ],
                  preview: {
                    select: { title: 'component', subtitle: 'specification' },
                  },
                },
              ],
            },
          ],
          preview: {
            select: { title: 'group', rows: 'rows' },
            prepare: ({ title, rows }) => ({
              title: title || 'Spec group',
              subtitle: `${rows?.length ?? 0} rows`,
            }),
          },
        },
      ],
    },
    {
      name: 'codeEditions',
      title: 'Code editions in force',
      type: 'object',
      group: 'specs',
      options: { columns: 3, collapsible: true, collapsed: true },
      description: 'Prints as the note under the spec table so the citations are dated.',
      fields: [
        {
          name: 'irc',
          title: 'IRC',
          type: 'string',
          description: 'e.g. "2021, as adopted by Pflugerville".',
        },
        { name: 'ifc', title: 'IFC', type: 'string' },
        { name: 'nec', title: 'NEC', type: 'string', description: 'e.g. "2020, adopted statewide".' },
      ],
    },

    {
      name: 'timeline',
      title: 'Day by day',
      type: 'array',
      group: 'numbers',
      description:
        'Include the waiting days. The meter swap is usually the long pole, and saying so is the point.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'date', title: 'Date', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'title', title: 'What happened', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'detail', title: 'Detail', type: 'text', rows: 2 },
          ],
          preview: { select: { title: 'title', subtitle: 'date' } },
        },
      ],
    },
    {
      name: 'billing',
      title: 'Bill, month by month',
      type: 'array',
      group: 'numbers',
      description: 'Side by side, so the reader decides. Totals are computed at render, never typed.',
      of: [
        {
          type: 'object',
          options: { columns: 5 },
          fields: [
            { name: 'month', title: 'Month', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'kWhUsed', title: 'kWh used', type: 'number', validation: (Rule) => Rule.min(0) },
            { name: 'kWhProduced', title: 'kWh made', type: 'number', validation: (Rule) => Rule.min(0) },
            {
              name: 'costWithout',
              title: 'Without solar ($)',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            },
            { name: 'costPaid', title: 'Paid ($)', type: 'number', validation: (Rule) => Rule.min(0) },
          ],
          preview: {
            select: { month: 'month', paid: 'costPaid', without: 'costWithout' },
            prepare: ({ month, paid, without }) => ({
              title: month || 'Month',
              subtitle: `paid $${paid ?? '—'} vs $${without ?? '—'} without`,
            }),
          },
        },
      ],
    },
    {
      name: 'billingNote',
      title: 'Bill note',
      type: 'text',
      rows: 2,
      group: 'numbers',
      description: 'Where the numbers came from and what rate they assume.',
    },

    {
      name: 'limits',
      title: 'What they asked',
      type: 'array',
      group: 'overview',
      description:
        'Straight answers this homeowner got before signing, especially the ones that cost us money. A question with an obvious yes is not worth publishing.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'claim',
              title: 'What they asked',
              type: 'text',
              rows: 2,
              description: 'In their words. A real question or something another contractor had told them.',
            },
            {
              name: 'reality',
              title: 'What we told them',
              type: 'text',
              rows: 3,
              description:
                'The straight answer, with the number, code or timeline that backs it up. Say the part that did not help us sell.',
            },
          ],
          preview: { select: { title: 'claim', subtitle: 'reality' } },
        },
      ],
    },
    {
      name: 'gallery',
      title: 'Project photos',
      type: 'array',
      group: 'photos',
      description:
        'Shown as a slideshow below the hero. Documentary shots from the job, in the order a reader should see them. Two or more photos turn on the arrows and dots; a single photo renders on its own.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'altText',
              title: 'Alt text',
              type: 'string',
              description: 'What the photo shows, for screen readers and image search.',
              validation: (Rule) => Rule.required().error('Every project photo needs alt text.'),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description:
                'Carry a real date, time or place, e.g. "February 26, 2026, 3:10 p.m. Falcon Pointe".',
            },
          ],
          preview: {
            select: { title: 'caption', subtitle: 'altText', media: 'asset' },
            prepare: ({ title, subtitle, media }) => ({
              title: title || subtitle || 'Project photo',
              subtitle: title ? subtitle : '',
              media,
            }),
          },
        },
      ],
    },
    {
      name: 'relatedProjects',
      title: 'Related projects',
      type: 'array',
      group: 'related',
      of: [{ type: 'reference', to: [{ type: 'caseStudy' }] }],
    },
    {
      name: 'sections',
      title: 'Extra sections',
      type: 'array',
      group: 'sections',
      description:
        'Optional page-builder blocks appended below the write-up — a call to action, gallery, FAQ, anything a normal page can hold. The structured story above always renders first.',
      of: [...pageSectionTypes],
    },
  ],
  preview: {
    select: {
      title: 'title',
      city: 'location.city',
      neighborhood: 'location.neighborhood',
      media: 'gallery.0',
      publishedAt: 'publishedAt',
    },
    prepare: ({ title, city, neighborhood, media, publishedAt }) => ({
      title: title || 'Untitled case study',
      subtitle: [[city, neighborhood].filter(Boolean).join(' · '), publishedAt?.slice(0, 10)]
        .filter(Boolean)
        .join(' — '),
      media,
    }),
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
}
