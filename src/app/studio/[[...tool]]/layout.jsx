import { redirect } from "next/navigation";

import { metadata, viewport } from "next-sanity/studio";
import { safeAuth } from "@/lib/auth/session";

export { metadata, viewport };

export default async function StudioLayout({ children }) {
  const session = await safeAuth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return children;
}
