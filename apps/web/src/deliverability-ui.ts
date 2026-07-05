import {
  deliverabilityAdminActionResponseSchema,
  deliverabilityAdminSummaryResponseSchema,
  deliverabilityCapabilitiesResponseSchema,
  deliverabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeliverabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deliverability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deliverabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeliverabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deliverability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deliverabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeliverabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deliverability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deliverability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deliverabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeliverabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeliverabilityRolloutCheckStatus(
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

export function formatDeliverabilityAdminAction(action: 'refresh_deliverability_summary') {
  switch (action) {
    case 'refresh_deliverability_summary':
      return 'Refresh deliverability summary'
  }
}

export function formatDeliverabilityDomain(
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

export async function fetchDeliverabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deliverability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deliverabilityCapabilitiesResponseSchema.parse(await response.json())
}
