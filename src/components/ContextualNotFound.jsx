'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

const FALLBACK_CONFIG = {
  kicker: 'Try Next',
  headline: 'Roof inspections and storm claims',
  copy: 'Start with the main service categories and we will get you back to the right place.',
  primaryLinks: [
        {
          href: '/roofing',
          title: 'Roofing',
          body: 'Repairs, replacement, storm damage, and inspection planning.',
        },
    {
      href: '/hail-damage',
      title: 'Hail damage',
      body: 'Claims questions, roof evidence, and detach-and-reset concerns.',
    },
  ],
  featureLink: {
    href: '/solar',
    eyebrow: 'Solar',
    title: 'Compare savings, roof-readiness, battery fit, and project timing.',
  },
  buttons: [
    { href: '/', label: 'Back to homepage', variant: 'default' },
    { href: '/services', label: 'Browse services', variant: 'secondary' },
    { href: '/guides', label: 'Open guides', variant: 'ghost' },
  ],
}

function getNotFoundConfig(pathname = '') {
  if (pathname.startsWith('/services/')) {
    return {
      kicker: 'Service Not Found',
      headline: 'That service page is not published here yet.',
      copy: 'The link points to a service route, but that specific service page does not exist on this site. Start from the services overview or jump into the closest active category.',
      primaryLinks: [
        {
          href: '/services',
          title: 'All services',
          body: 'See the full list of roofing, solar, and home-performance work.',
        },
        {
          href: '/roofing',
          title: 'Roofing',
          body: 'Roof replacement, inspections, storm restoration, and detach-and-reset.',
        },
      ],
      featureLink: {
        href: '/solar',
        eyebrow: 'Solar',
        title: 'Compare solar, batteries, and roof-readiness before the project starts.',
      },
      buttons: [
        { href: '/services', label: 'View all services', variant: 'default' },
        { href: '/roofing', label: 'Open roofing', variant: 'secondary' },
        { href: '/', label: 'Back to homepage', variant: 'ghost' },
      ],
    }
  }

  if (pathname.startsWith('/guides')) {
    return {
      kicker: 'Guide Not Found',
      headline: 'That guide is not in the library.',
      copy: 'The link points to a guide that is not published on this site. Start from the guide hub or move into the nearest service page if you need a direct next step.',
      primaryLinks: [
        {
          href: '/guides',
          title: 'Guide library',
          body: 'Browse the current solar, roofing, storm, and insurance guides.',
        },
        {
          href: '/insurance-basics',
          title: 'Insurance basics',
          body: 'Start with claims, estimates, depreciation, and supplement questions.',
        },
      ],
      featureLink: {
        href: '/hail-damage',
        eyebrow: 'Storms',
        title: 'Understand storm damage, roof evidence, and what to do before filing or escalating a claim.',
      },
      buttons: [
        { href: '/guides', label: 'Open guides', variant: 'default' },
        { href: '/insurance-basics', label: 'Insurance basics', variant: 'secondary' },
        { href: '/', label: 'Back to homepage', variant: 'ghost' },
      ],
    }
  }

  if (pathname.startsWith('/roofing') || pathname.startsWith('/hail-damage')) {
    return {
      kicker: 'Roofing Path Not Found',
      headline: 'This roofing or storm page is not live here.',
      copy: 'If you were looking for roof damage, claim help, or an inspection page, start from the roofing hub and move into the right service or guide from there.',
      primaryLinks: [
        {
          href: '/roofing',
          title: 'Roofing hub',
          body: 'Open the main roofing page for inspections, replacement, and storm work.',
        },
        {
          href: '/hail-damage',
          title: 'Hail damage',
          body: 'Review storm concerns, insurance friction, and solar detach-and-reset questions.',
        },
      ],
      featureLink: {
        href: '/services/shingle-roofing',
        eyebrow: 'Roofing service',
        title: 'Go straight to shingle roofing if the next question is repair versus replacement.',
      },
      buttons: [
        { href: '/roofing', label: 'Open roofing', variant: 'default' },
        { href: '/hail-damage', label: 'Storm and hail help', variant: 'secondary' },
        { href: '/', label: 'Back to homepage', variant: 'ghost' },
      ],
    }
  }

  if (pathname.startsWith('/solar')) {
    return {
      kicker: 'Solar Path Not Found',
      headline: 'This solar page is not available on the site.',
      copy: 'If you were looking for costs, incentives, roof-readiness, or system-fit guidance, start from the solar hub or the guide library.',
      primaryLinks: [
        {
          href: '/solar',
          title: 'Solar hub',
          body: 'Open the main solar page for system fit, payback, and project timing.',
        },
        {
          href: '/guides',
          title: 'Solar guides',
          body: 'Browse cost, incentive, battery, and roof-readiness explainers.',
        },
      ],
      featureLink: {
        href: '/services/solar-and-battery-installations',
        eyebrow: 'Solar service',
        title:
          'Jump to the solar and battery service page if you need a direct project conversation instead of a guide.',
      },
      buttons: [
        { href: '/solar', label: 'Open solar', variant: 'default' },
        { href: '/guides', label: 'Browse guides', variant: 'secondary' },
        { href: '/', label: 'Back to homepage', variant: 'ghost' },
      ],
    }
  }

  return FALLBACK_CONFIG
}

export default function ContextualNotFound() {
  const pathname = usePathname()
  const config = getNotFoundConfig(pathname)

  return (
    <div className="grid lg:items-center w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="max-w-2xl">
        <p className="text-muted-foreground text-xs tracking-[0.28em] uppercase">404</p>
        <h1 className="mt-5 leading-none text-5xl text-foreground tracking-tight sm:text-6xl type-display">
          This page went missing somewhere between the roofline and the panel layout.
        </h1>
        <p className="max-w-xl mt-6 leading-8 text-foreground/72 text-lg">{config.copy}</p>

        <div className="flex flex-wrap gap-3 mt-8">
          {config.buttons.map((button) => (
            <Button asChild key={button.href} size="lg" variant={button.variant}>
              <Link href={button.href}>{button.label}</Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="relative p-6 sm:p-8 bg-card/70 border border-border/70 rounded-[2rem] shadow-theme-glass-soft overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute h-px bg-gradient-to-r from-transparent inset-x-0 to-transparent top-0 via-[rgba(234,88,12,0.45)]"
        />

        <div className="grid gap-4">
          <div className="px-5 py-4 bg-background/80 border border-border/70 rounded-3xl">
            <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">{config.kicker}</p>
            <p className="mt-3 text-foreground text-xl">{config.headline}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {config.primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-5 bg-background/80 border border-border/70 rounded-3xl hover:bg-accent/60 transition-colors"
              >
                <p className="text-foreground text-lg">{link.title}</p>
                <p className="mt-2 leading-7 text-muted-foreground text-sm">{link.body}</p>
              </Link>
            ))}
          </div>

          <Link
            href={config.featureLink.href}
            className="p-6 text-white bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.88))] border border-border/70 rounded-[1.75rem] transition-transform hover:-translate-y-0.5"
          >
            <p className="text-white/65 text-xs tracking-[0.24em] uppercase">{config.featureLink.eyebrow}</p>
            <p className="mt-3 leading-tight text-2xl">{config.featureLink.title}</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
