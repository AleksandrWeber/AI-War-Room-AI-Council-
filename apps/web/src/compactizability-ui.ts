import {
  compactizabilityAdminActionResponseSchema,
  compactizabilityAdminSummaryResponseSchema,
  compactizabilityCapabilitiesResponseSchema,
  compactizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCompactizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compactizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compactizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCompactizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/compactizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compactizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCompactizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_compactizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/compactizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return compactizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatCompactizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCompactizabilityRolloutCheckStatus(
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

export function formatCompactizabilityAdminAction(action: 'refresh_compactizability_summary') {
  switch (action) {
    case 'refresh_compactizability_summary':
      return 'Refresh compactizability summary'
  }
}

export function formatCompactizabilityDomain(
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

export async function fetchCompactizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/compactizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return compactizabilityCapabilitiesResponseSchema.parse(await response.json())
}
