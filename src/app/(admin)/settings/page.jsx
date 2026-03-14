import LeadSettingsClient from '@/components/admin/LeadSettingsClient'
import { getLeadRoutingSettings } from '@/lib/leads/settings'

export default async function SettingsPage() {
  return <LeadSettingsClient initialSettings={await getLeadRoutingSettings()} />
}
