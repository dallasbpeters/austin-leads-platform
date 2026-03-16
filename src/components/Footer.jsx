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
      className="relative w-full text-white bg-secondary-950 border-t border-white/10 overflow-hidden"
      {...getDevSectionAttributes({
        id: 'site-footer',
        markup: 'src/components/Footer.jsx',
        content: 'local JSX footer + service catalog links',
      })}
    >
      <div className="max-w-7xl mx-auto px-4 py-12 lg:px-8 sm:px-3 md:px-6 z-2">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Logo className="h-12 w-auto" />
              Texas Solar & Roofing Pros
            </Link>
            <p className="max-w-md mt-3 text-gray-300 text-sm">
              Full-service roofing, solar installation, storm damage restoration, and energy efficiency
              upgrades for Texas homeowners.
            </p>
            <div className="mt-4">
              <h2 className="text-sm">Contact</h2>
              <ul className="mt-3 space-y-2 text-gray-300 text-sm">
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
            <ul className="mt-3 space-y-2 text-gray-300 text-sm">
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
              <ul className="mt-3 space-y-2 text-gray-300 text-sm">
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
        <div className="flex flex-col sm:flex-row items-start justify-between md:items-center gap-4 mt-10">
          <p className="text-gray-300 text-sm">
            © Texas Solar & Roofing Pros. All rights reserved.
            <span id="year"> 2026</span>
          </p>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <Link href="/services" className="text-gray-300 hover:text-gray-300">
              Services
            </Link>
            <Link href="/guides" className="text-gray-300 hover:text-gray-300">
              Guides
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-gray-300">
              Terms
            </Link>
            <Link href="/privacy-policy" className="text-gray-300 hover:text-gray-300">
              Privacy
            </Link>
            <Link href="/" className="items-center gap-1 text-gray-300 hover:text-gray-300 inline-flex">
              Back to top
              <DotArrowUp className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
      <AutoSizedText
        tabIndex={-1}
        className="absolute font-extrabold leading-2 text-center text-white/6 tracking-tight aria-hidden bottom-10 left-0 pointer-events-none table whitespace-nowrap"
      >
        Texas Solar & Roofing
      </AutoSizedText>
    </footer>
  )
}
