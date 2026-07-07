import {
  permissionizabilityAdminActionResponseSchema,
  permissionizabilityAdminSummaryResponseSchema,
  permissionizabilityCapabilitiesResponseSchema,
  permissionizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPermissionizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/permissionizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return permissionizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPermissionizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/permissionizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return permissionizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePermissionizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_permissionizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/permissionizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return permissionizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPermissionizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPermissionizabilityRolloutCheckStatus(
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

export function formatPermissionizabilityAdminAction(action: 'refresh_permissionizability_summary') {
  switch (action) {
    case 'refresh_permissionizability_summary':
      return 'Refresh permissionizability summary'
  }
}

export function formatPermissionizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_memberships' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_memberships':
      return 'Workspace memberships'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchPermissionizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/permissionizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return permissionizabilityCapabilitiesResponseSchema.parse(await response.json())
}
