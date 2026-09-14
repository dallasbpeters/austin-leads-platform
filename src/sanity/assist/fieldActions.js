import {
  defineAssistFieldAction,
  defineAssistFieldActionGroup,
  defineFieldActionDivider,
  isType,
  useUserInput,
} from '@sanity/assist'
import { useMemo } from 'react'
import { useClient } from 'sanity'

import { AUDIENCE, buildVoiceRules, escapeAgentTemplateVars } from '../agent/voice'

const AI_CONTEXT_DOC_ID = 'aiContext'

// Shared with the Generate path so the two cannot drift apart again.
const PLATFORM_COPY_RULES = [AUDIENCE, buildVoiceRules()].join('\n\n')

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
    return escapeAgentTemplateVars(PLATFORM_COPY_RULES)
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

  return escapeAgentTemplateVars(parts.join('\n\n').trim())
}

/*
 * Rewrite prompts are deliberately narrow. Three failure modes they guard against,
 * in the order they actually bite:
 *   - inventing facts the source never claimed
 *   - "improving" a product name, model number or code reference into something wrong
 *   - changing text that was already correct, because the model feels obliged to act
 */
const REWRITE_CONTRACT = `Copy these across untouched, character for character:
- numbers, measurements, dates, dollar amounts, percentages
- product and model names (for example "REC Alpha Pure-R", "Powerwall 2", "IQ8M")
- code and standard references (for example "NEC 690.12", "UL 2218 Class 4", "IRC 2021")
- proper nouns, place names, utility names, people's names
- URLs and link text

Add nothing. You are rewriting wording, not researching. If the source does not state a fact, it does not appear in your output.

If the text already follows the rules above, return it exactly as it is. An unnecessary rewrite is a worse outcome than no rewrite.`

const buildFieldInstruction = (goal) =>
  `
Rewrite one field. The editorial rules below outrank the rewrite goal: if the goal would require breaking them, follow the rules and change less.

Editorial rules:
$brandContext

Rewrite goal:
${goal}

${REWRITE_CONTRACT}

Length: stay within roughly the same length as the source. Short fields such as titles, labels and eyebrows must stay short — do not turn a label into a sentence.

Output: the rewritten field value only, in the source language. No preamble, no quotation marks around it, no explanation of what you changed.

Current field value:
$field
`.trim()

const buildDocumentInstruction = (goal) =>
  `
Rewrite the text in this document. The editorial rules below outrank the rewrite goal: if the goal would require breaking them, follow the rules and change less.

Editorial rules:
$brandContext

Rewrite goal:
${goal}

${REWRITE_CONTRACT}

Structure: rewrite only text-bearing fields. Leave every other part of the document alone — do not add, remove or reorder array items, do not change section types, slugs, references, images, or any field ending in Id.

Roles: each section must keep doing its own job. Do not let the hero, story, highlights and FAQ converge on the same paragraph reworded four times.

Headlines: sentence case, describing what sits below them.
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
