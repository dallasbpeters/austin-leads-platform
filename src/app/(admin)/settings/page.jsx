import LeadSettingsClient from '@/components/admin/lead-settings-client'
import { getLeadRoutingSettings } from '@/lib/leads/settings'

export default async function SettingsPage() {
  return <LeadSettingsClient initialSettings={await getLeadRoutingSettings()} />
}
