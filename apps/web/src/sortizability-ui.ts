import {
  sortizabilityAdminActionResponseSchema,
  sortizabilityAdminSummaryResponseSchema,
  sortizabilityCapabilitiesResponseSchema,
  sortizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSortizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sortizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sortizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchSortizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/sortizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sortizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSortizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_sortizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/sortizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return sortizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatSortizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSortizabilityRolloutCheckStatus(
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

export function formatSortizabilityAdminAction(action: 'refresh_sortizability_summary') {
  switch (action) {
    case 'refresh_sortizability_summary':
      return 'Refresh sortizability summary'
  }
}

export function formatSortizabilityDomain(
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

export async function fetchSortizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/sortizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sortizabilityCapabilitiesResponseSchema.parse(await response.json())
}
