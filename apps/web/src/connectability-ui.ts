import {
  connectabilityAdminActionResponseSchema,
  connectabilityAdminSummaryResponseSchema,
  connectabilityCapabilitiesResponseSchema,
  connectabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchConnectabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/connectability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connectabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchConnectabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/connectability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connectabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeConnectabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_connectability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/connectability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return connectabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatConnectabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatConnectabilityRolloutCheckStatus(
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

export function formatConnectabilityAdminAction(action: 'refresh_connectability_summary') {
  switch (action) {
    case 'refresh_connectability_summary':
      return 'Refresh connectability summary'
  }
}

export function formatConnectabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'usage_events' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchConnectabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/connectability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return connectabilityCapabilitiesResponseSchema.parse(await response.json())
}
