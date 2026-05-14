import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import { Bell, Building2, Search } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import AdminBodyScrollLock from '@/components/admin/AdminBodyScrollLock'
import AdminNav from '@/components/admin/AdminNav'
import SignOutButton from '@/components/admin/SignOutButton'
import { safeAuth } from '@/lib/auth/session'

const fontSans = Outfit({ subsets: ['latin'], variable: '--font-sans' })
const fontSerif = Outfit({ subsets: ['latin'], weight: '400', variable: '--font-serif' })
const fontMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'Austin Leads Admin',
  description: 'Internal admin console for the Austin Leads Platform.',
}

export default async function AdminLayout({ children }) {
  const session = await safeAuth()
  if (!session?.user) redirect('/sign-in')
  const { user } = session

  return (
    <SidebarProvider>
      <div
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} admin-theme flex h-svh w-full overflow-hidden antialiased`}
      >
        <AdminBodyScrollLock />

        {/* ── Sidebar ── */}
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full">
                  <Building2 className="shrink-0" />
                  <span>Austin Leads</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <AdminNav />
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="text-foreground bg-muted border-border flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium">
                    {user?.name?.[0] || 'A'}
                  </div>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <div className="text-foreground truncate text-sm font-medium">
                      {user?.name || 'Platform Admin'}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">{user?.email}</div>
                  </div>
                </div>
                <div className="group-data-[collapsible=icon]:hidden">
                  <SignOutButton />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* ── Main content ── */}
        <SidebarInset className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <header className="bg-background border-border flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="text-muted-foreground hidden items-center text-sm font-medium md:flex">
                <span>Austin Leads</span>
                <span className="mx-2 text-neutral-300">/</span>
                <span className="text-foreground">Overview</span>
              </div>
            </div>

            <Link
              href="/publish"
              className="text-primary-foreground bg-primary hover:bg-primary/90 rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
            >
              Create Post
            </Link>
          </header>

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
