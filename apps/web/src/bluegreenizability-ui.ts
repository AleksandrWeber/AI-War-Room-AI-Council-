import {
  bluegreenizabilityAdminActionResponseSchema,
  bluegreenizabilityAdminSummaryResponseSchema,
  bluegreenizabilityCapabilitiesResponseSchema,
  bluegreenizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBluegreenizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/bluegreenizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bluegreenizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBluegreenizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/bluegreenizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bluegreenizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBluegreenizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_bluegreenizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/bluegreenizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return bluegreenizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBluegreenizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBluegreenizabilityRolloutCheckStatus(
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

export function formatBluegreenizabilityAdminAction(action: 'refresh_bluegreenizability_summary') {
  switch (action) {
    case 'refresh_bluegreenizability_summary':
      return 'Refresh bluegreenizability summary'
  }
}

export function formatBluegreenizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_usage_limits' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_usage_limits':
      return 'Workspace usage limits'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchBluegreenizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/bluegreenizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return bluegreenizabilityCapabilitiesResponseSchema.parse(await response.json())
}
