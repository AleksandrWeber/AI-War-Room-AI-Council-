import {
  walizabilityAdminActionResponseSchema,
  walizabilityAdminSummaryResponseSchema,
  walizabilityCapabilitiesResponseSchema,
  walizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchWalizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/walizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return walizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchWalizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/walizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return walizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWalizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_walizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/walizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return walizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatWalizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatWalizabilityRolloutCheckStatus(
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

export function formatWalizabilityAdminAction(action: 'refresh_walizability_summary') {
  switch (action) {
    case 'refresh_walizability_summary':
      return 'Refresh walizability summary'
  }
}

export function formatWalizabilityDomain(
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

export async function fetchWalizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/walizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return walizabilityCapabilitiesResponseSchema.parse(await response.json())
}
