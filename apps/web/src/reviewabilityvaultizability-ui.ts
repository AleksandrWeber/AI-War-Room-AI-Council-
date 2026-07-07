import {
  reviewabilityvaultizabilityAdminActionResponseSchema,
  reviewabilityvaultizabilityAdminSummaryResponseSchema,
  reviewabilityvaultizabilityCapabilitiesResponseSchema,
  reviewabilityvaultizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReviewabilityvaultizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reviewabilityvaultizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reviewabilityvaultizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReviewabilityvaultizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/reviewabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reviewabilityvaultizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReviewabilityvaultizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_reviewabilityvaultizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/reviewabilityvaultizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return reviewabilityvaultizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReviewabilityvaultizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReviewabilityvaultizabilityRolloutCheckStatus(
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

export function formatReviewabilityvaultizabilityAdminAction(action: 'refresh_reviewabilityvaultizability_summary') {
  switch (action) {
    case 'refresh_reviewabilityvaultizability_summary':
      return 'Refresh reviewabilityvaultizability summary'
  }
}

export function formatReviewabilityvaultizabilityDomain(
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

export async function fetchReviewabilityvaultizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reviewabilityvaultizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reviewabilityvaultizabilityCapabilitiesResponseSchema.parse(await response.json())
}
