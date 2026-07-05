import {
  rebalanceizabilityAdminActionResponseSchema,
  rebalanceizabilityAdminSummaryResponseSchema,
  rebalanceizabilityCapabilitiesResponseSchema,
  rebalanceizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRebalanceizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/rebalanceizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rebalanceizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRebalanceizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/rebalanceizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rebalanceizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRebalanceizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_rebalanceizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/rebalanceizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return rebalanceizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRebalanceizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRebalanceizabilityRolloutCheckStatus(
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

export function formatRebalanceizabilityAdminAction(action: 'refresh_rebalanceizability_summary') {
  switch (action) {
    case 'refresh_rebalanceizability_summary':
      return 'Refresh rebalanceizability summary'
  }
}

export function formatRebalanceizabilityDomain(
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

export async function fetchRebalanceizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/rebalanceizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return rebalanceizabilityCapabilitiesResponseSchema.parse(await response.json())
}
