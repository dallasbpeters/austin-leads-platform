import CrmClient from "@/components/admin/CrmClient";
import {
  ensureLeadSubmissionsTable,
  getLeadPipelineSummary,
  getLeadSubmissionOverview,
  hasLeadDatabase,
  listLeadSubmissions,
} from "@/lib/leads/db";

export const metadata = {
  title: "CRM | Austin Leads Platform",
};

export default async function CrmPage() {
  let leadDbReady = false;
  let initialOverview = {
    total: 0,
    last_30_days: 0,
    open: 0,
    qualified: 0,
    inspections: 0,
    quoted: 0,
    won: 0,
  };
  let initialPipeline = [];
  let initialLeads = [];

  if (hasLeadDatabase()) {
    try {
      await ensureLeadSubmissionsTable();
      const [overview, pipeline, leads] = await Promise.all([
        getLeadSubmissionOverview(),
        getLeadPipelineSummary(),
        listLeadSubmissions({ limit: 100 }),
      ]);

      initialOverview = overview;
      initialPipeline = pipeline;
      initialLeads = leads;
      leadDbReady = true;
    } catch {
      leadDbReady = false;
    }
  }

  return (
    <CrmClient
      initialOverview={initialOverview}
      initialPipeline={initialPipeline}
      initialLeads={initialLeads}
      leadDbReady={leadDbReady}
    />
  );
}
