import {
  feasibilityAdminActionResponseSchema,
  feasibilityAdminSummaryResponseSchema,
  feasibilityCapabilitiesResponseSchema,
  feasibilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFeasibilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/feasibility/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return feasibilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFeasibilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/feasibility/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return feasibilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFeasibilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_feasibility_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/feasibility/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return feasibilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFeasibilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFeasibilityRolloutCheckStatus(
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

export function formatFeasibilityAdminAction(action: 'refresh_feasibility_summary') {
  switch (action) {
    case 'refresh_feasibility_summary':
      return 'Refresh feasibility summary'
  }
}

export function formatFeasibilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'workspace_provider_credentials' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'workspace_provider_credentials':
      return 'Provider credentials'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchFeasibilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/feasibility/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return feasibilityCapabilitiesResponseSchema.parse(await response.json())
}
