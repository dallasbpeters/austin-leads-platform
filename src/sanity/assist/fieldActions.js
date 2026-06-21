import {
  defineAssistFieldAction,
  defineAssistFieldActionGroup,
  defineFieldActionDivider,
  isType,
  useUserInput,
} from '@sanity/assist'
import { useMemo } from 'react'
import { useClient } from 'sanity'

const AI_CONTEXT_DOC_ID = 'aiContext'

const PLATFORM_COPY_RULES = `
Platform rules (always apply):
- Do not mention a federal solar tax credit, ITC, or similar federal incentive; it is not available (expired Dec 31, 2025).
- Do not invent utility rebates, specific incentive dollar amounts, or payback periods unless they already appear in the source.
- Prefer clear, trustworthy language for Texas homeowners; avoid hype and unverifiable claims.
`.trim()

const loadAssistContext = async (client) => {
  const row = await client.fetch(
    `*[_id == $id][0]{
      instructions,
      businessPriorities,
      guardrails,
      targetKeywords,
      preferredInternalLinks
    }`,
    { id: AI_CONTEXT_DOC_ID },
  )

  if (!row) {
    return [PLATFORM_COPY_RULES].filter(Boolean).join('\n\n')
  }

  const parts = [
    PLATFORM_COPY_RULES,
    row.instructions ? `Core direction:\n${row.instructions}` : '',
    Array.isArray(row.businessPriorities) && row.businessPriorities.length
      ? `Business priorities:\n- ${row.businessPriorities.filter(Boolean).join('\n- ')}`
      : '',
    Array.isArray(row.guardrails) && row.guardrails.length
      ? `Guardrails:\n- ${row.guardrails.filter(Boolean).join('\n- ')}`
      : '',
    Array.isArray(row.targetKeywords) && row.targetKeywords.length
      ? `Important phrases to use naturally when relevant:\n- ${row.targetKeywords.filter(Boolean).join('\n- ')}`
      : '',
    Array.isArray(row.preferredInternalLinks) && row.preferredInternalLinks.length
      ? `Preferred internal links when suggesting routes:\n- ${row.preferredInternalLinks.filter(Boolean).join('\n- ')}`
      : '',
  ].filter(Boolean)

  return parts.join('\n\n').trim()
}

const buildFieldInstruction = (goal) =>
  `
Rewrite the targeted field using the editorial context below as the highest-priority guide.

Editorial context:
$brandContext

Rewrite goal:
${goal}

Rules:
- Preserve factual meaning and any claims already supported by the source field.
- Keep proper nouns, product names, and links intact unless a change clearly improves clarity.
- Return only the rewritten field in the same language as the source.

Current field value:
$field
`.trim()

const buildDocumentInstruction = (goal) =>
  `
Rewrite the targeted document using the editorial context below as the highest-priority guide.

Editorial context:
$brandContext

Rewrite goal:
${goal}

Rules:
- Preserve the factual meaning of the source content.
- If the target includes multiple fields, rewrite only the text-bearing parts and leave structural data intact.
- Do not invent metrics, service areas, or promises not already supported by the document.
`.trim()

const isPortableTextField = (schemaType) => {
  if (!isType(schemaType, 'array')) {
    return false
  }
  const members = 'of' in schemaType ? schemaType.of : undefined
  return Array.isArray(members) && members.some((member) => isType(member, 'block'))
}

const isRewriteableField = (schemaType) => {
  if (
    isType(schemaType, 'boolean') ||
    isType(schemaType, 'number') ||
    isType(schemaType, 'date') ||
    isType(schemaType, 'datetime') ||
    isType(schemaType, 'url') ||
    isType(schemaType, 'email') ||
    isType(schemaType, 'slug') ||
    isType(schemaType, 'reference') ||
    isType(schemaType, 'crossDatasetReference') ||
    isType(schemaType, 'image') ||
    isType(schemaType, 'file') ||
    isType(schemaType, 'geopoint')
  ) {
    return false
  }

  return (
    isType(schemaType, 'string') ||
    isType(schemaType, 'text') ||
    isPortableTextField(schemaType) ||
    isType(schemaType, 'object') ||
    isType(schemaType, 'array')
  )
}

const createFieldAction = (title, goal, props, client) =>
  defineAssistFieldAction({
    title,
    onAction: async () => {
      const brandContext = await loadAssistContext(client)
      await client.agent.action.transform({
        schemaId: props.schemaId,
        documentId: props.documentIdForAction,
        targetDocument: {
          operation: 'createIfNotExists',
          _id: props.documentIdForAction,
          _type: props.documentSchemaType.name,
          initialValues: props.getDocumentValue(),
        },
        instruction: buildFieldInstruction(goal),
        instructionParams: {
          brandContext,
          field: { type: 'field', path: props.path },
        },
        target: props.path.length ? { path: props.path } : undefined,
        conditionalPaths: {
          paths: props.getConditionalPaths(),
        },
      })
    },
  })

const createDocumentAction = (title, goal, props, client) =>
  defineAssistFieldAction({
    title,
    onAction: async () => {
      const brandContext = await loadAssistContext(client)
      await client.agent.action.transform({
        schemaId: props.schemaId,
        documentId: props.documentIdForAction,
        targetDocument: {
          operation: 'createIfNotExists',
          _id: props.documentIdForAction,
          _type: props.documentSchemaType.name,
          initialValues: props.getDocumentValue(),
        },
        instruction: buildDocumentInstruction(goal),
        instructionParams: {
          brandContext,
        },
        conditionalPaths: {
          paths: props.getConditionalPaths(),
        },
      })
    },
  })

const austinAssistFieldActions = {
  title: 'Editorial (site voice)',
  useFieldActions: (props) => {
    const {
      actionType,
      documentIdForAction,
      documentSchemaType,
      getConditionalPaths,
      getDocumentValue,
      path,
      schemaId,
      schemaType,
    } = props
    const client = useClient({ apiVersion: 'vX' })
    const getUserInput = useUserInput()
    const pathKey = JSON.stringify(path)

    return useMemo(() => {
      if (actionType === 'field' && !isRewriteableField(schemaType)) {
        return []
      }

      const actionProps = {
        actionType,
        documentIdForAction,
        documentSchemaType,
        getConditionalPaths,
        getDocumentValue,
        path,
        schemaId,
        schemaType,
      }

      if (actionType === 'document') {
        return [
          defineAssistFieldActionGroup({
            title: 'Editorial (site voice)',
            children: [
              createDocumentAction(
                'Rewrite document for clarity',
                'Rewrite the document for clarity and a confident, homeowner-friendly tone while preserving every fact that is already stated.',
                actionProps,
                client,
              ),
              createDocumentAction(
                'Warm up tone',
                'Make the document warmer and more conversational without sounding salesy.',
                actionProps,
                client,
              ),
              createDocumentAction(
                'Tighten and shorten',
                'Tighten wording: remove fluff, shorten sentences, keep practical trust-building details.',
                actionProps,
                client,
              ),
              defineFieldActionDivider(),
              defineAssistFieldAction({
                title: 'Custom document rewrite…',
                onAction: async () => {
                  const input = await getUserInput({
                    title: 'Custom rewrite goal',
                    inputs: [
                      {
                        id: 'goal',
                        title: 'Rewrite goal',
                        description: 'Describe what should change across the document.',
                      },
                    ],
                  })
                  const goal = input?.[0]?.result?.trim()
                  if (!goal) {
                    return
                  }
                  const brandContext = await loadAssistContext(client)
                  await client.agent.action.transform({
                    schemaId,
                    documentId: documentIdForAction,
                    targetDocument: {
                      operation: 'createIfNotExists',
                      _id: documentIdForAction,
                      _type: documentSchemaType.name,
                      initialValues: getDocumentValue(),
                    },
                    instruction: buildDocumentInstruction(goal),
                    instructionParams: {
                      brandContext,
                    },
                    conditionalPaths: {
                      paths: getConditionalPaths(),
                    },
                  })
                },
              }),
            ],
          }),
        ]
      }

      return [
        defineAssistFieldActionGroup({
          title: 'Editorial (site voice)',
          children: [
            createFieldAction(
              'Rewrite for clarity',
              'Rewrite this field for clarity and a confident, homeowner-friendly tone while preserving the original meaning.',
              actionProps,
              client,
            ),
            createFieldAction(
              'Warm up tone',
              'Make this field warmer and more conversational without sounding salesy.',
              actionProps,
              client,
            ),
            createFieldAction(
              'Tighten wording',
              'Tighten this field: remove fluff, sharpen sentences, keep trust-building specifics that are already present.',
              actionProps,
              client,
            ),
            defineFieldActionDivider(),
            defineAssistFieldAction({
              title: 'Custom rewrite…',
              onAction: async () => {
                const input = await getUserInput({
                  title: 'Custom rewrite goal',
                  inputs: [
                    {
                      id: 'goal',
                      title: 'Rewrite goal',
                      description: 'Describe what should change for this field.',
                    },
                  ],
                })
                const goal = input?.[0]?.result?.trim()
                if (!goal) {
                  return
                }
                const brandContext = await loadAssistContext(client)
                await client.agent.action.transform({
                  schemaId,
                  documentId: documentIdForAction,
                  targetDocument: {
                    operation: 'createIfNotExists',
                    _id: documentIdForAction,
                    _type: documentSchemaType.name,
                    initialValues: getDocumentValue(),
                  },
                  instruction: buildFieldInstruction(goal),
                  instructionParams: {
                    brandContext,
                    field: { type: 'field', path },
                  },
                  target: path.length ? { path } : undefined,
                  conditionalPaths: {
                    paths: getConditionalPaths(),
                  },
                })
              },
            }),
          ],
        }),
      ]
    }, [
      actionType,
      client,
      documentIdForAction,
      documentSchemaType,
      getConditionalPaths,
      getDocumentValue,
      getUserInput,
      path,
      pathKey,
      schemaId,
      schemaType,
    ])
  },
}

export { austinAssistFieldActions }
