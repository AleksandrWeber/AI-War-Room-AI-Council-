import {
  monitorabilityAdminActionResponseSchema,
  monitorabilityAdminSummaryResponseSchema,
  monitorabilityCapabilitiesResponseSchema,
  monitorabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMonitorabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/monitorability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMonitorabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/monitorability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMonitorabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_monitorability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/monitorability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return monitorabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMonitorabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMonitorabilityRolloutCheckStatus(
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

export function formatMonitorabilityAdminAction(action: 'refresh_monitorability_summary') {
  switch (action) {
    case 'refresh_monitorability_summary':
      return 'Refresh monitorability summary'
  }
}

export function formatMonitorabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchMonitorabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/monitorability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return monitorabilityCapabilitiesResponseSchema.parse(await response.json())
}
