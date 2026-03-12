import Link from 'next/link'
import { Iconoir } from 'iconoir-react'

import { mainServices, roofingServices, specialtyServices } from '@/lib/platform/service-catalog'

import { getDevSectionAttributes } from './dev/DevTrace'
import Logo from './Logo'

export default function Footer() {
  return (
    <div
      className="bg-secondary-950 w-full border-t border-white/10 text-white"
      {...getDevSectionAttributes({
        id: 'site-footer',
        markup: 'src/components/Footer.jsx',
        content: 'local JSX footer + service catalog links',
      })}
    >
      <footer>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <Logo className="h-8 w-auto" />
                Texas Solar & Roofing Pros
              </Link>
              <p className="mt-3 max-w-md text-sm text-gray-400">
                Texas Solar & Roofing Pros helps homeowners sort through roofing, energy efficiency, storm
                damage, and solar decisions without the usual generic sales pitch.
              </p>
              <div className="mt-4">
                <h4 className="text-sm">Contact</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="mailto:info@texassolarandroofingpros.com" className="hover:text-gray-200">
                      info@texassolarandroofingpros.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-sm">Services</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
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
                <h4 className="text-sm">Roofing</h4>
                <ul className="mt-3 space-y-2 text-sm text-gray-400">
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
          <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              © Texas Solar & Roofing Pros. All rights reserved.
              <span id="year">2025</span>
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link href="/services" className="hover:text-gray-300">
                Services
              </Link>
              <Link href="/guides" className="hover:text-gray-300">
                Guides
              </Link>
              <a href="#" className="hover:text-gray-300">
                Terms
              </a>
              <a href="#" className="hover:text-gray-300">
                Privacy
              </a>
              <Link href="/" className="inline-flex items-center gap-1 hover:text-gray-300">
                Back to top
                <Iconoir name="priority-up" className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
