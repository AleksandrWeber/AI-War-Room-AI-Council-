import {
  retentionizabilityAdminActionResponseSchema,
  retentionizabilityAdminSummaryResponseSchema,
  retentionizabilityCapabilitiesResponseSchema,
  retentionizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchRetentionizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retentionizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retentionizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchRetentionizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/retentionizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retentionizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeRetentionizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_retentionizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/retentionizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return retentionizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatRetentionizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatRetentionizabilityRolloutCheckStatus(
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

export function formatRetentionizabilityAdminAction(action: 'refresh_retentionizability_summary') {
  switch (action) {
    case 'refresh_retentionizability_summary':
      return 'Refresh retentionizability summary'
  }
}

export function formatRetentionizabilityDomain(
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

export async function fetchRetentionizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/retentionizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return retentionizabilityCapabilitiesResponseSchema.parse(await response.json())
}
