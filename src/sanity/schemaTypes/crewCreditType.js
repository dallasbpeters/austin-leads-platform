/**
 * A crew credit, stored inline on the case study rather than as its own document.
 *
 * Used twice: once for the article byline (`caseStudy.crew`) and once per field note
 * (`fieldNotes[].author`), so the shape is defined here and referenced by name in
 * both places. Field names match what `case-study-article.jsx` reads —
 * `name`, `initials`, `role` — so the renderer is unchanged.
 */
export default {
  name: 'crewCredit',
  title: 'Crew credit',
  type: 'object',
  options: { columns: 3 },
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description:
        'First name and last initial, the way the crew is credited on a write-up, e.g. "Marcus R."',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'initials',
      title: 'Initials',
      type: 'string',
      description: 'Two letters for the field-note chip, e.g. "MR". Derived from the name when left empty.',
      validation: (Rule) => Rule.max(3),
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Crew lead', value: 'crew-lead' },
          { title: 'Roofing', value: 'roofing' },
          { title: 'Solar lead', value: 'solar-lead' },
          { title: 'Electrical', value: 'electrical' },
          { title: 'Inspector', value: 'inspector' },
        ],
      },
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role' },
    prepare: ({ title, subtitle }) => ({
      title: title || 'Unnamed crew member',
      subtitle: subtitle ? subtitle.replaceAll('-', ' ') : '',
    }),
  },
}
