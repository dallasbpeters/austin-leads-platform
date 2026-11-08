'use client'

import { Box, Button, Card, Dialog, Flex, Stack, Text } from '@sanity/ui'
import { useEffect, useRef, useState } from 'react'
import { useClient } from 'sanity'

import { toolApiOrigin } from '../env'

/*
 * "Remove background" in every image field's Select menu. The cut is done by
 * BiRefNet on fal.ai through our /api/remove-background route, which checks
 * the editor's Sanity login, keeps FAL_API_KEY on the server, and saves the
 * transparent PNG to Sanity as a new asset. The original stays untouched.
 */

// One worker per Studio session, shared by every field; it keeps the model loaded.
// WebGPU first; some GPUs cannot run this model there, so a failure switches to WASM for good.
const ENDPOINT = `${toolApiOrigin}/api/remove-background`

/* A picked file goes up as a JPEG of at most 2400px: well under the 4.5 MB request limit. */
async function fileToDataUrl(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.92)
}

async function removeBackground({ image, filename, token }) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ image, filename }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.assetId) {
    throw new Error(body.error || `Background removal failed (${response.status}).`)
  }
  return body
}

// Sanity's image CDN: cap the long side so huge photos stay quick in the browser.
const sourceUrl = (asset) => (asset?.url ? `${asset.url}?w=2400&h=2400&fit=max` : '')

const baseName = (name) => String(name || 'image').replace(/\.[^.]+$/u, '')

/* Light/dark squares, so the transparent parts read as transparent. */
const checkerboard = {
  backgroundColor: '#fff',
  backgroundImage:
    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
}

const previewStyle = { display: 'block', maxWidth: '100%', maxHeight: '22rem', margin: '0 auto' }

const RemoveBackgroundSource = ({ selectedAssets, onSelect, onClose }) => {
  const current = selectedAssets?.[0]
  // The editor's own Sanity login: the route checks it and saves the cut-out as them.
  const client = useClient({ apiVersion: '2025-02-19' })
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const inputRef = useRef(null)

  const src = fileUrl || sourceUrl(current)
  const name = baseName(file?.name || current?.originalFilename)

  useEffect(() => () => fileUrl && URL.revokeObjectURL(fileUrl), [fileUrl])

  const pickFile = (event) => {
    const picked = event.target.files?.[0]
    if (!picked) {
      return
    }
    setFile(picked)
    setFileUrl(URL.createObjectURL(picked))
    setResult(null)
    setStatus({ state: 'idle', message: '' })
  }

  const run = async () => {
    setResult(null)
    setStatus({ state: 'working', message: 'Removing the background… (about 5–15 seconds)' })
    try {
      const image = file ? await fileToDataUrl(file) : src
      const saved = await removeBackground({ image, filename: name, token: client.config().token })
      setResult(saved)
      setStatus({ state: 'done', message: '' })
    } catch (error) {
      console.error('[remove-background]', error)
      setStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Try another image.',
      })
    }
  }

  // The cut-out is already saved in Sanity; this puts it in the field.
  const useResult = () => onSelect([{ kind: 'assetDocumentId', value: result.assetId }])

  const working = status.state === 'working'

  return (
    <Dialog id="remove-background" header="Remove background" width={2} onClose={onClose} animate>
      <Box padding={4}>
        <Stack gap={4}>
          <Flex gap={3} wrap="wrap">
            <Card flex={1} radius={2} border overflow="hidden" style={{ minWidth: '14rem' }}>
              {src ? (
                // oxlint-disable-next-line next/no-img-element -- Studio, not the site
                <img src={src} alt="Original" style={previewStyle} />
              ) : (
                <Flex align="center" justify="center" padding={5}>
                  <Text muted size={1}>
                    Choose an image to start.
                  </Text>
                </Flex>
              )}
            </Card>
            <Card flex={1} radius={2} border overflow="hidden" style={{ ...checkerboard, minWidth: '14rem' }}>
              {result ? (
                // oxlint-disable-next-line next/no-img-element -- Studio, not the site
                <img src={`${result.url}?w=1200`} alt="Background removed" style={previewStyle} />
              ) : (
                <Flex align="center" justify="center" padding={5} style={{ height: '100%' }}>
                  <Text muted size={1}>
                    {working ? status.message : 'The cut-out shows here.'}
                  </Text>
                </Flex>
              )}
            </Card>
          </Flex>

          {status.state === 'error' ? (
            <Card padding={3} radius={2} tone="critical">
              <Text size={1}>{status.message}</Text>
            </Card>
          ) : null}

          <Flex gap={2} wrap="wrap">
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={pickFile} />
            <Button
              text={src ? 'Use a different image' : 'Choose an image'}
              mode="ghost"
              disabled={working}
              onClick={() => inputRef.current?.click()}
            />
            <Box flex={1} />
            <Button
              text={working ? 'Working…' : result ? 'Run again' : 'Remove background'}
              mode={result ? 'ghost' : 'default'}
              tone="primary"
              disabled={!src || working}
              loading={working}
              onClick={run}
            />
            {result ? <Button text="Use this image" tone="positive" onClick={useResult} /> : null}
          </Flex>
          <Text size={0} muted>
            Uses BiRefNet on fal.ai, a fraction of a cent per image. The original image is kept; the cut-out
            is saved to Sanity as a new PNG.
          </Text>
        </Stack>
      </Box>
    </Dialog>
  )
}

const ScissorsIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 25 25" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="7.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M9.5 9 19 18M9.5 16 19 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

export const removeBackgroundAssetSource = {
  name: 'remove-background',
  title: 'Remove background',
  icon: ScissorsIcon,
  component: RemoveBackgroundSource,
}
