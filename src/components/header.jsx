'use client'

import { Menu, Phone, Xmark } from 'iconoir-react'
import Link from 'next/link'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { SITE_PHONE_DISPLAY, SITE_PHONE_HREF } from '@/lib/platform/contact'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'
import { cn } from '@/lib/utils'

import { getDevSectionAttributes } from './dev/dev-trace'
import Logo from './logo'

const FALLBACK_LINKS = [
  { href: '/solar', label: 'Solar' },
  { href: '/roofing', label: 'Roofing' },
  { href: '/services', label: 'All Services' },
  { href: '/hail-damage', label: 'Hail & Storm Damage' },
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'About Us' },
  {
    href: '#consultation',
    label: 'Contact',
    variant: 'button',
  },
]

/* The Sanity "button" variant renders as the primary pill instead of a text link. */
const CTA_LINK_CLASSES = 'btn--primary'
const EMPTY_NAVIGATION = []
const MOBILE_MENU_ID = 'site-mobile-nav'
const DESKTOP_BREAKPOINT = 1024

const resolveNavItems = (navigation) => {
  const items = Array.isArray(navigation) && navigation.length > 0 ? navigation : FALLBACK_LINKS

  return items
    .map((item) => ({
      className: item.className || '',
      href: cleanRuntimeHref(item.href),
      isExternal: Boolean(item.isExternal),
      label: cleanRuntimeString(item.label),
      variant: cleanRuntimeString(item.variant),
    }))
    .filter((item) => item.href && item.label)
}

const LinkInner = ({ children }) => (
  <span data-slot="button-inner" className="site-header__link-inner">
    {children}
  </span>
)

const NavList = ({ items, onNavigate }) => (
  <>
    {items.map(({ label, href, className, isExternal, variant }, index) => {
      const isAnchor = href.startsWith('#')
      const isAbsolute = /^https?:\/\//iu.test(href)
      const shouldOpenExternal = isExternal || isAbsolute
      const itemClassName = variant === 'button' ? CTA_LINK_CLASSES : className
      const key = buildRuntimeKey('solar-nav-item', href, label, index)

      if (isAnchor) {
        return (
          <Button
            variant="primary"
            key={key}
            href={href}
            onClick={onNavigate}
            className={cn('btn site-header__link text-size-100 site-header__link--cta', itemClassName)}
          >
            <LinkInner>{label}</LinkInner>
          </Button>
        )
      }

      if (shouldOpenExternal) {
        return (
          <a
            key={key}
            href={href}
            onClick={onNavigate}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('btn site-header__link text-size-100', itemClassName)}
          >
            <LinkInner>{label}</LinkInner>
          </a>
        )
      }

      return (
        <Link
          key={key}
          href={href}
          onClick={onNavigate}
          className={cn('btn site-header__link text-size-100', itemClassName)}
        >
          <LinkInner>{label}</LinkInner>
        </Link>
      )
    })}
  </>
)

/*
 * One phone link for both the desktop bar and the mobile sheet, so the two
 * never drift apart. The sheet passes a `prefix` so the number reads as an
 * instruction ("Call us") on a small screen where the icon alone is easy to miss.
 */
const PhoneLink = ({ inSheet = false, prefix = null }) => (
  <div className="site-header__phone-wrapper">
    <a href={SITE_PHONE_HREF} className={cn('site-header__phone', inSheet && 'site-header__phone--sheet')}>
      <span> Call us at:</span>
      <Phone className="site-header__phone-icon" strokeWidth={2} aria-hidden="true" />
      <span>
        {prefix ? `${prefix} ` : null}
        {SITE_PHONE_DISPLAY}
      </span>
    </a>
  </div>
)

const Header = ({ navigation = EMPTY_NAVIGATION }) => {
  const [openNav, setOpenNav] = React.useState(false)
  const navItems = React.useMemo(() => resolveNavItems(navigation), [navigation])
  const closeNav = React.useCallback(() => setOpenNav(false), [])

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        setOpenNav(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    if (!openNav) {
      return
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenNav(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openNav])

  return (
    <nav
      id="site-top"
      className="site-header"
      {...getDevSectionAttributes({
        content: 'Sanity site navigation with fallback links',
        id: 'site-header',
        markup: 'src/components/header.jsx',
      })}
    >
      <PhoneLink />
      <div className="site-header__bar">
        <div className="site-header__inner">
          <Link href="/" aria-label="Texas Solar & Roofing Pros - Home" className="site-header__brand">
            <Logo height={84} width={120} />
            <span className="sr-only">Texas Solar & Roofing Pros</span>
          </Link>
          <div className="site-header__nav">
            <NavList items={navItems} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setOpenNav((current) => !current)}
            className="site-header__toggle"
            aria-expanded={openNav}
            aria-controls={MOBILE_MENU_ID}
            aria-label={openNav ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className="site-header__toggle-icon" aria-hidden="true">
              <Menu
                className={cn('site-header__toggle-glyph', openNav && 'site-header__toggle-glyph--hidden')}
              />
              <Xmark
                className={cn('site-header__toggle-glyph', !openNav && 'site-header__toggle-glyph--hidden')}
              />
            </span>
          </Button>
        </div>
      </div>

      <div
        id={MOBILE_MENU_ID}
        inert={!openNav}
        className={cn('site-header__sheet', openNav && 'site-header__sheet--open')}
      >
        <div className="site-header__sheet-clip">
          <div className="site-header__sheet-panel">
            <div className="site-header__sheet-list">
              <NavList items={navItems} onNavigate={closeNav} />
              <PhoneLink inSheet prefix="Call us:" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
