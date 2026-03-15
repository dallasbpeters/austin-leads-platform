import Link from 'next/link'
import { Bell, Building2, Search } from 'lucide-react'

import AdminNav from './AdminNav'
import SignOutButton from './SignOutButton'

export default function AdminShell({ children, user }) {
  return (
    <div className="h-svh text-foreground bg-background admin-theme overflow-hidden">
      <div className="grid h-full min-h-0 lg:grid-cols-[256px_1fr]">
        <aside className="hidden lg:flex h-svh bg-sidebar border-border border-r">
          <div className="flex flex-col h-full w-full">
            <div className="p-4 border-b border-border">
              <button className="flex items-center justify-between w-full px-3 py-2 border border-transparent rounded-lg hover:bg-muted/40 hover:border-border transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-7 w-7 font-semibold text-primary-foreground text-sm tracking-tight bg-primary rounded shadow-theme-sm">
                    AL
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium leading-none text-foreground text-sm">Austin Leads</span>
                    <span className="mt-1 leading-none text-muted-foreground text-sm">Production</span>
                  </div>
                </div>
                <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>

            <div className="px-3 py-4 flex-1 overflow-y-auto">
              <AdminNav />
            </div>

            <div className="p-4 border-border border-t">
              <div className="flex items-center gap-3 mb-4 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-center h-8 w-8 font-medium text-foreground text-sm bg-muted border border-border rounded-full">
                  {user?.name?.[0] || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground text-sm truncate">
                    {user?.name || 'Platform Admin'}
                  </div>
                  <div className="text-muted-foreground text-sm truncate">{user?.email}</div>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="flex flex-col min-h-0 min-w-0 bg-muted/40">
          <header className="hidden md:flex items-center justify-between h-14 px-8 bg-background border-b border-border">
            <div className="flex items-center font-medium text-muted-foreground text-sm">
              <span>Austin Leads</span>
              <span className="mx-2 text-neutral-300">/</span>
              <span className="text-foreground">Overview</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden relative lg:block">
                <Search className="absolute h-4 w-4 text-muted-foreground -translate-y-1/2 left-2.5 top-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-8 px-4 py-1.5 text-foreground text-sm placeholder:text-muted-foreground bg-muted border border-border rounded-md transition-shadow outline-none focus:ring-2 focus:ring-foreground"
                />
              </div>

              <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute h-2 w-2 bg-rose-500 rounded-full right-0 ring-2 ring-background top-0" />
              </button>

              <Link
                href="/publish"
                className="px-4 py-1.5 font-medium text-primary-foreground text-sm bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Post
              </Link>
            </div>
          </header>

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
