'use client'

import Link from 'next/link'
import Logo from './Logo'
import { getDevSectionAttributes } from './dev/DevTrace'

import * as React from 'react'
import { Menu, Xmark } from 'iconoir-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import Image from 'next/image'
import { mainServices, roofingServices, specialtyServices } from '@/lib/platform/service-catalog'

import { Button } from './ui/button'
import { Collapsible, CollapsibleContent } from './ui/collapsible'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu'
import { Separator } from './ui/separator'

const LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/hail-damage', label: 'Hail Damage' },
  { href: '/guides', label: 'Guides' },
  { href: '/about', label: 'About Us' },
]
const serviceIndex = [...mainServices, ...roofingServices, ...specialtyServices].reduce((acc, service) => {
  acc[service.slug] = service
  return acc
}, {})

function buildServiceMenuItem(slug) {
  const service = serviceIndex[slug]

  if (!service) return null

  return {
    title: service.title,
    description: service.menuDescription || service.body,
    href: `/services/${service.slug}`,
  }
}

const SOLAR_ITEMS = [
  buildServiceMenuItem('solar-and-battery-installations'),
  buildServiceMenuItem('energy-audits'),
  buildServiceMenuItem('detach-and-reset'),
  {
    title: 'All Services',
    description: 'Compare the full service lineup and pick the right starting point for the house.',
    href: '/services',
  },
].filter(Boolean)

const ROOFING_ITEMS = [
  buildServiceMenuItem('shingle-roofing'),
  buildServiceMenuItem('metal-roofing'),
  buildServiceMenuItem('storm-damage-restoration'),
  buildServiceMenuItem('commercial-roofing'),
  buildServiceMenuItem('hail-and-wind-damage-roof-inspection'),
].filter(Boolean)

function NavList() {
  return (
    <>
      {LINKS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className="btn text-foreground hover:text-primary font-semi-bold flex items-start justify-start gap-2 rounded-md px-3 py-2 text-sm hover:bg-transparent"
        >
          {label}
        </Link>
      ))}
    </>
  )
}
function MenuItem({ title, description, href }) {
  return (
    <Link
      href={href}
      className="hover:text-primary flex flex-col items-start rounded-md py-2 px-3 hover:bg-transparent"
    >
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
    </Link>
  )
}
export default function Header() {
  const [openNav, setOpenNav] = React.useState(false)
  const mobileMenuId = React.useId()

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpenNav(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return (
    <nav
      className="fixed top-2 left-[50%] z-50 mx-auto w-full max-w-7xl translate-x-[-50%] px-4"
      {...getDevSectionAttributes({
        id: 'site-header',
        markup: 'src/components/Header.jsx',
        content: 'local JSX nav and service catalog links',
      })}
    >
      <div className="bg-card mx-auto w-full rounded-full px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Link href="/" title="Texas Solar & Roofing Pros" className="grid grid-flow-col items-center gap-2">
            <Logo />
            <div className="type-accent sm:text-md text-lg leading-none font-bold text-foreground">
              Texas Solar & Roofing Pros
            </div>
          </Link>
          <Separator orientation="vertical" className="mx-1 hidden h-5 lg:block" />
          <div className="hidden lg:flex lg:items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto px-3 py-2">Solar</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-150 grid-cols-5 gap-3 p-2">
                      <Image
                        src="/images/solar-install.png"
                        alt="Solar services"
                        width={250}
                        height={400}
                        className="col-span-2 h-full rounded-md object-cover"
                      />
                      <div className="col-span-3 space-y-1">
                        {SOLAR_ITEMS.map((item) => (
                          <MenuItem key={item.href} {...item} />
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto px-3 py-2">Roofing</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-150 grid-cols-5 gap-3 p-2">
                      <Image
                        src="/images/roof-install.png"
                        alt="Roofing services"
                        width={250}
                        height={300}
                        className="col-span-2 h-full rounded-md object-cover"
                      />
                      <div className="col-span-3 space-y-1">
                        {ROOFING_ITEMS.map((item) => (
                          <MenuItem key={item.href} {...item} />
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <NavList />
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setOpenNav(!openNav)}
            className="mr-2 ml-auto lg:hidden"
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
            className="bg-card border-border mx-auto w-full rounded-md border px-4 py-2 shadow-sm"
          >
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="solar-pages" className="border-none">
                <AccordionTrigger className="btn p-0 hover:no-underline">
                  <div className="flex w-full items-center gap-2 rounded-md px-3 py-2">
                    <span className="text-sm font-semibold">Solar</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="space-y-1">
                    {SOLAR_ITEMS.map((item) => (
                      <MenuItem key={item.href} {...item} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="roofing-pages" className="border-none">
                <AccordionTrigger className="btn p-0 hover:no-underline">
                  <div className="flex w-full items-center gap-2 rounded-md px-3 py-2">
                    <span className="text-sm font-semibold">Roofing</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="space-y-1">
                    {ROOFING_ITEMS.map((item) => (
                      <MenuItem key={item.href} {...item} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-2 space-y-1">
              <NavList />
            </div>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
    </nav>
  )
}
