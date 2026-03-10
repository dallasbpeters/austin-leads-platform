import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/guards";
import { createAnalyticsGoal, listAnalyticsGoals } from "@/lib/platform/store";

export const runtime = "nodejs";

export async function GET() {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  return NextResponse.json({ goals: listAnalyticsGoals() });
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const goal = createAnalyticsGoal(body);

  return NextResponse.json({ goal }, { status: 201 });
}
