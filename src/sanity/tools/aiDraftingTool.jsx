import React from 'react'
import { useClient } from 'sanity'
import { ImageGeneratorContent } from 'sanity-plugin-gemini-ai-images'

import {
  buildDraftSkeleton,
  normalizeDraftSlugForContentType,
  slugifyDraftValue,
  trimDraftLines,
} from '../agent/draftHelpers'
import {
  buildSanityAgentPublishingInstruction,
  SANITY_AGENT_PUBLISHING_SETUP_NOTES,
} from '../agent/publishingInstructions'
import { geminiImageApiEndpoint, geminiPluginApiKey, studioUrl } from '../env'
import { syncGuideHeroToGuideGridItems } from '../lib/syncGuideListingImages'

const SANITY_AGENT_SCHEMA_ID =
  process.env.SANITY_STUDIO_AGENT_SCHEMA_ID || process.env.SANITY_AGENT_SCHEMA_ID || ''
const CONTENT_TYPE_OPTIONS = [
  { value: 'page', label: 'Page' },
  { value: 'servicePage', label: 'Service page' },
  { value: 'locationPage', label: 'Location page' },
  { value: 'post', label: 'Guide / post' },
]

function ToolIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.1rem',
        height: '1.1rem',
        fontSize: '0.95rem',
        lineHeight: 1,
      }}
    >
      ✦
    </span>
  )
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem' }}>
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</span>
      {children}
      {hint ? <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>{hint}</span> : null}
    </label>
  )
}

function buildSuggestedSlug(contentType, title) {
  return normalizeDraftSlugForContentType(contentType, slugifyDraftValue(title))
}

export function AiDraftingTool() {
  const client = useClient({ apiVersion: 'vX' })
  const [sites, setSites] = React.useState([])
  const [assets, setAssets] = React.useState([])
  const [loadingAssets, setLoadingAssets] = React.useState(true)
  const [assetSearch, setAssetSearch] = React.useState('')
  const [loadingSites, setLoadingSites] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [generatedAssetUrl, setGeneratedAssetUrl] = React.useState('')
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [form, setForm] = React.useState({
    siteId: '',
    contentType: 'page',
    title: '',
    slug: '',
    heroImageUrl: '',
    heroImageAlt: '',
    brief: '',
    sources: '',
  })
  React.useEffect(() => {
    let active = true

    async function loadSites() {
      try {
        const nextSites = await client.fetch(
          '*[_type == "site"] | order(name asc){_id, name, primaryDomain, "slug": slug.current}',
        )

        if (!active) {
          return
        }

        setSites(nextSites)
        setForm((current) => ({
          ...current,
          siteId: current.siteId || nextSites[0]?._id || '',
        }))
      } catch (nextError) {
        if (!active) {
          return
        }

        setError(nextError instanceof Error ? nextError.message : 'Failed to load sites.')
      } finally {
        if (active) {
          setLoadingSites(false)
        }
      }
    }

    loadSites()

    return () => {
      active = false
    }
  }, [client])

  React.useEffect(() => {
    let active = true

    async function loadAssets() {
      try {
        const nextAssets = await client.fetch(
          '*[_type == "sanity.imageAsset"] | order(_updatedAt desc)[0...80]{_id, url, originalFilename, extension, metadata}',
        )

        if (!active) {
          return
        }

        setAssets(Array.isArray(nextAssets) ? nextAssets : [])
      } catch {
        if (!active) {
          return
        }
        setAssets([])
      } finally {
        if (active) {
          setLoadingAssets(false)
        }
      }
    }

    loadAssets()

    return () => {
      active = false
    }
  }, [client])

  const selectedSite = sites.find((site) => site._id === form.siteId)

  const assetQuery = assetSearch.trim().toLowerCase()
  const filteredAssets = assets.filter((asset) => {
    if (!assetQuery) {
      return true
    }

    return String(asset?.originalFilename || '')
      .toLowerCase()
      .includes(assetQuery)
  })

  React.useEffect(() => {
    if (slugTouched && form.slug) {
      return
    }

    const nextSlug = buildSuggestedSlug(form.contentType, form.title)

    setForm((current) => {
      if (current.slug === nextSlug) {
        return current
      }

      return {
        ...current,
        slug: nextSlug,
      }
    })
  }, [form.contentType, form.title, form.slug, slugTouched])

  function regenerateSlug() {
    setSlugTouched(false)
    setForm((current) => ({
      ...current,
      slug: buildSuggestedSlug(current.contentType, current.title),
    }))
  }

  async function runSanityAgentAction(draftId, schemaType) {
    if (!SANITY_AGENT_SCHEMA_ID || !client?.agent?.action?.generate) {
      return null
    }
    try {
      await client.agent.action.generate({
        schemaId: SANITY_AGENT_SCHEMA_ID,
        documentId: draftId,
        instruction: buildSanityAgentPublishingInstruction({
          contentType: schemaType,
          title: form.title,
          siteName: selectedSite?.name || '',
        }),
        instructionParams: {
          title: { type: 'constant', value: form.title },
          siteName: { type: 'constant', value: selectedSite?.name || '' },
          brief: { type: 'constant', value: form.brief },
          sources: { type: 'constant', value: trimDraftLines(form.sources).join('\n') },
          neighboringTitles: {
            type: 'groq',
            query: '*[_type == $schemaType && site._ref == $siteId][0...12].title',
            params: { schemaType, siteId: form.siteId },
          },
        },
      })
      return 'sanity-agent'
    } catch {
      return null
    }
  }

  function buildAgentWarning(mode) {
    if (mode === 'sanity-agent') {
      return null
    }
    if (!SANITY_AGENT_SCHEMA_ID) {
      return 'SANITY_AGENT_SCHEMA_ID is missing, so the tool created a structured starter draft instead of running Sanity Agent.'
    }
    return 'Sanity Agent actions are not available in this Studio session.'
  }

  async function syncGuideHeroIfNeeded(draftId, normalizedSlug) {
    if (normalizedSlug.startsWith('guides/')) {
      const guideDraft = await client.fetch(
        '*[_id == $documentId][0]{title,description,"slug":slug.current,sections[]{type,heroImage,heroAsset}}',
        { documentId: draftId },
      )
      await syncGuideHeroToGuideGridItems(client, {
        ...guideDraft,
        site: { _ref: form.siteId },
      })
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setResult(null)

    try {
      const requestedSlug = normalizeDraftSlugForContentType(form.contentType, form.slug || form.title)
      const input = { ...form, slug: requestedSlug, siteName: selectedSite?.name || '' }
      const { baseDocumentId, draftId, normalizedSlug, schemaType, skeleton } = buildDraftSkeleton(input)

      await client.createOrReplace(skeleton)

      const agentResult = await runSanityAgentAction(draftId, schemaType)
      const mode = agentResult || 'fallback'
      const warning = agentResult ? null : buildAgentWarning(mode)

      await syncGuideHeroIfNeeded(draftId, normalizedSlug)

      setResult({
        ok: true,
        documentId: baseDocumentId,
        draftId,
        schemaType,
        slug: normalizedSlug,
        mode,
        warning,
      })
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Draft creation failed.')
    } finally {
      setSubmitting(false)
    }
  }

  function openDraft() {
    if (!result?.documentId || !result?.schemaType) {
      return
    }

    window.location.assign(
      `${studioUrl}/intent/edit/id=${encodeURIComponent(result.documentId)};type=${encodeURIComponent(result.schemaType)}`,
    )
  }

  function handleImageGenerated(asset) {
    if (!asset?.url) {
      return
    }

    setGeneratedAssetUrl(asset.url)
    setForm((current) => ({
      ...current,
      heroImageUrl: asset.url,
      heroImageAlt: current.heroImageAlt || current.title || 'AI generated hero image',
    }))
  }

  function handleSelectAsset(asset) {
    const assetUrl = String(asset?.url || '').trim()
    if (!assetUrl) {
      return
    }

    const filename = String(asset?.originalFilename || '')
      .replace(/\.[a-z0-9]+$/i, '')
      .replaceAll(/[-_]+/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim()

    setGeneratedAssetUrl(assetUrl)
    setForm((current) => ({
      ...current,
      heroImageUrl: assetUrl,
      heroImageAlt: current.heroImageAlt || filename || current.title || 'Hero image',
    }))
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        display: 'grid',
        gap: '1.25rem',
        maxWidth: '960px',
        marginInline: 'auto',
      }}
    >
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#6b7280',
          }}
        >
          Draft assistant
        </div>
        <h1 style={{ fontSize: '2rem', lineHeight: 1.1, margin: 0 }}>Create structured drafts in Sanity</h1>
        <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.7 }}>
          Use this tool to create a draft page or guide directly in Sanity. It creates the required draft
          document first, then asks Sanity Agent to turn that draft into a structured first pass that editors
          can finish in Studio.
        </p>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          background: '#f9fafb',
          borderRadius: '0.9rem',
          padding: '1rem 1.1rem',
          display: 'grid',
          gap: '0.45rem',
        }}
      >
        <div style={{ fontWeight: 600 }}>Publishing workflow notes</div>
        {SANITY_AGENT_PUBLISHING_SETUP_NOTES.map((note) => (
          <div key={note} style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {note}
          </div>
        ))}
        <div style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.6 }}>
          The full Gemini image suite is embedded below. Use "Use This Image" to push an image into the Hero
          image URL field before creating the draft.
        </div>
      </div>

      {!SANITY_AGENT_SCHEMA_ID ? (
        <div
          style={{
            border: '1px solid #f59e0b',
            background: '#fff7ed',
            color: '#9a3412',
            borderRadius: '0.75rem',
            padding: '0.9rem 1rem',
            lineHeight: 1.6,
          }}
        >
          `SANITY_STUDIO_AGENT_SCHEMA_ID` is not configured for the Studio build. The tool can still create
          starter drafts, but Sanity Agent generation will not run until the deployed schema id is available
          in the Studio env.
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            border: '1px solid #fca5a5',
            background: '#fef2f2',
            color: '#991b1b',
            borderRadius: '0.75rem',
            padding: '0.9rem 1rem',
          }}
        >
          {error}
        </div>
      ) : null}

      {result ? (
        <div
          style={{
            border: '1px solid #86efac',
            background: '#f0fdf4',
            color: '#166534',
            borderRadius: '0.75rem',
            padding: '1rem',
            display: 'grid',
            gap: '0.6rem',
          }}
        >
          <div style={{ fontWeight: 600 }}>Draft created</div>
          <div>
            {result.schemaType} · {result.slug} · {result.mode}
          </div>
          {result.warning ? <div>{result.warning}</div> : null}
          <div>
            <button
              type="button"
              onClick={openDraft}
              style={{
                border: 'none',
                background: '#111827',
                color: 'white',
                padding: '0.7rem 1rem',
                borderRadius: '0.6rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Open draft in Desk
            </button>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '1rem',
          padding: '1.25rem',
          border: '1px solid #e5e7eb',
          borderRadius: '1rem',
          background: 'white',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <Field label="Site">
            <select
              value={form.siteId}
              disabled={loadingSites}
              onChange={(event) => setForm((current) => ({ ...current, siteId: event.target.value }))}
              style={{
                padding: '0.7rem 0.8rem',
                borderRadius: '0.6rem',
                border: '1px solid #d1d5db',
              }}
            >
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Content type">
            <select
              value={form.contentType}
              onChange={(event) => setForm((current) => ({ ...current, contentType: event.target.value }))}
              style={{
                padding: '0.7rem 0.8rem',
                borderRadius: '0.6rem',
                border: '1px solid #d1d5db',
              }}
            >
              {CONTENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Title">
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Texas storm damage roof insurance claims"
            style={{
              padding: '0.75rem 0.8rem',
              borderRadius: '0.6rem',
              border: '1px solid #d1d5db',
            }}
          />
        </Field>

        <Field
          label="Slug"
          hint="It auto-generates from the title. Posts get a guides/ prefix and service pages get services/ automatically."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '0.65rem' }}>
            <input
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true)
                setForm((current) => ({ ...current, slug: event.target.value }))
              }}
              placeholder="guides/texas-storm-damage-roof-insurance-claims"
              style={{
                padding: '0.75rem 0.8rem',
                borderRadius: '0.6rem',
                border: '1px solid #d1d5db',
              }}
            />
            <button
              type="button"
              onClick={regenerateSlug}
              disabled={!form.title}
              style={{
                border: '1px solid #d1d5db',
                background: '#f9fafb',
                color: '#111827',
                padding: '0.75rem 0.9rem',
                borderRadius: '0.6rem',
                cursor: form.title ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                opacity: form.title ? 1 : 0.6,
              }}
            >
              Generate
            </button>
          </div>
        </Field>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr',
          }}
        >
          <Field
            label="AI image suite"
            hint="Use the full Gemini image studio here. 'Use This Image' auto-fills Hero image URL below. If generate fails with 401, set SANITY_STUDIO_GEMINI_PLUGIN_API_KEY (Studio deploy) to match server GEMINI_PLUGIN_API_KEY."
          >
            <div
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '0.75rem',
                padding: '0.6rem',
                background: '#fff',
              }}
            >
              <ImageGeneratorContent
                apiEndpoint={geminiImageApiEndpoint}
                apiKey={geminiPluginApiKey}
                onImageGenerated={handleImageGenerated}
              />
            </div>
            <div
              style={{
                marginTop: '0.35rem',
                fontSize: '0.78rem',
                color: '#9ca3af',
                wordBreak: 'break-all',
              }}
            >
              Endpoint: {geminiImageApiEndpoint}
            </div>
            {generatedAssetUrl ? (
              <div style={{ marginTop: '0.6rem', color: '#166534', fontSize: '0.85rem' }}>
                Added generated asset to hero URL field.
              </div>
            ) : null}
          </Field>

          <Field
            label="Asset manager image selection"
            hint="Pick an existing image from Sanity assets to populate Hero image URL and alt text."
          >
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <input
                value={assetSearch}
                onChange={(event) => setAssetSearch(event.target.value)}
                placeholder="Search by filename..."
                style={{
                  padding: '0.75rem 0.8rem',
                  borderRadius: '0.6rem',
                  border: '1px solid #d1d5db',
                }}
              />
              <div
                style={{
                  maxHeight: '240px',
                  overflow: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.6rem',
                  padding: '0.45rem',
                  display: 'grid',
                  gap: '0.45rem',
                }}
              >
                {loadingAssets ? (
                  <div style={{ color: '#6b7280', fontSize: '0.85rem', padding: '0.3rem 0.2rem' }}>
                    Loading assets...
                  </div>
                ) : null}
                {!loadingAssets && filteredAssets.length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: '0.85rem', padding: '0.3rem 0.2rem' }}>
                    No matching assets.
                  </div>
                ) : null}
                {!loadingAssets
                  ? filteredAssets.map((asset) => (
                      <button
                        key={asset._id}
                        type="button"
                        onClick={() => handleSelectAsset(asset)}
                        style={{
                          border: '1px solid #e5e7eb',
                          background: '#fff',
                          borderRadius: '0.55rem',
                          padding: '0.45rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'grid',
                          gridTemplateColumns: '72px minmax(0, 1fr)',
                          gap: '0.55rem',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={`${asset.url}?w=144&h=96&fit=crop&auto=format`}
                          alt={asset.originalFilename || 'Asset preview'}
                          style={{
                            width: '72px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '0.4rem',
                            border: '1px solid #e5e7eb',
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              color: '#111827',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {asset.originalFilename || asset._id}
                          </div>
                        </div>
                      </button>
                    ))
                  : null}
              </div>
            </div>
          </Field>

          <Field
            label="Hero image URL"
            hint={
              form.contentType === 'post'
                ? 'For guides, the guide-library card image will inherit this hero image automatically.'
                : 'Optional. Paste a full image URL to seed the hero with an external image.'
            }
          >
            <input
              value={form.heroImageUrl}
              onChange={(event) => setForm((current) => ({ ...current, heroImageUrl: event.target.value }))}
              placeholder="https://images.unsplash.com/photo-..."
              style={{
                padding: '0.75rem 0.8rem',
                borderRadius: '0.6rem',
                border: '1px solid #d1d5db',
              }}
            />
          </Field>

          <Field
            label="Hero image alt text"
            hint="Used for the draft hero image. Leave blank to default to the draft title."
          >
            <input
              value={form.heroImageAlt}
              onChange={(event) => setForm((current) => ({ ...current, heroImageAlt: event.target.value }))}
              placeholder="Crew inspecting a hail-damaged Texas roof"
              style={{
                padding: '0.75rem 0.8rem',
                borderRadius: '0.6rem',
                border: '1px solid #d1d5db',
              }}
            />
          </Field>
        </div>

        <Field label="Brief">
          <textarea
            rows={7}
            value={form.brief}
            onChange={(event) => setForm((current) => ({ ...current, brief: event.target.value }))}
            placeholder="Describe the angle, audience, claims to avoid, and what the page should help the homeowner decide."
            style={{
              padding: '0.8rem',
              borderRadius: '0.6rem',
              border: '1px solid #d1d5db',
              resize: 'vertical',
            }}
          />
        </Field>

        <Field label="Sources" hint="One URL or source note per line.">
          <textarea
            rows={5}
            value={form.sources}
            onChange={(event) => setForm((current) => ({ ...current, sources: event.target.value }))}
            placeholder="https://example.com/source-1"
            style={{
              padding: '0.8rem',
              borderRadius: '0.6rem',
              border: '1px solid #d1d5db',
              resize: 'vertical',
            }}
          />
        </Field>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={submitting || loadingSites || !form.siteId || !form.title || !form.brief}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              background: '#111827',
              color: 'white',
              padding: '0.8rem 1rem',
              borderRadius: '0.7rem',
              cursor: 'pointer',
              fontWeight: 600,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <ToolIcon />
            {submitting ? 'Creating draft…' : 'Create draft'}
          </button>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Drafts are created directly in Studio, then handed to Sanity Agent when the schema id is
            configured.
          </span>
        </div>
      </form>
    </div>
  )
}

export function aiDraftingTool() {
  return {
    name: 'ai-drafting',
    title: 'AI Drafting',
    icon: ToolIcon,
    component: AiDraftingTool,
  }
}
