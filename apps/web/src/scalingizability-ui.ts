import {
  scalingizabilityAdminActionResponseSchema,
  scalingizabilityAdminSummaryResponseSchema,
  scalingizabilityCapabilitiesResponseSchema,
  scalingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchScalingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/scalingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scalingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchScalingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/scalingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scalingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeScalingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_scalingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/scalingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return scalingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatScalingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatScalingizabilityRolloutCheckStatus(
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

export function formatScalingizabilityAdminAction(action: 'refresh_scalingizability_summary') {
  switch (action) {
    case 'refresh_scalingizability_summary':
      return 'Refresh scalingizability summary'
  }
}

export function formatScalingizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'billing_invoices' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'billing_invoices':
      return 'Billing invoices'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchScalingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/scalingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return scalingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
