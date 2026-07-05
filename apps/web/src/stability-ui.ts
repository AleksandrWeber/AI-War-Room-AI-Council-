import {
  stabilityAdminActionResponseSchema,
  stabilityAdminSummaryResponseSchema,
  stabilityCapabilitiesResponseSchema,
  stabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchStabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchStabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/stability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeStabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_stability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/stability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return stabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatStabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatStabilityRolloutCheckStatus(
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

export function formatStabilityAdminAction(
  action: 'refresh_stability_summary',
) {
  switch (action) {
    case 'refresh_stability_summary':
      return 'Refresh stability summary'
  }
}

export function formatStabilityDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'artifacts'
    | 'applied_migrations',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'applied_migrations':
      return 'Applied migrations'
  }
}

export async function fetchStabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/stability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return stabilityCapabilitiesResponseSchema.parse(await response.json())
}
