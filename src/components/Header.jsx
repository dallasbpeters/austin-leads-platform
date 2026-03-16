'use client'

import Link from 'next/link'
import Logo from './Logo'
import { getDevSectionAttributes } from './dev/DevTrace'

import * as React from 'react'
import { Menu, Xmark } from 'iconoir-react'

import { Button } from './ui/button'
import { Collapsible, CollapsibleContent } from './ui/collapsible'

import { Separator } from './ui/separator'

const LINKS = [
  { href: '/solar', label: 'Solar' },
  { href: '/roofing', label: 'Roofing' },
  { href: '/services', label: 'All Services' },
  { href: '/hail-damage', label: 'Hail & Storm Damage' },
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'About Us' },
  { href: '#consultation', label: 'Contact', className: 'btn--primary text-white px-4 items-center! justify-center! h-11 md:h-9' },
]


function NavList() {
  return (
    <>
      {LINKS.map(({ label, href, className }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-start justify-start gap-2 px-2 py-2 font-semi-bold text-foreground text-sm hover:text-primary rounded-full hover:bg-transparent btn ${className}`}
        >
          {label}
        </Link>
      ))}
    </>
  )
}

export default function Header() {
  const [openNav, setOpenNav] = React.useState(false)
  const mobileMenuId = 'site-mobile-nav'

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpenNav(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return (
    <nav
      className="fixed max-w-7xl w-full mx-auto px-0 md:px-4 text-foreground left-[50%] sm:top-0 md:top-2 translate-x-[-50%] z-50"
      {...getDevSectionAttributes({
        id: 'site-header',
        markup: 'src/components/Header.jsx',
        content: 'local JSX nav and service catalog links',
      })}
    >
      <div className="w-full mx-auto px-4 md:px-3 md:px-6 py-4 bg-card rounded-none md:rounded-full shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" title="Texas Solar & Roofing Pros" className="grid items-center gap-2 grid-flow-col">
            <Logo />
            <div className="font-bold leading-none text-inherit sm:text-xs md:text-lg  type-accent">
              Texas Solar & Roofing Pros
            </div>
          </Link>
          <Separator orientation="vertical" className="hidden lg:block h-5 mx-1" />
          <div className="hidden lg:flex lg:items-center">
            <NavList />
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setOpenNav(!openNav)}
            className="lg:hidden ml-auto"
            aria-expanded={openNav}
            aria-controls={mobileMenuId}
            aria-label={openNav ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {openNav ? <Xmark className="size-6" /> : <Menu className="size-6" />}
          </Button>
        </div>
      </div>

      <Collapsible open={openNav}>
        {openNav ? (
          <CollapsibleContent
            id={mobileMenuId}
            className="w-full mx-auto px-4 py-2 bg-card border-b border-border md:border md:border-border rounded-none md:rounded-md shadow-sm"
          >
            <div className="mt-2 space-y-1 -translate-x-2">
              <NavList />
            </div>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
    </nav>
  )
}
