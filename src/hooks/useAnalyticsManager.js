'use client'

import { useEffect, useState } from 'react'

import {
  buildDefaultAnalyticsGoalForm,
  createAnalyticsGoal,
  fetchAnalyticsGoals,
  updateAnalyticsGoal,
} from '@/services/admin/analytics'

export const useAnalyticsManager = ({ goals, sites }) => {
  const [goalList, setGoalList] = useState(goals)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(buildDefaultAnalyticsGoalForm(sites))

  useEffect(() => {
    setGoalList(goals)
  }, [goals])

  const refreshGoals = async () => {
    setLoading(true)

    try {
      const data = await fetchAnalyticsGoals()
      setGoalList(data.goals)
    } finally {
      setLoading(false)
    }
  }

  const submitGoal = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await createAnalyticsGoal(form)
      setForm(buildDefaultAnalyticsGoalForm(sites))
      await refreshGoals()
    } finally {
      setLoading(false)
    }
  }

  const updateGoal = async (goalId, status) => {
    setLoading(true)

    try {
      await updateAnalyticsGoal(goalId, status)
      await refreshGoals()
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    goalList,
    loading,
    refreshGoals,
    setForm,
    submitGoal,
    updateGoal,
  }
}
