import {
  mapizabilityAdminActionResponseSchema,
  mapizabilityAdminSummaryResponseSchema,
  mapizabilityCapabilitiesResponseSchema,
  mapizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMapizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mapizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mapizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMapizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/mapizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mapizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMapizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_mapizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/mapizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return mapizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMapizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMapizabilityRolloutCheckStatus(
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

export function formatMapizabilityAdminAction(action: 'refresh_mapizability_summary') {
  switch (action) {
    case 'refresh_mapizability_summary':
      return 'Refresh mapizability summary'
  }
}

export function formatMapizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_meter_usage_reports' | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchMapizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/mapizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return mapizabilityCapabilitiesResponseSchema.parse(await response.json())
}
