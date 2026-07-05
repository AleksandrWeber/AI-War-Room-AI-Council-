import {
  meshabilizabilityAdminActionResponseSchema,
  meshabilizabilityAdminSummaryResponseSchema,
  meshabilizabilityCapabilitiesResponseSchema,
  meshabilizabilityRolloutResponseSchema,
} from '@ai-war-room/schemas'

export async function fetchMeshabilizabilityRollout(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/meshabilizability/readiness`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return meshabilizabilityRolloutResponseSchema.parse(await response.json())
}

export async function fetchMeshabilizabilityAdminSummary(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `${apiBaseUrl}/meshabilizability/workspace/${encodeURIComponent(workspaceId)}/admin`,
    { headers },
  )

  if (response.status === 403) {
    return null
  }

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return meshabilizabilityAdminSummaryResponseSchema.parse(await response.json())
}

export async function executeMeshabilizabilityAdminAction(
  apiBaseUrl: string,
  workspaceId: string,
  headers: Record<string, string>,
  input: { action: 'refresh_meshabilizability_summary' },
) {
  const response = await fetch(
    `${apiBaseUrl}/meshabilizability/workspace/${encodeURIComponent(workspaceId)}/admin/actions`,
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

  return meshabilizabilityAdminActionResponseSchema.parse(await response.json())
}

export function formatMeshabilizabilityRolloutStatus(status: 'ready' | 'not_ready') {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'not_ready':
      return 'Not ready'
  }
}

export function formatMeshabilizabilityRolloutCheckStatus(
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

export function formatMeshabilizabilityAdminAction(action: 'refresh_meshabilizability_summary') {
  switch (action) {
    case 'refresh_meshabilizability_summary':
      return 'Refresh meshabilizability summary'
  }
}

export function formatMeshabilizabilityDomain(
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

export async function fetchMeshabilizabilityCapabilities(apiBaseUrl: string) {
  const response = await fetch(`${apiBaseUrl}/meshabilizability/capabilities`)

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  return meshabilizabilityCapabilitiesResponseSchema.parse(await response.json())
}
