import {
  balancingizabilityAdminActionResponseSchema,
  balancingizabilityAdminSummaryResponseSchema,
  balancingizabilityCapabilitiesResponseSchema,
  balancingizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchBalancingizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/balancingizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return balancingizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchBalancingizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/balancingizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return balancingizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeBalancingizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_balancingizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/balancingizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return balancingizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatBalancingizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatBalancingizabilityRolloutCheckStatus(
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

export function formatBalancingizabilityAdminAction(action: 'refresh_balancingizability_summary') {
  switch (action) {
    case 'refresh_balancingizability_summary':
      return 'Refresh balancingizability summary'
  }
}

export function formatBalancingizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'model_health_events' | 'billing_records',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_health_events':
      return 'Model health events'
    case 'billing_records':
      return 'Billing records'
  }
}

export async function fetchBalancingizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/balancingizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return balancingizabilityCapabilitiesResponseSchema.parse(await response.json())
}
