import {
  terminologizabilityAdminActionResponseSchema,
  terminologizabilityAdminSummaryResponseSchema,
  terminologizabilityCapabilitiesResponseSchema,
  terminologizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTerminologizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/terminologizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return terminologizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTerminologizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/terminologizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return terminologizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTerminologizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_terminologizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/terminologizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return terminologizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTerminologizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTerminologizabilityRolloutCheckStatus(
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

export function formatTerminologizabilityAdminAction(action: 'refresh_terminologizability_summary') {
  switch (action) {
    case 'refresh_terminologizability_summary':
      return 'Refresh terminologizability summary'
  }
}

export function formatTerminologizabilityDomain(
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

export async function fetchTerminologizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/terminologizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return terminologizabilityCapabilitiesResponseSchema.parse(await response.json())
}
