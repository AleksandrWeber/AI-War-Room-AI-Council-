import {
  coldizabilityAdminActionResponseSchema,
  coldizabilityAdminSummaryResponseSchema,
  coldizabilityCapabilitiesResponseSchema,
  coldizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchColdizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/coldizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coldizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchColdizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/coldizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coldizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeColdizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_coldizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/coldizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return coldizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatColdizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatColdizabilityRolloutCheckStatus(
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

export function formatColdizabilityAdminAction(action: 'refresh_coldizability_summary') {
  switch (action) {
    case 'refresh_coldizability_summary':
      return 'Refresh coldizability summary'
  }
}

export function formatColdizabilityDomain(
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

export async function fetchColdizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/coldizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return coldizabilityCapabilitiesResponseSchema.parse(await response.json())
}
