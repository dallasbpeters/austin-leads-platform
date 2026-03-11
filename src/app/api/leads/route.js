import { NextResponse } from "next/server";

import {
  createLeadSubmission,
  ensureLeadSubmissionsTable,
  hasLeadDatabase,
} from "@/lib/leads/db";

function badRequest(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeString(value) {
  return String(value || "").trim();
}

export async function POST(request) {
  if (!hasLeadDatabase()) {
    return badRequest("Lead database is not configured.", 503);
  }

  const payload = await request.json().catch(() => null);

  if (!payload) {
    return badRequest("Invalid request body.");
  }

  const fullName = normalizeString(payload.fullName);
  const email = normalizeEmail(payload.email);
  const phone = normalizeString(payload.phone);
  const siteSlug = normalizeString(payload.siteSlug);
  const siteName = normalizeString(payload.siteName);
  const sourceDomain = normalizeString(payload.sourceDomain);
  const pagePath = normalizeString(payload.pagePath || "/");

  if (!fullName) {
    return badRequest("Full name is required.");
  }

  if (!email || !email.includes("@")) {
    return badRequest("A valid email address is required.");
  }

  if (!siteSlug || !siteName || !sourceDomain) {
    return badRequest("Lead source context is incomplete.", 422);
  }

  await ensureLeadSubmissionsTable();

  const submission = await createLeadSubmission({
    fullName,
    email,
    phone,
    notes: normalizeString(payload.notes),
    sourceType: normalizeString(payload.sourceType) || "consultation",
    sourceSection: normalizeString(payload.sourceSection),
    serviceInterest: normalizeString(payload.serviceInterest),
    siteSlug,
    siteName,
    sourceDomain,
    pagePath,
    pageTitle: normalizeString(payload.pageTitle),
    metadata: payload.metadata || {},
  });

  return NextResponse.json({
    ok: true,
    submission: {
      id: submission.id,
      createdAt: submission.created_at,
      status: submission.status,
    },
  });
}
