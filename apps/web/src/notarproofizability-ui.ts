import {
  notarproofizabilityAdminActionResponseSchema,
  notarproofizabilityAdminSummaryResponseSchema,
  notarproofizabilityCapabilitiesResponseSchema,
  notarproofizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchNotarproofizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/notarproofizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarproofizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchNotarproofizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/notarproofizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarproofizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeNotarproofizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_notarproofizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/notarproofizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return notarproofizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatNotarproofizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatNotarproofizabilityRolloutCheckStatus(
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

export function formatNotarproofizabilityAdminAction(action: 'refresh_notarproofizability_summary') {
  switch (action) {
    case 'refresh_notarproofizability_summary':
      return 'Refresh notarproofizability summary'
  }
}

export function formatNotarproofizabilityDomain(
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

export async function fetchNotarproofizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/notarproofizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return notarproofizabilityCapabilitiesResponseSchema.parse(await response.json())
}
