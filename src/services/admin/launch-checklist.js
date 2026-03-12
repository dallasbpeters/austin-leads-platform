export async function updateLaunchChecklistTaskStatus(payload) {
  const response = await fetch('/api/launch-checklist/task-status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to update launch checklist task')
  }

  return data
}
