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
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'))
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
  if (/(font|shadow|radius|gap)/.test(token)) return false
  if (/-(h|s|l)$/.test(token)) return false
  return (
    semanticTokenNames.has(token) ||
    token.startsWith('--color-') ||
    /(hsl|rgb|rgba|#|var\(--color-|var\(--(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|sidebar))/i.test(
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

async function loadStyleGuideData() {
  const cssPath = path.join(process.cwd(), 'src/styles/globals.css')
  const css = await readFile(cssPath, 'utf8')

  const rootVariables = parseVariables(extractBlock(css, ':root')).filter(isSwatchFriendly)
  const adminVariables = parseVariables(extractBlock(css, '.admin-theme')).filter(isSwatchFriendly)

  const publicVariables = rootVariables.filter(({ token }) => token.startsWith('--color-'))
  const semanticVariables = rootVariables.filter(({ token }) => semanticTokenNames.has(token))

  return {
    publicGroups: groupPublicTokens(publicVariables).map((group) => ({
      ...group,
      id: group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })),
    semanticVariables,
    adminVariables,
  }
}

export default async function StyleGuidePage() {
  const { publicGroups, semanticVariables, adminVariables } = await loadStyleGuideData()

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--background),var(--card))]">
      <div className="flex flex-col max-w-[1440px] w-full gap-8 mx-auto px-4 py-6 lg:px-8 lg:py-8 sm:px-6">
        <div className="px-6 py-8 sm:px-8 bg-card/76 border border-border rounded-[2.25rem] shadow-none backdrop-blur">
          <div className="max-w-4xl space-y-4">
            <div className="font-semibold text-muted-foreground text-sm tracking-[0.24em] uppercase">
              Internal Reference
            </div>
            <h1 className="font-bold text-4xl text-foreground tracking-tight sm:text-5xl">
              Theme style guide
            </h1>
            <p className="max-w-3xl leading-7 text-base text-muted-foreground">
              Generated directly from <code>src/styles/globals.css</code>, so the swatches stay in sync with
              the actual theme file. This page is intentionally blocked from crawlers.
            </p>
          </div>
        </div>

        <StyleGuideBrowser
          publicGroups={publicGroups}
          semanticVariables={semanticVariables}
          adminVariables={adminVariables}
        />
      </div>
    </main>
  )
}
