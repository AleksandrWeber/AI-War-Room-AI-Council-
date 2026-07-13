import {
  shieldReviewAdminActionResponseSchema,
  shieldReviewAdminSummaryResponseSchema,
  shieldCapabilitiesResponseSchema,
  shieldRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchShieldCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/shield/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return shieldCapabilitiesResponseSchema.parse(await response.json())
}

export async function fetchShieldRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/shield/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return shieldRolloutResponseSchema.parse(await response.json())
}

export async function fetchShieldReviewAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/shield/workspace/${encodeURIComponent(workspaceId)}/admin`,
    {
      headers,
    },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return shieldReviewAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeShieldReviewAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action: 'rerun_review_summary'
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/shield/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        ...input,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return shieldReviewAdminActionResponseSchema.parse(await response.json())
}

export async function createShieldOverride(
  apiBaseUrl: string,
  runId: string,
  headers: Record<string, string>,
  input: {
    reason: string
    findingIds: string[]
    shieldScan: unknown
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/shield/runs/${encodeURIComponent(runId)}/override`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(
      typeof body?.message === 'string'
        ? body.message
        : `API returned ${response.status}`,
    )
  }

  return response.json()
}

export function formatShieldRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatShieldRolloutCheckStatus(
  status: 'pass' | 'fail' | 'skip',
) {
  switch (status) {
    case 'pass':
      return 'Pass'
    case 'fail':
      return 'Fail'
    case 'skip':
      return 'Skip'
  }
}

export function formatShieldReviewStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function formatShieldReviewAdminAction(action: 'rerun_review_summary') {
  switch (action) {
    case 'rerun_review_summary':
      return 'Rerun review summary'
  }
}

export function formatFalsePositiveRate(rate: number) {
  return `${Math.round(rate * 100)}%`
}
