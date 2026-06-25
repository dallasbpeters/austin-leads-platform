'use client'

import { Menu, Xmark } from 'iconoir-react'
import Link from 'next/link'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { getDevSectionAttributes } from './dev/dev-trace'
import Logo from './logo'

const LINKS = [
  { href: '/solar', label: 'Solar' },
  { href: '/roofing', label: 'Roofing' },
  { href: '/services', label: 'All Services' },
  { href: '/hail-damage', label: 'Hail & Storm Damage' },
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'About Us' },
  {
    className: 'btn--primary text-white px-4 items-center! justify-center! h-11 md:h-9 hover:bg-primary/80',
    href: '#consultation',
    label: 'Contact',
  },
]

function NavList({ onNavigate }) {
  return (
    <>
      {LINKS.map(({ label, href, className }) =>
        href.startsWith('#') ? (
          <Button
            variant="primary"
            key={href}
            href={href}
            onClick={onNavigate}
            className={`font-wght-500 medium text-foreground btn flex items-start justify-start gap-2 rounded-full px-6 py-5.5 text-[1rem] hover:text-white hover:brightness-125 ${className}`}
          >
            <span
              data-slot="button-inner"
              className="inline-flex max-w-full min-w-fit items-center justify-center gap-[inherit]"
            >
              {label}
            </span>
          </Button>
        ) : (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`font-wght-450 medium text-foreground hover:text-primary btn text-md flex items-start justify-start gap-2 rounded-full px-2 py-4 hover:bg-transparent ${className}`}
          >
            <span
              data-slot="button-inner"
              className="inline-flex max-w-full min-w-fit items-center justify-center gap-[inherit]"
            >
              {label}
            </span>
          </Link>
        ),
      )}
    </>
  )
}

export default function Header() {
  const [openNav, setOpenNav] = React.useState(false)
  const [, setConsultationInView] = React.useState(false)
  const mobileMenuId = 'site-mobile-nav'

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpenNav(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    const section = document.querySelector('#consultation')

    if (!section || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setConsultationInView(entries.some((entry) => entry.isIntersecting))
      },
      {
        threshold: 0.1,
      },
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <nav
        id="site-top"
        className="site-header text-foreground fixed left-[50%] z-50 mx-auto w-full max-w-400 -translate-x-1/2 transform px-0 sm:top-0 md:top-2 md:px-4"
        {...getDevSectionAttributes({
          content: 'local JSX nav and service catalog links',
          id: 'site-header',
          markup: 'src/components/header.jsx',
        })}
      >
        <div
          className={`mx-auto w-full rounded-none bg-stone-100 px-7 py-4 shadow-md backdrop-blur-sm ${
            openNav ? 'md:rounded-tl-lg md:rounded-tr-lg' : 'md:rounded-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              aria-label="Texas Solar & Roofing Pros - Home"
              className="grid grid-flow-col items-center gap-2"
            >
              <Logo height={60} width={80} />
              <span className="sr-only">Texas Solar & Roofing Pros</span>
            </Link>
            <Separator orientation="vertical" className="mx-1 hidden h-5 lg:block" />
            <div className="hidden lg:flex lg:items-center">
              <NavList />
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
          className={`relative z-100 overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
            openNav ? 'max-h-128 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-border md:border-border mx-auto w-full rounded-none border-b bg-stone-100 px-4 py-2 pb-8 shadow-sm md:rounded-br-lg md:rounded-bl-lg md:border">
            <div
              className={`mt-2 space-y-1 transition-all duration-200 ${
                openNav ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
              }`}
            >
              <NavList onNavigate={() => setOpenNav(false)} />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
