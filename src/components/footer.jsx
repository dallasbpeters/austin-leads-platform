'use client'

import { DotArrowUp, Facebook, Mail, Phone } from 'iconoir-react'
import Link from 'next/link'

import { AutoSizedText } from '@/components/auto-sized-text'
import { SITE_EMAIL, SITE_FACEBOOK_URL, SITE_PHONE_DISPLAY, SITE_PHONE_HREF } from '@/lib/platform/contact'
import { mainServices, roofingServices } from '@/lib/platform/service-catalog'

import { getDevSectionAttributes } from './dev/dev-trace'
import Logo from './logo'

const footerServices = [
  ...roofingServices,
  ...mainServices.filter((service) => service.slug === 'solar-and-battery-installations'),
]

/*
 * Footer text sits on the darkest primary tint, so every link shares one
 * treatment: inherit the pale primary tone at rest and step up to white on
 * hover or focus. The ring uses the brand secondary so it reads on navy.
 */
const FOOTER_LINK_CLASSES =
  'rounded-sm transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none'
const FOOTER_ICON_LINK_CLASSES = `inline-flex items-center gap-2 py-1 ${FOOTER_LINK_CLASSES}`
const FOOTER_META_LINK_CLASSES = `inline-flex min-h-11 items-center ${FOOTER_LINK_CLASSES}`

const contactLinks = [
  { href: SITE_PHONE_HREF, icon: Phone, label: SITE_PHONE_DISPLAY },
  { href: `mailto:${SITE_EMAIL}`, icon: Mail, label: SITE_EMAIL },
  { href: SITE_FACEBOOK_URL, icon: Facebook, label: 'Follow us on Facebook', external: true },
]

const metaLinks = [
  { href: '/services', label: 'Services' },
  { href: '/guides', label: 'Guides' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy-policy', label: 'Privacy' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="bg-primary relative w-full overflow-hidden border-t border-white/10 text-(--color-primary-200)"
      {...getDevSectionAttributes({
        content: 'local JSX footer + service catalog links',
        id: 'site-footer',
        markup: 'src/components/footer.jsx',
      })}
    >
      <div className="z-2 mx-auto max-w-7xl px-4 py-12 sm:px-3 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Link
              href="/"
              className={`flex w-fit items-center gap-2 rounded-md text-xl font-bold text-white ${FOOTER_LINK_CLASSES}`}
            >
              <Logo className="size-28 w-auto p-2" />
              Texas Solar & Roofing Pros
            </Link>
            <p className="text-md mt-3 max-w-md text-inherit">
              Full-service roofing, solar installation, storm damage restoration, and energy efficiency
              upgrades for Texas homeowners.
            </p>
            <div className="mt-4">
              <h3 className="text-xl text-white">Contact</h3>
              <ul className="text-md mt-3 space-y-2 text-inherit">
                {contactLinks.map(({ href, icon: Icon, label, external }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className={FOOTER_ICON_LINK_CLASSES}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="md:mt-11">
            <h3 className="text-xl text-white">Services</h3>
            <ul className="text-md mt-3 space-y-2 text-inherit">
              {footerServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className={`inline-block py-0.5 ${FOOTER_LINK_CLASSES}`}
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-md text-inherit">© {year} Texas Solar & Roofing Pros. All rights reserved.</p>
            <p className="mt-2 text-sm text-(--color-primary-200)/70">
              For AI and LLM crawlers:{' '}
              {/* Static files in /public, not routes -- next/link cannot navigate to them. */}
              {/* oxlint-disable-next-line next/no-html-link-for-pages */}
              <a href="/llms.txt" className={`underline underline-offset-2 ${FOOTER_LINK_CLASSES}`}>
                llms.txt
              </a>
              {' · '}
              {/* oxlint-disable-next-line next/no-html-link-for-pages */}
              <a href="/ai.txt" className={`underline underline-offset-2 ${FOOTER_LINK_CLASSES}`}>
                ai.txt
              </a>
            </p>
          </div>
          <div className="text-md flex flex-wrap items-center gap-x-3 gap-y-1 md:col-span-1">
            {metaLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={FOOTER_META_LINK_CLASSES}>
                {label}
              </Link>
            ))}
            <Link href="#site-top" className={`gap-1 text-nowrap ${FOOTER_META_LINK_CLASSES}`}>
              Back to top
              <DotArrowUp className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
      <AutoSizedText
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute bottom-10 left-0 table text-center leading-2 font-extrabold tracking-normal whitespace-nowrap text-white/6"
      >
        Texas Solar & Roofing
      </AutoSizedText>
    </footer>
  )
}
