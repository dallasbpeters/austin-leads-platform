import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/guards";
import { getDomainRecord, upsertDomainRecord } from "@/lib/platform/store";
import { verifyDomainOnVercel } from "@/lib/platform/vercel";

export const runtime = "nodejs";

export async function POST(_request, { params }) {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  const { domain } = await params;
  const existing = getDomainRecord(domain);

  if (!existing) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  const result = await verifyDomainOnVercel(domain);

  const record = upsertDomainRecord({
    ...existing,
    verified: result.verified,
    verificationStatus: result.verificationStatus,
    dnsInstructions: result.dnsInstructions,
  });

  return NextResponse.json({ domain: record });
}
