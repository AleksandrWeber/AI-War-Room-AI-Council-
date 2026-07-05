import {
  availabilityAdminActionResponseSchema,
  availabilityAdminSummaryResponseSchema,
  availabilityCapabilitiesResponseSchema,
  availabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchAvailabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/availability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return availabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchAvailabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/availability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return availabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeAvailabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_availability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/availability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return availabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatAvailabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatAvailabilityRolloutCheckStatus(
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

export function formatAvailabilityAdminAction(
  action: 'refresh_availability_summary',
) {
  switch (action) {
    case 'refresh_availability_summary':
      return 'Refresh availability summary'
  }
}

export function formatAvailabilityDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'blocked_runs'
    | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'blocked_runs':
      return 'Blocked runs'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchAvailabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/availability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return availabilityCapabilitiesResponseSchema.parse(await response.json())
}
