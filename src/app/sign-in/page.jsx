import { redirect } from "next/navigation";

import SignInForm from "@/components/auth/SignInForm";
import { safeAuth } from "@/lib/auth/session";

export const metadata = {
  title: "Sign In | Austin Leads Platform",
};

export default async function SignInPage({ searchParams }) {
  const session = await safeAuth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(249,247,244,0.98),rgba(255,255,255,1))] px-6 py-20">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Platform security</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Keep the operator side private while the public domains stay indexable.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            Auth.js is now protecting the dashboard, analytics, publishing, domains, and CMS setup
            routes with a single admin account backed by local environment credentials.
          </p>
        </div>
        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
