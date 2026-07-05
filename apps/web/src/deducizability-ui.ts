import {
  deducizabilityAdminActionResponseSchema,
  deducizabilityAdminSummaryResponseSchema,
  deducizabilityCapabilitiesResponseSchema,
  deducizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchDeducizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deducizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deducizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchDeducizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/deducizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deducizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeDeducizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_deducizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/deducizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return deducizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatDeducizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatDeducizabilityRolloutCheckStatus(
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

export function formatDeducizabilityAdminAction(action: 'refresh_deducizability_summary') {
  switch (action) {
    case 'refresh_deducizability_summary':
      return 'Refresh deducizability summary'
  }
}

export function formatDeducizabilityDomain(
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

export async function fetchDeducizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/deducizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return deducizabilityCapabilitiesResponseSchema.parse(await response.json())
}
