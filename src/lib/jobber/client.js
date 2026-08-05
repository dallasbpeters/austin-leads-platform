import { setTimeout as delay } from 'node:timers/promises'

import { getJobberApiUrl, getJobberGraphqlVersion, getValidJobberAccessToken } from './auth.js'

/*
 * Thin GraphQL client for Jobber's API — handles auth headers, the required
 * dated version header, and a defensive (capped) backoff when the account's
 * rate-limit "bucket" (extensions.cost.throttleStatus) is running low.
 * See https://developer.getjobber.com/docs/build_with_jobber/api_rate_limits
 */

const LOW_WATER_RATIO = 0.2
const MAX_THROTTLE_WAIT_SECONDS = 5

async function throttleIfNeeded(throttleStatus) {
  if (!throttleStatus) {
    return
  }
  const { currentlyAvailable, maximumAvailable, restoreRate } = throttleStatus
  if (typeof currentlyAvailable !== 'number' || !maximumAvailable || !restoreRate) {
    return
  }
  const lowWaterMark = maximumAvailable * LOW_WATER_RATIO
  if (currentlyAvailable > lowWaterMark) {
    return
  }
  const waitSeconds = Math.min(
    MAX_THROTTLE_WAIT_SECONDS,
    Math.ceil((lowWaterMark - currentlyAvailable) / restoreRate),
  )
  if (waitSeconds > 0) {
    await delay(waitSeconds * 1000)
  }
}

export async function executeJobberQuery(query, variables = {}) {
  const accessToken = await getValidJobberAccessToken()

  const response = await fetch(`${getJobberApiUrl()}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-JOBBER-GRAPHQL-VERSION': getJobberGraphqlVersion(),
    },
    body: JSON.stringify({ query, variables }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`Jobber API request failed (${response.status}): ${JSON.stringify(payload)}`)
  }
  if (payload.errors?.length) {
    throw new Error(`Jobber GraphQL error: ${payload.errors.map((error) => error.message).join('; ')}`)
  }

  await throttleIfNeeded(payload.extensions?.cost?.throttleStatus)
  return payload.data
}

/** Throws if any mutation payload's `userErrors` array is non-empty. */
export function assertNoJobberUserErrors(payloadKey, result) {
  const userErrors = result?.[payloadKey]?.userErrors
  if (userErrors?.length) {
    throw new Error(`Jobber ${payloadKey} rejected: ${userErrors.map((error) => error.message).join('; ')}`)
  }
}
