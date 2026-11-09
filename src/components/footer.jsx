'use client'

import { DotArrowUp, NavArrowRight } from 'iconoir-react'
import Image from 'next/image'
import Link from 'next/link'

import {
  SITE_EMAIL,
  SITE_FACEBOOK_URL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_HREF,
  SITE_TIKTOK_URL,
} from '@/lib/platform/contact'
import { mainServices, roofingServices } from '@/lib/platform/service-catalog'

import { getDevSectionAttributes } from './dev/dev-trace'

const footerServices = [
  ...roofingServices,
  ...mainServices.filter((service) => service.slug === 'solar-and-battery-installations'),
].map((service) => ({ href: `/services/${service.slug}`, label: service.title }))

const linkGroups = [
  { heading: 'Services', links: footerServices },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'Why Texas Solar & Roofing Pros' },
      { href: '/roofing-partners', label: 'Our roofing pros' },
      { href: '/projects', label: 'Projects' },
      { href: '/guides', label: 'Guides' },
    ],
  },
  {
    heading: 'Get started',
    links: [
      { href: '/solar-costs', label: 'See if solar is right for you' },
      { href: '/hail-damage', label: 'Hail & storm damage' },
      { href: '#consultation', label: 'Free estimate' },
    ],
  },
  {
    heading: 'Follow',
    links: [
      { href: 'https://www.instagram.com/texassolarandroofingpros/', label: 'Instagram', external: true },
      { href: SITE_FACEBOOK_URL, label: 'Facebook', external: true },
      { href: SITE_TIKTOK_URL, label: 'TikTok', external: true },
    ],
  },
]

const metaLinks = [
  { href: '/privacy-policy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

const externalProps = (external) => (external ? { target: '_blank', rel: 'noopener noreferrer' } : {})

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
        <div className="site-footer__cta">
          <h2 className="site-footer__title">A system that pays you back.</h2>
          <p className="site-footer__intro">
            Free estimate, no pressure, no commitment. We serve homeowners across Central Texas.
          </p>
          <div className="site-footer__actions">
            <Link href="#consultation" className="site-footer__button site-footer__button--light">
              Get a free estimate
              <NavArrowRight className="site-footer__button-icon" aria-hidden="true" />
            </Link>
            <Link href="/solar-costs" className="site-footer__button">
              Run the numbers
              <NavArrowRight className="site-footer__button-icon" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <nav className="site-footer__groups" aria-label="Footer">
          {linkGroups.map((group) => (
            <div key={group.heading} className="site-footer__group">
              <h3 className="site-footer__heading">{group.heading}</h3>
              <ul className="site-footer__list">
                {group.links.map(({ href, label, external }) => (
                  <li key={href}>
                    <Link href={href} className="site-footer__link" {...externalProps(external)}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="site-footer__contact">
          <a href={`mailto:${SITE_EMAIL}`} className="site-footer__link site-footer__email">
            {SITE_EMAIL}
          </a>
          <div className="site-footer__contact-meta">
            <a href={SITE_PHONE_HREF} className="site-footer__link site-footer__phone">
              {SITE_PHONE_DISPLAY}
            </a>
            <p className="site-footer__muted">TECL 41840 · TDRL Residential Solar Retailer #46</p>
          </div>
          <a
            href="https://www.bbb.org/us/tx/cedar-park/profile/solar-energy-contractors/texas-solar-and-roofing-pros-llc-0825-1000263664/#sealclick"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="site-footer__seal"
          >
            <Image
              src="https://m.bbb.org/brand/seals/Accredited_Business_Seal_Rating_RGB.svg?tx=w_340,dpr_2.0"
              height={65}
              width={110}
              alt="Texas Solar and Roofing Pros LLC BBB Business Review"
            />
          </a>
        </div>

        <p className="site-footer__wordmark" aria-hidden="true">
          <span className="site-footer__wordmark-text">Texas Solar & Roofing Pros</span>
        </p>

        <div className="site-footer__meta">
          <div className="site-footer__meta-links">
            {metaLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="site-footer__link">
                {label}
              </Link>
            ))}
            {/* Static files in /public, not routes -- next/link cannot navigate to them. */}
            {/* oxlint-disable-next-line next/no-html-link-for-pages */}
            <a href="/llms.txt" className="site-footer__link">
              llms.txt
            </a>
            {/* oxlint-disable-next-line next/no-html-link-for-pages */}
            <a href="/ai.txt" className="site-footer__link">
              ai.txt
            </a>
          </div>
          <p className="site-footer__muted">© {year} Texas Solar & Roofing Pros. All rights reserved.</p>
          <Link href="#site-top" className="site-footer__link site-footer__top">
            Back to top
            <DotArrowUp className="site-footer__button-icon" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
