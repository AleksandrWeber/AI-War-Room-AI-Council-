import {
  efficiencyAdminActionResponseSchema,
  efficiencyAdminSummaryResponseSchema,
  efficiencyCapabilitiesResponseSchema,
  efficiencyRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEfficiencyRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/efficiency/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return efficiencyRolloutResponseSchema.parse(await response.json())
}

export async function fetchEfficiencyAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/efficiency/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return efficiencyAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEfficiencyAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_efficiency_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/efficiency/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return efficiencyAdminActionResponseSchema.parse(await response.json())
}

export function formatEfficiencyRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEfficiencyRolloutCheckStatus(
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

export function formatEfficiencyAdminAction(
  action: 'refresh_efficiency_summary',
) {
  switch (action) {
    case 'refresh_efficiency_summary':
      return 'Refresh efficiency summary'
  }
}

export function formatEfficiencyDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'usage_events'
    | 'workspace_usage_limits',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
  }
}

export async function fetchEfficiencyCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/efficiency/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return efficiencyCapabilitiesResponseSchema.parse(await response.json())
}
