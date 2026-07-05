import {
  visualizabilityAdminActionResponseSchema,
  visualizabilityAdminSummaryResponseSchema,
  visualizabilityCapabilitiesResponseSchema,
  visualizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchVisualizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/visualizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return visualizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchVisualizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/visualizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return visualizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeVisualizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_visualizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/visualizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return visualizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatVisualizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatVisualizabilityRolloutCheckStatus(
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

export function formatVisualizabilityAdminAction(action: 'refresh_visualizability_summary') {
  switch (action) {
    case 'refresh_visualizability_summary':
      return 'Refresh visualizability summary'
  }
}

export function formatVisualizabilityDomain(
  domain: 'completed_runs' | 'failed_runs' | 'model_registry_entries' | 'model_health_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_registry_entries':
      return 'Model registry entries'
    case 'model_health_events':
      return 'Model health events'
  }
}

export async function fetchVisualizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/visualizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return visualizabilityCapabilitiesResponseSchema.parse(await response.json())
}
