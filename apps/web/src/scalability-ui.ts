import {
  scalabilityAdminActionResponseSchema,
  scalabilityAdminSummaryResponseSchema,
  scalabilityCapabilitiesResponseSchema,
  scalabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchScalabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/scalability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scalabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchScalabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/scalability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scalabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeScalabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_scalability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/scalability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return scalabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatScalabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatScalabilityRolloutCheckStatus(
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

export function formatScalabilityAdminAction(
  action: 'refresh_scalability_summary',
) {
  switch (action) {
    case 'refresh_scalability_summary':
      return 'Refresh scalability summary'
  }
}

export function formatScalabilityDomain(
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

export async function fetchScalabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/scalability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scalabilityCapabilitiesResponseSchema.parse(await response.json())
}
