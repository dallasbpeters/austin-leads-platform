'use client'

import { useState } from 'react'
import Logo from './Logo'

const links = [
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#costs', label: 'Cost & Savings' },
  { href: '#incentives', label: 'Incentives' },
  { href: '#go-deeper', label: 'Guides' },
  { href: '#resources', label: 'Resources' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed -inset-x-3 top-3 z-50 text-sm font-medium">
      <div className="shadow-solar-xl border-solar mx-auto flex w-[min(80rem,calc(100%-3rem))] items-center justify-between gap-4 rounded-full border bg-white px-6 py-4">
        <div className="grid grid-flow-col items-center gap-2">
          <Logo />
          <div className="type-accent text-solar-slate-950 text-base font-semibold leading-none">Austin Solar Pros</div>
        </div>

        <div className="hidden gap-8 md:flex">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="type-accent hover-text-solar-primary text-solar-slate-950 font-semibold transition-colors duration-150">
              {link.label}
            </a>
          ))}
        </div>

        <button className="text-solar-slate-950 inline-flex border-0 bg-transparent p-0 md:hidden" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <iconify-icon icon="solar:hamburger-menu-linear" class="text-[2rem]"></iconify-icon>
        </button>
      </div>

      {open ? (
        <div className="shadow-solar-xl mx-auto mt-3 flex w-[min(80rem,calc(100%-3rem))] flex-col gap-3 rounded-lg bg-white p-4 md:hidden">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="type-accent hover-text-solar-primary text-solar-slate-950 font-semibold transition-colors duration-150" onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </nav>
  )
}
