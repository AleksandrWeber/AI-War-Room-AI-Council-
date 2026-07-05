import {
  heuristizabilityAdminActionResponseSchema,
  heuristizabilityAdminSummaryResponseSchema,
  heuristizabilityCapabilitiesResponseSchema,
  heuristizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchHeuristizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/heuristizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return heuristizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchHeuristizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/heuristizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return heuristizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeHeuristizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_heuristizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/heuristizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return heuristizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatHeuristizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatHeuristizabilityRolloutCheckStatus(
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

export function formatHeuristizabilityAdminAction(action: 'refresh_heuristizability_summary') {
  switch (action) {
    case 'refresh_heuristizability_summary':
      return 'Refresh heuristizability summary'
  }
}

export function formatHeuristizabilityDomain(
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

export async function fetchHeuristizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/heuristizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return heuristizabilityCapabilitiesResponseSchema.parse(await response.json())
}
