'use client'

import {
  Bot,
  FileSignature,
  Globe2,
  ImagePlus,
  LayoutDashboard,
  PenSquare,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const overviewItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
]

const workspaceItems = [
  { href: '/crm', label: 'CRM', icon: UsersRound },
  { href: '/clients', label: 'Clients', icon: UsersRound },
  { href: '/hero-pages', label: 'Hero Pages', icon: ImagePlus },
  { href: '/publish', label: 'Publish', icon: PenSquare },
  { href: '/documents', label: 'Documents', icon: FileSignature },
  { href: '/domains', label: 'Domains', icon: Globe2 },
  { href: '/users', label: 'Users', icon: ShieldCheck },
  { href: '/settings', label: 'Settings', icon: Settings2 },
  { href: '/studio', label: 'Studio', icon: Bot },
  { href: '/', label: 'Live Site', icon: Globe2 },
]
const nestedItems = [{ href: '/documents/history', label: 'History', icon: PenSquare }]

const christmasItems = [
  { href: '/christmas', label: 'Jobs', icon: UsersRound },
  { href: '/christmas/slots', label: 'Slots', icon: Sparkles },
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
            const subItemsForHref = href === '/documents' ? nestedItems : []
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={active} tooltip={itemLabel}>
                  <Link href={href}>
                    <Icon aria-hidden="true" />
                    <span>{itemLabel}</span>
                  </Link>
                </SidebarMenuButton>
                {active && subItemsForHref.length ? (
                  <SidebarMenuSub>
                    {subItemsForHref.map(({ href: nestedHref, label: nestedLabel, icon: NestedIcon }) => (
                      <SidebarMenuSubItem key={nestedHref}>
                        <SidebarMenuButton asChild isActive={pathname === nestedHref}>
                          <Link href={nestedHref}>
                            <NestedIcon aria-hidden="true" />
                            <span>{nestedLabel}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
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
      <NavGroup label="Overview" items={overviewItems} />
      <NavGroup label="Workspace" items={workspaceItems} />
      <NavGroup label="Christmas Lights" items={christmasItems} />
    </>
  )
}
