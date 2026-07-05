import {
  performanceAdminActionResponseSchema,
  performanceAdminSummaryResponseSchema,
  performanceCapabilitiesResponseSchema,
  performanceRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchPerformanceRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/performance/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return performanceRolloutResponseSchema.parse(await response.json())
}

export async function fetchPerformanceAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/performance/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return performanceAdminSummaryResponseSchema.parse(await response.json())
}

export async function executePerformanceAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_performance_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/performance/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return performanceAdminActionResponseSchema.parse(await response.json())
}

export function formatPerformanceRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatPerformanceRolloutCheckStatus(
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

export function formatPerformanceAdminAction(
  action: 'refresh_performance_summary',
) {
  switch (action) {
    case 'refresh_performance_summary':
      return 'Refresh performance summary'
  }
}

export function formatPerformanceDomain(
  domain:
    | 'completed_runs'
    | 'usage_events'
    | 'model_health_events'
    | 'pipeline_latency_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'usage_events':
      return 'Usage events'
    case 'model_health_events':
      return 'Model health events'
    case 'pipeline_latency_events':
      return 'Pipeline latency events'
  }
}

export async function fetchPerformanceCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/performance/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return performanceCapabilitiesResponseSchema.parse(await response.json())
}
