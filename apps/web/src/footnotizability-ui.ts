import {
  footnotizabilityAdminActionResponseSchema,
  footnotizabilityAdminSummaryResponseSchema,
  footnotizabilityCapabilitiesResponseSchema,
  footnotizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchFootnotizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/footnotizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return footnotizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchFootnotizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/footnotizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return footnotizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeFootnotizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_footnotizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/footnotizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return footnotizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatFootnotizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatFootnotizabilityRolloutCheckStatus(
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

export function formatFootnotizabilityAdminAction(action: 'refresh_footnotizability_summary') {
  switch (action) {
    case 'refresh_footnotizability_summary':
      return 'Refresh footnotizability summary'
  }
}

export function formatFootnotizabilityDomain(
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

export async function fetchFootnotizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/footnotizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return footnotizabilityCapabilitiesResponseSchema.parse(await response.json())
}
