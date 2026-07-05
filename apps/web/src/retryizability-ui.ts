import {
  retryizabilityAdminActionResponseSchema,
  retryizabilityAdminSummaryResponseSchema,
  retryizabilityCapabilitiesResponseSchema,
  retryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRetryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRetryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/retryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRetryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_retryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/retryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return retryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRetryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRetryizabilityRolloutCheckStatus(
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

export function formatRetryizabilityAdminAction(action: 'refresh_retryizability_summary') {
  switch (action) {
    case 'refresh_retryizability_summary':
      return 'Refresh retryizability summary'
  }
}

export function formatRetryizabilityDomain(
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

export async function fetchRetryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
