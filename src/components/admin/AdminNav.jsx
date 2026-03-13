'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, Globe2, ImagePlus, LayoutDashboard, PenSquare, TrendingUp, UsersRound } from 'lucide-react'

import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/crm', label: 'CRM', icon: UsersRound },
  { href: '/hero-pages', label: 'Hero Pages', icon: ImagePlus },
  { href: '/publish', label: 'Publish', icon: PenSquare },
  { href: '/domains', label: 'Domains', icon: Globe2 },
  { href: '/studio', label: 'Studio', icon: Bot },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-4">
      <div>
        <div className="text-muted-foreground mb-1 px-3 text-xs font-medium tracking-[0.18em] uppercase">
          Overview
        </div>
        {items.slice(0, 2).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div>
        <div className="text-muted-foreground mb-1 px-3 text-xs font-medium tracking-[0.18em] uppercase">
          Workspace
        </div>
        {items.slice(2).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
