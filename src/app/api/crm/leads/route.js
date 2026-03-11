import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/guards";
import {
  ensureLeadSubmissionsTable,
  getLeadPipelineSummary,
  getLeadSubmissionOverview,
  hasLeadDatabase,
  listLeadSubmissions,
} from "@/lib/leads/db";

export async function GET(request) {
  const unauthorized = await requireAdminRequest();

  if (unauthorized) {
    return unauthorized;
  }

  if (!hasLeadDatabase()) {
    return NextResponse.json(
      { error: "Lead database is not configured." },
      { status: 503 },
    );
  }

  await ensureLeadSubmissionsTable();

  const { searchParams } = new URL(request.url);

  const [overview, pipeline, leads] = await Promise.all([
    getLeadSubmissionOverview(),
    getLeadPipelineSummary(),
    listLeadSubmissions({
      limit: Number(searchParams.get("limit") || 100),
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "all",
      pipelineStage: searchParams.get("pipelineStage") || "all",
      serviceInterest: searchParams.get("serviceInterest") || "all",
    }),
  ]);

  return NextResponse.json({
    overview,
    pipeline,
    leads,
  });
}
