import {
  sloAdminActionResponseSchema,
  sloAdminSummaryResponseSchema,
  sloCapabilitiesResponseSchema,
  sloRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchSloRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/slo/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sloRolloutResponseSchema.parse(await response.json())
}

export async function fetchSloAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/slo/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sloAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeSloAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_slo_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/slo/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return sloAdminActionResponseSchema.parse(await response.json())
}

export function formatSloRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatSloRolloutCheckStatus(status: 'pass' | 'fail' | 'skip') {
  switch (status) {
    case 'pass':
      return 'Pass'
    case 'fail':
      return 'Fail'
    case 'skip':
      return 'Skip'
  }
}

export function formatSloAdminAction(action: 'refresh_slo_summary') {
  switch (action) {
    case 'refresh_slo_summary':
      return 'Refresh SLO summary'
  }
}

export function formatSloDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'observability_errors',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'observability_errors':
      return 'Observability errors'
  }
}

export async function fetchSloCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/slo/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return sloCapabilitiesResponseSchema.parse(await response.json())
}
