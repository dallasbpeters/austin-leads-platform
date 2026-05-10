'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function SwatchTile({ token, value, compact = false }) {
  return (
    <div
      className={cn(
        'bg-card border-border overflow-hidden rounded-[1.5rem] border',
        compact ? 'shadow-theme-xs' : 'shadow-theme-sm',
      )}
    >
      <div className="relative aspect-[1.08] overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: `var(${token})` }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/18 to-transparent" />
      </div>
      <div className="space-y-1 p-3">
        <div className="text-foreground truncate text-sm font-semibold">{token}</div>
        <div className="text-muted-foreground line-clamp-2 text-xs break-all">{value}</div>
      </div>
    </div>
  )
}

function SectionRailButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-border hover:bg-foreground/4 hover:border-foreground/25 flex w-full items-center justify-between rounded-full border px-4 py-3 text-left transition-colors',
        active && 'text-background bg-foreground border-foreground',
      )}
    >
      <span className="font-medium">{children}</span>
    </button>
  )
}

export default function StyleGuideBrowser({ publicGroups, semanticVariables, adminVariables }) {
  const allSections = [
    ...publicGroups,
    {
      id: 'semantic-theme-tokens',
      title: 'Semantic theme tokens',
      description: 'Shared semantic tokens derived from the public theme.',
      tokens: semanticVariables,
      theme: 'public',
    },
    {
      id: 'admin-semantic-overrides',
      title: 'Admin semantic overrides',
      description: 'Semantic token overrides declared inside the admin theme block.',
      tokens: adminVariables,
      theme: 'admin',
    },
  ]

  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState('all')

  const normalizedQuery = query.trim().toLowerCase()

  const visibleSections = allSections
    .map((section) => ({
      ...section,
      tokens: section.tokens.filter(({ token, value }) => {
        if (!normalizedQuery) return true
        const haystack = `${token} ${value}`.toLowerCase()
        return haystack.includes(normalizedQuery)
      }),
    }))
    .filter((section) => {
      if (activeSection !== 'all' && section.id !== activeSection) return false
      return section.tokens.length > 0
    })

  const resultCount = visibleSections.reduce((count, section) => count + section.tokens.length, 0)

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
      <aside className="lg:sticky lg:top-8">
        <Card className="bg-card/92 border-border rounded-[2rem] border shadow-none backdrop-blur">
          <CardContent className="space-y-6 p-5">
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm font-semibold tracking-[0.24em] uppercase">
                Browse
              </div>
              <div className="text-foreground text-2xl font-bold tracking-tight">Theme tokens</div>
              <p className="text-muted-foreground text-sm leading-6">
                Search by variable name or declared value, then jump between sections.
              </p>
            </div>

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search variables"
              className="bg-background h-12 rounded-full px-4"
            />

            <div className="grid gap-2">
              <SectionRailButton active={activeSection === 'all'} onClick={() => setActiveSection('all')}>
                All sections
              </SectionRailButton>
              {allSections.map((section) => (
                <SectionRailButton
                  key={section.id}
                  active={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.title}
                </SectionRailButton>
              ))}
            </div>

            <div className="border-border flex items-center justify-between rounded-[1.4rem] border px-4 py-3">
              <div>
                <div className="text-foreground text-lg font-semibold">{resultCount}</div>
                <div className="text-muted-foreground text-sm">Visible swatches</div>
              </div>
              {(query || activeSection !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery('')
                    setActiveSection('all')
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-8">
        {visibleSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={cn(
              'rounded-[2rem] border p-5 sm:p-6',
              section.theme === 'admin'
                ? 'text-sidebar-foreground bg-sidebar border-sidebar-border admin-theme'
                : 'bg-card/82 border-border backdrop-blur',
            )}
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <div className="text-foreground text-2xl font-bold tracking-tight">{section.title}</div>
                <p className="text-muted-foreground max-w-2xl text-sm leading-6">{section.description}</p>
              </div>
              <div className="text-muted-foreground rounded-full border border-current/10 px-3 py-1 text-sm">
                {section.tokens.length} swatches
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {section.tokens.map(({ token, value }) => (
                <SwatchTile key={token} token={token} value={value} compact />
              ))}
            </div>
          </section>
        ))}

        {resultCount === 0 && (
          <Card className="rounded-[2rem] border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="text-foreground text-xl font-semibold">No matching swatches</div>
              <p className="text-muted-foreground max-w-md text-sm leading-6">
                Try a broader search term or reset the section filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
