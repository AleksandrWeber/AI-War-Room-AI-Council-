import {
  pivotizabilityAdminActionResponseSchema,
  pivotizabilityAdminSummaryResponseSchema,
  pivotizabilityCapabilitiesResponseSchema,
  pivotizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPivotizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/pivotizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pivotizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchPivotizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/pivotizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pivotizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePivotizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_pivotizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/pivotizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return pivotizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatPivotizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPivotizabilityRolloutCheckStatus(
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

export function formatPivotizabilityAdminAction(action: 'refresh_pivotizability_summary') {
  switch (action) {
    case 'refresh_pivotizability_summary':
      return 'Refresh pivotizability summary'
  }
}

export function formatPivotizabilityDomain(
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

export async function fetchPivotizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/pivotizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return pivotizabilityCapabilitiesResponseSchema.parse(await response.json())
}
