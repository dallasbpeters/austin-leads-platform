import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/guards";
import { createPublishJob, listPublishJobs } from "@/lib/platform/store";

export const runtime = "nodejs";

export async function GET() {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  return NextResponse.json({ jobs: listPublishJobs() });
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  const body = await request.json();

  const job = createPublishJob(body);

  return NextResponse.json({ job }, { status: 201 });
}
