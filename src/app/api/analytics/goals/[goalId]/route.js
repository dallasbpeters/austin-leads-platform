import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/guards";
import { getAnalyticsGoal, updateAnalyticsGoal } from "@/lib/platform/store";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  const { goalId } = await params;
  const body = await request.json();

  if (!getAnalyticsGoal(goalId)) {
    return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  }

  const goal = updateAnalyticsGoal(goalId, body);

  return NextResponse.json({ goal });
}
