import {
  quotaAdminActionResponseSchema,
  quotaAdminSummaryResponseSchema,
  usageLimitsCapabilitiesResponseSchema,
  usageLimitsRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchUsageLimitsRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/usage/limits/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return usageLimitsRolloutResponseSchema.parse(await response.json())
}

export async function fetchQuotaAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/usage/limits/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return quotaAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeQuotaAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_quota_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/usage/limits/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return quotaAdminActionResponseSchema.parse(await response.json())
}

export function formatUsageLimitsRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatUsageLimitsRolloutCheckStatus(
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

export function formatQuotaAdminAction(action: 'refresh_quota_summary') {
  switch (action) {
    case 'refresh_quota_summary':
      return 'Refresh quota summary'
  }
}

export function formatUsagePhase(phase: string) {
  return phase
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function fetchUsageLimitsCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/usage/limits/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return usageLimitsCapabilitiesResponseSchema.parse(await response.json())
}
