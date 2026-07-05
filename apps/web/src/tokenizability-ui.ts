import {
  tokenizabilityAdminActionResponseSchema,
  tokenizabilityAdminSummaryResponseSchema,
  tokenizabilityCapabilitiesResponseSchema,
  tokenizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTokenizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tokenizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tokenizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTokenizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/tokenizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tokenizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTokenizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_tokenizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/tokenizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return tokenizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTokenizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTokenizabilityRolloutCheckStatus(
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

export function formatTokenizabilityAdminAction(action: 'refresh_tokenizability_summary') {
  switch (action) {
    case 'refresh_tokenizability_summary':
      return 'Refresh tokenizability summary'
  }
}

export function formatTokenizabilityDomain(
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

export async function fetchTokenizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/tokenizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return tokenizabilityCapabilitiesResponseSchema.parse(await response.json())
}
