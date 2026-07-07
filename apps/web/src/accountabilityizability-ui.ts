import {
  accountabilityizabilityAdminActionResponseSchema,
  accountabilityizabilityAdminSummaryResponseSchema,
  accountabilityizabilityCapabilitiesResponseSchema,
  accountabilityizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAccountabilityizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accountabilityizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accountabilityizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAccountabilityizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/accountabilityizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accountabilityizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAccountabilityizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_accountabilityizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/accountabilityizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return accountabilityizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAccountabilityizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAccountabilityizabilityRolloutCheckStatus(
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

export function formatAccountabilityizabilityAdminAction(action: 'refresh_accountabilityizability_summary') {
  switch (action) {
    case 'refresh_accountabilityizability_summary':
      return 'Refresh accountabilityizability summary'
  }
}

export function formatAccountabilityizabilityDomain(
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

export async function fetchAccountabilityizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/accountabilityizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return accountabilityizabilityCapabilitiesResponseSchema.parse(await response.json())
}
