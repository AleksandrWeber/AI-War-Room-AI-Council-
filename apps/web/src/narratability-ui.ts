import {
  narratabilityAdminActionResponseSchema,
  narratabilityAdminSummaryResponseSchema,
  narratabilityCapabilitiesResponseSchema,
  narratabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNarratabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/narratability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return narratabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNarratabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/narratability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return narratabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNarratabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_narratability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/narratability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return narratabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNarratabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNarratabilityRolloutCheckStatus(
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

export function formatNarratabilityAdminAction(action: 'refresh_narratability_summary') {
  switch (action) {
    case 'refresh_narratability_summary':
      return 'Refresh narratability summary'
  }
}

export function formatNarratabilityDomain(
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

export async function fetchNarratabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/narratability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return narratabilityCapabilitiesResponseSchema.parse(await response.json())
}
