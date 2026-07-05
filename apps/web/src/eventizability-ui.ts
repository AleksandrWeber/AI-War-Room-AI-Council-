import {
  eventizabilityAdminActionResponseSchema,
  eventizabilityAdminSummaryResponseSchema,
  eventizabilityCapabilitiesResponseSchema,
  eventizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchEventizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/eventizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return eventizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchEventizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/eventizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return eventizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeEventizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_eventizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/eventizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return eventizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatEventizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatEventizabilityRolloutCheckStatus(
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

export function formatEventizabilityAdminAction(action: 'refresh_eventizability_summary') {
  switch (action) {
    case 'refresh_eventizability_summary':
      return 'Refresh eventizability summary'
  }
}

export function formatEventizabilityDomain(
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

export async function fetchEventizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/eventizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return eventizabilityCapabilitiesResponseSchema.parse(await response.json())
}
