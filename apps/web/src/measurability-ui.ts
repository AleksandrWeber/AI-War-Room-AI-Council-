import {
  measurabilityAdminActionResponseSchema,
  measurabilityAdminSummaryResponseSchema,
  measurabilityCapabilitiesResponseSchema,
  measurabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMeasurabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/measurability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return measurabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMeasurabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/measurability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return measurabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMeasurabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_measurability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/measurability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return measurabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMeasurabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMeasurabilityRolloutCheckStatus(
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

export function formatMeasurabilityAdminAction(action: 'refresh_measurability_summary') {
  switch (action) {
    case 'refresh_measurability_summary':
      return 'Refresh measurability summary'
  }
}

export function formatMeasurabilityDomain(
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

export async function fetchMeasurabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/measurability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return measurabilityCapabilitiesResponseSchema.parse(await response.json())
}
