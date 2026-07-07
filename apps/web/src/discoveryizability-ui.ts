import {
  discoveryizabilityAdminActionResponseSchema,
  discoveryizabilityAdminSummaryResponseSchema,
  discoveryizabilityCapabilitiesResponseSchema,
  discoveryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDiscoveryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/discoveryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoveryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDiscoveryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/discoveryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoveryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDiscoveryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_discoveryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/discoveryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return discoveryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDiscoveryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDiscoveryizabilityRolloutCheckStatus(
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

export function formatDiscoveryizabilityAdminAction(action: 'refresh_discoveryizability_summary') {
  switch (action) {
    case 'refresh_discoveryizability_summary':
      return 'Refresh discoveryizability summary'
  }
}

export function formatDiscoveryizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_webhook_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_webhook_events':
      return 'Billing webhook events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchDiscoveryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/discoveryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoveryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
