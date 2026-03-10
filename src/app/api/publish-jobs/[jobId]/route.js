import { NextResponse } from "next/server";

import { requireAdminRequest } from "@/lib/auth/guards";
import { getPublishJob, updatePublishJob } from "@/lib/platform/store";
import { publishPageToSanity } from "@/lib/platform/content";

export const runtime = "nodejs";

function createDraftOutput(job) {
  return `Placeholder draft for ${job.title}\n\nAudience: ${job.siteSlug}\n\nBrief:\n${job.prompt}\n\nSources:\n${job.sources.join("\n")}`;
}

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdminRequest();
  if (unauthorized) return unauthorized;

  const { jobId } = await params;
  const body = await request.json();
  const job = getPublishJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (body.action === "approve") {
    const updated = updatePublishJob(jobId, {
      status: job.output ? "approved" : "draft_ready",
      reviewStatus: "approved",
      output: job.output || createDraftOutput(job),
    });

    return NextResponse.json({ job: updated });
  }

  if (body.action === "reject") {
    const updated = updatePublishJob(jobId, {
      status: "rejected",
      reviewStatus: "changes_requested",
    });

    return NextResponse.json({ job: updated });
  }

  if (body.action === "publish") {
    const publishResult = await publishPageToSanity({
      ...job,
      output: job.output || createDraftOutput(job),
    });

    const updated = updatePublishJob(jobId, {
      status: "published",
      reviewStatus: "published",
      output: job.output || createDraftOutput(job),
      publishResult,
    });

    return NextResponse.json({ job: updated, publishResult });
  }

  const updated = updatePublishJob(jobId, {
    status: "draft_ready",
    output: job.output || createDraftOutput(job),
  });

  return NextResponse.json({ job: updated });
}
