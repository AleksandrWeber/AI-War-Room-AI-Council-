import {
  windowizabilityAdminActionResponseSchema,
  windowizabilityAdminSummaryResponseSchema,
  windowizabilityCapabilitiesResponseSchema,
  windowizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchWindowizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/windowizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return windowizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchWindowizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/windowizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return windowizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeWindowizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_windowizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/windowizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return windowizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatWindowizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatWindowizabilityRolloutCheckStatus(
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

export function formatWindowizabilityAdminAction(action: 'refresh_windowizability_summary') {
  switch (action) {
    case 'refresh_windowizability_summary':
      return 'Refresh windowizability summary'
  }
}

export function formatWindowizabilityDomain(
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

export async function fetchWindowizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/windowizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return windowizabilityCapabilitiesResponseSchema.parse(await response.json())
}
