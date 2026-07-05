import {
  discoverabilityAdminActionResponseSchema,
  discoverabilityAdminSummaryResponseSchema,
  discoverabilityCapabilitiesResponseSchema,
  discoverabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDiscoverabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/discoverability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoverabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDiscoverabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/discoverability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoverabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDiscoverabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_discoverability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/discoverability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return discoverabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDiscoverabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDiscoverabilityRolloutCheckStatus(
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

export function formatDiscoverabilityAdminAction(action: 'refresh_discoverability_summary') {
  switch (action) {
    case 'refresh_discoverability_summary':
      return 'Refresh discoverability summary'
  }
}

export function formatDiscoverabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_meter_usage_reports' | 'billing_notifications',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
    case 'billing_notifications':
      return 'Billing notifications'
  }
}

export async function fetchDiscoverabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/discoverability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return discoverabilityCapabilitiesResponseSchema.parse(await response.json())
}
