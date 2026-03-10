export default [
  {
    name: "faqItem",
    title: "FAQ Item",
    type: "document",
    fields: [
      { name: "question", title: "Question", type: "string", validation: (Rule) => Rule.required() },
      { name: "answer", title: "Answer", type: "text", validation: (Rule) => Rule.required() },
      { name: "site", title: "Site", type: "reference", to: [{ type: "site" }] },
    ],
  },
  {
    name: "review",
    title: "Review",
    type: "document",
    fields: [
      { name: "author", title: "Author", type: "string" },
      { name: "rating", title: "Rating", type: "number" },
      { name: "body", title: "Body", type: "text" },
      { name: "site", title: "Site", type: "reference", to: [{ type: "site" }] },
    ],
  },
  {
    name: "leadForm",
    title: "Lead Form",
    type: "document",
    fields: [
      { name: "title", title: "Title", type: "string" },
      { name: "description", title: "Description", type: "text" },
      { name: "ctaLabel", title: "CTA Label", type: "string" },
    ],
  },
  {
    name: "seoSettings",
    title: "SEO Settings",
    type: "document",
    fields: [
      { name: "title", title: "Title", type: "string" },
      { name: "description", title: "Description", type: "text" },
      { name: "canonicalUrl", title: "Canonical URL", type: "url" },
    ],
  },
  {
    name: "redirectRule",
    title: "Redirect Rule",
    type: "document",
    fields: [
      { name: "domain", title: "Domain", type: "string", validation: (Rule) => Rule.required() },
      { name: "target", title: "Target", type: "string", validation: (Rule) => Rule.required() },
      { name: "statusCode", title: "Status code", type: "number", initialValue: 308 },
    ],
  },
];
