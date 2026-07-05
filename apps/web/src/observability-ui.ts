import {
  observabilityAdminActionResponseSchema,
  observabilityAdminSummaryResponseSchema,
  observabilityCapabilitiesResponseSchema,
  observabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchObservabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/observability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return observabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchObservabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/observability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    {
      headers,
    },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return observabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeObservabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: {
    action: 'refresh_event_summary' | 'clear_observability_buffer'
  },
) {
  const response = await fetch(
    `${apiBaseUrl}/observability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return observabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatObservabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatObservabilityRolloutCheckStatus(
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

export function formatObservabilityEventLevel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export function formatObservabilityAdminAction(
  action: 'refresh_event_summary' | 'clear_observability_buffer',
) {
  switch (action) {
    case 'refresh_event_summary':
      return 'Refresh event summary'
    case 'clear_observability_buffer':
      return 'Clear event buffer'
  }
}

export async function fetchObservabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/observability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return observabilityCapabilitiesResponseSchema.parse(await response.json())
}
