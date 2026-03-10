const sectionFields = [
  { name: "type", title: "Section type", type: "string" },
  { name: "eyebrow", title: "Eyebrow", type: "string" },
  { name: "title", title: "Title", type: "string" },
  { name: "body", title: "Body", type: "text" },
  { name: "heroTextColor", title: "Hero text color", type: "string" },
  { name: "heroOverlayColor", title: "Hero overlay color", type: "string" },
  { name: "heroOverlayStartColor", title: "Hero overlay start color", type: "string" },
  { name: "heroOverlayEndColor", title: "Hero overlay end color", type: "string" },
  { name: "heroOverlayDirection", title: "Hero overlay direction", type: "string" },
  { name: "heroOverlayStartOpacity", title: "Hero overlay start opacity", type: "number" },
  { name: "heroOverlayEndOpacity", title: "Hero overlay end opacity", type: "number" },
  { name: "heroOverlayOpacity", title: "Hero overlay opacity", type: "number" },
  {
    name: "heroImage",
    title: "Hero image",
    type: "object",
    fields: [
      { name: "source", title: "Source", type: "string" },
      { name: "unsplashId", title: "Unsplash ID", type: "string" },
      { name: "alt", title: "Alt text", type: "string" },
      { name: "description", title: "Description", type: "text" },
      { name: "color", title: "Color", type: "string" },
      { name: "blurHash", title: "BlurHash", type: "string" },
      { name: "width", title: "Width", type: "number" },
      { name: "height", title: "Height", type: "number" },
      { name: "creditName", title: "Photographer name", type: "string" },
      { name: "creditUsername", title: "Photographer username", type: "string" },
      { name: "creditUrl", title: "Photographer URL", type: "url" },
      { name: "unsplashUrl", title: "Unsplash photo URL", type: "url" },
      { name: "downloadLocation", title: "Download location", type: "url" },
      {
        name: "urls",
        title: "Image URLs",
        type: "object",
        fields: [
          { name: "raw", title: "Raw", type: "url" },
          { name: "full", title: "Full", type: "url" },
          { name: "regular", title: "Regular", type: "url" },
          { name: "small", title: "Small", type: "url" },
          { name: "thumb", title: "Thumb", type: "url" },
        ],
      },
    ],
  },
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
    of: [
      {
        type: "object",
        fields: sectionFields,
        preview: {
          select: {
            title: "title",
            subtitle: "type",
          },
          prepare({ title, subtitle }) {
            return {
              title: title || "Untitled section",
              subtitle: subtitle || "section",
            };
          },
        },
      },
    ],
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
