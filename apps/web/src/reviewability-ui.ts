import {
  reviewabilityAdminActionResponseSchema,
  reviewabilityAdminSummaryResponseSchema,
  reviewabilityCapabilitiesResponseSchema,
  reviewabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchReviewabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reviewability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reviewabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchReviewabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/reviewability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reviewabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeReviewabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_reviewability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/reviewability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return reviewabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatReviewabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatReviewabilityRolloutCheckStatus(
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

export function formatReviewabilityAdminAction(action: 'refresh_reviewability_summary') {
  switch (action) {
    case 'refresh_reviewability_summary':
      return 'Refresh reviewability summary'
  }
}

export function formatReviewabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'artifacts' | 'billing_invoices',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'artifacts':
      return 'Artifacts'
    case 'billing_invoices':
      return 'Billing invoices'
  }
}

export async function fetchReviewabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/reviewability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return reviewabilityCapabilitiesResponseSchema.parse(await response.json())
}
