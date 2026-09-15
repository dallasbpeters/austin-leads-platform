/**
 * A video project: the script, the figures and the review state for one film.
 *
 * The video itself is a HyperFrames composition on disk (videos/<slug>/). This
 * document is what the team edits — the narration, the on-screen figures, and
 * the call to action. `scripts/sync-video-project.mjs` reads it, regenerates the
 * voiceover from the narration lines, and writes the numbers into the frames, so
 * changing a figure here changes the film rather than drifting away from it.
 *
 * Figures are REFERENCES to the chart documents that already hold them
 * (`energyChartSection`), never retyped, so a price change lands in one place.
 */
export default {
  name: 'videoProject',
  title: 'Video project',
  type: 'document',
  groups: [
    { name: 'script', title: 'Script', default: true },
    { name: 'data', title: 'Figures' },
    { name: 'review', title: 'Review & delivery' },
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'script',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Project folder',
      type: 'slug',
      group: 'script',
      options: { source: 'title', maxLength: 64 },
      description:
        'Must match the folder under videos/ — e.g. "detach-and-reset" for videos/detach-and-reset.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'message',
      title: 'The one thing it must communicate',
      type: 'text',
      rows: 2,
      group: 'script',
      description: 'If a beat cannot be traced back to this sentence, cut the beat.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'beats',
      title: 'Beats',
      type: 'array',
      group: 'script',
      description:
        'One per frame, in order. Editing a narration line here re-records that line and only that line.',
      of: [
        {
          type: 'object',
          name: 'videoBeat',
          title: 'Beat',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Shorthand for the team, e.g. "The money beat".',
            },
            {
              name: 'narration',
              title: 'Narration',
              type: 'text',
              rows: 3,
              description:
                'Spoken verbatim. Write numbers as words ("five thousand four hundred") — the voice reads them better.',
              validation: (Rule) => Rule.required(),
            },
            /* The words the frame actually shows. `sync-video-project.mjs` writes
               these into the composition, so editing them here changes the film
               — unlike `onScreen`, which is a note for the team. */
            {
              name: 'eyebrow',
              title: 'Eyebrow (on screen)',
              type: 'string',
              description: 'Small mono label above the headline.',
            },
            {
              name: 'headline',
              title: 'Headline (on screen)',
              type: 'text',
              rows: 2,
              description: 'The large serif line. Use | to force a line break.',
            },
            {
              name: 'support',
              title: 'Support line (on screen)',
              type: 'text',
              rows: 2,
              description: 'The smaller line under the headline, where the frame has one.',
            },
            {
              name: 'cardLabel',
              title: 'Card label (on screen)',
              type: 'string',
              description: 'Only used by frames with a callout card, e.g. the rule in the close.',
            },
            {
              name: 'cardText',
              title: 'Card text (on screen)',
              type: 'string',
            },
            {
              name: 'fine',
              title: 'Fine print (on screen)',
              type: 'text',
              rows: 2,
              description: 'What the figure varies by. Required wherever a number is shown.',
            },
            {
              name: 'onScreen',
              title: 'Note: what is on screen',
              type: 'text',
              rows: 2,
              description: 'A description for the team. Not rendered.',
            },
            {
              name: 'why',
              title: 'Why this beat exists',
              type: 'string',
              description: 'Its job in the story, traced to the message. No answer means no beat.',
            },
          ],
          preview: {
            select: { title: 'label', subtitle: 'narration' },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    },
    {
      name: 'voice',
      title: 'Voice',
      type: 'object',
      group: 'script',
      options: { columns: 3 },
      fields: [
        { name: 'provider', title: 'Provider', type: 'string', initialValue: 'elevenlabs', readOnly: true },
        { name: 'voiceId', title: 'Voice ID', type: 'string', description: 'ElevenLabs voice id.' },
        { name: 'voiceName', title: 'Voice name', type: 'string' },
        {
          name: 'speed',
          title: 'Speed',
          type: 'number',
          initialValue: 1,
          validation: (Rule) => Rule.min(0.7).max(1.2),
        },
      ],
    },
    {
      name: 'figureSources',
      title: 'Figures used on screen',
      type: 'array',
      group: 'data',
      description:
        'Every number the film shows must come from one of these. Nothing on screen is invented; if one of these changes, the film has to change.',
      of: [{ type: 'reference', to: [{ type: 'page' }] }],
    },
    {
      name: 'figureNotes',
      title: 'Figure notes',
      type: 'text',
      rows: 4,
      group: 'data',
      description: 'Which figure appears in which frame, and what each one varies by.',
    },
    {
      name: 'cta',
      title: 'Call to action',
      type: 'object',
      group: 'script',
      fields: [
        { name: 'lead', title: 'The ask', type: 'text', rows: 2 },
        { name: 'phone', title: 'Phone', type: 'string' },
        { name: 'site', title: 'Site', type: 'string' },
        {
          name: 'reassurance',
          title: 'Reassurance',
          type: 'string',
          initialValue: 'Free estimate · no commitment',
        },
      ],
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'review',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'In review', value: 'review' },
          { title: 'Changes requested', value: 'changes' },
          { title: 'Approved', value: 'approved' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'reviewUrl',
      title: 'Review link',
      type: 'url',
      group: 'review',
      description:
        'The HyperFrames published URL. Plays the live composition in a browser and updates in place on every re-publish, so this link never goes stale.',
    },
    {
      name: 'notes',
      title: 'Review notes',
      type: 'array',
      group: 'review',
      description: 'Feedback from the team. Each note says who, what and whether it was addressed.',
      of: [
        {
          type: 'object',
          name: 'reviewNote',
          fields: [
            { name: 'who', title: 'Who', type: 'string' },
            { name: 'note', title: 'Note', type: 'text', rows: 2, validation: (Rule) => Rule.required() },
            { name: 'timecode', title: 'Timecode', type: 'string', description: 'e.g. 28.4s' },
            { name: 'resolved', title: 'Addressed', type: 'boolean', initialValue: false },
          ],
          preview: {
            select: { title: 'note', subtitle: 'who', resolved: 'resolved' },
            prepare: ({ title, subtitle, resolved }) => ({
              title: `${resolved ? '✓ ' : ''}${title || 'Note'}`,
              subtitle,
            }),
          },
        },
      ],
    },
    {
      name: 'renderUrl',
      title: 'Rendered MP4',
      type: 'url',
      group: 'review',
      description: 'Where the approved render lives, if one has been made.',
    },
    {
      name: 'youtube',
      title: 'YouTube',
      type: 'object',
      group: 'review',
      fields: [
        {
          name: 'videoId',
          title: 'Video ID',
          type: 'string',
          readOnly: true,
          description: 'Written by scripts/youtube-upload.mjs.',
        },
        { name: 'url', title: 'URL', type: 'url', readOnly: true },
        {
          name: 'privacy',
          title: 'Privacy',
          type: 'string',
          initialValue: 'unlisted',
          options: {
            list: [
              { title: 'Private', value: 'private' },
              { title: 'Unlisted', value: 'unlisted' },
              { title: 'Public', value: 'public' },
            ],
            layout: 'radio',
          },
        },
        { name: 'description', title: 'Description', type: 'text', rows: 4 },
        { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } },
      ],
    },
  ],
  preview: {
    select: { title: 'title', status: 'status', slug: 'slug.current' },
    prepare: ({ title, status, slug }) => ({
      title: title || 'Untitled video',
      subtitle: `${status || 'draft'} · videos/${slug || '—'}`,
    }),
  },
}
