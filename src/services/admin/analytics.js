import { requestJson } from '@/services/admin/hero-pages'

export const formatAnalyticsNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value)
}

export const buildDefaultAnalyticsGoalForm = (sites) => {
  return {
    name: '',
    goalLevel: 'site',
    siteSlug: sites[0]?.slug || 'all',
    eventName: '',
    targetValue: '',
    interval: 'monthly',
    owner: 'Platform Ops',
    notes: '',
  }
}

export const fetchAnalyticsGoals = async () => {
  return requestJson('/api/analytics/goals')
}

export const createAnalyticsGoal = async (form) => {
  return requestJson('/api/analytics/goals', {
    method: 'POST',
    body: JSON.stringify(form),
  })
}

export const updateAnalyticsGoal = async (goalId, status) => {
  return requestJson(`/api/analytics/goals/${goalId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
