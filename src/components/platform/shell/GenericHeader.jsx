'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, Xmark } from 'iconoir-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getDevSectionAttributes } from '@/components/dev/DevTrace'
import { buildSanityImageUrl } from '@/lib/platform/imageSource'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'

import { CONSULTATION_ANCHOR_ID, TX_CHRISTMAS_PUBLIC_LOGO_SRC } from '../PublicSiteUtils'

const CONTACT_LINK_CLASSES = 'btn--primary text-white px-4 items-center! justify-center! h-11 md:h-9'

function NavList({ items, onNavigate }) {
  return (
    <>
      {items.map((item, index) => {
        const href = cleanRuntimeHref(item.href)
        const label = cleanRuntimeString(item.label)
        const isAnchor = href.startsWith('#')
        const isAbsolute = /^https?:\/\//i.test(href)
        const isExternal = Boolean(item.isExternal) || isAbsolute
        const isContact = item.kind === 'contact'
        const className = isContact
          ? `font-wght-450 medium text-foreground text-md btn flex items-start justify-start gap-2 rounded-full px-6 py-5.5 ${CONTACT_LINK_CLASSES}`
          : 'font-wght-450 medium text-foreground text-md hover:text-primary btn flex items-start justify-start gap-2 rounded-full px-2 py-4 hover:bg-transparent'

        const key = buildRuntimeKey('generic-nav-item', href, label, index)

        if (isAnchor || isExternal) {
          return (
            <a
              key={key}
              href={href}
              onClick={onNavigate}
              className={className}
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span data-slot="button-inner">{label}</span>
            </a>
          )
        }

        return (
          <Link key={key} href={href} onClick={onNavigate} className={className}>
            <span data-slot="button-inner">{label}</span>
          </Link>
        )
      })}
    </>
  )
}

export default function GenericHeader({ site, navigation = [] }) {
  const [openNav, setOpenNav] = React.useState(false)
  const [, setConsultationInView] = React.useState(false)
  const mobileMenuId = 'site-mobile-nav'

  const isChristmas = site?.slug === 'txchristmaslights'
  const logoUrl = isChristmas ? TX_CHRISTMAS_PUBLIC_LOGO_SRC : buildSanityImageUrl(site?.brand?.logo, { width: 200 })
  const logoAlt = isChristmas ? (site?.name || 'Texas Christmas Lights') : site?.brand?.logo?.alt || site?.name || ''
  const siteName = cleanRuntimeString(site?.shortName || site?.name || '')

  const navItems = React.useMemo(() => {
    const items = navigation.map((item) => ({ ...item, kind: 'page' }))
    items.push({
      href: `#${CONSULTATION_ANCHOR_ID}`,
      label: 'Contact',
      kind: 'contact',
    })
    return items
  }, [navigation])

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpenNav(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    const section = document.getElementById(CONSULTATION_ANCHOR_ID)

    if (!section || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setConsultationInView(entries.some((entry) => entry.isIntersecting))
      },
      { threshold: 0.1 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <nav
        id="site-top"
        className="text-foreground fixed left-[50%] z-50 mx-auto w-full max-w-7xl translate-x-[-50%] px-0 sm:top-0 md:top-2 md:px-4"
        {...getDevSectionAttributes({
          id: 'site-header',
          markup: 'src/components/platform/shell/GenericHeader.jsx',
          content: 'multi-tenant public-site nav driven by Sanity site doc',
        })}
      >
        <div
          className={
            isChristmas
              ? 'border-border bg-card/95 mx-auto w-full rounded-none border px-5 py-2 shadow-sm backdrop-blur-sm md:rounded-full'
              : 'mx-auto w-full rounded-none bg-stone-100 px-5 py-2 shadow-sm backdrop-blur-sm md:rounded-full'
          }
        >
          <div className="flex items-center justify-between">
            <Link href="/" title={site?.name || ''} className="grid grid-flow-col items-center gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  width={isChristmas ? 200 : 150}
                  height={isChristmas ? 48 : 40}
                  className={
                    isChristmas ? 'h-9 w-auto max-w-[200px] object-contain md:h-10' : 'h-7 w-7 object-contain'
                  }
                />
              ) : (
                <span aria-hidden className="text-primary type-display text-xl leading-none font-medium">
                  {(siteName || 'S').charAt(0)}
                </span>
              )}
              <div className="sm:text-md type-accent font-serif leading-none font-bold text-inherit md:text-lg">
                {siteName}
              </div>
            </Link>
            <Separator orientation="vertical" className="mx-1 hidden h-5 lg:block" />
            <div className="hidden lg:flex lg:items-center">
              <NavList items={navItems} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setOpenNav(!openNav)}
              className="!hover:bg-transparent ml-auto px-6 py-5.5 lg:hidden"
              aria-expanded={openNav}
              aria-controls={mobileMenuId}
              aria-label={openNav ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {openNav ? <Xmark className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>

        <div
          id={mobileMenuId}
          aria-hidden={!openNav}
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
            openNav ? 'max-h-128 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-card border-border md:border-border mx-auto w-full rounded-none border-b px-4 py-2 shadow-sm md:rounded-md md:border">
            <div
              className={`mt-2 space-y-1 transition-all duration-200 ${
                openNav ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              <NavList items={navItems} onNavigate={() => setOpenNav(false)} />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
