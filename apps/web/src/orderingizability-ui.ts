import {
  orderingizabilityAdminActionResponseSchema,
  orderingizabilityAdminSummaryResponseSchema,
  orderingizabilityCapabilitiesResponseSchema,
  orderingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOrderingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orderingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orderingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOrderingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/orderingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orderingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOrderingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_orderingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/orderingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return orderingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOrderingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOrderingizabilityRolloutCheckStatus(
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

export function formatOrderingizabilityAdminAction(action: 'refresh_orderingizability_summary') {
  switch (action) {
    case 'refresh_orderingizability_summary':
      return 'Refresh orderingizability summary'
  }
}

export function formatOrderingizabilityDomain(
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

export async function fetchOrderingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/orderingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return orderingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
