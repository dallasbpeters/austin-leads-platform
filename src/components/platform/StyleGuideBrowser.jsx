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
        "bg-card border border-border rounded-[1.5rem] overflow-hidden",
        compact ? 'shadow-theme-xs' : 'shadow-theme-sm',
      )}
    >
      <div className="relative aspect-[1.08] overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: `var(${token})` }} />
        <div className="absolute h-16 bg-gradient-to-t bottom-0 from-black/18 inset-x-0 pointer-events-none to-transparent" />
      </div>
      <div className="p-3 space-y-1">
        <div className="font-semibold text-foreground text-sm truncate">{token}</div>
        <div className="text-muted-foreground text-xs break-all line-clamp-2">{value}</div>
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
        "flex items-center justify-between w-full px-4 py-3 text-left border border-border rounded-full hover:bg-foreground/4 hover:border-foreground/25 transition-colors",
        active && "text-background bg-foreground border-foreground",
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
    <div className="grid lg:items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-8">
        <Card className="bg-card/92 border border-border rounded-[2rem] shadow-none backdrop-blur">
          <CardContent className="p-5 space-y-6">
            <div className="space-y-2">
              <div className="font-semibold text-muted-foreground text-sm tracking-[0.24em] uppercase">
                Browse
              </div>
              <div className="font-bold text-2xl text-foreground tracking-tight">Theme tokens</div>
              <p className="leading-6 text-muted-foreground text-sm">
                Search by variable name or declared value, then jump between sections.
              </p>
            </div>

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search variables"
              className="h-12 px-4 bg-background rounded-full"
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

            <div className="flex items-center justify-between px-4 py-3 border border-border rounded-[1.4rem]">
              <div>
                <div className="font-semibold text-foreground text-lg">{resultCount}</div>
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
              "p-5 sm:p-6 border rounded-[2rem]",
              section.theme === 'admin'
                ? "text-sidebar-foreground bg-sidebar border-sidebar-border admin-theme"
                : 'bg-card/82 border-border backdrop-blur',
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
              <div className="space-y-1">
                <div className="font-bold text-2xl text-foreground tracking-tight">{section.title}</div>
                <p className="max-w-2xl leading-6 text-muted-foreground text-sm">{section.description}</p>
              </div>
              <div className="px-3 py-1 text-muted-foreground text-sm border border-current/10 rounded-full">
                {section.tokens.length} swatches
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2 2xl:grid-cols-5 md:grid-cols-3 xl:grid-cols-4">
              {section.tokens.map(({ token, value }) => (
                <SwatchTile key={token} token={token} value={value} compact />
              ))}
            </div>
          </section>
        ))}

        {resultCount === 0 && (
          <Card className="border-dashed rounded-[2rem] shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="font-semibold text-foreground text-xl">No matching swatches</div>
              <p className="max-w-md leading-6 text-muted-foreground text-sm">
                Try a broader search term or reset the section filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
