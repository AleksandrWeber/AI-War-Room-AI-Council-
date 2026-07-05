import {
  maintainabilizabilityAdminActionResponseSchema,
  maintainabilizabilityAdminSummaryResponseSchema,
  maintainabilizabilityCapabilitiesResponseSchema,
  maintainabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMaintainabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/maintainabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return maintainabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMaintainabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/maintainabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return maintainabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMaintainabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_maintainabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/maintainabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return maintainabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMaintainabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMaintainabilizabilityRolloutCheckStatus(
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

export function formatMaintainabilizabilityAdminAction(action: 'refresh_maintainabilizability_summary') {
  switch (action) {
    case 'refresh_maintainabilizability_summary':
      return 'Refresh maintainabilizability summary'
  }
}

export function formatMaintainabilizabilityDomain(
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

export async function fetchMaintainabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/maintainabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return maintainabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
