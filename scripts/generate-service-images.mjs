import fs from 'node:fs/promises'
import path from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AirConditioner, AreaSearch, BatteryCharging, HomeShield, WindowTabs } from 'iconoir-react'

const width = 1600
const height = 1600
const outputDir = path.resolve('public/assets/services')

const services = [
  {
    slug: 'energy-audits',
    icon: AreaSearch,
    colors: {
      bgA: '#071f32',
      bgB: '#0a3749',
      accentA: '#87d7ff',
      accentB: '#d9f066',
    },
    buildScene: () => `
      <g opacity="0.22" stroke="url(#lineGradient)" stroke-width="2">
        <rect x="172" y="204" width="610" height="610" rx="30" />
        <line x1="325" y1="204" x2="325" y2="814" />
        <line x1="478" y1="204" x2="478" y2="814" />
        <line x1="631" y1="204" x2="631" y2="814" />
        <line x1="172" y1="357" x2="782" y2="357" />
        <line x1="172" y1="510" x2="782" y2="510" />
        <line x1="172" y1="663" x2="782" y2="663" />
      </g>
      <circle cx="1116" cy="436" r="234" fill="url(#orbGradient)" opacity="0.78" />
      <circle cx="1288" cy="296" r="58" fill="#ffffff" opacity="0.14" />
    `,
  },
  {
    slug: 'insulation-air-sealing',
    icon: HomeShield,
    colors: {
      bgA: '#0c2230',
      bgB: '#0b3840',
      accentA: '#7be4db',
      accentB: '#fee39f',
    },
    buildScene: () => `
      <g opacity="0.28">
        <path d="M214 932 L518 658 L818 932" fill="none" stroke="url(#lineGradient)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="302" y="926" width="426" height="270" rx="34" fill="none" stroke="url(#lineGradient)" stroke-width="16" />
        <path d="M368 1036 H662" stroke="url(#lineGradient)" stroke-width="10" stroke-linecap="round" />
        <path d="M368 1098 H662" stroke="url(#lineGradient)" stroke-width="10" stroke-linecap="round" />
        <path d="M368 1160 H662" stroke="url(#lineGradient)" stroke-width="10" stroke-linecap="round" />
      </g>
      <circle cx="1194" cy="358" r="206" fill="url(#orbGradient)" opacity="0.66" />
    `,
  },
  {
    slug: 'duct-sealing',
    icon: AirConditioner,
    colors: {
      bgA: '#081b2d',
      bgB: '#093642',
      accentA: '#91d9ff',
      accentB: '#80ffd3',
    },
    buildScene: () => `
      <g fill="none" stroke="url(#lineGradient)" stroke-linecap="round" stroke-linejoin="round">
        <path d="M212 530 H612 V720 H834" stroke-width="26" opacity="0.32" />
        <path d="M270 794 H566 V990 H756" stroke-width="18" opacity="0.24" />
        <path d="M278 1140 C414 1060 520 1060 678 1140" stroke-width="12" opacity="0.24" />
        <path d="M862 1108 C1010 1000 1168 1000 1336 1108" stroke-width="16" opacity="0.22" />
      </g>
      <circle cx="1168" cy="404" r="214" fill="url(#orbGradient)" opacity="0.7" />
    `,
  },
  {
    slug: 'window-replacement',
    icon: WindowTabs,
    colors: {
      bgA: '#122130',
      bgB: '#183d4f',
      accentA: '#99d6ff',
      accentB: '#f6d79b',
    },
    buildScene: () => `
      <g opacity="0.28" stroke="url(#lineGradient)" stroke-width="12">
        <rect x="192" y="246" width="564" height="852" rx="40" />
        <line x1="474" y1="246" x2="474" y2="1098" />
        <line x1="192" y1="672" x2="756" y2="672" />
      </g>
      <circle cx="1150" cy="382" r="220" fill="url(#orbGradient)" opacity="0.66" />
    `,
  },
  {
    slug: 'heat-pump-upgrades',
    icon: AirConditioner,
    colors: {
      bgA: '#0a2031',
      bgB: '#12384a',
      accentA: '#90d0ff',
      accentB: '#cbe989',
    },
    buildScene: () => `
      <g opacity="0.26" fill="none" stroke="url(#lineGradient)">
        <circle cx="446" cy="742" r="184" stroke-width="12" />
        <circle cx="446" cy="742" r="126" stroke-width="10" />
        <circle cx="446" cy="742" r="68" stroke-width="8" />
        <path d="M446 514 V364" stroke-width="10" stroke-linecap="round" />
        <path d="M446 1120 V970" stroke-width="10" stroke-linecap="round" />
        <path d="M216 742 H66" stroke-width="10" stroke-linecap="round" />
        <path d="M826 742 H676" stroke-width="10" stroke-linecap="round" />
      </g>
      <circle cx="1188" cy="382" r="210" fill="url(#orbGradient)" opacity="0.72" />
    `,
  },
  {
    slug: 'solar-battery-installations',
    icon: BatteryCharging,
    colors: {
      bgA: '#091f2f',
      bgB: '#0e3945',
      accentA: '#85d3ff',
      accentB: '#f2e487',
    },
    buildScene: () => `
      <g opacity="0.26" stroke="url(#lineGradient)" fill="none">
        <path d="M156 1122 L446 846 L786 846 L1090 1122" stroke-width="12" stroke-linejoin="round" />
        <path d="M248 1022 H1008" stroke-width="10" />
        <path d="M284 944 H962" stroke-width="8" />
        <path d="M914 336 A110 110 0 1 1 913.9 336" stroke-width="12" />
        <path d="M914 170 V92" stroke-width="8" stroke-linecap="round" />
        <path d="M1040 214 L1098 156" stroke-width="8" stroke-linecap="round" />
        <path d="M788 214 L730 156" stroke-width="8" stroke-linecap="round" />
      </g>
      <circle cx="1192" cy="438" r="224" fill="url(#orbGradient)" opacity="0.74" />
    `,
  },
]

function renderIcon(Icon, color) {
  return renderToStaticMarkup(
    React.createElement(Icon, {
      width: 360,
      height: 360,
      color,
      strokeWidth: 1.65,
    }),
  )
}

function svgForService(service) {
  const icon = renderIcon(service.icon, 'rgba(255,255,255,0.94)')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="140" y1="88" x2="1370" y2="1500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${service.colors.bgA}" />
      <stop offset="100%" stop-color="${service.colors.bgB}" />
    </linearGradient>
    <linearGradient id="lineGradient" x1="180" y1="220" x2="1170" y2="1220" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${service.colors.accentA}" />
      <stop offset="100%" stop-color="${service.colors.accentB}" />
    </linearGradient>
    <radialGradient id="orbGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 364) rotate(120) scale(520 520)">
      <stop offset="0%" stop-color="${service.colors.accentA}" />
      <stop offset="100%" stop-color="${service.colors.accentB}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="shadowGradient" x1="800" y1="980" x2="800" y2="1600" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(5, 12, 18, 0)" />
      <stop offset="100%" stop-color="rgba(4, 10, 14, 0.96)" />
    </linearGradient>
    <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="28" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" rx="64" fill="url(#bgGradient)" />
  <circle cx="286" cy="198" r="212" fill="${service.colors.accentB}" opacity="0.11" filter="url(#softBlur)" />
  <circle cx="1316" cy="182" r="188" fill="${service.colors.accentA}" opacity="0.12" filter="url(#softBlur)" />
  ${service.buildScene()}
  <g transform="translate(940 722)" opacity="0.9">
    ${icon}
  </g>
  <rect x="0" y="938" width="${width}" height="662" fill="url(#shadowGradient)" />
  <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="48" stroke="rgba(255,255,255,0.14)" stroke-width="2" />
</svg>
`
}

await fs.mkdir(outputDir, { recursive: true })

for (const service of services) {
  await fs.writeFile(path.join(outputDir, `${service.slug}.svg`), svgForService(service))
}

console.log(`Generated ${services.length} service images in ${outputDir}`)
