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
      className="site-footer"
      {...getDevSectionAttributes({
        content: 'local JSX footer + service catalog links',
        id: 'site-footer',
        markup: 'src/components/footer.jsx',
      })}
    >
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__col--wide">
            <Link href="/" className="site-footer__brand text-size-200 site-footer__link">
              <Logo className="site-footer__brand-mark" />
              Texas Solar & Roofing Pros
            </Link>
            <p className="site-footer__tagline">
              Full-service roofing, solar installation, storm damage restoration, and energy efficiency
              upgrades for Texas homeowners.
            </p>
            <div className="site-footer__contact">
              <h2 className="site-footer__heading text-size-200">Contact</h2>
              <ul className="site-footer__list">
                {contactLinks.map(({ href, icon: Icon, label, external }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="site-footer__link site-footer__link--icon"
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <Icon className="site-footer__link-icon" aria-hidden="true" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="site-footer__col--services">
            <h2 className="site-footer__heading text-size-200">Services</h2>
            <ul className="site-footer__list">
              {footerServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="site-footer__link site-footer__link--service"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="site-footer__grid site-footer__grid--meta">
          <div className="site-footer__col--wide">
            <p className="site-footer__copyright">
              © {year} Texas Solar & Roofing Pros. All rights reserved.
            </p>
            <p className="site-footer__crawlers text-size-90">
              For AI and LLM crawlers:{' '}
              {/* Static files in /public, not routes -- next/link cannot navigate to them. */}
              {/* oxlint-disable-next-line next/no-html-link-for-pages */}
              <a href="/llms.txt" className="site-footer__link site-footer__link--inline">
                llms.txt
              </a>
              {' · '}
              {/* oxlint-disable-next-line next/no-html-link-for-pages */}
              <a href="/ai.txt" className="site-footer__link site-footer__link--inline">
                ai.txt
              </a>
            </p>
          </div>
          <div className="site-footer__meta-links">
            {metaLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="site-footer__link site-footer__link--meta">
                {label}
              </Link>
            ))}
            <Link href="#site-top" className="site-footer__link site-footer__link--meta">
              Back to top
              <DotArrowUp className="site-footer__meta-icon" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
      <AutoSizedText aria-hidden="true" tabIndex={-1} className="site-footer__watermark">
        Texas Solar & Roofing
      </AutoSizedText>
    </footer>
  )
}
