import {
  comparabilityAdminActionResponseSchema,
  comparabilityAdminSummaryResponseSchema,
  comparabilityCapabilitiesResponseSchema,
  comparabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchComparabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/comparability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comparabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchComparabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/comparability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comparabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeComparabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_comparability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/comparability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return comparabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatComparabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatComparabilityRolloutCheckStatus(
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

export function formatComparabilityAdminAction(action: 'refresh_comparability_summary') {
  switch (action) {
    case 'refresh_comparability_summary':
      return 'Refresh comparability summary'
  }
}

export function formatComparabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_meter_usage_reports',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_meter_usage_reports':
      return 'Meter usage reports'
  }
}

export async function fetchComparabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/comparability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return comparabilityCapabilitiesResponseSchema.parse(await response.json())
}
