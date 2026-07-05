import {
  orchestrizabilityAdminActionResponseSchema,
  orchestrizabilityAdminSummaryResponseSchema,
  orchestrizabilityCapabilitiesResponseSchema,
  orchestrizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOrchestrizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orchestrizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOrchestrizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/orchestrizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOrchestrizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_orchestrizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/orchestrizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return orchestrizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOrchestrizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOrchestrizabilityRolloutCheckStatus(
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

export function formatOrchestrizabilityAdminAction(action: 'refresh_orchestrizability_summary') {
  switch (action) {
    case 'refresh_orchestrizability_summary':
      return 'Refresh orchestrizability summary'
  }
}

export function formatOrchestrizabilityDomain(
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

export async function fetchOrchestrizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orchestrizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orchestrizabilityCapabilitiesResponseSchema.parse(await response.json())
}
