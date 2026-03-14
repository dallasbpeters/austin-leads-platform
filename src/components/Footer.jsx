'use client'

import Link from 'next/link'
import { DotArrowUp } from 'iconoir-react'
import { AutoSizedText } from '@/components/autoSizedText'

import { mainServices, roofingServices } from '@/lib/platform/service-catalog'

import { getDevSectionAttributes } from './dev/DevTrace'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer
      className="bg-secondary-950 w-full border-t border-white/10 text-white relative overflow-hidden"
      {...getDevSectionAttributes({
        id: 'site-footer',
        markup: 'src/components/Footer.jsx',
        content: 'local JSX footer + service catalog links',
      })}
    >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 z-2">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-xl font-bold"
              >
                <Logo className="h-12 w-auto" />
                Texas Solar & Roofing Pros
              </Link>
              <p className="mt-3 max-w-md text-sm text-gray-300">
              Full-service roofing, solar installation, storm damage restoration, and energy efficiency upgrades for Texas homeowners.
              </p>
              <div className="mt-4">
                <h2 className="text-sm">Contact</h2>
                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                  <li>
                    <a href="mailto:info@texassolarandroofingpros.com" className="hover:text-gray-200">
                      info@texassolarandroofingpros.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h2 className="text-sm">Services</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {mainServices.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} className="hover:text-gray-200">
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div>
                <h2 className="text-sm">Roofing</h2>
                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                  {roofingServices.map((service) => (
                    <li key={service.slug}>
                      <Link href={`/services/${service.slug}`} className="hover:text-gray-200">
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-start md:items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-300">
              © Texas Solar & Roofing Pros. All rights reserved.
              <span id="year"> 2026</span>
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link href="/services" className="hover:text-gray-300 text-gray-300">
                Services
              </Link>
              <Link href="/guides" className="hover:text-gray-300 text-gray-300">
                Guides
              </Link>
              <Link href="/terms" className="hover:text-gray-300 text-gray-300">
                Terms
              </Link>
              <Link href="/privacy-policy" className="hover:text-gray-300 text-gray-300">
                Privacy
              </Link>
              <Link href="/" className="inline-flex items-center gap-1 hover:text-gray-300 text-gray-300">
                Back to top
                <DotArrowUp className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
        <AutoSizedText tabIndex={-1} className="table text-white/6 absolute left-0 bottom-10 text-center whitespace-nowrap leading-2 aria-hidden pointer-events-none font-extrabold tracking-tight">Texas Solar & Roofing</AutoSizedText>
    </footer>
  )
}
