/** Singleton doc `_id` / `documentId`: `aiContext` — drives @sanity/assist rewrite prompts. */
export default {
  name: 'aiContext',
  title: 'AI context',
  type: 'document',
  options: {
    canvasApp: { exclude: true },
  },
  fields: [
    {
      name: 'title',
      title: 'Document label',
      description: 'Fixed label for this settings document. Not shown on the website.',
      type: 'string',
      initialValue: 'AI Context',
      readOnly: true,
    },
    {
      name: 'instructions',
      title: 'Core instructions',
      type: 'text',
      rows: 8,
      description:
        'High-level guidance the Studio AI (Assist) should follow when rewriting or suggesting copy.',
    },
    {
      name: 'businessPriorities',
      title: 'Business priorities',
      type: 'array',
      of: [{ type: 'string' }],
      options: { sortable: true },
    },
    {
      name: 'guardrails',
      title: 'Guardrails',
      type: 'array',
      of: [{ type: 'string' }],
      options: { sortable: true },
      description: 'Things the AI should avoid or rules it must respect.',
    },
    {
      name: 'targetKeywords',
      title: 'Target keywords',
      type: 'array',
      of: [{ type: 'string' }],
      options: { sortable: true },
    },
    {
      name: 'preferredInternalLinks',
      title: 'Preferred internal links',
      type: 'array',
      of: [{ type: 'string' }],
      options: { sortable: true },
      description: 'Paths or URLs the AI should favor when suggesting internal links.',
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'instructions' },
    prepare({ title, subtitle }) {
      return {
        title: title || 'AI Context',
        subtitle: subtitle ? subtitle.slice(0, 80) : 'No AI guidance added yet',
      }
    },
  },
}
