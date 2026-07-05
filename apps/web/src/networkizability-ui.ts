import {
  networkizabilityAdminActionResponseSchema,
  networkizabilityAdminSummaryResponseSchema,
  networkizabilityCapabilitiesResponseSchema,
  networkizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNetworkizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/networkizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return networkizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNetworkizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/networkizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return networkizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNetworkizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_networkizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/networkizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return networkizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNetworkizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNetworkizabilityRolloutCheckStatus(
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

export function formatNetworkizabilityAdminAction(action: 'refresh_networkizability_summary') {
  switch (action) {
    case 'refresh_networkizability_summary':
      return 'Refresh networkizability summary'
  }
}

export function formatNetworkizabilityDomain(
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

export async function fetchNetworkizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/networkizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return networkizabilityCapabilitiesResponseSchema.parse(await response.json())
}
