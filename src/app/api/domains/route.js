import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/guards";
import { listDomainRecords, upsertDomainRecord } from "@/lib/platform/store";
import { addDomainToVercel } from "@/lib/platform/vercel";

export const runtime = "nodejs";

export async function GET() {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  return NextResponse.json({ domains: listDomainRecords() });
}

export async function POST(request) {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const result = await addDomainToVercel(body);

  const record = upsertDomainRecord({
    domain: body.domain,
    siteSlug: body.siteSlug,
    tier: body.redirectTarget ? "redirect" : "landing",
    redirectTarget: body.redirectTarget || null,
    projectId: result.projectId,
    verified: result.verified,
    verificationStatus: result.verificationStatus,
    dnsInstructions: result.dnsInstructions,
  });

  return NextResponse.json({ domain: record }, { status: 201 });
}
