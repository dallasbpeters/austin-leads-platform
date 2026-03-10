import Link from "next/link";
import { Bell, Building2, Search } from "lucide-react";

import AdminNav from "./AdminNav";
import SignOutButton from "./SignOutButton";

export default function AdminShell({ children, user }) {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[256px_1fr]">
        <aside className="hidden h-full border-r border-border bg-sidebar lg:flex">
          <div className="flex h-full w-full flex-col">
            <div className="border-b border-border p-4">
              <button className="group flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-semibold tracking-tight text-primary-foreground shadow-sm">
                    AL
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium leading-none text-foreground">Austin Leads</span>
                    <span className="mt-1 text-xs leading-none text-muted-foreground">Production</span>
                  </div>
                </div>
                <Building2 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <AdminNav />
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-4 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-sm font-medium text-foreground">
                  {user?.name?.[0] || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{user?.name || "Platform Admin"}</div>
                  <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col bg-muted/40">
          <header className="hidden h-14 items-center justify-between border-b border-border bg-background px-8 md:flex">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <span>Austin Leads</span>
              <span className="mx-2 text-neutral-300">/</span>
              <span className="text-foreground">Overview</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 rounded-md border border-border bg-muted px-4 py-1.5 pl-8 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground"
                />
              </div>

              <button className="relative text-muted-foreground transition-colors hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
              </button>

              <Link
                href="/publish"
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create Post
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
