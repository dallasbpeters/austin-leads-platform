import './sync-gemini-env.js'
import { NextResponse } from 'next/server'
import { POST as BasePOST } from 'sanity-plugin-gemini-ai-images-nextjs/route'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export const POST = async (request) => {
  const response = await BasePOST(request)
  const headers = new Headers(response.headers)

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
