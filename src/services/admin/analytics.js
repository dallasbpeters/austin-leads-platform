import { requestJson } from '@/services/admin/hero-pages'

export function formatAnalyticsNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function buildDefaultAnalyticsGoalForm(sites) {
  return {
    name: '',
    scope: 'site',
    siteSlug: sites[0]?.slug || 'all',
    eventName: '',
    targetValue: '',
    interval: 'monthly',
    owner: 'Platform Ops',
    notes: '',
  }
}

export async function fetchAnalyticsGoals() {
  return requestJson('/api/analytics/goals')
}

export async function createAnalyticsGoal(form) {
  return requestJson('/api/analytics/goals', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}

export async function updateAnalyticsGoal(goalId, status) {
  return requestJson(`/api/analytics/goals/${goalId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
