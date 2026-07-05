import {
  maintainabilityAdminActionResponseSchema,
  maintainabilityAdminSummaryResponseSchema,
  maintainabilityCapabilitiesResponseSchema,
  maintainabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMaintainabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/maintainability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return maintainabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMaintainabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/maintainability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return maintainabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMaintainabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_maintainability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/maintainability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return maintainabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMaintainabilityRolloutStatus(
  status: 'ready' | 'not_ready',
) {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMaintainabilityRolloutCheckStatus(
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

export function formatMaintainabilityAdminAction(
  action: 'refresh_maintainability_summary',
) {
  switch (action) {
    case 'refresh_maintainability_summary':
      return 'Refresh maintainability summary'
  }
}

export function formatMaintainabilityDomain(
  domain:
    | 'completed_runs'
    | 'failed_runs'
    | 'model_health_events'
    | 'usage_events',
) {
  switch (domain) {
    case 'completed_runs':
      return 'Completed runs'
    case 'failed_runs':
      return 'Failed runs'
    case 'model_health_events':
      return 'Model health events'
    case 'usage_events':
      return 'Usage events'
  }
}

export async function fetchMaintainabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/maintainability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return maintainabilityCapabilitiesResponseSchema.parse(await response.json())
}
