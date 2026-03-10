const sectionFields = [
  { name: "type", title: "Section type", type: "string" },
  { name: "eyebrow", title: "Eyebrow", type: "string" },
  { name: "title", title: "Title", type: "string" },
  { name: "body", title: "Body", type: "text" },
  {
    name: "metrics",
    title: "Metrics",
    type: "array",
    of: [
      {
        type: "object",
        fields: [
          { name: "label", title: "Label", type: "string" },
          { name: "value", title: "Value", type: "string" },
        ],
      },
    ],
  },
  {
    name: "items",
    title: "Items",
    type: "array",
    of: [
      {
        type: "object",
        fields: [
          { name: "title", title: "Title", type: "string" },
          { name: "body", title: "Body", type: "text" },
          { name: "question", title: "Question", type: "string" },
          { name: "answer", title: "Answer", type: "text" },
        ],
      },
    ],
  },
  { name: "ctaLabel", title: "CTA label", type: "string" },
  { name: "ctaHref", title: "CTA href", type: "string" },
];

const baseFields = [
  { name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() },
  { name: "description", title: "Description", type: "text" },
  {
    name: "site",
    title: "Site",
    type: "reference",
    to: [{ type: "site" }],
    validation: (Rule) => Rule.required(),
  },
  { name: "pageType", title: "Page type", type: "string" },
  {
    name: "templateLevel",
    title: "Template level",
    type: "string",
    options: { list: ["hero", "landing"] },
  },
  {
    name: "slug",
    title: "Slug",
    type: "slug",
    options: { source: "title" },
    validation: (Rule) => Rule.required(),
  },
  {
    name: "sections",
    title: "Sections",
    type: "array",
    of: [{ type: "object", fields: sectionFields }],
  },
];

export default [
  {
    name: "page",
    title: "Page",
    type: "document",
    fields: baseFields,
  },
  {
    name: "servicePage",
    title: "Service Page",
    type: "document",
    fields: baseFields,
  },
  {
    name: "locationPage",
    title: "Location Page",
    type: "document",
    fields: baseFields,
  },
  {
    name: "post",
    title: "Post",
    type: "document",
    fields: baseFields,
  },
];
