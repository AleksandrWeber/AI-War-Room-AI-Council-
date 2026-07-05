import {
  triggerizabilityAdminActionResponseSchema,
  triggerizabilityAdminSummaryResponseSchema,
  triggerizabilityCapabilitiesResponseSchema,
  triggerizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTriggerizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/triggerizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return triggerizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTriggerizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/triggerizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return triggerizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTriggerizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_triggerizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/triggerizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return triggerizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTriggerizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTriggerizabilityRolloutCheckStatus(
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

export function formatTriggerizabilityAdminAction(action: 'refresh_triggerizability_summary') {
  switch (action) {
    case 'refresh_triggerizability_summary':
      return 'Refresh triggerizability summary'
  }
}

export function formatTriggerizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_notifications' | 'billing_webhook_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_notifications':
      return 'Billing notifications'
    case 'billing_webhook_events':
      return 'Billing webhook events'
  }
}

export async function fetchTriggerizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/triggerizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return triggerizabilityCapabilitiesResponseSchema.parse(await response.json())
}
