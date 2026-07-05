import {
  capacityAdminActionResponseSchema,
  capacityAdminSummaryResponseSchema,
  capacityCapabilitiesResponseSchema,
  capacityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchCapacityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/capacity/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return capacityRolloutResponseSchema.parse(await response.json())
}

export async function fetchCapacityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/capacity/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return capacityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeCapacityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_capacity_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/capacity/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return capacityAdminActionResponseSchema.parse(await response.json())
}

export function formatCapacityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatCapacityRolloutCheckStatus(
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

export function formatCapacityAdminAction(action: 'refresh_capacity_summary') {
  switch (action) {
    case 'refresh_capacity_summary':
      return 'Refresh capacity summary'
  }
}

export function formatCapacityDomain(
  domain:
    | 'active_runs'
    | 'completed_runs'
    | 'usage_events'
    | 'workspace_limits',
) {
  switch (domain) {
    case 'active_runs':
      return 'Active runs'
    case 'completed_runs':
      return 'Completed runs'
    case 'usage_events':
      return 'Usage events'
    case 'workspace_limits':
      return 'Workspace limits'
  }
}

export async function fetchCapacityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/capacity/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return capacityCapabilitiesResponseSchema.parse(await response.json())
}
