import './sync-gemini-env.js'

import { setTimeout as delay } from 'node:timers/promises'

import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

/*
 * Local replacement for `sanity-plugin-gemini-ai-images-nextjs/route`, which
 * has no Sanity 6 compatible release. The request and response shapes are kept
 * identical to that package so the studio side is a drop-in swap.
 */

const IMAGE_MODEL = 'gemini-2.5-flash-image'
const MIN_SERIES = 2
const MAX_SERIES = 10
/* Google rate-limits bursts; the original spaced sequential calls out by this much. */
const SERIES_DELAY_MS = 500

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

/**
 * Answers a JSON response carrying the CORS headers the studio needs, since it
 * calls this route from the Sanity-hosted origin rather than our own.
 *
 * @param {unknown} body - Value to serialise.
 * @param {number} status - HTTP status code.
 * @returns {NextResponse} The response.
 */
const jsonResponse = (body, status = 200) => NextResponse.json(body, { headers: corsHeaders, status })

/**
 * Checks the shared secret when one is configured. With no secret set the
 * route stays open, matching the behaviour of the package it replaces.
 *
 * @param {Request} request - Incoming request.
 * @returns {boolean} Whether the caller may proceed.
 */
const hasValidApiKey = (request) => {
  const expectedApiKey = process.env.GEMINI_PLUGIN_API_KEY

  return !expectedApiKey || request.headers.get('x-api-key') === expectedApiKey
}

/**
 * Generates one image, either from a prompt alone or by editing a supplied
 * base image.
 *
 * @param {GoogleGenAI} client - Configured Gemini client.
 * @param {{ prompt: string, aspectRatio?: string, mode?: string, baseImage?: string }} options - Generation options.
 * @returns {Promise<{ imageData: string, mimeType: string }>} Base64 image payload.
 */
const generateSingleImage = async (client, { prompt, aspectRatio, mode, baseImage }) => {
  const imageConfig = aspectRatio ? { aspectRatio } : {}
  const isEdit = mode === 'edit' && baseImage

  const response = await client.models.generateContent({
    model: IMAGE_MODEL,
    contents: [
      {
        parts: isEdit
          ? [{ inlineData: { data: baseImage, mimeType: 'image/png' } }, { text: prompt }]
          : [{ text: prompt }],
      },
    ],
    config: isEdit ? { imageConfig } : { imageConfig, responseModalities: ['Image'] },
  })

  for (const part of response?.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return { imageData: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' }
    }
  }

  throw new Error('No image generated in response')
}

/**
 * Builds the prompt for one entry in a series. The wording is deliberately
 * heavy-handed: without it the model tends to answer with a contact sheet of
 * several images rather than one, and to redraw the subject each time.
 *
 * @param {{ prompt: string, consistencyPrompt?: string, variation: string, hasBaseImage: boolean }} options - Prompt parts.
 * @returns {string} The assembled prompt.
 */
const buildSeriesPrompt = ({ prompt, consistencyPrompt, variation, hasBaseImage }) =>
  (hasBaseImage
    ? [
        'CREATE A SINGLE IMAGE (NOT A GRID OR COLLAGE).',
        'IMPORTANT: Use this reference image as the EXACT subject/person. Do NOT create a different person or subject.',
        'Keep the SAME person/subject/object from the reference image.',
        consistencyPrompt,
        prompt,
        `Apply this specific variation ONLY: ${variation}`,
        'Output: ONE single image showing the same subject with the specified variation applied.',
      ]
    : [
        'CREATE A SINGLE IMAGE (NOT A GRID OR COLLAGE).',
        prompt,
        consistencyPrompt,
        `Apply ONLY this variation to the subject: ${variation}`,
        'The subject itself must remain IDENTICAL. Only the specified variation aspect should change.',
        'Output: ONE single image.',
      ]
  )
    .filter(Boolean)
    .join(' ')

/**
 * Generates a consistent set of images, one per variation. Generation is
 * sequential rather than parallel: sharing a reference image across concurrent
 * calls produces noticeably less consistent subjects.
 *
 * @param {GoogleGenAI} client - Configured Gemini client.
 * @param {object} body - Parsed request body.
 * @returns {Promise<NextResponse>} A single-, partial-, or total-failure response.
 */
const generateSeries = async (client, body) => {
  const { prompt, aspectRatio, mode, baseImage, series } = body
  const { quantity, consistencyPrompt, variations } = series

  if (!variations || variations.length === 0) {
    return jsonResponse({ error: 'Variations are required for series generation' }, 400)
  }

  const parsedQuantity = Number(quantity)

  if (!Number.isFinite(parsedQuantity)) {
    return jsonResponse({ error: 'Quantity must be a number between 2 and 10' }, 400)
  }

  if (parsedQuantity < MIN_SERIES || parsedQuantity > MAX_SERIES) {
    return jsonResponse({ error: `Quantity must be between ${MIN_SERIES} and ${MAX_SERIES}` }, 400)
  }

  const images = []
  const errors = []
  const cappedVariations = variations.slice(0, parsedQuantity)

  for (const [index, variation] of cappedVariations.entries()) {
    try {
      const result = await generateSingleImage(client, {
        aspectRatio,
        baseImage,
        mode,
        prompt: buildSeriesPrompt({ consistencyPrompt, hasBaseImage: Boolean(baseImage), prompt, variation }),
      })

      images.push({ ...result, index, variation })
    } catch (error) {
      errors.push({ error: error?.message || 'Generation failed', index, variation })
    }

    if (index < cappedVariations.length - 1) {
      await delay(SERIES_DELAY_MS)
    }
  }

  if (images.length === 0) {
    return jsonResponse({ details: errors, error: 'All image generations failed' }, 500)
  }

  const payload = {
    images,
    metadata: {
      basePrompt: prompt,
      failed: errors.length,
      generatedAt: new Date().toISOString(),
      quantity: parsedQuantity,
      stylePrompt: consistencyPrompt,
      successful: images.length,
    },
  }

  /* 207 Multi-Status: some variations came back, some did not. */
  return errors.length > 0
    ? jsonResponse({ ...payload, errors, warning: 'Some image generations failed' }, 207)
    : jsonResponse(payload)
}

/**
 * Preflight for the studio's cross-origin call.
 *
 * @returns {NextResponse} An empty 200 carrying the CORS headers.
 */
export const OPTIONS = async () => new NextResponse(null, { headers: corsHeaders, status: 200 })

/**
 * Generates one image, or a consistent series when `series` is supplied.
 *
 * @param {Request} request - Incoming request.
 * @returns {Promise<NextResponse>} The generated image payload.
 */
export const POST = async (request) => {
  if (!hasValidApiKey(request)) {
    return jsonResponse({ error: 'Invalid or missing API key' }, 401)
  }

  const geminiApiKey = process.env.GEMINI_API_KEY

  if (!geminiApiKey) {
    return jsonResponse({ error: 'Gemini API not configured' }, 500)
  }

  try {
    const body = await request.json()

    if (!body?.prompt) {
      return jsonResponse({ error: 'Prompt is required' }, 400)
    }

    const client = new GoogleGenAI({ apiKey: geminiApiKey })

    if (body.series) {
      return await generateSeries(client, body)
    }

    return jsonResponse(await generateSingleImage(client, body))
  } catch (error) {
    console.error('Image generation failed:', error)
    return jsonResponse({ error: error?.message || 'Image generation failed' }, 500)
  }
}
