export default [
  {
    name: "launchChecklist",
    title: "Launch Checklist",
    type: "document",
    options: {
      canvasApp: {
        exclude: true,
      },
    },
    fields: [
      {
        name: "title",
        title: "Title",
        type: "string",
        validation: (Rule) => Rule.required(),
      },
      {
        name: "summary",
        title: "Summary",
        type: "text",
      },
      {
        name: "sections",
        title: "Sections",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "title",
                title: "Section title",
                type: "string",
                validation: (Rule) => Rule.required(),
              },
              {
                name: "description",
                title: "Description",
                type: "text",
              },
              {
                name: "tasks",
                title: "Tasks",
                type: "array",
                of: [
                  {
                    type: "object",
                    fields: [
                      {
                        name: "title",
                        title: "Task",
                        type: "string",
                        validation: (Rule) => Rule.required(),
                      },
                      {
                        name: "notes",
                        title: "Notes",
                        type: "text",
                      },
                      {
                        name: "status",
                        title: "Status",
                        type: "string",
                        initialValue: "todo",
                        options: {
                          list: [
                            { title: "Todo", value: "todo" },
                            { title: "In progress", value: "in_progress" },
                            { title: "Blocked", value: "blocked" },
                            { title: "Done", value: "done" },
                          ],
                        },
                      },
                      {
                        name: "owner",
                        title: "Owner",
                        type: "string",
                      },
                      {
                        name: "priority",
                        title: "Priority",
                        type: "string",
                        initialValue: "medium",
                        options: {
                          list: [
                            { title: "High", value: "high" },
                            { title: "Medium", value: "medium" },
                            { title: "Low", value: "low" },
                          ],
                        },
                      },
                    ],
                    preview: {
                      select: {
                        title: "title",
                        subtitle: "status",
                      },
                      prepare({ title, subtitle }) {
                        return {
                          title: title || "Untitled task",
                          subtitle: subtitle ? subtitle.replace(/_/g, " ") : "todo",
                        };
                      },
                    },
                  },
                ],
              },
            ],
            preview: {
              select: {
                title: "title",
              },
            },
          },
        ],
      },
    ],
  },
  {
    name: "faqItem",
    title: "FAQ Item",
    type: "document",
    options: {
      canvasApp: {
        exclude: true,
      },
    },
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
    options: {
      canvasApp: {
        exclude: true,
      },
    },
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
    options: {
      canvasApp: {
        exclude: true,
      },
    },
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
    options: {
      canvasApp: {
        exclude: true,
      },
    },
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
    options: {
      canvasApp: {
        exclude: true,
      },
    },
    fields: [
      { name: "domain", title: "Domain", type: "string", validation: (Rule) => Rule.required() },
      { name: "target", title: "Target", type: "string", validation: (Rule) => Rule.required() },
      { name: "statusCode", title: "Status code", type: "number", initialValue: 308 },
    ],
  },
];
