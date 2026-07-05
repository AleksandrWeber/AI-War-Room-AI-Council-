import {
  optimizabilityAdminActionResponseSchema,
  optimizabilityAdminSummaryResponseSchema,
  optimizabilityCapabilitiesResponseSchema,
  optimizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOptimizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/optimizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return optimizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchOptimizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/optimizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return optimizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOptimizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_optimizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/optimizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return optimizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatOptimizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOptimizabilityRolloutCheckStatus(
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

export function formatOptimizabilityAdminAction(action: 'refresh_optimizability_summary') {
  switch (action) {
    case 'refresh_optimizability_summary':
      return 'Refresh optimizability summary'
  }
}

export function formatOptimizabilityDomain(
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

export async function fetchOptimizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/optimizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return optimizabilityCapabilitiesResponseSchema.parse(await response.json())
}
