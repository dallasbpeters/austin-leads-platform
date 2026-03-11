import { NextResponse } from "next/server";

import { auth } from "./src/auth";
import { getAllSites } from "./src/lib/platform/content";

const protectedPaths = ["/dashboard", "/analytics", "/crm", "/publish", "/domains", "/hero-pages"];
const protectedApiPrefixes = ["/api/domains", "/api/publish-jobs", "/api/analytics", "/api/crm", "/api/hero-pages", "/api/unsplash", "/api/launch-checklist"];

function normalizeHost(host) {
  return (host || "").replace(/:\d+$/, "").toLowerCase();
}

function getRedirectSite(host) {
  const normalizedHost = normalizeHost(host);
  return getAllSites().find(
    (candidate) =>
      candidate.tier === "redirect" &&
      (candidate.primaryDomain === normalizedHost || candidate.aliases?.includes(normalizedHost)),
  );
}

const proxy = auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const isLoggedIn = Boolean(request.auth?.user);
  const redirectSite = getRedirectSite(
    request.headers.get("x-forwarded-host") || request.headers.get("host"),
  );

  if (redirectSite?.redirectTarget) {
    const url = nextUrl.clone();
    url.protocol = "https:";
    url.hostname =
      getAllSites().find((candidate) => candidate.slug === redirectSite.redirectTarget)
        ?.primaryDomain || redirectSite.redirectTarget;
    url.port = "";

    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/sign-in" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  const requiresAuth =
    protectedPaths.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    protectedApiPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

  if (!requiresAuth) {
    return NextResponse.next();
  }

  if (isLoggedIn) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/sign-in", nextUrl);
  const callbackUrl = `${pathname}${nextUrl.search}`;
  signInUrl.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(signInUrl);
});

export default proxy;

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
