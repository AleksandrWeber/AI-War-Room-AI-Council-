import {
  recoveryizabilityAdminActionResponseSchema,
  recoveryizabilityAdminSummaryResponseSchema,
  recoveryizabilityCapabilitiesResponseSchema,
  recoveryizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRecoveryizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/recoveryizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoveryizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRecoveryizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/recoveryizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoveryizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRecoveryizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_recoveryizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/recoveryizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return recoveryizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRecoveryizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRecoveryizabilityRolloutCheckStatus(
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

export function formatRecoveryizabilityAdminAction(action: 'refresh_recoveryizability_summary') {
  switch (action) {
    case 'refresh_recoveryizability_summary':
      return 'Refresh recoveryizability summary'
  }
}

export function formatRecoveryizabilityDomain(
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

export async function fetchRecoveryizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/recoveryizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return recoveryizabilityCapabilitiesResponseSchema.parse(await response.json())
}
