import {
  optimizationAdminActionResponseSchema,
  optimizationAdminSummaryResponseSchema,
  optimizationCapabilitiesResponseSchema,
  optimizationRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchOptimizationRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/optimization/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return optimizationRolloutResponseSchema.parse(await response.json())
}

export async function fetchOptimizationAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/optimization/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return optimizationAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeOptimizationAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_optimization_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/optimization/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return optimizationAdminActionResponseSchema.parse(await response.json())
}

export function formatOptimizationRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatOptimizationRolloutCheckStatus(
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

export function formatOptimizationAdminAction(
  action: 'refresh_optimization_summary',
) {
  switch (action) {
    case 'refresh_optimization_summary':
      return 'Refresh optimization summary'
  }
}

export function formatOptimizationDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'usage_events'
    | 'model_health_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'usage_events':
      return 'Usage events'
    case 'model_health_events':
      return 'Model health events'
  }
}

export async function fetchOptimizationCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/optimization/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return optimizationCapabilitiesResponseSchema.parse(await response.json())
}
