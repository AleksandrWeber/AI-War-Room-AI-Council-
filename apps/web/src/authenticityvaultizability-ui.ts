import {
  authenticityvaultizabilityAdminActionResponseSchema,
  authenticityvaultizabilityAdminSummaryResponseSchema,
  authenticityvaultizabilityCapabilitiesResponseSchema,
  authenticityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAuthenticityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/authenticityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAuthenticityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/authenticityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAuthenticityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_authenticityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/authenticityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return authenticityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAuthenticityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAuthenticityvaultizabilityRolloutCheckStatus(
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

export function formatAuthenticityvaultizabilityAdminAction(action: 'refresh_authenticityvaultizability_summary') {
  switch (action) {
    case 'refresh_authenticityvaultizability_summary':
      return 'Refresh authenticityvaultizability summary'
  }
}

export function formatAuthenticityvaultizabilityDomain(
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

export async function fetchAuthenticityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/authenticityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return authenticityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
