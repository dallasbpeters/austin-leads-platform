import DomainsClient from "@/components/admin/DomainsClient";
import { getAllRenderableSites } from "@/lib/platform/content";
import { listDomainRecords } from "@/lib/platform/store";
import { isVercelConfigured } from "@/lib/platform/vercel";

export default function DomainsPage() {
  return (
    <DomainsClient
      initialDomains={listDomainRecords()}
      sites={getAllRenderableSites()}
      vercelEnabled={isVercelConfigured()}
    />
  );
}
