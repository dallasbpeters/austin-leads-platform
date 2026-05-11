'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bot,
  Globe2,
  ImagePlus,
  LayoutDashboard,
  PenSquare,
  Settings2,
  Sparkles,
  TrendingUp,
  UsersRound,
} from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const overviewItems = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics',  label: 'Analytics',  icon: TrendingUp },
]

const workspaceItems = [
  { href: '/crm',        label: 'CRM',        icon: UsersRound },
  { href: '/hero-pages', label: 'Hero Pages',  icon: ImagePlus },
  { href: '/publish',    label: 'Publish',     icon: PenSquare },
  { href: '/domains',    label: 'Domains',     icon: Globe2 },
  { href: '/settings',   label: 'Settings',    icon: Settings2 },
  { href: '/studio',     label: 'Studio',      icon: Bot },
  { href: '/',           label: 'Live Site',   icon: Globe2 },
]

const christmasItems = [
  { href: '/christmas',        label: 'Jobs',  icon: UsersRound },
  { href: '/christmas/slots',  label: 'Slots', icon: Sparkles },
]

function NavGroup({ label, items }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ href, label: itemLabel, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={active} tooltip={itemLabel}>
                  <Link href={href}>
                    <Icon />
                    <span>{itemLabel}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default function AdminNav() {
  return (
    <>
      <NavGroup label="Overview"         items={overviewItems} />
      <NavGroup label="Workspace"        items={workspaceItems} />
      <NavGroup label="Christmas Lights" items={christmasItems} />
    </>
  )
}
