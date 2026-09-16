'use client'

import {
  Bot,
  Camera,
  Clapperboard,
  FileSignature,
  FileText,
  Globe2,
  ImagePlus,
  LayoutDashboard,
  PenSquare,
  Settings2,
  Share2,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { isQuotesRole } from '@/lib/auth/roles'

const overviewItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
]

const workspaceItems = [
  { href: '/crm', label: 'CRM', icon: UsersRound },
  { href: '/quotes', label: 'Quotes', icon: FileSignature },
  { href: '/clients', label: 'Clients', icon: UsersRound },
  { href: '/hero-pages', label: 'Hero Pages', icon: ImagePlus },
  { href: '/publish', label: 'Publish', icon: PenSquare },
  { href: '/videos', label: 'Videos', icon: Clapperboard },
  { href: '/social', label: 'Social accounts', icon: Share2 },
  { href: '/documents', label: 'Documents', icon: FileSignature },
  { href: '/domains', label: 'Domains', icon: Globe2 },
  { href: '/users', label: 'Users', icon: ShieldCheck },
  { href: '/settings', label: 'Settings', icon: Settings2 },
  { href: '/studio', label: 'Studio', icon: Bot },
  { href: '/', label: 'Live Site', icon: Globe2 },
]

const quotesWorkspaceItems = [
  { href: '/crm', label: 'CRM', icon: UsersRound },
  { href: '/quotes', label: 'Quotes', icon: FileSignature },
]

const quotesChristmasItems = [
  { href: '/christmas/invoices', label: 'Invoices', icon: FileText },
  { href: '/christmas/mockup', label: 'Lights mockup', icon: Camera },
  { href: '/reels', label: 'Reel studio', icon: Clapperboard },
]

const nestedItems = {
  '/documents': [{ href: '/documents/history', label: 'History', icon: PenSquare }],
  '/quotes': [{ href: '/quotes/history', label: 'History', icon: FileText }],
  '/christmas/invoices': [
    { href: '/christmas/invoices/history', label: 'History', icon: FileText },
    { href: '/christmas/invoices/settings', label: 'Template settings', icon: Settings2 },
  ],
}

const christmasItems = [
  { href: '/christmas', label: 'Jobs', icon: UsersRound },
  { href: '/christmas/invoices', label: 'Invoices', icon: FileText },
  { href: '/christmas/mockup', label: 'Lights mockup', icon: Camera },
  { href: '/reels', label: 'Reel studio', icon: Clapperboard },
  { href: '/christmas/slots', label: 'Slots', icon: Sparkles },
]

const NavGroup = ({ label, items }) => {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ href, label: itemLabel, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
            const subItemsForHref = nestedItems[href] || []
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

const AdminNav = ({ role = 'admin' }) => {
  if (isQuotesRole(role)) {
    return (
      <>
        <NavGroup label="Workspace" items={quotesWorkspaceItems} />
        <NavGroup label="Christmas Lights" items={quotesChristmasItems} />
      </>
    )
  }

  return (
    <>
      <NavGroup label="Overview" items={overviewItems} />
      <NavGroup label="Workspace" items={workspaceItems} />
      <NavGroup label="Christmas Lights" items={christmasItems} />
    </>
  )
}

export default AdminNav
