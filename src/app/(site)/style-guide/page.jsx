import { readFile } from 'node:fs/promises'
import path from 'node:path'

import StyleGuideBrowser from '@/components/platform/StyleGuideBrowser'

const semanticTokenNames = new Set([
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
])

const publicGroupDefinitions = [
  {
    title: 'Brand hues',
    description: 'Core public-site palette variables defined in :root.',
    match: (token) =>
      [
        '--color-primary',
        '--color-primary-alt',
        '--color-secondary',
        '--color-secondary-alt',
        '--color-tertiary',
        '--color-tertiary-alt',
      ].includes(token),
  },
  {
    title: 'Primary scale',
    description: 'Blue brand ramp used throughout the public site.',
    match: (token) => /^--color-primary-(?!h$|s$|l$)/.test(token),
  },
  {
    title: 'Secondary scale',
    description: 'Deep teal and supporting cyan tones.',
    match: (token) => /^--color-secondary-(?!h$|s$|l$)/.test(token),
  },
  {
    title: 'Tertiary scale',
    description: 'Warm highlight and action colors.',
    match: (token) => /^--color-tertiary-(?!h$|s$|l$)/.test(token),
  },
  {
    title: 'Surface and text tokens',
    description: 'Background, surface, border, and text variables that shape the public theme.',
    match: (token) =>
      /^--color-(warm-bg|surface|surface-elevated|grid|grid-line|border|border-strong|text(?:-strong|-muted)?)$/.test(
        token,
      ),
  },
  {
    title: 'Alias colors',
    description: 'Supporting aliases mapped from the main theme variables.',
    match: (token) => /^--color-(slate|gray|neutral|cyan|sky|orange|yellow|blue|white|black)/.test(token),
  },
]

export const metadata = {
  title: 'Style Guide',
  description: 'Internal theme token reference for Austin Leads Platform.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

function extractBlock(css, selector) {
  // Allow comma-separated selectors like `:root,\n.some-class {`
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector}[^{]*\\{([\\s\\S]*?)\\n\\}`, 'm'))
  return match?.[1] ?? ''
}

function parseVariables(block) {
  const variables = []
  const pattern = /(--[\w-]+)\s*:\s*([^;]+);/g
  let match
  while ((match = pattern.exec(block)) !== null) {
    variables.push({ token: match[1], value: match[2].trim() })
  }
  return variables
}

function isSwatchFriendly({ token, value }) {
  if (/(font|shadow|radius|gap|spacing|tracking)/.test(token)) return false
  if (/-(h|s|l)$/.test(token)) return false
  return (
    semanticTokenNames.has(token) ||
    token.startsWith('--color-') ||
    /(oklch|hsl|rgb|rgba|#|var\(--color-|var\(--(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|sidebar))/i.test(
      value,
    )
  )
}

function groupPublicTokens(variables) {
  const remaining = [...variables]
  const groups = publicGroupDefinitions
    .map((group) => {
      const tokens = remaining.filter(({ token }) => group.match(token))
      tokens.forEach((item) => {
        const index = remaining.indexOf(item)
        if (index >= 0) remaining.splice(index, 1)
      })
      return {
        title: group.title,
        description: group.description,
        tokens,
      }
    })
    .filter((group) => group.tokens.length > 0)

  if (remaining.length > 0) {
    groups.push({
      title: 'Additional public tokens',
      description: 'Other color-related variables found in :root.',
      tokens: remaining,
    })
  }

  return groups
}

async function readStyleFile(relativePath) {
  try {
    return await readFile(path.join(process.cwd(), relativePath), 'utf8')
  } catch {
    return ''
  }
}

async function loadStyleGuideData() {
  const [globalsCss, solarCss, christmasCss, adminCss] = await Promise.all([
    readStyleFile('src/styles/globals.css'),
    readStyleFile('src/styles/texas-solar-and-roofing-pros-theme.css'),
    readStyleFile('src/styles/txchristmaslights-theme.css'),
    readStyleFile('src/styles/admin-theme.css'),
  ])

  const rootVariables = parseVariables(
    extractBlock(solarCss, ':root') || extractBlock(globalsCss, ':root'),
  ).filter(isSwatchFriendly)

  const adminVariables = parseVariables(extractBlock(adminCss, '.admin-theme')).filter(isSwatchFriendly)
  const txchristmaslightsVariables = parseVariables(
    extractBlock(christmasCss, '.txchristmaslights-theme'),
  ).filter(isSwatchFriendly)

  const publicVariables = rootVariables.filter(({ token }) => token.startsWith('--color-'))
  const semanticVariables = rootVariables.filter(({ token }) => semanticTokenNames.has(token))

  return {
    publicGroups: groupPublicTokens(publicVariables).map((group) => ({
      ...group,
      id: group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })),
    semanticVariables,
    adminVariables,
    txchristmaslightsVariables,
  }
}

export default async function StyleGuidePage() {
  const { publicGroups, semanticVariables, adminVariables, txchristmaslightsVariables } =
    await loadStyleGuideData()

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--background),var(--card))]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-6 sm:px-3 md:px-6 lg:px-8 lg:py-8">
        <div className="bg-card/76 border-border rounded-[2.25rem] border px-3 py-8 shadow-none backdrop-blur sm:px-8 md:px-6">
          <div className="max-w-4xl space-y-4">
            <div className="text-muted-foreground text-sm font-semibold tracking-[0.24em] uppercase">
              Internal Reference
            </div>
            <h1 className="text-foreground text-4xl font-bold tracking-normal sm:text-5xl">
              Theme style guide
            </h1>
            <p className="text-muted-foreground max-w-3xl text-base leading-7">
              Generated directly from <code>src/styles/*-theme.css</code>, so the swatches stay in sync with
              the actual theme files. This page is intentionally blocked from crawlers.
            </p>
          </div>
        </div>

        <StyleGuideBrowser
          publicGroups={publicGroups}
          semanticVariables={semanticVariables}
          adminVariables={adminVariables}
          txchristmaslightsVariables={txchristmaslightsVariables}
        />
      </div>
    </main>
  )
}
