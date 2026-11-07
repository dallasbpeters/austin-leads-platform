'use client'

import { Menu, NavArrowDown, Phone, Xmark } from 'iconoir-react'
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
/* Room for the gaps between the logo, links and actions, plus a little breathing space. */
const NAV_FIT_SLACK = 64
/* The menu toggle's width, reserved once any link has to move into the sheet. */
const TOGGLE_WIDTH = 72

const resolveNavItems = (navigation) => {
  const items = Array.isArray(navigation) && navigation.length > 0 ? navigation : FALLBACK_LINKS

  return items
    .map((item) => ({
      className: item.className || '',
      href: cleanRuntimeHref(item.href),
      isExternal: Boolean(item.isExternal),
      label: cleanRuntimeString(item.label),
      variant: cleanRuntimeString(item.variant),
      children: (Array.isArray(item.children) ? item.children : [])
        .map((child) => ({
          href: cleanRuntimeHref(child.href),
          label: cleanRuntimeString(child.label),
          description: cleanRuntimeString(child.description),
          imageUrl: cleanRuntimeHref(child.imageUrl),
        }))
        .filter((child) => child.href && child.label),
    }))
    .filter((item) => item.href && item.label)
}

const LinkInner = ({ children }) => (
  <span data-slot="button-inner" className="site-header__link-inner">
    {children}
  </span>
)

/*
 * A nav item with Sanity "Dropdown links". On desktop it opens on hover or on
 * click of the trigger; in the mobile sheet (`inSheet`) the links are listed
 * open under the label, since a tap target inside a tap target is fiddly.
 * The item's own href stays reachable as the "View all" link at the bottom.
 */
const NavDropdown = ({ item, inSheet, onNavigate }) => {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)
  const menuId = React.useId()

  React.useEffect(() => {
    if (!open) {
      return
    }
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        rootRef.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleNavigate = () => {
    setOpen(false)
    onNavigate?.()
  }

  const links = (
    <>
      {item.children.map((child, index) => (
        <Link
          key={buildRuntimeKey('solar-nav-child', child.href, child.label, index)}
          href={child.href}
          onClick={handleNavigate}
          className="site-header__dropdown-link"
        >
          {child.imageUrl ? (
            <img
              src={`${child.imageUrl}?w=192&h=144&fit=crop&auto=format`}
              alt=""
              width={96}
              height={72}
              loading="lazy"
              className="site-header__dropdown-image"
            />
          ) : null}
          <span className="site-header__dropdown-text">
            <span className="site-header__dropdown-title">{child.label}</span>
            {child.description ? (
              <span className="site-header__dropdown-description">{child.description}</span>
            ) : null}
          </span>
        </Link>
      ))}
      <Link
        href={item.href}
        onClick={handleNavigate}
        className="site-header__dropdown-link site-header__dropdown-link--all"
      >
        View all {item.label.toLowerCase()}
      </Link>
    </>
  )

  if (inSheet) {
    return (
      <div className="site-header__dropdown site-header__dropdown--sheet">
        <p className="site-header__dropdown-heading text-size-100">{item.label}</p>
        <div className="site-header__dropdown-sheet-list">{links}</div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={cn('site-header__dropdown', open && 'site-header__dropdown--open')}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        className="btn site-header__link site-header__dropdown-trigger text-size-100"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <LinkInner>
          {item.label}
          <NavArrowDown className="site-header__dropdown-chevron" strokeWidth={2} aria-hidden="true" />
        </LinkInner>
      </button>
      <div id={menuId} className="site-header__dropdown-menu" inert={!open}>
        <div className="site-header__dropdown-panel">{links}</div>
      </div>
    </div>
  )
}

const NavList = ({ items, inSheet = false, onNavigate }) => (
  <>
    {items.map((item, index) => {
      const { label, href, className, isExternal, variant, children } = item
      const isAnchor = href.startsWith('#')
      const isAbsolute = /^https?:\/\//iu.test(href)
      const shouldOpenExternal = isExternal || isAbsolute
      const itemClassName = variant === 'button' ? CTA_LINK_CLASSES : className
      const key = buildRuntimeKey('solar-nav-item', href, label, index)

      if (children.length > 0) {
        return <NavDropdown key={key} item={item} inSheet={inSheet} onNavigate={onNavigate} />
      }

      if (isAnchor) {
        return (
          <Link
            variant="primary"
            key={key}
            href={href}
            onClick={onNavigate}
            scroll={true}
            className={cn('btn site-header__link text-size-100 site-header__link--cta', itemClassName)}
          >
            <LinkInner>{label}</LinkInner>
          </Link>
        )
      }

      if (shouldOpenExternal) {
        return (
          <Link
            key={key}
            href={href}
            onClick={onNavigate}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('btn site-header__link text-size-100', itemClassName)}
          >
            <LinkInner>{label}</LinkInner>
          </Link>
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

/*
 * One phone link for the bar and the mobile sheet, so the two never drift
 * apart. In the bar it shrinks to the icon until there is room for the number.
 */
const PhoneLink = ({ inSheet = false }) => (
  <Link
    href={SITE_PHONE_HREF}
    aria-label={`Call ${SITE_PHONE_DISPLAY}`}
    className={cn('site-header__phone', inSheet && 'site-header__phone--sheet')}
  >
    <Phone className="site-header__phone-icon" strokeWidth={2} aria-hidden="true" />
    <span className="site-header__phone-number">{SITE_PHONE_DISPLAY}</span>
  </Link>
)

const Header = ({ navigation = EMPTY_NAVIGATION }) => {
  const [openNav, setOpenNav] = React.useState(false)
  const navItems = React.useMemo(() => resolveNavItems(navigation), [navigation])
  /* Button-variant items (the CTA pill) sit at the far right, after the phone link. */
  const linkItems = React.useMemo(() => navItems.filter((item) => item.variant !== 'button'), [navItems])
  const ctaItems = React.useMemo(() => navItems.filter((item) => item.variant === 'button'), [navItems])
  const closeNav = React.useCallback(() => setOpenNav(false), [])
  const innerRef = React.useRef(null)
  const measureRef = React.useRef(null)
  /*
   * Desktop "priority" nav: how many links fit in the bar. The rest move into
   * the menu sheet one at a time, from the right, as the bar narrows.
   * null until measured (and always on phones, where the sheet holds everything).
   */
  const [visibleCount, setVisibleCount] = React.useState(null)

  /*
   * Nav labels come from Sanity and change length, so instead of fixed
   * breakpoints the bar measures itself against a hidden copy of every link.
   */
  React.useLayoutEffect(() => {
    const inner = innerRef.current
    const measure = measureRef.current
    if (!inner || !measure) {
      return undefined
    }
    const update = () => {
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        setVisibleCount(null)
        return
      }
      const width = (selector) => inner.querySelector(selector)?.scrollWidth ?? 0
      const gap = Number.parseFloat(getComputedStyle(measure).columnGap) || 0
      const itemWidths = [...measure.children].map((child) => child.getBoundingClientRect().width)
      const fixed =
        width('.site-header__brand') +
        width('.site-header__actions .site-header__phone') +
        width('.site-header__cta') +
        NAV_FIT_SLACK
      const fits = (count, reserveToggle) => {
        const links = itemWidths.slice(0, count).reduce((sum, w) => sum + w, 0) + gap * Math.max(count - 1, 0)
        return fixed + links + (reserveToggle ? TOGGLE_WIDTH : 0) <= inner.clientWidth
      }
      let count = itemWidths.length
      if (!fits(count, false)) {
        while (count > 0 && !fits(count, true)) {
          count -= 1
        }
      }
      setVisibleCount(count)
      if (count === itemWidths.length) {
        setOpenNav(false)
      }
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [linkItems])

  const isDesktopMeasured = visibleCount !== null
  const barLinks = isDesktopMeasured ? linkItems.slice(0, visibleCount) : linkItems
  const overflowLinks = isDesktopMeasured ? linkItems.slice(visibleCount) : []
  const hasOverflow = overflowLinks.length > 0
  /* On desktop the sheet only holds the links that did not fit; on phones it holds everything. */
  const sheetItems = isDesktopMeasured ? overflowLinks : navItems

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
      className={cn('site-header', hasOverflow && 'site-header--overflow', openNav && 'site-header--open')}
      {...getDevSectionAttributes({
        content: 'Sanity site navigation with fallback links',
        id: 'site-header',
        markup: 'src/components/header.jsx',
      })}
    >
      <div className="site-header__bar">
        <p className="site-header__message">
          Not a roofing company: We're solar specialists, working with local roofers.
        </p>
        <div ref={innerRef} className="site-header__inner">
          <Link href="/" aria-label="Texas Solar & Roofing Pros - Home" className="site-header__brand">
            <Logo height={44} width={63} />
            <span className="sr-only">Texas Solar & Roofing Pros</span>
          </Link>
          <div className="site-header__nav">
            <NavList items={barLinks} />
          </div>
          {/* Hidden copy of every link, measured to decide how many fit in the bar. */}
          <div
            ref={measureRef}
            className="site-header__nav site-header__nav--measure"
            aria-hidden="true"
            inert
          >
            <NavList items={linkItems} />
          </div>
          <div className="site-header__actions">
            <PhoneLink />
            <div className="site-header__cta">
              <NavList items={ctaItems} />
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
      </div>

      <div
        id={MOBILE_MENU_ID}
        inert={!openNav}
        className={cn('site-header__sheet', openNav && 'site-header__sheet--open')}
      >
        <div className="site-header__sheet-clip">
          <div className="site-header__sheet-panel">
            <div className="site-header__sheet-list">
              <NavList items={sheetItems} inSheet onNavigate={closeNav} />
              {isDesktopMeasured ? null : <PhoneLink inSheet />}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
