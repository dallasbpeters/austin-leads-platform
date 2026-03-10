import AnalyticsClient from "@/components/admin/AnalyticsClient";
import { getAllRenderableSites } from "@/lib/platform/content";
import {
  getAnalyticsOverview,
  getAnalyticsProviders,
  listAnalyticsGoals,
} from "@/lib/platform/store";

export default function AnalyticsPage() {
  return (
    <AnalyticsClient
      overview={getAnalyticsOverview()}
      providers={getAnalyticsProviders()}
      goals={listAnalyticsGoals()}
      sites={getAllRenderableSites()}
    />
  );
}
