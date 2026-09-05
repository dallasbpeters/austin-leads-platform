import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'

const __dirname = import.meta.dirname
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')

const primaryColor = '#016db7'

const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 483 491" aria-hidden="true">
  <g transform="matrix(1,0,0,1,-1117.520132,-20.022941)">
    <g transform="matrix(1,0,0,1,551.679288,0)">
      <g transform="matrix(1.122079,0,-0.363049,1.122079,-617.643357,-79.842122)">
        <path
          fill="${primaryColor}"
          d="M1320.761,404.637L1152.178,301.201L1155.057,207.401L1221.488,248.161L1221.488,89L1321,89L1321,157.702L1493.193,158.064L1554.281,252.808L1381.996,252.445L1321,157.845L1321,252.808L1229.062,252.808L1325.627,312.056L1322.846,402.659L1381.781,346.744L1480.789,405.149L1419.879,311.178L1481.587,252.808L1587.731,416.563L1526.022,474.934L1481.017,405.502L1374.555,506.509L1275.177,447.885L1320.761,404.637Z"
        />
      </g>
    </g>
  </g>
</svg>
`

async function renderPng(size, outputPath) {
  const buffer = await sharp(Buffer.from(svgMarkup))
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  await writeFile(outputPath, buffer)
  return buffer
}

async function main() {
  await mkdir(publicDir, { recursive: true })

  const faviconSvgPath = path.join(publicDir, 'favicon.svg')
  const favicon16Path = path.join(publicDir, 'favicon-16x16.png')
  const favicon32Path = path.join(publicDir, 'favicon-32x32.png')
  const appleTouchIconPath = path.join(publicDir, 'apple-touch-icon.png')
  const faviconIcoPath = path.join(publicDir, 'favicon.ico')

  await writeFile(faviconSvgPath, svgMarkup)

  const [png16, png32] = await Promise.all([renderPng(16, favicon16Path), renderPng(32, favicon32Path)])

  await renderPng(180, appleTouchIconPath)

  const icoBuffer = await pngToIco([png16, png32])
  await writeFile(faviconIcoPath, icoBuffer)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
