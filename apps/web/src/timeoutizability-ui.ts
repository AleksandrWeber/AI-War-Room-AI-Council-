import {
  timeoutizabilityAdminActionResponseSchema,
  timeoutizabilityAdminSummaryResponseSchema,
  timeoutizabilityCapabilitiesResponseSchema,
  timeoutizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchTimeoutizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/timeoutizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return timeoutizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchTimeoutizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/timeoutizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return timeoutizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeTimeoutizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_timeoutizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/timeoutizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return timeoutizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatTimeoutizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatTimeoutizabilityRolloutCheckStatus(
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

export function formatTimeoutizabilityAdminAction(action: 'refresh_timeoutizability_summary') {
  switch (action) {
    case 'refresh_timeoutizability_summary':
      return 'Refresh timeoutizability summary'
  }
}

export function formatTimeoutizabilityDomain(
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

export async function fetchTimeoutizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/timeoutizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return timeoutizabilityCapabilitiesResponseSchema.parse(await response.json())
}
