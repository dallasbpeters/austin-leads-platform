'use client'

import { Menu, Phone, Xmark } from 'iconoir-react'
import Link from 'next/link'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { SITE_PHONE_DISPLAY, SITE_PHONE_HREF } from '@/lib/platform/contact'
import { buildRuntimeKey, cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'

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

const CONTACT_LINK_CLASSES =
  'btn--primary text-white px-4 items-center! justify-center! h-11 md:h-9 hover:bg-primary/80'
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

const NavList = ({ items, onNavigate }) => (
  <>
    {items.map(({ label, href, className, isExternal, variant }, index) => {
      const isAnchor = href.startsWith('#')
      const isAbsolute = /^https?:\/\//iu.test(href)
      const shouldOpenExternal = isExternal || isAbsolute
      const itemClassName = variant === 'button' ? CONTACT_LINK_CLASSES : className
      const key = buildRuntimeKey('solar-nav-item', href, label, index)

      if (isAnchor) {
        return (
          <Button
            variant="primary"
            key={key}
            href={href}
            onClick={onNavigate}
            className={`font-wght-500 medium text-foreground btn flex items-start justify-start gap-2 rounded-full px-6 py-5.5 text-[1rem] hover:text-white hover:brightness-125 ${itemClassName}`}
          >
            <span
              data-slot="button-inner"
              className="inline-flex max-w-full min-w-fit items-center justify-center gap-[inherit]"
            >
              {label}
            </span>
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
            className={`font-wght-450 medium text-foreground hover:text-primary btn text-md flex items-start justify-start gap-2 rounded-full px-2 py-4 hover:bg-transparent ${itemClassName}`}
          >
            <span
              data-slot="button-inner"
              className="inline-flex max-w-full min-w-fit items-center justify-center gap-[inherit]"
            >
              {label}
            </span>
          </a>
        )
      }

      return (
        <Link
          key={key}
          href={href}
          onClick={onNavigate}
          className={`font-wght-450 medium text-foreground hover:text-primary btn text-md flex items-start justify-start gap-2 rounded-full px-2 py-4 hover:bg-transparent ${itemClassName}`}
        >
          <span
            data-slot="button-inner"
            className="inline-flex max-w-full min-w-fit items-center justify-center gap-[inherit]"
          >
            {label}
          </span>
        </Link>
      )
    })}
  </>
)

/*
 * One phone link for both the desktop bar and the mobile sheet, so the two
 * never drift apart in weight, colour or hover treatment. The mobile sheet
 * passes a `prefix` so the number reads as an instruction ("Call us") on a
 * small screen where the icon alone is easy to miss.
 */
const PhoneLink = ({ className = '', prefix = null }) => (
  <a
    href={SITE_PHONE_HREF}
    className={`text-primary decoration-primary/40 hover:decoration-primary focus-visible:ring-secondary inline-flex items-center gap-2 rounded-full px-2 font-bold underline decoration-1 underline-offset-4 transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none ${className}`}
  >
    <Phone className="size-4 shrink-0 text-(--color-voodoo)" aria-hidden="true" />
    <span>
      {prefix ? `${prefix} ` : null}
      {SITE_PHONE_DISPLAY}
    </span>
  </a>
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
      className="site-header text-foreground fixed left-0 z-50 mx-auto w-full px-0 sm:top-0"
      {...getDevSectionAttributes({
        content: 'Sanity site navigation with fallback links',
        id: 'site-header',
        markup: 'src/components/header.jsx',
      })}
    >
      <div className="mx-auto flex w-full justify-center rounded-none bg-(--color-warm-bg) px-7 py-4 shadow-md backdrop-blur-sm md:rounded-br-sm md:rounded-bl-sm">
        <div className="relative flex w-full max-w-310 items-center justify-between">
          <Link
            href="/"
            aria-label="Texas Solar & Roofing Pros - Home"
            className="grid grid-flow-col items-center gap-2"
          >
            <Logo height={60} width={80} />
            <span className="sr-only">Texas Solar & Roofing Pros</span>
          </Link>
          <div className="hidden gap-3 lg:flex lg:items-center">
            <NavList items={navItems} />
            <PhoneLink className="py-2" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setOpenNav((current) => !current)}
            className="ml-auto px-6 py-5.5 hover:bg-transparent! lg:hidden"
            aria-expanded={openNav}
            aria-controls={MOBILE_MENU_ID}
            aria-label={openNav ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {openNav ? <Xmark className="size-6" /> : <Menu className="size-6" />}
          </Button>
        </div>
      </div>

      {/*
        The sheet animates grid-template-rows rather than max-height, so the
        open height is always exact and the browser never guesses a cap.
        `inert` keeps the hidden links out of the tab order while closed.
      */}
      <div
        id={MOBILE_MENU_ID}
        inert={!openNav}
        className={`relative z-100 grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          openNav ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-border mx-auto w-full rounded-none border-b bg-(--color-surface) px-4 py-2 pb-8 shadow-sm md:rounded-br-lg md:rounded-bl-lg md:border">
            <div
              className={`mt-2 space-y-1 transition-[transform,opacity] duration-200 motion-reduce:transition-none ${
                openNav ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              <NavList items={navItems} onNavigate={closeNav} />
              <PhoneLink className="w-full justify-start rounded-md py-4" prefix="Call us:" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
