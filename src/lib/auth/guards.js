import { NextResponse } from "next/server";

import { safeAuth } from "./session";

export async function requireAdminRequest() {
  const session = await safeAuth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
