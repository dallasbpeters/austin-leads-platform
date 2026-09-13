import { createMCPClient } from '@ai-sdk/mcp'

const token = process.env.SANITY_API_WRITE_TOKEN
const pinned = {
  protocolVersion: '2025-11-25',
  capabilities: { tools: {} },
  serverInfo: { name: 'sanity-mcp', version: '1.0.0' },
}

for (const [label, extra] of [
  ['default', {}],
  ['discovery off', { protocolVersionDiscovery: false }],
  ['pinned initialize', { initialInitializeResult: pinned }],
]) {
  try {
    const client = await createMCPClient({
      transport: {
        type: 'http',
        url: 'https://mcp.sanity.io',
        headers: { Authorization: `Bearer ${token}` },
      },
      ...extra,
    })
    const tools = Object.keys(await client.tools())
    console.log(`${label}: OK (${tools.length} tools) ${tools.slice(0, 8).join(', ')}`)
    await client.close()
  } catch (e) {
    console.log(`${label}: FAIL ${e.message?.slice(0, 120)}`)
  }
}
