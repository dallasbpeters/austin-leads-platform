import Link from 'next/link'
import { Bell, Building2, Search } from 'lucide-react'

import AdminNav from './AdminNav'
import SignOutButton from './SignOutButton'

export default function AdminShell({ children, user }) {
  return (
    <div className="admin-theme bg-background text-foreground min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[256px_1fr]">
        <aside className="border-border bg-sidebar hidden h-[100vh] border-r lg:flex">
          <div className="flex h-full w-full flex-col">
            <div className="border-border border-b p-4">
              <button className="group hover:border-border hover:bg-muted/40 flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="shadow-theme-sm bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded text-sm font-semibold tracking-tight">
                    AL
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-foreground text-sm leading-none font-medium">Austin Leads</span>
                    <span className="text-muted-foreground mt-1 text-sm leading-none">Production</span>
                  </div>
                </div>
                <Building2 className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <AdminNav />
            </div>

            <div className="border-border border-t p-4">
              <div className="hover:bg-muted/40 mb-4 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors">
                <div className="border-border bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium">
                  {user?.name?.[0] || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-foreground truncate text-sm font-medium">
                    {user?.name || 'Platform Admin'}
                  </div>
                  <div className="text-muted-foreground truncate text-sm">{user?.email}</div>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="bg-muted/40 flex min-w-0 flex-col">
          <header className="border-border bg-background hidden h-14 items-center justify-between border-b px-8 md:flex">
            <div className="text-muted-foreground flex items-center text-sm font-medium">
              <span>Austin Leads</span>
              <span className="mx-2 text-neutral-300">/</span>
              <span className="text-foreground">Overview</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="border-border bg-muted text-foreground placeholder:text-muted-foreground focus:ring-foreground w-64 rounded-md border px-4 py-1.5 pl-8 text-sm transition-shadow outline-none focus:ring-2"
                />
              </div>

              <button className="text-muted-foreground hover:text-foreground relative transition-colors">
                <Bell className="h-5 w-5" />
                <span className="ring-background absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500 ring-2" />
              </button>

              <Link
                href="/publish"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
              >
                Create Post
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
