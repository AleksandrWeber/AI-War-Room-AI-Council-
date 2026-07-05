import {
  utilizationAdminActionResponseSchema,
  utilizationAdminSummaryResponseSchema,
  utilizationCapabilitiesResponseSchema,
  utilizationRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchUtilizationRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/utilization/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return utilizationRolloutResponseSchema.parse(await response.json())
}

export async function fetchUtilizationAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/utilization/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return utilizationAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeUtilizationAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_utilization_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/utilization/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return utilizationAdminActionResponseSchema.parse(await response.json())
}

export function formatUtilizationRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatUtilizationRolloutCheckStatus(
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

export function formatUtilizationAdminAction(
  action: 'refresh_utilization_summary',
) {
  switch (action) {
    case 'refresh_utilization_summary':
      return 'Refresh utilization summary'
  }
}

export function formatUtilizationDomain(
  domain:
    | 'active_runs'
    | 'completed_runs'
    | 'usage_events'
    | 'workspace_memberships',
) {
  switch (domain) {
    case 'active_runs':
      return 'Active runs'
    case 'completed_runs':
      return 'Completed runs'
    case 'usage_events':
      return 'Usage events'
    case 'workspace_memberships':
      return 'Workspace memberships'
  }
}

export async function fetchUtilizationCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/utilization/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return utilizationCapabilitiesResponseSchema.parse(await response.json())
}
