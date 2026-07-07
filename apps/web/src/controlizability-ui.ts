import {
  controlizabilityAdminActionResponseSchema,
  controlizabilityAdminSummaryResponseSchema,
  controlizabilityCapabilitiesResponseSchema,
  controlizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchControlizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/controlizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return controlizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchControlizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/controlizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return controlizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeControlizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_controlizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/controlizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return controlizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatControlizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatControlizabilityRolloutCheckStatus(
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

export function formatControlizabilityAdminAction(action: 'refresh_controlizability_summary') {
  switch (action) {
    case 'refresh_controlizability_summary':
      return 'Refresh controlizability summary'
  }
}

export function formatControlizabilityDomain(
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

export async function fetchControlizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/controlizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return controlizabilityCapabilitiesResponseSchema.parse(await response.json())
}
