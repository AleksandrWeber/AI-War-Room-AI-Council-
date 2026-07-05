import {
  inspectabilityAdminActionResponseSchema,
  inspectabilityAdminSummaryResponseSchema,
  inspectabilityCapabilitiesResponseSchema,
  inspectabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchInspectabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inspectability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inspectabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchInspectabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/inspectability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inspectabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeInspectabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_inspectability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/inspectability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return inspectabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatInspectabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatInspectabilityRolloutCheckStatus(
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

export function formatInspectabilityAdminAction(action: 'refresh_inspectability_summary') {
  switch (action) {
    case 'refresh_inspectability_summary':
      return 'Refresh inspectability summary'
  }
}

export function formatInspectabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'billing_meter_usage_reports',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
  }
}

export async function fetchInspectabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/inspectability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return inspectabilityCapabilitiesResponseSchema.parse(await response.json())
}
