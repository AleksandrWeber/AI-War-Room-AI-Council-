import {
  asynchronizabilityAdminActionResponseSchema,
  asynchronizabilityAdminSummaryResponseSchema,
  asynchronizabilityCapabilitiesResponseSchema,
  asynchronizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAsynchronizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/asynchronizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return asynchronizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAsynchronizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/asynchronizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return asynchronizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAsynchronizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_asynchronizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/asynchronizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return asynchronizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAsynchronizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAsynchronizabilityRolloutCheckStatus(
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

export function formatAsynchronizabilityAdminAction(action: 'refresh_asynchronizability_summary') {
  switch (action) {
    case 'refresh_asynchronizability_summary':
      return 'Refresh asynchronizability summary'
  }
}

export function formatAsynchronizabilityDomain(
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

export async function fetchAsynchronizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/asynchronizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return asynchronizabilityCapabilitiesResponseSchema.parse(await response.json())
}
